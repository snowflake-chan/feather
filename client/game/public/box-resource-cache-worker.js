/*
 * BOX3 Play static-resource cache.
 *
 * The Play server signs the hash allowlist and this worker verifies both the
 * signature and every downloaded blob before it reaches Cache Storage. Script
 * blobs are excluded by the server before this worker receives the manifest.
 */
const PUBLIC_PREFIX = (self.location.pathname || '/box-resource-cache-worker.js').replace(/\/box-resource-cache-worker\.js$/, '')
importScripts(`${PUBLIC_PREFIX}/box-resource-cache-range.js`)

function resourcePath(request) {
  const pathname = new URL(request.url).pathname
  return PUBLIC_PREFIX && pathname.startsWith(`${PUBLIC_PREFIX}/`) ? pathname.slice(PUBLIC_PREFIX.length) : pathname
}

const CACHE_PREFIX = 'box-play-static:'
// Map loads have their own critical requests. Keep the optional warm-up small
// enough that it does not occupy every browser connection to the Play host.
const PREFETCH_CONCURRENCY = 6
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const HASH_PATTERN = /^(?:Qm[1-9A-HJ-NP-Za-km-z]{44}|[A-Za-z0-9_-]{32,128})$/
const CONTENT_TYPES = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
}
const inFlightResources = new Map()

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

function isCacheableResource(request) {
  if (request.method !== 'GET') return false
  const url = new URL(request.url)
  // `engine/m` is the public, immutable model route. Do not broaden this to
  // `engine/s`: that namespace carries scripts and must never be persisted in
  // a player's browser cache.
  return url.origin === self.location.origin && (!PUBLIC_PREFIX || url.pathname.startsWith(`${PUBLIC_PREFIX}/`)) && /^\/runtime\/play\/[^/]+\/(?:block|engine\/m)\/[^/]+$/.test(resourcePath(request))
}

// Cache entries deliberately use only their content hash instead of a public
// URL. The public access ID in /runtime/play/<access-id>/... may change, while
// a content-addressed blob is immutable. This lets a stable map cache survive
// an access-ID rename without treating the old route as canonical.
function staticResourceCacheKey(hash) {
  return new Request(new URL(`/${encodeURIComponent(hash)}`, self.location.origin))
}

function resourceDescriptor(request) {
  const match = resourcePath(request).match(/^\/runtime\/play\/[^/]+\/(?:block|engine\/m)\/([^/]+)$/)
  if (!match) return null
  const segment = decodeURIComponent(match[1])
  // ContentFetch appends an extension (for example `<CID>.png`) only so the
  // browser gets the right media type. It is not part of the immutable
  // content hash, and must map to the same Cache Storage entry as `<CID>`.
  const extensionMatch = segment.match(/^(.*?)(\.[A-Za-z0-9]{1,16})?$/)
  const hash = extensionMatch?.[1] || ''
  if (!HASH_PATTERN.test(hash)) return null
  return { hash, extension: extensionMatch?.[2]?.toLowerCase() || '' }
}

function cachedResponseForRequest(response, extension) {
  if (!extension || response.headers.has('content-type') || !CONTENT_TYPES[extension]) return response
  const headers = new Headers(response.headers)
  headers.set('Content-Type', CONTENT_TYPES[extension])
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function bytesToBase64Url(bytes) {
  let value = ''
  for (const byte of bytes) value += String.fromCharCode(byte)
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function base64UrlBytes(value) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function base58Bytes(value) {
  const output = [0]
  for (const character of value) {
    const index = BASE58.indexOf(character)
    if (index < 0) throw new Error('invalid base58 value')
    let carry = index
    for (let position = 0; position < output.length; position += 1) {
      const next = output[position] * 58 + carry
      output[position] = next & 0xff
      carry = next >> 8
    }
    while (carry) {
      output.push(carry & 0xff)
      carry >>= 8
    }
  }
  for (const character of value) {
    if (character !== '1') break
    output.push(0)
  }
  return Uint8Array.from(output.reverse())
}

async function hashMatches(expected, body) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', body))
  if (/^[A-Za-z0-9_-]{43}$/.test(expected)) return bytesToBase64Url(digest) === expected
  if (!expected.startsWith('Qm')) return false
  try {
    const multihash = base58Bytes(expected)
    return multihash.length === 34 && multihash[0] === 0x12 && multihash[1] === 0x20 && digest.every((byte, index) => byte === multihash[index + 2])
  } catch {
    return false
  }
}

function manifestPayload({ mapId, version, hashes }) {
  return JSON.stringify({ worldId: mapId, version, hashes })
}

async function signatureIsValid({ mapId, version, hashes, signature }) {
  if (!signature || signature.algorithm !== 'ES256' || !signature.publicKey || typeof signature.value !== 'string') return false
  try {
    const key = await crypto.subtle.importKey('jwk', signature.publicKey, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify'])
    return crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      base64UrlBytes(signature.value),
      new TextEncoder().encode(manifestPayload({ mapId, version, hashes })),
    )
  } catch {
    return false
  }
}

async function cleanupMapCaches(mapId, keep) {
  const prefix = `${CACHE_PREFIX}${mapId}:`
  const names = await caches.keys()
  await Promise.all(names.filter((name) => name.startsWith(prefix) && name !== keep).map((name) => caches.delete(name)))
}

function cacheVerifiedResponse(cache, request, expectedHash) {
  const running = inFlightResources.get(expectedHash)
  if (running) return running
  const pending = (async () => {
    const response = await fetch(request)
    if (!response.ok || response.type === 'opaque') return false
    const body = await response.arrayBuffer()
    if (!await hashMatches(expectedHash, body)) return false
    await cache.put(staticResourceCacheKey(expectedHash), new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    }))
    // Remove the pre-v0.2 cache key after the verified hash key has been
    // committed. It contained the mutable public access ID and is no longer
    // needed for cache-first reads.
    await cache.delete(request)
    return true
  })()
  inFlightResources.set(expectedHash, pending)
  return pending.finally(() => {
    if (inFlightResources.get(expectedHash) === pending) inFlightResources.delete(expectedHash)
  })
}

async function runWithConcurrency(items, limit, operation) {
  let cursor = 0
  const workerCount = Math.min(Math.max(1, limit), items.length)
  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      await operation(items[index], index)
    }
  }))
}

async function prefetch({ mapId, version, hashes, assets, signature }) {
  if (
    typeof mapId !== 'string' ||
    typeof version !== 'string' ||
    !Array.isArray(hashes) ||
    !Array.isArray(assets) ||
    hashes.length !== assets.length ||
    !await signatureIsValid({ mapId, version, hashes, signature })
  ) return
  const cacheName = `${CACHE_PREFIX}${mapId}:${version}`
  const cache = await caches.open(cacheName)
  await cleanupMapCaches(mapId, cacheName)
  await runWithConcurrency(assets, PREFETCH_CONCURRENCY, async (asset, index) => {
    if (typeof asset !== 'string' || typeof hashes[index] !== 'string') return
    const url = new URL(asset, self.location.origin)
    if (PUBLIC_PREFIX && url.origin === self.location.origin && url.pathname.startsWith('/runtime/play/')) url.pathname = PUBLIC_PREFIX + url.pathname
    const request = new Request(url, { credentials: 'include' })
    if (!isCacheableResource(request) || await cache.match(staticResourceCacheKey(hashes[index]))) return
    try {
      await cacheVerifiedResponse(cache, request, hashes[index])
    } catch {
      // A partial or altered response is never cached. The runtime keeps its
      // online request path and the next entry will retry the download.
    }
  })
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'BOX3_PREFETCH_STATIC_RESOURCES') event.waitUntil(prefetch(event.data))
  if (event.data?.type === 'BOX3_CLEAR_STATIC_RESOURCES') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX)).map((name) => caches.delete(name)))),
    )
  }
})

self.addEventListener('fetch', (event) => {
  if (!isCacheableResource(event.request)) return
  event.respondWith((async () => {
    const resource = resourceDescriptor(event.request)
    const cached = resource ? await caches.match(staticResourceCacheKey(resource.hash)) : undefined
    if (cached) {
      const response = cachedResponseForRequest(cached, resource.extension)
      return self.__BOX3_CACHE_RANGE__
        ? self.__BOX3_CACHE_RANGE__.serveCachedRange(response, event.request)
        : response
    }
    // The warm-up may already be verifying this same immutable hash. Waiting
    // for it avoids issuing a second request when the map asks for the asset
    // during its initial load.
    const warming = resource ? inFlightResources.get(resource.hash) : undefined
    if (warming) {
      await warming
      const warmed = await caches.match(staticResourceCacheKey(resource.hash))
      if (warmed) {
        const response = cachedResponseForRequest(warmed, resource.extension)
        return self.__BOX3_CACHE_RANGE__
          ? self.__BOX3_CACHE_RANGE__.serveCachedRange(response, event.request)
          : response
      }
    }
    return fetch(event.request)
  })())
})

// Kept unreachable in normal browsers. The narrow hook lets the regression
// test exercise the URL normalisation without exposing it to page scripts.
if (self.__BOX3_RESOURCE_CACHE_TEST__) {
  self.__BOX3_RESOURCE_CACHE_TEST__.resourceDescriptor = resourceDescriptor
  self.__BOX3_RESOURCE_CACHE_TEST__.runWithConcurrency = runWithConcurrency
  self.__BOX3_RESOURCE_CACHE_TEST__.hashMatches = hashMatches
  self.__BOX3_RESOURCE_CACHE_TEST__.signatureIsValid = signatureIsValid
  self.__BOX3_RESOURCE_CACHE_TEST__.cacheVerifiedResponse = cacheVerifiedResponse
}
