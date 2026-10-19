"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundsSchema = exports.Mat4Schema = exports.Mat3Schema = exports.Mat2Schema = exports.QuatSchema = exports.Vec4Schema = exports.Vec3Schema = exports.Vec2Schema = exports.NumSchema = void 0;
const gl_matrix_1 = require("gl-matrix");
const float32_1 = require("@box/mudb/schema/float32");
const struct_1 = require("@box/mudb/schema/struct");
const vector_1 = require("@box/mudb/schema/vector");
exports.NumSchema = new float32_1.MuFloat32();
exports.Vec2Schema = new vector_1.MuVector(new float32_1.MuFloat32(), 2);
const vec3Pool = [];
exports.Vec3Schema = {
    muType: 'vector',
    identity: gl_matrix_1.vec3.create(),
    json: {
        type: 'vector',
        data: [0, 0, 0],
    },
    alloc: () => {
        return vec3Pool.pop() || gl_matrix_1.vec3.create();
    },
    free: (v) => {
        vec3Pool.push(v);
    },
    assign: (dst, src) => {
        dst[0] = src[0];
        dst[1] = src[1];
        dst[2] = src[2];
        return dst;
    },
    equal: (dst, src) => {
        return dst[0] === src[0] && dst[1] === src[1] && dst[2] === src[2];
    },
    diff: (base, target, out) => {
        const s0 = (base[0] !== target[0]) << 0;
        const s1 = (base[1] !== target[1]) << 1;
        const s2 = (base[2] !== target[2]) << 2;
        const flags = s0 + s1 + s2;
        if (flags === 0) {
            return false;
        }
        out.grow(13);
        out.writeUint8(flags);
        if (s0) {
            out.writeFloat32(target[0]);
        }
        if (s1) {
            out.writeFloat32(target[1]);
        }
        if (s2) {
            out.writeFloat32(target[2]);
        }
        return true;
    },
    patch: (base, inp) => {
        const v = vec3Pool.pop() || gl_matrix_1.vec3.create();
        const flags = inp.readUint8();
        v[0] = flags & 1 ? inp.readFloat32() : base[0];
        v[1] = flags & 2 ? inp.readFloat32() : base[1];
        v[2] = flags & 4 ? inp.readFloat32() : base[2];
        return v;
    },
    clone: (v) => {
        const x = vec3Pool.pop();
        if (x) {
            x[0] = v[0];
            x[1] = v[1];
            x[2] = v[2];
            return x;
        }
        return gl_matrix_1.vec3.clone(v);
    },
    toJSON: (v) => [v[0], v[1], v[2]],
    fromJSON: (json) => {
        let v = vec3Pool.pop();
        if (Array.isArray(json)) {
            v = v || gl_matrix_1.vec3.create();
            v[0] = +json[0] || 0;
            v[1] = +json[1] || 0;
            v[2] = +json[2] || 0;
            return v;
        }
        else if (v) {
            v[0] = v[1] = v[2] = 0;
            return v;
        }
        else {
            return gl_matrix_1.vec3.create();
        }
    },
};
const vec4Pool = [];
exports.Vec4Schema = {
    muType: 'vector',
    identity: gl_matrix_1.vec4.create(),
    json: {
        type: 'vector',
        data: [0, 0, 0, 0],
    },
    alloc: () => {
        return vec4Pool.pop() || gl_matrix_1.vec4.create();
    },
    free: (v) => {
        vec4Pool.push(v);
    },
    assign: (dst, src) => {
        dst[0] = src[0];
        dst[1] = src[1];
        dst[2] = src[2];
        dst[3] = src[3];
        return dst;
    },
    equal: (dst, src) => {
        return (dst[0] === src[0] &&
            dst[1] === src[1] &&
            dst[2] === src[2] &&
            dst[3] === src[3]);
    },
    diff: (base, target, out) => {
        const s0 = (base[0] !== target[0]) << 0;
        const s1 = (base[1] !== target[1]) << 1;
        const s2 = (base[2] !== target[2]) << 2;
        const s3 = (base[3] !== target[3]) << 3;
        const flags = s0 + s1 + s2 + s3;
        if (flags === 0) {
            return false;
        }
        out.grow(17);
        out.writeUint8(flags);
        if (s0) {
            out.writeFloat32(target[0]);
        }
        if (s1) {
            out.writeFloat32(target[1]);
        }
        if (s2) {
            out.writeFloat32(target[2]);
        }
        if (s3) {
            out.writeFloat32(target[3]);
        }
        return true;
    },
    patch: (base, inp) => {
        const v = vec4Pool.pop() || gl_matrix_1.vec4.create();
        const flags = inp.readUint8();
        v[0] = flags & 1 ? inp.readFloat32() : base[0];
        v[1] = flags & 2 ? inp.readFloat32() : base[1];
        v[2] = flags & 4 ? inp.readFloat32() : base[2];
        v[3] = flags & 8 ? inp.readFloat32() : base[3];
        return v;
    },
    clone: (v) => {
        const x = vec4Pool.pop();
        if (x) {
            x[0] = v[0];
            x[1] = v[1];
            x[2] = v[2];
            x[3] = v[3];
            return x;
        }
        return gl_matrix_1.vec4.clone(v);
    },
    toJSON: (v) => [v[0], v[1], v[2], v[3]],
    fromJSON: (json) => {
        let v = vec4Pool.pop();
        if (Array.isArray(json)) {
            v = v || gl_matrix_1.vec4.create();
            v[0] = +json[0] || 0;
            v[1] = +json[1] || 0;
            v[2] = +json[2] || 0;
            v[3] = +json[3] || 0;
            return v;
        }
        else if (v) {
            v[0] = v[1] = v[2] = v[3] = 0;
            return v;
        }
        else {
            return gl_matrix_1.vec4.create();
        }
    },
};
exports.QuatSchema = exports.Vec4Schema;
exports.Mat2Schema = exports.Vec4Schema;
exports.Mat3Schema = new vector_1.MuVector(new float32_1.MuFloat32(), 9);
exports.Mat4Schema = (new vector_1.MuVector(new float32_1.MuFloat32(), 16));
exports.BoundsSchema = new struct_1.MuStruct({
    lo: exports.Vec3Schema,
    hi: exports.Vec3Schema,
});
