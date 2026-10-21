import { describe, expect, test } from '@jest/globals'
import { parseByteRange, serveCachedRange } from './cache-range'

describe('Service Worker cached byte ranges', () => {
  test('parses closed, open-ended and suffix ranges', () => {
    expect(parseByteRange('bytes=2-4', 10)).toEqual([2, 4])
    expect(parseByteRange('bytes=7-', 10)).toEqual([7, 9])
    expect(parseByteRange('bytes=-3', 10)).toEqual([7, 9])
  })

  test('rejects malformed, multi-range and unsatisfiable requests', () => {
    expect(parseByteRange('items=1-2', 10)).toBeNull()
    expect(parseByteRange('bytes=1-2,4-5', 10)).toBeNull()
    expect(parseByteRange('bytes=10-', 10)).toBeNull()
    expect(parseByteRange('bytes=-0', 10)).toBeNull()
  })

  test('returns a 206 slice with audio metadata for a cached response', async () => {
    const full = new Response('0123456789', {
      headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': '10' },
    })
    const ranged = await serveCachedRange(full, new Request('https://play.test/audio', {
      headers: { Range: 'bytes=2-5' },
    }))
    expect(ranged.status).toBe(206)
    expect(ranged.headers.get('Accept-Ranges')).toBe('bytes')
    expect(ranged.headers.get('Content-Range')).toBe('bytes 2-5/10')
    expect(ranged.headers.get('Content-Length')).toBe('4')
    expect(ranged.headers.get('Content-Type')).toBe('audio/mpeg')
    await expect(ranged.text()).resolves.toBe('2345')
  })

  test('returns 416 for an invalid range and leaves non-range reads unchanged', async () => {
    const full = new Response('0123456789', { headers: { 'Content-Type': 'audio/mpeg' } })
    const invalid = await serveCachedRange(full.clone(), new Request('https://play.test/audio', {
      headers: { Range: 'bytes=20-' },
    }))
    expect(invalid.status).toBe(416)
    expect(invalid.headers.get('Content-Range')).toBe('bytes */10')

    const ordinary = await serveCachedRange(full, new Request('https://play.test/audio'))
    expect(ordinary.status).toBe(200)
    await expect(ordinary.text()).resolves.toBe('0123456789')
  })
})
