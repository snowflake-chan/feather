"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.murmur3 = murmur3;
const v = new Uint32Array(2);
function murmur_32_scramble() {
    v[1] = Math.imul(v[1], 0xcc9e2d51);
    v[1] = (v[1] << 15) | (v[1] >>> 17);
    v[1] = Math.imul(v[1], 0x1b873593);
    v[0] ^= v[1];
}
function murmur3(data, seed) {
    v[0] = seed;
    for (let i = 0, len = data.length >> 2; len > 0; len--) {
        v[1] =
            data.charCodeAt(i++) |
                (data.charCodeAt(i++) << 8) |
                (data.charCodeAt(i++) << 16) |
                (data.charCodeAt(i++) << 24);
        murmur_32_scramble();
        v[0] = (v[0] << 13) | (v[0] >>> 19);
        v[0] = Math.imul(v[0], 5) + 0xe6546b64;
    }
    v[1] = 0;
    for (let i = data.length - 1, len = data.length & 3; len > 0; len--) {
        v[1] <<= 8;
        v[1] |= data.charCodeAt(i--);
    }
    murmur_32_scramble();
    v[0] ^= data.length;
    v[0] ^= v[0] >>> 16;
    v[0] = Math.imul(v[0], 0x85ebca6b);
    v[0] ^= v[0] >>> 13;
    v[0] = Math.imul(v[0], 0xc2b2ae35);
    v[0] ^= v[0] >>> 16;
    return v[0];
}
//# sourceMappingURL=murmur3.js.map