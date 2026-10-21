import { useEffect } from 'react'
import { apiClient } from 'src/apis/client'

type ResourceManifest = {
  worldId?: string
  version?: string
  hashes?: string[]
  signature?: {
    algorithm: 'ES256'
    keyId: string
    publicKey: Record<string, string>
    value: string
  }
}

type ResourceSigningIdentity = {
  signingKey?: {
    keyId?: string
    publicKey?: Record<string, string>
  }
}

type ActiveWorkerRegistration = Pick<ServiceWorkerRegistration, 'active' | 'installing' | 'waiting'>

export interface BootstrapPlayResourceCacheOptions {
  world: string
  launcherServiceWorkerMode?: boolean
  fetchManifest?: (url: string) => Promise<Response>
  serviceWorkerContainer?: Pick<ServiceWorkerContainer, 'register'> & Partial<Pick<ServiceWorkerContainer, 'controller' | 'addEventListener' | 'removeEventListener'>>
  cacheStorage?: Pick<CacheStorage, 'open'>
  isSecureContext?: boolean
  isCancelled?: () => boolean
  waitForCompletion?: boolean
  onProgress?: (progress: number) => void
}

export function shouldBootstrapPlayResourceCache({
  deploymentMode,
  launcherServiceWorkerMode,
  disableResourceCache,
}: {
  deploymentMode?: string
  launcherServiceWorkerMode?: boolean
  disableResourceCache?: boolean
}): boolean {
  return deploymentMode === 'play' && !launcherServiceWorkerMode && !disableResourceCache
}

function waitForActivation(worker: ServiceWorker | null): Promise<ServiceWorker | null> {
  if (!worker || worker.state === 'activated') return Promise.resolve(worker)
  return new Promise((resolve) => {
    const onStateChange = () => {
      if (worker.state === 'activated') {
        worker.removeEventListener('statechange', onStateChange)
        resolve(worker)
      }
      if (worker.state === 'redundant') {
        worker.removeEventListener('statechange', onStateChange)
        resolve(null)
      }
    }
    worker.addEventListener('statechange', onStateChange)
  })
}

/** Resolves a worker that can receive a cache request on a first visit. */
export async function getActiveResourceCacheWorker(
  registration: ActiveWorkerRegistration,
): Promise<ServiceWorker | null> {
  // Prefer the version just installed by this page. `navigator.serviceWorker.ready`
  // can point to an older controller during an update, so using it here may send
  // the first prefetch message to a worker that does not implement this cache.
  return waitForActivation(registration.installing || registration.waiting || registration.active)
}

/** Starts background caching while the map runtime is loading. */
export async function bootstrapPlayResourceCache({
  world,
  launcherServiceWorkerMode = false,
  fetchManifest,
  serviceWorkerContainer,
  cacheStorage,
  isSecureContext = typeof window === 'undefined' || window.isSecureContext,
  isCancelled = () => false,
  waitForCompletion = false,
  onProgress,
}: BootstrapPlayResourceCacheOptions): Promise<void> {
  if (!world) {
    if (waitForCompletion) throw new Error('当前客户端不支持 Service Worker，无法离线准备地图资源')
    return
  }
  if (waitForCompletion && !isSecureContext) {
    throw new Error('启动器本地资源缓存需要安全连接：请使用 HTTPS 地址')
  }
  // Public HTTP skips optional caching; normal online resource loading continues.
  if (!isSecureContext) return
  if (!serviceWorkerContainer) {
    if (waitForCompletion) throw new Error('当前客户端不支持 Service Worker，无法离线准备地图资源')
    return
  }
  try {
    const manifestResult = fetchManifest
      ? { response: await fetchManifest(`/api/play-resource-cache/${encodeURIComponent(world)}`), data: undefined }
      : await apiClient.getApiPlayResourceCacheWorldRaw({ params: { path: { world } } })
    const response = manifestResult.response
    if (isCancelled()) return
    if (!response.ok) {
      if (waitForCompletion) throw new Error('无法读取地图静态资源清单')
      return
    }
    const manifest = (fetchManifest
      ? await response.json()
      : manifestResult.data) as ResourceManifest
    if (launcherServiceWorkerMode) {
      const bootstrapResult = fetchManifest
        ? { response: await fetchManifest('/api/player-launcher/bootstrap'), data: undefined }
        : await apiClient.getApiPlayerLauncherBootstrapRaw()
      const bootstrapResponse = bootstrapResult.response
      if (!bootstrapResponse.ok) throw new Error('无法读取服务器的资源签名公钥')
      const bootstrap = (fetchManifest
        ? await bootstrapResponse.json()
        : bootstrapResult.data) as ResourceSigningIdentity
      const trustedKey = bootstrap.signingKey
      const manifestKey = manifest.signature?.publicKey
      if (
        !trustedKey?.keyId || !trustedKey.publicKey ||
        manifest.signature?.keyId !== trustedKey.keyId ||
        !manifestKey ||
        ['kty', 'crv', 'x', 'y'].some((key) => manifestKey[key] !== trustedKey.publicKey?.[key])
      ) throw new Error('服务器地图资源签名与已信任公钥不匹配')
    }
    const registered = await serviceWorkerContainer.register('/box-resource-cache-worker.js', { scope: '/' })
    const worker = await getActiveResourceCacheWorker(registered)
    if (isCancelled()) return
    if (!worker) {
      if (waitForCompletion) throw new Error('Service Worker 无法启动')
      return
    }
    if (launcherServiceWorkerMode && serviceWorkerContainer.controller !== worker) {
      await waitForController(serviceWorkerContainer, worker)
    }
    if (!manifest.worldId || !manifest.version || !Array.isArray(manifest.hashes) || !manifest.signature) {
      worker.postMessage({ type: 'BOX3_CLEAR_STATIC_RESOURCES' })
      if (waitForCompletion) throw new Error('服务器地图资源清单格式无效')
      return
    }
    const message = {
      type: 'BOX3_PREFETCH_STATIC_RESOURCES',
      mapId: manifest.worldId,
      version: manifest.version,
      hashes: manifest.hashes,
      signature: manifest.signature,
      assets: manifest.hashes.map((hash) => `/runtime/play/${encodeURIComponent(world)}/block/${encodeURIComponent(hash)}`),
    }
    worker.postMessage(message)
    if (waitForCompletion) {
      if (!cacheStorage) throw new Error('当前客户端无法访问 Service Worker Cache Storage')
      await waitForCachedResources({
        cacheStorage,
        cacheName: `box-play-static:${manifest.worldId}:${manifest.version}`,
        hashes: manifest.hashes,
        isCancelled,
        origin: typeof location === 'undefined' ? 'http://localhost' : location.origin,
        onProgress,
      })
    }
  } catch (error) {
    // Browser cache is optional for normal browser play, but launcher mode
    // waits for it so runtime fetches do not race the initial prefetch.
    if (waitForCompletion) {
      throw error instanceof Error ? error : new Error('无法准备本地地图资源缓存，请检查服务器连接后重试')
    }
  }
}

function waitForController(
  container: BootstrapPlayResourceCacheOptions['serviceWorkerContainer'],
  worker: ServiceWorker,
): Promise<void> {
  if (!container?.addEventListener || container.controller === worker) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      container.removeEventListener?.('controllerchange', onChange)
      reject(new Error('Service Worker 未能接管地图页面'))
    }, 15_000)
    const onChange = () => {
      if (container.controller !== worker) return
      window.clearTimeout(timeout)
      container.removeEventListener?.('controllerchange', onChange)
      resolve()
    }
    container.addEventListener?.('controllerchange', onChange)
    onChange()
  })
}

async function waitForCachedResources({
  cacheStorage,
  cacheName,
  hashes,
  isCancelled,
  origin,
  onProgress,
}: {
  cacheStorage: Pick<CacheStorage, 'open'>
  cacheName: string
  hashes: string[]
  isCancelled: () => boolean
  origin: string
  onProgress?: (progress: number) => void
}): Promise<void> {
  const cache = await cacheStorage.open(cacheName)
  const expiresAt = Date.now() + 5 * 60 * 1000
  while (!isCancelled() && Date.now() < expiresAt) {
    const cached = await Promise.all(hashes.map((hash) => cache.match(
      new Request(new URL(`/${encodeURIComponent(hash)}`, origin)),
    )))
    const count = cached.filter(Boolean).length
    onProgress?.(hashes.length ? Math.floor((count / hashes.length) * 100) : 100)
    if (count === hashes.length) return
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  if (isCancelled()) return
  throw new Error('地图静态资源预加载未完成，请检查服务器资源连接后重试')
}

export function PlayResourceCacheBootstrap({
  world,
  launcherServiceWorkerMode = false,
}: {
  world: string
  launcherServiceWorkerMode?: boolean
}) {
  useEffect(() => {
    if (!world || !('serviceWorker' in navigator)) return
    let cancelled = false
    void bootstrapPlayResourceCache({
      world,
      launcherServiceWorkerMode,
      fetchManifest: fetch,
      serviceWorkerContainer: navigator.serviceWorker,
      isCancelled: () => cancelled,
    })
    return () => { cancelled = true }
  }, [world, launcherServiceWorkerMode])
  return null
}
