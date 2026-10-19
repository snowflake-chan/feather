"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSafeHttpUrl = isSafeHttpUrl;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;
const SCRIPT_PROTOCOL = /^(?:javascript|data|vbscript):/i;
function decodeForSafetyCheck(value) {
    let decoded = value;
    for (let i = 0; i < 2; i += 1) {
        try {
            const next = decodeURIComponent(decoded);
            if (next === decoded)
                break;
            decoded = next;
        }
        catch (_a) {
            break;
        }
    }
    return decoded;
}
function isSafeHttpUrl(url) {
    const normalizedUrl = url.trim();
    const decodedUrl = decodeForSafetyCheck(normalizedUrl).trim();
    if (!normalizedUrl ||
        CONTROL_CHARACTER.test(normalizedUrl) ||
        CONTROL_CHARACTER.test(decodedUrl) ||
        SCRIPT_PROTOCOL.test(normalizedUrl) ||
        SCRIPT_PROTOCOL.test(decodedUrl)) {
        return false;
    }
    let parsed;
    try {
        parsed = new URL(normalizedUrl);
    }
    catch (_a) {
        return false;
    }
    return ((parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        parsed.hostname !== '' &&
        parsed.username === '' &&
        parsed.password === '');
}
