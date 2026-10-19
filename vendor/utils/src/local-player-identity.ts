import { createHmac, timingSafeEqual } from 'crypto';

export type LocalPlayerRole = 'player' | 'moderator' | 'admin';
export type LocalPlayerStatus = 'active' | 'banned';

export type RuntimePlayerIdentity = {
  /** Authenticated browser device identifier; never supplied by map scripts. */
  deviceHash?: string;
  subjectId: string;
  userId: string;
  username: string;
  /** Optional legacy Box/神岛 account identifier. Empty when not bound. */
  boxId: string;
  /** Optional userKey override used to keep old platform save identities. */
  userKey: string;
  displayName: string;
  avatar: string;
  /** Curated in-game 3D skin identifier, separate from the profile avatar image. */
  avatarSkinId: string;
  /** Granted by the server owner; required to access the Creator product. */
  creatorAccess: boolean;
  /** Server-enforced Creator capabilities. Never trust a browser-provided value. */
  creatorPermissions: readonly string[];
  /** CLI Token-only capabilities. They are independent from Creator UI access. */
  creatorCliPermissions?: readonly string[];
  role: LocalPlayerRole;
  status: LocalPlayerStatus;
  expiresAt: number;
};

const subjectPattern = /^[0-9a-f]{32}$/;
const userIdPattern = /^[1-9][0-9]{0,18}$/;
const usernamePattern = /^[a-zA-Z][a-zA-Z0-9_]{2,31}$/;

function encodeBase64URL(value: string | Buffer) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function decodeBase64URL(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, 'base64').toString('utf8');
}

function signature(payload: string, secret: string) {
  return encodeBase64URL(createHmac('sha256', secret).update(payload).digest());
}

function validIdentity(value: RuntimePlayerIdentity) {
  return (
    (value.deviceHash === undefined || /^[0-9a-f]{64}$/.test(value.deviceHash)) &&
    subjectPattern.test(value.subjectId) &&
    userIdPattern.test(value.userId) &&
    usernamePattern.test(value.username) &&
    typeof value.boxId === 'string' &&
    value.boxId.length <= 64 &&
    (value.userKey == null || (
      typeof value.userKey === 'string' &&
      value.userKey.length <= 128 &&
      /^[\x20-\x7e]*$/.test(value.userKey)
    )) &&
    typeof value.displayName === 'string' &&
    value.displayName.length >= 1 &&
    value.displayName.length <= 32 &&
    typeof value.avatar === 'string' &&
    // Profile avatars may be persisted as validated data URLs (up to the
    // 512 KiB upload limit). Keep the signed identity assertion compatible
    // with that representation so updating an avatar cannot invalidate login.
    value.avatar.length <= 700_000 &&
    typeof value.avatarSkinId === 'string' &&
    value.avatarSkinId.length <= 64 &&
    typeof value.creatorAccess === 'boolean' &&
    Array.isArray(value.creatorPermissions) &&
    value.creatorPermissions.length <= 32 &&
    value.creatorPermissions.every((permission) => typeof permission === 'string' && permission.length <= 64) &&
    Array.isArray(value.creatorCliPermissions) &&
    value.creatorCliPermissions.length <= 32 &&
    value.creatorCliPermissions.every((permission) => typeof permission === 'string' && permission.length <= 64) &&
    ['player', 'moderator', 'admin'].includes(value.role) &&
    ['active', 'banned'].includes(value.status) &&
    Number.isSafeInteger(value.expiresAt)
  );
}

export function signRuntimePlayerIdentity(
  identity: Omit<RuntimePlayerIdentity, 'expiresAt' | 'userKey'> & Partial<Pick<RuntimePlayerIdentity, 'userKey'>>,
  secret: string,
  ttlMs = 60_000,
) {
  if (!secret) throw new Error('player identity secret is not configured');
  const value: RuntimePlayerIdentity = {
    ...identity,
    userKey: identity.userKey || '',
    creatorCliPermissions: identity.creatorCliPermissions || [],
    expiresAt: Date.now() + Math.max(5_000, Math.min(ttlMs, 5 * 60_000)),
  };
  if (!validIdentity(value)) throw new Error('invalid runtime player identity');
  const payload = encodeBase64URL(JSON.stringify(value));
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyRuntimePlayerIdentity(
  token: string,
  secret: string,
  now = Date.now(),
): RuntimePlayerIdentity | null {
  if (!token || !secret) return null;
  const [payload, provided, extra] = token.split('.');
  if (!payload || !provided || extra) return null;
  const expected = signature(payload, secret);
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }
  try {
    const value = JSON.parse(decodeBase64URL(payload)) as RuntimePlayerIdentity;
    if (!validIdentity(value) || value.expiresAt <= now) return null;
    return value;
  } catch {
    return null;
  }
}

export function createPlayerUserKey(subjectId: string, secret: string) {
  if (!subjectPattern.test(subjectId) || !secret) return '';
  return encodeBase64URL(
    createHmac('sha256', secret).update(`player-subject:${subjectId}`).digest(),
  ).slice(0, 16);
}
