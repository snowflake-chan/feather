import { describe, expect, test } from '@jest/globals'

import {
  bootstrapPlayResourceCache,
  getActiveResourceCacheWorker,
  shouldBootstrapPlayResourceCache,
} from './play-resource-cache-bootstrap'

describe('Play resource cache selection', () => {
  test('skips all browser caching when the launcher explicitly starts over HTTP', () => {
    expect(shouldBootstrapPlayResourceCache({
      deploymentMode: 'play',
      launcherServiceWorkerMode: false,
      disableResourceCache: true,
    })).toBe(false)
  })

  test('keeps browser caching enabled for ordinary Play visits', () => {
    expect(shouldBootstrapPlayResourceCache({
      deploymentMode: 'play',
      launcherServiceWorkerMode: false,
    })).toBe(true)
  })
})

function worker(state: ServiceWorkerState) {
  const listeners = new Set<() => void>()
  return {
    state,
    addEventListener(_name: string, listener: () => void) { listeners.add(listener) },
    removeEventListener(_name: string, listener: () => void) { listeners.delete(listener) },
    activate() {
      this.state = 'activated'
      for (const listener of listeners) listener()
    },
  }
}

describe('Play resource cache worker activation', () => {
  test('explains that non-loopback HTTP servers need HTTPS for launcher caching', async () => {
    await expect(bootstrapPlayResourceCache({
      world: 'map-one',
      launcherServiceWorkerMode: true,
      waitForCompletion: true,
      isSecureContext: false,
    })).rejects.toThrow('请使用 HTTPS 地址')
  })

  test('registers the Service Worker and primes launcher maps before runtime startup', async () => {
    const calls: string[] = []
    const activeWorker = {
      state: 'activated',
      postMessage(message: unknown) { calls.push((message as { type: string }).type) },
    } as unknown as ServiceWorker
    await bootstrapPlayResourceCache({
      world: 'map-one',
      launcherServiceWorkerMode: true,
      fetchManifest: async (input) => {
        const url = String(input)
        calls.push(url.includes('bootstrap') ? 'trusted-key' : 'manifest')
        if (url.includes('bootstrap')) {
          return new Response(JSON.stringify({ signingKey: { keyId: 'key-1', publicKey: { kty: 'EC', crv: 'P-256', x: 'x', y: 'y' } } }), { status: 200 })
        }
        return new Response(JSON.stringify({
          worldId: 'permanent-map-one',
          version: 'v1',
          hashes: ['Qm' + '1'.repeat(44)],
          signature: { algorithm: 'ES256', keyId: 'key-1', publicKey: { kty: 'EC', crv: 'P-256', x: 'x', y: 'y' }, value: 'signature' },
        }), { status: 200 })
      },
      serviceWorkerContainer: {
        async register() {
          calls.push('register')
          return { active: activeWorker } as ServiceWorkerRegistration
        },
      } as unknown as ServiceWorkerContainer,
      cacheStorage: {
        async open(name: string) {
          calls.push(`open:${name}`)
          return { async match() { return new Response('cached') } } as unknown as Cache
        },
      },
      waitForCompletion: true,
      isCancelled: () => false,
    })
    expect(calls).toEqual([
      'manifest',
      'trusted-key',
      'register',
      'BOX3_PREFETCH_STATIC_RESOURCES',
      'open:box-play-static:permanent-map-one:v1',
    ])
  })

  test('waits for a newly installed worker before sending its first cache request', async () => {
    const installing = worker('installing')
    const active = getActiveResourceCacheWorker({ active: null, waiting: null, installing } as never)

    installing.activate()

    await expect(active).resolves.toBe(installing)
  })

  test('prefers an installing update over an older active worker', async () => {
    const oldWorker = worker('activated')
    const installing = worker('installing')
    const active = getActiveResourceCacheWorker({ active: oldWorker, waiting: null, installing } as never)

    installing.activate()

    await expect(active).resolves.toBe(installing)
  })
})
