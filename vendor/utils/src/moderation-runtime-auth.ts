import { createHmac, timingSafeEqual } from 'crypto'

export type ModerationRuntimeIdentity = {
  mapId: string
  runtimeId: string
  mode: 'edit' | 'play'
  issuedAt: number
  expiresAt: number
}
function signature(payload: string, secret: string) {
  return createHmac('sha256', secret)
    .update('box3-moderation-runtime-v1:' + payload)
    .digest('hex')
}
export function issueModerationRuntimeToken(
  identity: Omit<ModerationRuntimeIdentity, 'issuedAt' | 'expiresAt'>,
  secret: string,
  now = Date.now(),
): string {
  if (secret.length < 32) throw new Error('Moderation signing secret is not configured')
  if (
    !/^[a-z0-9][a-z0-9-]{0,62}$/.test(identity.mapId) ||
    !identity.runtimeId ||
    !['edit', 'play'].includes(identity.mode)
  )
    throw new Error('Invalid moderation runtime identity')
  const payload = Buffer.from(JSON.stringify({ ...identity, issuedAt: now, expiresAt: now + 5 * 60000 })).toString(
    'base64',
  )
  return `${payload}.${signature(payload, secret)}`
}
export function verifyModerationRuntimeToken(
  token: string,
  secret: string,
  now = Date.now(),
): ModerationRuntimeIdentity | null {
  if (secret.length < 32 || token.length > 2048) return null
  const parts = token.split('.')
  if (parts.length !== 2 || !/^[a-f0-9]{64}$/.test(parts[1])) return null
  if (!timingSafeEqual(Buffer.from(signature(parts[0], secret), 'hex'), Buffer.from(parts[1], 'hex'))) return null
  try {
    const identity = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'))
    if (
      !/^[a-z0-9][a-z0-9-]{0,62}$/.test(identity.mapId) ||
      typeof identity.runtimeId !== 'string' || !identity.runtimeId ||
      identity.runtimeId.length > 128 ||
      !['edit', 'play'].includes(identity.mode)
    )
      return null
    if (
      !Number.isSafeInteger(identity.issuedAt) ||
      !Number.isSafeInteger(identity.expiresAt) ||
      identity.issuedAt > now + 10000 ||
      identity.expiresAt <= now ||
      identity.expiresAt - identity.issuedAt !== 5 * 60000
    )
      return null
    return identity
  } catch {
    return null
  }
}
