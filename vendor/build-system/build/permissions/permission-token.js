"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePermissionToken = generatePermissionToken;
exports.parsePermissionToken = parsePermissionToken;
const permission_rda_1 = require("@box/schema/permissions/permission-rda");
const stream_1 = require("@box/mudb/stream");
const crypto_1 = __importDefault(require("crypto"));
const HMAC_LENGTH = 42;
const MAX_TOKEN_LENGTH = 256;
const HMAC_TYPE = 'sha256';
function generatePermissionToken(secret, token) {
    const stream = new stream_1.MuWriteStream(512);
    try {
        // serialize and base64 encode stream
        if (!permission_rda_1.PermissionTokenSchema.diff(permission_rda_1.PermissionTokenSchema.identity, token, stream)) {
            return '';
        }
        const bytes = stream.bytes();
        const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const payload = buffer.toString('base64');
        // compute hmac
        const hmac = crypto_1.default.createHmac(HMAC_TYPE, secret);
        hmac.update(payload);
        const digest = hmac.digest('base64').slice(0, HMAC_LENGTH);
        return digest + payload;
    }
    finally {
        stream.destroy();
    }
    return '';
}
function parsePermissionToken(secret, message) {
    if (message.length > MAX_TOKEN_LENGTH || message.length <= HMAC_LENGTH) {
        return null;
    }
    const payload = message.slice(HMAC_LENGTH);
    const hmac = crypto_1.default.createHmac(HMAC_TYPE, secret);
    hmac.update(payload);
    const digest = hmac.digest('base64');
    if (digest.slice(0, HMAC_LENGTH) !== message.slice(0, HMAC_LENGTH)) {
        return null;
    }
    try {
        const buffer = new Buffer(payload, 'base64');
        const stream = new stream_1.MuReadStream(new Uint8Array(buffer));
        const token = permission_rda_1.PermissionTokenSchema.patch(permission_rda_1.PermissionTokenSchema.identity, stream);
        if (token.expireAt < new Date()) {
            permission_rda_1.PermissionTokenSchema.free(token);
            return null;
        }
        return token;
    }
    catch (e) {
        return null;
    }
}
//# sourceMappingURL=permission-token.js.map