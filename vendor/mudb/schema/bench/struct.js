"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const _do_1 = require("./_do");
{
    const struct = new __1.MuStruct({
        a: new __1.MuUint8(),
        b: new __1.MuUint8(),
    });
    (0, _do_1.deltaByteLength)(struct, { a: 0, b: 0 }, { a: 1, b: 0 });
    (0, _do_1.deltaByteLength)(struct, { a: 0, b: 0 }, { a: 1, b: 2 });
    const s0 = { a: 0, b: 0 };
    const s1 = { a: 1, b: 2 };
    (0, _do_1.diffPatchDuration)(struct, s1, s1, 1e3, 'uint8 - b=t');
    (0, _do_1.diffPatchDuration)(struct, s0, s1, 1e3, 'uint8 - b!=t');
    (0, _do_1.diffPatchDuration)(struct, s0, s1, 1e4, 'uint8 - b!=t');
    (0, _do_1.diffPatchDuration)(struct, s0, s1, 1e5, 'uint8 - b!=t');
}
{
    const struct = new __1.MuStruct({
        v: new __1.MuVarint(),
        rv: new __1.MuRelativeVarint(),
    });
    (0, _do_1.deltaByteLength)(struct, { v: 0, rv: 0 }, { v: 0x7f, rv: 0 });
    (0, _do_1.deltaByteLength)(struct, { v: 0, rv: 0 }, { v: 0x80, rv: 0 });
    (0, _do_1.deltaByteLength)(struct, { v: 0, rv: 0 }, { v: 0x80, rv: -0x2a });
    (0, _do_1.deltaByteLength)(struct, { v: 0, rv: 0 }, { v: 0x80, rv: -0x2b });
    const s0 = { v: 0, rv: 0 };
    const s1 = { v: 0x7f, rv: -0x2a };
    const s2 = { v: 0x80, rv: -0x2b };
    (0, _do_1.diffPatchDuration)(struct, s1, s1, 1e3, 'varint - b=t');
    (0, _do_1.diffPatchDuration)(struct, s0, s1, 1e3, 'varint - one byte');
    (0, _do_1.diffPatchDuration)(struct, s0, s1, 1e4, 'varint - one byte');
    (0, _do_1.diffPatchDuration)(struct, s0, s1, 1e5, 'varint - one byte');
    (0, _do_1.diffPatchDuration)(struct, s0, s2, 1e3, 'varint - two bytes');
    (0, _do_1.diffPatchDuration)(struct, s0, s2, 1e4, 'varint - two bytes');
    (0, _do_1.diffPatchDuration)(struct, s0, s2, 1e5, 'varint - two bytes');
}
{
    const struct = new __1.MuStruct({
        vec2: new __1.MuVector(new __1.MuFloat32(), 2),
        vec3: new __1.MuVector(new __1.MuFloat32(), 3),
    });
    const s0 = {
        vec2: Float32Array.from([0, 0]),
        vec3: Float32Array.from([0, 0, 0]),
    };
    const s1 = {
        vec2: Float32Array.from([0.5, 1.5]),
        vec3: Float32Array.from([0.5, 1.5, 2.5]),
    };
    (0, _do_1.diffPatchDuration)(struct, s0, s0, 1e3, 'vector - b=t');
    (0, _do_1.diffPatchDuration)(struct, s0, s1, 1e3, 'vector - b!=t');
    (0, _do_1.diffPatchDuration)(struct, s0, s1, 1e4, 'vector - b!=t');
    (0, _do_1.diffPatchDuration)(struct, s0, s1, 1e5, 'vector - b!=t');
}
//# sourceMappingURL=struct.js.map