export type ByteRange = readonly [start: number, end: number]

export function parseByteRange(value: string, totalSize: number): ByteRange | null {
  if (!value.startsWith('bytes=') || value.includes(',') || totalSize <= 0) return null
  const match = /^bytes=(\d*)-(\d*)$/.exec(value)
  if (!match || (!match[1] && !match[2])) return null

  if (!match[1]) {
    const suffixLength = Number(match[2])
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null
    return [Math.max(0, totalSize - suffixLength), totalSize - 1]
  }

  const start = Number(match[1])
  const end = match[2] ? Number(match[2]) : totalSize - 1
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || start >= totalSize) return null
  return [start, Math.min(end, totalSize - 1)]
}

/** Reconstructs the Range response expected by media elements from a cached full blob. */
export async function serveCachedRange(response: Response, request: Request): Promise<Response> {
  const rangeHeader = request.headers.get('range')
  if (!rangeHeader || response.status !== 200 || request.method !== 'GET') return response

  const bytes = await response.arrayBuffer()
  const range = parseByteRange(rangeHeader, bytes.byteLength)
  const headers = new Headers(response.headers)
  headers.set('Accept-Ranges', 'bytes')
  if (!range) {
    headers.set('Content-Range', `bytes */${bytes.byteLength}`)
    return new Response(null, { status: 416, headers })
  }

  const [start, end] = range
  const body = bytes.slice(start, end + 1)
  headers.set('Content-Range', `bytes ${start}-${end}/${bytes.byteLength}`)
  headers.set('Content-Length', String(body.byteLength))
  return new Response(body, { status: 206, headers })
}
