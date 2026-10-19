"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueModerationRuntimeToken = issueModerationRuntimeToken;
exports.verifyModerationRuntimeToken = verifyModerationRuntimeToken;
const crypto_1 = require("crypto");
function signature(payload, secret) {
    return (0, crypto_1.createHmac)('sha256', secret)
        .update('box3-moderation-runtime-v1:' + payload)
        .digest('hex');
}
function issueModerationRuntimeToken(identity, secret, now = Date.now()) {
    if (secret.length < 32)
        throw new Error('Moderation signing secret is not configured');
    if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(identity.mapId) ||
        !identity.runtimeId ||
        !['edit', 'play'].includes(identity.mode))
        throw new Error('Invalid moderation runtime identity');
    const payload = Buffer.from(JSON.stringify(Object.assign(Object.assign({}, identity), { issuedAt: now, expiresAt: now + 5 * 60000 }))).toString('base64');
    return `${payload}.${signature(payload, secret)}`;
}
function verifyModerationRuntimeToken(token, secret, now = Date.now()) {
    if (secret.length < 32 || token.length > 2048)
        return null;
    const parts = token.split('.');
    if (parts.length !== 2 || !/^[a-f0-9]{64}$/.test(parts[1]))
        return null;
    if (!(0, crypto_1.timingSafeEqual)(Buffer.from(signature(parts[0], secret), 'hex'), Buffer.from(parts[1], 'hex')))
        return null;
    try {
        const identity = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'));
        if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(identity.mapId) ||
            typeof identity.runtimeId !== 'string' || !identity.runtimeId ||
            identity.runtimeId.length > 128 ||
            !['edit', 'play'].includes(identity.mode))
            return null;
        if (!Number.isSafeInteger(identity.issuedAt) ||
            !Number.isSafeInteger(identity.expiresAt) ||
            identity.issuedAt > now + 10000 ||
            identity.expiresAt <= now ||
            identity.expiresAt - identity.issuedAt !== 5 * 60000)
            return null;
        return identity;
    }
    catch (_a) {
        return null;
    }
}
