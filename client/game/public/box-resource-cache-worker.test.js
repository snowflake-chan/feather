const fs = require('fs')
const crypto = require('node:crypto')
const path = require('path')
const vm = require('vm')

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function base58Encode(bytes) {
  let value = BigInt(`0x${Buffer.from(bytes).toString('hex')}`)
  let encoded = ''
  while (value > 0n) {
    encoded = BASE58_ALPHABET[Number(value % 58n)] + encoded
    value /= 58n
  }
  const leadingZeroes = bytes.findIndex((byte) => byte !== 0)
  return `${'1'.repeat(leadingZeroes < 0 ? bytes.length : leadingZeroes)}${encoded}`
}

function loadWorkerTestHooks({ fetchImpl, prefix = '' } = {}) {
  const hooks = {}
  const workerScope = {
    __BOX3_RESOURCE_CACHE_TEST__: hooks,
    location: { origin: 'https://play.example.test', pathname: `${prefix}/box-resource-cache-worker.js` },
    addEventListener: () => {},
    skipWaiting: () => {},
    clients: { claim: () => {} },
  }
  const context = {
    self: workerScope,
    URL,
    Request,
    Response,
    Headers,
    TextEncoder,
    Uint8Array,
    crypto: globalThis.crypto,
    btoa,
    atob,
    fetch: fetchImpl,
    importScripts(scriptPath) {
      if (scriptPath !== `${prefix}/box-resource-cache-range.js`) {
        throw new Error(`Unexpected Service Worker import: ${scriptPath}`)
      }
      const helper = fs.readFileSync(path.join(__dirname, 'box-resource-cache-range.js'), 'utf8')
      vm.runInNewContext(helper, context)
    },
  }
  const source = fs.readFileSync(path.join(__dirname, 'box-resource-cache-worker.js'), 'utf8')
  vm.runInNewContext(source, context)
  hooks.hasRangeHelper = Boolean(workerScope.__BOX3_CACHE_RANGE__)
  return hooks
}

describe('BOX3 Play resource cache worker', () => {
  test('loads its range helper and identifies media below a public path prefix', () => {
    const { resourceDescriptor, hasRangeHelper } = loadWorkerTestHooks({ prefix: '/play' })
    const hash = 'QmbVZUtAue26KwkMjcJggm5yVLbiUrunC83t4e2CdS2ZGf'
    expect(hasRangeHelper).toBe(true)
    expect(resourceDescriptor({url: `https://play.example.test/play/runtime/play/map/block/${hash}.png`})).toEqual({hash, extension: '.png'})
    expect(resourceDescriptor({url: `https://play.example.test/play/runtime/play/map/engine/s/${hash}`})).toBeNull()
  })
  test('maps engine media URLs with extensions to the manifest content hash', () => {
    const { resourceDescriptor, hasRangeHelper } = loadWorkerTestHooks()
    const hash = 'QmbVZUtAue26KwkMjcJggm5yVLbiUrunC83t4e2CdS2ZGf'

    expect(hasRangeHelper).toBe(true)
    expect(resourceDescriptor({
      url: `https://play.example.test/runtime/play/a-map/block/${hash}.png`,
    })).toEqual({ hash, extension: '.png' })
    expect(resourceDescriptor({
      url: `https://play.example.test/runtime/play/a-map/block/${hash}`,
    })).toEqual({ hash, extension: '' })
    expect(resourceDescriptor({
      url: `https://play.example.test/runtime/play/a-map/engine/m/${hash}`,
    })).toEqual({ hash, extension: '' })
    expect(resourceDescriptor({
      url: `https://play.example.test/runtime/play/a-map/engine/s/${hash}`,
    })).toBeNull()
  })

  test('limits background prefetches so they do not flood the map loader', async () => {
    const { runWithConcurrency } = loadWorkerTestHooks()
    let active = 0
    let peak = 0
    await runWithConcurrency(Array.from({ length: 20 }, (_, index) => index), 3, async () => {
      active += 1
      peak = Math.max(peak, active)
      await Promise.resolve()
      active -= 1
    })
    expect(peak).toBeLessThanOrEqual(3)
  })

  test('checks both base64url SHA-256 hashes and IPFS CIDv0 content hashes', async () => {
    const { hashMatches } = loadWorkerTestHooks()
    const body = new TextEncoder().encode('verified player asset')
    const digest = new Uint8Array(await crypto.webcrypto.subtle.digest('SHA-256', body))
    const sha256 = Buffer.from(digest).toString('base64url')
    const ipfsCid = base58Encode(Uint8Array.from([0x12, 0x20, ...digest]))

    await expect(hashMatches(sha256, body)).resolves.toBe(true)
    await expect(hashMatches(ipfsCid, body)).resolves.toBe(true)
    await expect(hashMatches(sha256, new TextEncoder().encode('tampered asset'))).resolves.toBe(false)
    await expect(hashMatches(ipfsCid, new TextEncoder().encode('tampered asset'))).resolves.toBe(false)
  })

  test('stores a resource only after its downloaded bytes match the signed hash', async () => {
    const body = new TextEncoder().encode('verified static response')
    const hash = Buffer.from(await crypto.webcrypto.subtle.digest('SHA-256', body)).toString('base64url')
    const writes = []
    const cache = {
      async put(key, response) { writes.push({ key, response }) },
      async delete() {},
    }
    const request = new Request(`https://play.example.test/runtime/play/map-one/block/${hash}`)
    const { cacheVerifiedResponse } = loadWorkerTestHooks({ fetchImpl: async () => new Response(body) })

    await expect(cacheVerifiedResponse(cache, request, hash)).resolves.toBe(true)
    expect(writes).toHaveLength(1)
    expect(writes[0].key.url).toBe(`https://play.example.test/${encodeURIComponent(hash)}`)

    writes.length = 0
    const { cacheVerifiedResponse: cacheCorruptResponse } = loadWorkerTestHooks({
      fetchImpl: async () => new Response('tampered response'),
    })
    await expect(cacheCorruptResponse(cache, request, hash)).resolves.toBe(false)
    expect(writes).toHaveLength(0)
  })

  test('accepts only the exact ECDSA-signed map resource manifest', async () => {
    const { signatureIsValid } = loadWorkerTestHooks()
    const keys = await crypto.webcrypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify'],
    )
    const publicKey = await crypto.webcrypto.subtle.exportKey('jwk', keys.publicKey)
    const mapId = 'permanent-map-id'
    const version = 'release-v1'
    const hashes = ['Qm' + '1'.repeat(44)]
    const payload = JSON.stringify({ worldId: mapId, version, hashes })
    const signatureBytes = await crypto.webcrypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      keys.privateKey,
      new TextEncoder().encode(payload),
    )
    const signature = {
      algorithm: 'ES256',
      keyId: 'test-key',
      publicKey,
      value: Buffer.from(signatureBytes).toString('base64url'),
    }

    await expect(signatureIsValid({ mapId, version, hashes, signature })).resolves.toBe(true)
    await expect(signatureIsValid({ mapId, version, hashes: ['tampered-hash'], signature })).resolves.toBe(false)
  })
})
