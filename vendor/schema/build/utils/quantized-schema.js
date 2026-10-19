"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantizedVec4Schema = exports.QuantizedVec3Schema = exports.QuantizedVec2Schema = exports.QuantizedScalar = void 0;
const gl_matrix_1 = require("gl-matrix");
const math_schema_1 = require("./math-schema");
const SCHROEPPEL2 = 0xaaaaaaaa;
function readShroeppel(stream) {
    const x = stream.readVarint();
    return ((SCHROEPPEL2 ^ x) - SCHROEPPEL2) >> 0;
}
class QuantizedScalar {
    constructor(precision, identity) {
        this.precision = precision;
        this.invPrecision = 1;
        this.identity = 0;
        this.muData = {
            type: 'quantized-scalar',
            precision: 0,
            identity: 0,
        };
        this.muType = 'quantized-scalar';
        this.invPrecision = 1 / this.precision;
        if (identity) {
            this.identity =
                this.precision * (Math.round(this.invPrecision * identity) >> 0);
        }
        this.json = this.muData = {
            type: 'quantized-scalar',
            precision: this.precision,
            identity: this.identity,
        };
    }
    assign(x, y) {
        return (Math.round(this.invPrecision * y) >> 0) * this.precision;
    }
    clone(y) {
        return (Math.round(this.invPrecision * y) >> 0) * this.precision;
    }
    alloc() {
        return this.identity;
    }
    free() { }
    toJSON(x) {
        return this.precision * (Math.round(this.invPrecision * x) >> 0);
    }
    fromJSON(x) {
        if (typeof x === 'number') {
            return this.clone(x);
        }
        return this.identity;
    }
    equal(x, y) {
        const sf = this.invPrecision;
        return Math.round(sf * x) >> 0 === Math.round(sf * y) >> 0;
    }
    diff(base, target, stream) {
        const sf = this.invPrecision;
        const b = Math.round(sf * base) >> 0;
        const t = Math.round(sf * target) >> 0;
        if (b === t) {
            return false;
        }
        stream.grow(5);
        stream.writeVarint(((SCHROEPPEL2 + (t - b)) ^ SCHROEPPEL2) >>> 0);
        return true;
    }
    patch(base, stream) {
        const b = Math.round(this.invPrecision * base) >> 0;
        const d = readShroeppel(stream);
        return (b + d) * this.precision;
    }
}
exports.QuantizedScalar = QuantizedScalar;
function writeVarIntWithPrefix2(code, x, stream) {
    const x0 = x & 31;
    const x1 = x >>> 5;
    const prefix = code | (x1 ? 4 : 0);
    stream.writeUint8((prefix << 5) | x0);
    if (x1) {
        stream.writeVarint(x1);
    }
}
function readShroeppelWithPrefix2(prefix, stream) {
    let x = prefix & 31;
    if (prefix & 128) {
        x += stream.readVarint() << 5;
    }
    return ((SCHROEPPEL2 ^ x) - SCHROEPPEL2) >> 0;
}
class QuantizedVec2Schema {
    constructor(precision, identity) {
        this.precision = precision;
        this.invPrecision = 1;
        this.identity = gl_matrix_1.vec2.create();
        this.muData = {
            type: 'quantized-vec2',
            precision: 0,
            identity: [0, 0],
        };
        this.muType = 'quantized-vec2';
        this.invPrecision = 1 / this.precision;
        if (identity) {
            this.identity[0] =
                this.precision * (Math.round(this.invPrecision * identity[0]) >> 0);
            this.identity[1] =
                this.precision * (Math.round(this.invPrecision * identity[1]) >> 0);
        }
        this.json = this.muData = {
            type: 'quantized-vec2',
            precision: this.precision,
            identity: [this.identity[0], this.identity[1]],
        };
    }
    assign(x, y) {
        const ip = this.invPrecision;
        const p = this.precision;
        x[0] = (Math.round(ip * y[0]) >> 0) * p;
        x[1] = (Math.round(ip * y[1]) >> 0) * p;
        return x;
    }
    clone(x) {
        const r = math_schema_1.Vec2Schema.alloc();
        return this.assign(r, x);
    }
    alloc() {
        return math_schema_1.Vec2Schema.alloc();
    }
    free(x) {
        return math_schema_1.Vec2Schema.free(x);
    }
    toJSON(x) {
        return [
            this.precision * (Math.round(this.invPrecision * x[0]) >> 0),
            this.precision * (Math.round(this.invPrecision * x[1]) >> 0),
        ];
    }
    fromJSON(x) {
        if (Array.isArray(x) &&
            x.length === 2 &&
            typeof x[0] === 'number' &&
            typeof x[1] === 'number') {
            return this.clone(x);
        }
        return math_schema_1.Vec2Schema.clone(this.identity);
    }
    equal(x, y) {
        const sf = this.invPrecision;
        return (Math.round(sf * x[0]) >> 0 === Math.round(sf * y[0]) >> 0 &&
            Math.round(sf * x[1]) >> 0 === Math.round(sf * y[1]) >> 0);
    }
    diff(base, target, stream) {
        const sf = this.invPrecision;
        const bx = Math.round(sf * base[0]) >> 0;
        const by = Math.round(sf * base[1]) >> 0;
        const tx = Math.round(sf * target[0]) >> 0;
        const ty = Math.round(sf * target[1]) >> 0;
        if (bx === tx && by === ty) {
            return false;
        }
        const dx = ((SCHROEPPEL2 + (tx - bx)) ^ SCHROEPPEL2) >>> 0;
        const dy = ((SCHROEPPEL2 + (ty - by)) ^ SCHROEPPEL2) >>> 0;
        const code = (dx ? 1 : 0) | (dy ? 2 : 0);
        stream.grow(16);
        if (dx) {
            writeVarIntWithPrefix2(code, dx, stream);
            dy && stream.writeVarint(dy);
        }
        else {
            writeVarIntWithPrefix2(code, dy, stream);
        }
        return true;
    }
    patch(base, stream) {
        const prefix = stream.readUint8();
        let dx = 0;
        let dy = 0;
        if (prefix & 32) {
            dx = readShroeppelWithPrefix2(prefix, stream);
            prefix & 64 && (dy = readShroeppel(stream));
        }
        else {
            dy = readShroeppelWithPrefix2(prefix, stream);
        }
        const result = math_schema_1.Vec2Schema.alloc();
        const ip = this.invPrecision;
        const p = this.precision;
        const bx = Math.round(ip * base[0]) >> 0;
        const by = Math.round(ip * base[1]) >> 0;
        result[0] = p * (bx + dx);
        result[1] = p * (by + dy);
        return result;
    }
}
exports.QuantizedVec2Schema = QuantizedVec2Schema;
function writeVarIntWithPrefix3(code, x, stream) {
    const x0 = x & 15;
    const x1 = x >>> 4;
    const prefix = code | (x1 ? 8 : 0);
    stream.writeUint8((prefix << 4) | x0);
    if (x1) {
        stream.writeVarint(x1);
    }
}
function readShroeppelWithPrefix3(prefix, stream) {
    let x = prefix & 15;
    if (prefix & 128) {
        x += stream.readVarint() << 4;
    }
    return ((SCHROEPPEL2 ^ x) - SCHROEPPEL2) >> 0;
}
class QuantizedVec3Schema {
    constructor(precision, identity) {
        this.precision = precision;
        this.invPrecision = 1;
        this.identity = gl_matrix_1.vec3.create();
        this.muData = {
            type: 'quantized-vec3',
            precision: 0,
            identity: [0, 0, 0],
        };
        this.muType = 'quantized-vec3';
        this.pool = math_schema_1.Vec3Schema.pool;
        this.invPrecision = 1 / this.precision;
        if (identity) {
            this.identity[0] =
                this.precision * (Math.round(this.invPrecision * identity[0]) >> 0);
            this.identity[1] =
                this.precision * (Math.round(this.invPrecision * identity[1]) >> 0);
            this.identity[2] =
                this.precision * (Math.round(this.invPrecision * identity[2]) >> 0);
        }
        this.json = this.muData = {
            type: 'quantized-vec3',
            precision: this.precision,
            identity: [this.identity[0], this.identity[1], this.identity[2]],
        };
    }
    assign(x, y) {
        const ip = this.invPrecision;
        const p = this.precision;
        x[0] = (Math.round(ip * y[0]) >> 0) * p;
        x[1] = (Math.round(ip * y[1]) >> 0) * p;
        x[2] = (Math.round(ip * y[2]) >> 0) * p;
        return x;
    }
    clone(x) {
        const r = math_schema_1.Vec3Schema.alloc();
        return this.assign(r, x);
    }
    alloc() {
        return math_schema_1.Vec3Schema.alloc();
    }
    free(x) {
        return math_schema_1.Vec3Schema.free(x);
    }
    toJSON(x) {
        return [
            this.precision * (Math.round(this.invPrecision * x[0]) >> 0),
            this.precision * (Math.round(this.invPrecision * x[1]) >> 0),
            this.precision * (Math.round(this.invPrecision * x[2]) >> 0),
        ];
    }
    fromJSON(x) {
        if (Array.isArray(x) &&
            x.length === 3 &&
            typeof x[0] === 'number' &&
            typeof x[1] === 'number' &&
            typeof x[2] === 'number') {
            return this.clone(x);
        }
        return math_schema_1.Vec3Schema.clone(this.identity);
    }
    equal(x, y) {
        const sf = this.invPrecision;
        return (Math.round(sf * x[0]) >> 0 === Math.round(sf * y[0]) >> 0 &&
            Math.round(sf * x[1]) >> 0 === Math.round(sf * y[1]) >> 0 &&
            Math.round(sf * x[2]) >> 0 === Math.round(sf * y[2]) >> 0);
    }
    diff(base, target, stream) {
        const sf = this.invPrecision;
        const bx = Math.round(sf * base[0]) >> 0;
        const by = Math.round(sf * base[1]) >> 0;
        const bz = Math.round(sf * base[2]) >> 0;
        const tx = Math.round(sf * target[0]) >> 0;
        const ty = Math.round(sf * target[1]) >> 0;
        const tz = Math.round(sf * target[2]) >> 0;
        if (bx === tx && by === ty && bz === tz) {
            return false;
        }
        const dx = ((SCHROEPPEL2 + (tx - bx)) ^ SCHROEPPEL2) >>> 0;
        const dy = ((SCHROEPPEL2 + (ty - by)) ^ SCHROEPPEL2) >>> 0;
        const dz = ((SCHROEPPEL2 + (tz - bz)) ^ SCHROEPPEL2) >>> 0;
        const code = (dx ? 1 : 0) | (dy ? 2 : 0) | (dz ? 4 : 0);
        stream.grow(16);
        if (dx) {
            writeVarIntWithPrefix3(code, dx, stream);
            dy && stream.writeVarint(dy);
            dz && stream.writeVarint(dz);
        }
        else if (dy) {
            writeVarIntWithPrefix3(code, dy, stream);
            dz && stream.writeVarint(dz);
        }
        else {
            writeVarIntWithPrefix3(code, dz, stream);
        }
        return true;
    }
    patch(base, stream) {
        const prefix = stream.readUint8();
        let dx = 0;
        let dy = 0;
        let dz = 0;
        if (prefix & 16) {
            dx = readShroeppelWithPrefix3(prefix, stream);
            prefix & 32 && (dy = readShroeppel(stream));
            prefix & 64 && (dz = readShroeppel(stream));
        }
        else if (prefix & 32) {
            dy = readShroeppelWithPrefix3(prefix, stream);
            prefix & 64 && (dz = readShroeppel(stream));
        }
        else {
            dz = readShroeppelWithPrefix3(prefix, stream);
        }
        const result = math_schema_1.Vec3Schema.alloc();
        const ip = this.invPrecision;
        const p = this.precision;
        const bx = Math.round(ip * base[0]) >> 0;
        const by = Math.round(ip * base[1]) >> 0;
        const bz = Math.round(ip * base[2]) >> 0;
        result[0] = p * (bx + dx);
        result[1] = p * (by + dy);
        result[2] = p * (bz + dz);
        return result;
    }
}
exports.QuantizedVec3Schema = QuantizedVec3Schema;
function writeVarIntWithPrefix4(code, x, stream) {
    const x0 = x & 7;
    const x1 = x >>> 3;
    const prefix = code | (x1 ? 16 : 0);
    stream.writeUint8((prefix << 3) | x0);
    if (x1) {
        stream.writeVarint(x1);
    }
}
function readShroeppelWithPrefix4(prefix, stream) {
    let x = prefix & 7;
    if (prefix & 128) {
        x += stream.readVarint() << 3;
    }
    return ((SCHROEPPEL2 ^ x) - SCHROEPPEL2) >> 0;
}
class QuantizedVec4Schema {
    constructor(precision, identity) {
        this.precision = precision;
        this.invPrecision = 1;
        this.identity = gl_matrix_1.vec4.create();
        this.muData = {
            type: 'quantized-vec4',
            precision: 0,
            identity: [0, 0, 0, 0],
        };
        this.muType = 'quantized-vec4';
        this.invPrecision = 1 / this.precision;
        if (identity) {
            this.identity[0] =
                this.precision * (Math.round(this.invPrecision * identity[0]) >> 0);
            this.identity[1] =
                this.precision * (Math.round(this.invPrecision * identity[1]) >> 0);
            this.identity[2] =
                this.precision * (Math.round(this.invPrecision * identity[2]) >> 0);
            this.identity[3] =
                this.precision * (Math.round(this.invPrecision * identity[3]) >> 0);
        }
        this.json = this.muData = {
            type: 'quantized-vec4',
            precision: this.precision,
            identity: [
                this.identity[0],
                this.identity[1],
                this.identity[2],
                this.identity[3],
            ],
        };
    }
    assign(x, y) {
        const ip = this.invPrecision;
        const p = this.precision;
        x[0] = (Math.round(ip * y[0]) >> 0) * p;
        x[1] = (Math.round(ip * y[1]) >> 0) * p;
        x[2] = (Math.round(ip * y[2]) >> 0) * p;
        x[3] = (Math.round(ip * y[3]) >> 0) * p;
        return x;
    }
    clone(x) {
        const r = math_schema_1.Vec4Schema.alloc();
        return this.assign(r, x);
    }
    alloc() {
        return math_schema_1.Vec4Schema.alloc();
    }
    free(x) {
        return math_schema_1.Vec4Schema.free(x);
    }
    toJSON(x) {
        return [
            this.precision * (Math.round(this.invPrecision * x[0]) >> 0),
            this.precision * (Math.round(this.invPrecision * x[1]) >> 0),
            this.precision * (Math.round(this.invPrecision * x[2]) >> 0),
            this.precision * (Math.round(this.invPrecision * x[3]) >> 0),
        ];
    }
    fromJSON(x) {
        if (Array.isArray(x) &&
            x.length === 4 &&
            typeof x[0] === 'number' &&
            typeof x[1] === 'number' &&
            typeof x[2] === 'number' &&
            typeof x[3] === 'number') {
            return this.clone(x);
        }
        return math_schema_1.Vec4Schema.clone(this.identity);
    }
    equal(x, y) {
        const sf = this.invPrecision;
        return (Math.round(sf * x[0]) >> 0 === Math.round(sf * y[0]) >> 0 &&
            Math.round(sf * x[1]) >> 0 === Math.round(sf * y[1]) >> 0 &&
            Math.round(sf * x[2]) >> 0 === Math.round(sf * y[2]) >> 0 &&
            Math.round(sf * x[3]) >> 0 === Math.round(sf * y[3]) >> 0);
    }
    diff(base, target, stream) {
        const sf = this.invPrecision;
        const bx = Math.round(sf * base[0]) >> 0;
        const by = Math.round(sf * base[1]) >> 0;
        const bz = Math.round(sf * base[2]) >> 0;
        const bw = Math.round(sf * base[3]) >> 0;
        const tx = Math.round(sf * target[0]) >> 0;
        const ty = Math.round(sf * target[1]) >> 0;
        const tz = Math.round(sf * target[2]) >> 0;
        const tw = Math.round(sf * target[3]) >> 0;
        if (bx === tx && by === ty && bz === tz && bw === tw) {
            return false;
        }
        const dx = ((SCHROEPPEL2 + (tx - bx)) ^ SCHROEPPEL2) >>> 0;
        const dy = ((SCHROEPPEL2 + (ty - by)) ^ SCHROEPPEL2) >>> 0;
        const dz = ((SCHROEPPEL2 + (tz - bz)) ^ SCHROEPPEL2) >>> 0;
        const dw = ((SCHROEPPEL2 + (tw - bw)) ^ SCHROEPPEL2) >>> 0;
        const code = (dx ? 1 : 0) | (dy ? 2 : 0) | (dz ? 4 : 0) | (dw ? 8 : 0);
        stream.grow(21);
        if (dx) {
            writeVarIntWithPrefix4(code, dx, stream);
            dy && stream.writeVarint(dy);
            dz && stream.writeVarint(dz);
            dw && stream.writeVarint(dw);
        }
        else if (dy) {
            writeVarIntWithPrefix4(code, dy, stream);
            dz && stream.writeVarint(dz);
            dw && stream.writeVarint(dw);
        }
        else if (dz) {
            writeVarIntWithPrefix4(code, dz, stream);
            dw && stream.writeVarint(dw);
        }
        else {
            writeVarIntWithPrefix4(code, dw, stream);
        }
        return true;
    }
    patch(base, stream) {
        const prefix = stream.readUint8();
        let dx = 0;
        let dy = 0;
        let dz = 0;
        let dw = 0;
        if (prefix & 8) {
            dx = readShroeppelWithPrefix4(prefix, stream);
            prefix & 16 && (dy = readShroeppel(stream));
            prefix & 32 && (dz = readShroeppel(stream));
            prefix & 64 && (dw = readShroeppel(stream));
        }
        else if (prefix & 16) {
            dy = readShroeppelWithPrefix4(prefix, stream);
            prefix & 32 && (dz = readShroeppel(stream));
            prefix & 64 && (dw = readShroeppel(stream));
        }
        else if (prefix & 32) {
            dz = readShroeppelWithPrefix4(prefix, stream);
            prefix & 64 && (dw = readShroeppel(stream));
        }
        else {
            dw = readShroeppelWithPrefix4(prefix, stream);
        }
        const result = math_schema_1.Vec4Schema.alloc();
        const ip = this.invPrecision;
        const p = this.precision;
        const bx = Math.round(ip * base[0]) >> 0;
        const by = Math.round(ip * base[1]) >> 0;
        const bz = Math.round(ip * base[2]) >> 0;
        const bw = Math.round(ip * base[3]) >> 0;
        result[0] = p * (bx + dx);
        result[1] = p * (by + dy);
        result[2] = p * (bz + dz);
        result[3] = p * (bw + dw);
        return result;
    }
}
exports.QuantizedVec4Schema = QuantizedVec4Schema;
//# sourceMappingURL=quantized-schema.js.map