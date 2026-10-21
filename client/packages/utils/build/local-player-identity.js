"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signRuntimePlayerIdentity = signRuntimePlayerIdentity;
exports.verifyRuntimePlayerIdentity = verifyRuntimePlayerIdentity;
exports.createPlayerUserKey = createPlayerUserKey;
const crypto_1 = require("crypto");
const subjectPattern = /^[0-9a-f]{32}$/;
const userIdPattern = /^[1-9][0-9]{0,18}$/;
const usernamePattern = /^[a-zA-Z][a-zA-Z0-9_]{2,31}$/;
function encodeBase64URL(value) {
    return Buffer.from(value)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function decodeBase64URL(value) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    return Buffer.from(normalized + padding, 'base64').toString('utf8');
}
function signature(payload, secret) {
    return encodeBase64URL((0, crypto_1.createHmac)('sha256', secret).update(payload).digest());
}
function validIdentity(value) {
    return ((value.deviceHash === undefined || /^[0-9a-f]{64}$/.test(value.deviceHash)) &&
        subjectPattern.test(value.subjectId) &&
        userIdPattern.test(value.userId) &&
        usernamePattern.test(value.username) &&
        typeof value.boxId === 'string' &&
        value.boxId.length <= 64 &&
        (value.userKey == null || (typeof value.userKey === 'string' &&
            value.userKey.length <= 128 &&
            /^[\x20-\x7e]*$/.test(value.userKey))) &&
        typeof value.displayName === 'string' &&
        value.displayName.length >= 1 &&
        value.displayName.length <= 32 &&
        typeof value.avatar === 'string' &&
        value.avatar.length <= 700000 &&
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
        Number.isSafeInteger(value.expiresAt));
}
function signRuntimePlayerIdentity(identity, secret, ttlMs = 60000) {
    if (!secret)
        throw new Error('player identity secret is not configured');
    const value = Object.assign(Object.assign({}, identity), { userKey: identity.userKey || '', creatorCliPermissions: identity.creatorCliPermissions || [], expiresAt: Date.now() + Math.max(5000, Math.min(ttlMs, 5 * 60000)) });
    if (!validIdentity(value))
        throw new Error('invalid runtime player identity');
    const payload = encodeBase64URL(JSON.stringify(value));
    return `${payload}.${signature(payload, secret)}`;
}
function verifyRuntimePlayerIdentity(token, secret, now = Date.now()) {
    if (!token || !secret)
        return null;
    const [payload, provided, extra] = token.split('.');
    if (!payload || !provided || extra)
        return null;
    const expected = signature(payload, secret);
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);
    if (providedBuffer.length !== expectedBuffer.length ||
        !(0, crypto_1.timingSafeEqual)(providedBuffer, expectedBuffer)) {
        return null;
    }
    try {
        const value = JSON.parse(decodeBase64URL(payload));
        if (!validIdentity(value) || value.expiresAt <= now)
            return null;
        return value;
    }
    catch (_a) {
        return null;
    }
}
function createPlayerUserKey(subjectId, secret) {
    if (!subjectPattern.test(subjectId) || !secret)
        return '';
    return encodeBase64URL((0, crypto_1.createHmac)('sha256', secret).update(`player-subject:${subjectId}`).digest()).slice(0, 16);
}
