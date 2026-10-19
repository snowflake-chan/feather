"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alloc = alloc;
exports.free = free;
exports.cloneU8 = cloneU8;
exports.clearMemoryPool = clearMemoryPool;
const bit_twiddle_1 = require("bit-twiddle");
const pool = new Array(32);
for (let i = 0; i < 32; ++i) {
    pool[i] = [];
}
function alloc(size) {
    const sz = (0, bit_twiddle_1.nextPow2)(size);
    const bin = pool[(0, bit_twiddle_1.log2)(sz)];
    const mem = bin.pop();
    if (mem) {
        return mem;
    }
    else {
        return new Uint8Array(sz).buffer;
    }
}
function free(buffer) {
    pool[(0, bit_twiddle_1.log2)(buffer.byteLength)].push(buffer);
}
function cloneU8(data) {
    const sz = (0, bit_twiddle_1.nextPow2)(data.length);
    const bin = pool[(0, bit_twiddle_1.log2)(sz)];
    const mem = bin.pop();
    if (mem) {
        const result = new Uint8Array(mem);
        result.set(data);
        return result;
    }
    else {
        return new Uint8Array(data);
    }
}
function clearMemoryPool() {
    for (let i = 0; i < pool.length; ++i) {
        pool[i].length = 0;
    }
}
