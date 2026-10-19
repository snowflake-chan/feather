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
function murmur3(texture, seed, flipped = 0, rotate = 0) {
    const { width: w, height: h, data } = texture;
    const dataMapper = [
        [
            (x) => data[x],
            (x) => data[w * (h - 1) + Math.floor(x / h) - (x % h) * w],
            (x) => data[w * h - 1 - x],
            (x) => data[w - 1 - Math.floor(x / h) + (x % h) * w],
        ],
        [
            (x) => data[Math.floor(x / h) + (x % h) * w],
            (x) => data[w * (h - 1 - Math.floor(x / w)) + (x % w)],
            (x) => data[w * h - Math.floor(x / h) - 1 - (x % h) * w],
            (x) => data[Math.floor(x / w + 1) * w - 1 - (x % w)],
        ],
    ];
    const d = dataMapper[flipped][rotate];
    v[0] = seed;
    for (let i = 0, len = data.length >> 2; len > 0; len--) {
        v[1] = d(i++) | (d(i++) << 8) | (d(i++) << 16) | (d(i++) << 24);
        murmur_32_scramble();
        v[0] = (v[0] << 13) | (v[0] >>> 19);
        v[0] = Math.imul(v[0], 5) + 0xe6546b64;
    }
    v[1] = 0;
    for (let i = data.length - 1, len = data.length & 3; len > 0; len--) {
        v[1] <<= 8;
        v[1] |= d(i--);
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
