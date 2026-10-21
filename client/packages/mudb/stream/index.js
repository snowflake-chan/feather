"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuReadStream = exports.MuWriteStream = exports.MuBuffer = exports.decodeUTF8 = exports.encodeUTF8 = void 0;
exports.allocBuffer = allocBuffer;
exports.freeBuffer = freeBuffer;
const root = (typeof self == 'object' && self['Object'] == Object && self)
    || (typeof global == 'object' && global['Object'] == Object && global);
if (typeof root === 'object' && 'TextEncoder' in root) {
    const encoder = new TextEncoder();
    exports.encodeUTF8 = (str) => encoder.encode(str);
    const decoder = new TextDecoder();
    exports.decodeUTF8 = (bytes) => decoder.decode(bytes);
}
else {
    const codec = require('./codec');
    exports.encodeUTF8 = codec.encode;
    exports.decodeUTF8 = codec.decode;
}
function ceilLog2(v_) {
    let v = v_ - 1;
    let r = (v > 0xFFFF) ? 1 << 4 : 0;
    v >>>= r;
    let shift = (v > 0xFF) ? 1 << 3 : 0;
    v >>>= shift;
    r |= shift;
    shift = (v > 0xF) ? 1 << 2 : 0;
    v >>>= shift;
    r |= shift;
    shift = (v > 0x3) ? 1 << 1 : 0;
    v >>>= shift;
    r |= shift;
    return (r | (v >> 1)) + 1;
}
class MuBuffer {
    constructor(buffer) {
        this.buffer = buffer;
        this.dataView = new DataView(buffer);
        this.uint8 = new Uint8Array(buffer);
    }
}
exports.MuBuffer = MuBuffer;
const bufferPool = new Array(31);
for (let i = 0; i < 31; ++i) {
    bufferPool[i] = [];
}
function allocBuffer(size) {
    if (size > 0x40000000 || size < 0) {
        throw new RangeError(`size out of range: ${size}`);
    }
    size = Math.max(2, size | 0);
    const b = ceilLog2(size);
    return bufferPool[b].pop() || new MuBuffer(new ArrayBuffer(1 << b));
}
function freeBuffer(buffer) {
    if (buffer.uint8.length > 0) {
        bufferPool[ceilLog2(buffer.uint8.length)].push(buffer);
    }
}
const LITTLE_ENDIAN = true;
class MuWriteStream {
    constructor(capacity) {
        this.buffer = allocBuffer(capacity);
        this.offset = 0;
    }
    bytes() {
        return this.buffer.uint8.subarray(0, this.offset);
    }
    destroy() {
        freeBuffer(this.buffer);
    }
    grow(bytes) {
        const newSize = this.offset + bytes;
        const uint8 = this.buffer.uint8;
        if (uint8.length < newSize) {
            const buffer = allocBuffer(newSize);
            buffer.uint8.set(uint8);
            freeBuffer(this.buffer);
            this.buffer = buffer;
        }
    }
    writeInt8(x) {
        this.buffer.dataView.setInt8(this.offset, x);
        this.offset += 1;
    }
    writeInt16(x) {
        this.buffer.dataView.setInt16(this.offset, x, LITTLE_ENDIAN);
        this.offset += 2;
    }
    writeInt32(x) {
        this.buffer.dataView.setInt32(this.offset, x, LITTLE_ENDIAN);
        this.offset += 4;
    }
    writeUint8(x) {
        this.buffer.dataView.setUint8(this.offset, x);
        this.offset += 1;
    }
    writeUint16(x) {
        this.buffer.dataView.setUint16(this.offset, x, LITTLE_ENDIAN);
        this.offset += 2;
    }
    writeUint32(x) {
        this.buffer.dataView.setUint32(this.offset, x, LITTLE_ENDIAN);
        this.offset += 4;
    }
    writeFloat32(x) {
        this.buffer.dataView.setFloat32(this.offset, x, LITTLE_ENDIAN);
        this.offset += 4;
    }
    writeFloat64(x) {
        this.buffer.dataView.setFloat64(this.offset, x, LITTLE_ENDIAN);
        this.offset += 8;
    }
    writeVarint(x) {
        const x_ = x >>> 0;
        const bytes = this.buffer.uint8;
        let offset = this.offset;
        if (x_ < 0x80) {
            bytes[offset++] = x_;
        }
        else if (x_ < 0x4000) {
            bytes[offset++] = x_ & 0x7f | 0x80;
            bytes[offset++] = x_ >>> 7;
        }
        else if (x_ < 0x200000) {
            bytes[offset++] = x_ & 0x7f | 0x80;
            bytes[offset++] = x_ >> 7 & 0x7f | 0x80;
            bytes[offset++] = x_ >>> 14;
        }
        else if (x_ < 0x10000000) {
            bytes[offset++] = x_ & 0x7f | 0x80;
            bytes[offset++] = x_ >> 7 & 0x7f | 0x80;
            bytes[offset++] = x_ >> 14 & 0x7f | 0x80;
            bytes[offset++] = x_ >>> 21;
        }
        else {
            bytes[offset++] = x_ & 0x7f | 0x80;
            bytes[offset++] = x_ >> 7 & 0x7f | 0x80;
            bytes[offset++] = x_ >> 14 & 0x7f | 0x80;
            bytes[offset++] = x_ >> 21 & 0x7f | 0x80;
            bytes[offset++] = x_ >>> 28;
        }
        this.offset = offset;
    }
    writeASCII(str) {
        const bytes = this.buffer.uint8;
        let ptr = this.offset;
        for (let i = 0; i < str.length; ++i) {
            bytes[ptr++] = str.charCodeAt(i);
        }
        this.offset = ptr;
    }
    writeString(str) {
        const bytes = (0, exports.encodeUTF8)(str);
        this.grow(5 + bytes.length);
        this.writeVarint(bytes.length);
        this.buffer.uint8.set(bytes, this.offset);
        this.offset += bytes.length;
    }
    writeUint8At(offset, x) {
        this.buffer.dataView.setUint8(offset, x);
    }
    writeUint32At(offset, x) {
        this.buffer.dataView.setUint32(offset, x, LITTLE_ENDIAN);
    }
}
exports.MuWriteStream = MuWriteStream;
class MuReadStream {
    constructor(data) {
        this.buffer = new MuBuffer(data.buffer);
        this.offset = data.byteOffset;
        this.length = data.byteLength + data.byteOffset;
    }
    bytes() {
        return this.buffer.uint8.subarray(this.offset, this.length);
    }
    checkBounds() {
        if (this.offset > this.length) {
            throw new Error('out of bounds');
        }
    }
    readInt8() {
        const offset = this.offset;
        this.offset += 1;
        this.checkBounds();
        return this.buffer.dataView.getInt8(offset);
    }
    readInt16() {
        const offset = this.offset;
        this.offset += 2;
        this.checkBounds();
        return this.buffer.dataView.getInt16(offset, LITTLE_ENDIAN);
    }
    readInt32() {
        const offset = this.offset;
        this.offset += 4;
        this.checkBounds();
        return this.buffer.dataView.getInt32(offset, LITTLE_ENDIAN);
    }
    readUint8() {
        const offset = this.offset;
        this.offset += 1;
        this.checkBounds();
        return this.buffer.dataView.getUint8(offset);
    }
    readUint16() {
        const offset = this.offset;
        this.offset += 2;
        this.checkBounds();
        return this.buffer.dataView.getUint16(offset, LITTLE_ENDIAN);
    }
    readUint32() {
        const offset = this.offset;
        this.offset += 4;
        this.checkBounds();
        return this.buffer.dataView.getUint32(offset, LITTLE_ENDIAN);
    }
    readFloat32() {
        const offset = this.offset;
        this.offset += 4;
        this.checkBounds();
        return this.buffer.dataView.getFloat32(offset, LITTLE_ENDIAN);
    }
    readFloat64() {
        const offset = this.offset;
        this.offset += 8;
        this.checkBounds();
        return this.buffer.dataView.getFloat64(offset, LITTLE_ENDIAN);
    }
    readVarint() {
        const bytes = this.buffer.uint8;
        let offset = this.offset;
        const x0 = bytes[offset++];
        if (x0 < 0x80) {
            this.offset = offset;
            this.checkBounds();
            return x0;
        }
        const x1 = bytes[offset++];
        if (x1 < 0x80) {
            this.offset = offset;
            this.checkBounds();
            return (x0 & 0x7f) |
                (x1 << 7);
        }
        const x2 = bytes[offset++];
        if (x2 < 0x80) {
            this.offset = offset;
            this.checkBounds();
            return (x0 & 0x7f) |
                ((x1 & 0x7f) << 7) |
                (x2 << 14);
        }
        const x3 = bytes[offset++];
        if (x3 < 0x80) {
            this.offset = offset;
            this.checkBounds();
            return (x0 & 0x7f) |
                ((x1 & 0x7f) << 7) |
                ((x2 & 0x7f) << 14) |
                (x3 << 21);
        }
        const x4 = bytes[offset++];
        this.offset = offset;
        this.checkBounds();
        return (x0 & 0x7f) +
            ((x1 & 0x7f) << 7) +
            ((x2 & 0x7f) << 14) +
            ((x3 & 0x7f) << 21) +
            (x4 * (1 << 28));
    }
    readASCII(length) {
        const head = this.offset;
        this.offset += length;
        this.checkBounds();
        let str = '';
        for (let i = head; i < this.offset; ++i) {
            str += String.fromCharCode(this.buffer.uint8[i]);
        }
        return str;
    }
    readString() {
        const byteLength = this.readVarint();
        const head = this.offset;
        this.offset += byteLength;
        this.checkBounds();
        const bytes = this.buffer.uint8.subarray(head, this.offset);
        return (0, exports.decodeUTF8)(bytes);
    }
    readUint8At(offset) {
        return this.buffer.dataView.getUint8(offset);
    }
}
exports.MuReadStream = MuReadStream;
//# sourceMappingURL=index.js.map