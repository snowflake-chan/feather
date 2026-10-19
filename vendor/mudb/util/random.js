"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randBool = randBool;
exports.randInt = randInt;
exports.randInt8 = randInt8;
exports.randInt16 = randInt16;
exports.randInt32 = randInt32;
exports.randUint8 = randUint8;
exports.randUint16 = randUint16;
exports.randUint32 = randUint32;
exports.randFloat32 = randFloat32;
exports.randFloat64 = randFloat64;
function randBool() {
    return Math.random() >= 0.5;
}
function randInt(min, max) {
    return Math.random() * (max - min + 1) + min | 0;
}
function randInt8() {
    return randInt(-0x80, 0x7F);
}
function randInt16() {
    return randInt(-0x8000, 0x7FFF);
}
function randInt32() {
    return randInt(-0x80000000, 0x7FFFFFFF);
}
function randUint8() {
    return randInt(0, 0xFF);
}
function randUint16() {
    return randInt(0, 0xFFFF);
}
function randUint32() {
    return randInt(0, 0xFFFFFFFF) >>> 0;
}
const dv = new DataView(new ArrayBuffer(8));
function randFloat32() {
    let f;
    do {
        dv.setUint32(0, randUint32(), true);
        f = dv.getFloat32(0, true);
    } while (isNaN(f));
    return f;
}
function randFloat64() {
    let f;
    do {
        dv.setUint32(0, randUint32(), true);
        dv.setUint32(4, randUint32(), true);
        f = dv.getFloat64(0, true);
    } while (isNaN(f));
    return f;
}
//# sourceMappingURL=random.js.map