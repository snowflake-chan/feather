"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMeshSchema = exports.CompactModel = void 0;
const stream_1 = require("@box/mudb/stream");
const pool_1 = require("@box/utils/pool");
const voxle_fill_1 = require("@box/utils/voxle-fill");
const AO_TABLE = new Uint8Array([0, 153, 204, 255]);
class CompactModel {
    constructor(data, sliceInfo, material, surfaceCount) {
        this.data = data;
        this.sliceInfo = sliceInfo;
        this.material = material;
        this.surfaceCount = surfaceCount;
    }
    spread() {
        const meshBuffer = new Uint8Array(this.surfaceCount * 6 * 8);
        const pbrBuffer = new Uint8Array(this.surfaceCount * 6 * 4);
        let ptr = 0;
        let pbr_ptr = 0;
        let quad_ptr = 0;
        let slice_ptr = 0;
        while (slice_ptr < this.sliceInfo.length) {
            const normal_code = this.sliceInfo[slice_ptr++];
            const normal_code_count = this.sliceInfo[slice_ptr++];
            for (let j = 0; j < normal_code_count; j++) {
                const z = this.sliceInfo[slice_ptr++];
                const z_count = this.sliceInfo[slice_ptr++];
                for (let k = 0; k < z_count; k++, quad_ptr++) {
                    const lo_x = this.data[quad_ptr * 6];
                    const lo_y = this.data[quad_ptr * 6 + 1];
                    const hi_x = this.data[quad_ptr * 6 + 2];
                    const hi_y = this.data[quad_ptr * 6 + 3];
                    const m_idx = this.data[quad_ptr * 6 + 4];
                    const packedAO = this.data[quad_ptr * 6 + 5];
                    let u;
                    let v;
                    let d;
                    if (normal_code === 0 || normal_code === 1) {
                        u = 2;
                        v = 1;
                        d = 0;
                    }
                    else if (normal_code === 2 || normal_code === 3) {
                        u = 0;
                        v = 2;
                        d = 1;
                    }
                    else if (normal_code === 4 || normal_code === 5) {
                        u = 1;
                        v = 0;
                        d = 2;
                    }
                    const a00 = AO_TABLE[packedAO & 3];
                    const a10 = AO_TABLE[(packedAO & 12) >> 2];
                    const a11 = AO_TABLE[(packedAO & 48) >> 4];
                    const a01 = AO_TABLE[packedAO >> 6];
                    let flip = false;
                    if (normal_code == 0 || normal_code == 2 || normal_code == 4) {
                        flip = true;
                    }
                    let flipAO = a00 + a11 < a10 + a01;
                    if (a00 + a11 === a10 + a01) {
                        flipAO = Math.max(a00, a11) < Math.max(a10, a01);
                    }
                    if (flipAO) {
                        if (!flip) {
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a00;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a01;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a10;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a11;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a10;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a01;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                        }
                        else {
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a00;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a10;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a01;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a11;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a01;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a10;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                        }
                    }
                    else {
                        //Check if flipped
                        if (flip) {
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a01;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a00;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a11;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a10;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a11;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a00;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                        }
                        else {
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a00;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a01;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a11;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = hi_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a11;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = hi_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a10;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                            meshBuffer[ptr + u] = lo_x;
                            meshBuffer[ptr + v] = lo_y;
                            meshBuffer[ptr + d] = z;
                            meshBuffer[ptr + 3] = a00;
                            meshBuffer[ptr + 4] = this.material[m_idx].rgb[0];
                            meshBuffer[ptr + 5] = this.material[m_idx].rgb[1];
                            meshBuffer[ptr + 6] = this.material[m_idx].rgb[2];
                            meshBuffer[ptr + 7] = normal_code;
                            ptr += 8;
                        }
                    }
                    for (let l = 0; l < 6; l++) {
                        pbrBuffer[pbr_ptr++] = this.material[m_idx].pbr[0];
                        pbrBuffer[pbr_ptr++] = this.material[m_idx].pbr[1];
                        pbrBuffer[pbr_ptr++] = this.material[m_idx].pbr[2];
                        pbrBuffer[pbr_ptr++] = m_idx;
                    }
                }
            }
        }
        return { meshBuffer, pbrBuffer };
    }
}
exports.CompactModel = CompactModel;
// FIXME: this is not a correct usage of MuSchema
// This this should just be a constant, not a class.
class ModelMeshSchema {
    constructor() {
        this.identity = new CompactModel(new Uint8Array((0, pool_1.alloc)(1)), [], {}, 0);
        this.muType = 'model_mesh';
        this.json = {
            type: 'model_mesh',
        };
    }
    alloc() {
        return new CompactModel(new Uint8Array((0, pool_1.alloc)(1)), [], {}, 0);
    }
    free(model) {
        (0, pool_1.free)(model.data.buffer);
        model.sliceInfo = [];
        model.material = {};
        model.surfaceCount = 0;
    }
    equal(a, b) {
        if (a.surfaceCount !== b.surfaceCount) {
            return false;
        }
        if (a.sliceInfo.length !== b.sliceInfo.length) {
            return false;
        }
        else {
            for (let i = 0; i < a.sliceInfo.length; i++) {
                if (a.sliceInfo[i] !== b.sliceInfo[i]) {
                    return false;
                }
            }
        }
        if (JSON.stringify(a.material) !== JSON.stringify(b.material)) {
            return false;
        }
        const dataByteLen = a.surfaceCount * 5;
        for (let i = 0; i < dataByteLen; i++) {
            if (a.data[i] !== b.data[i]) {
                return false;
            }
        }
        return true;
    }
    clone(m) {
        const dataByteLen = m.surfaceCount * 6;
        const data = new Uint8Array((0, pool_1.alloc)(dataByteLen));
        (0, voxle_fill_1.fillArray)(data, 0);
        for (let i = 0; i < dataByteLen; i++) {
            data[i] = m.data[i];
        }
        const sliceInfo = [];
        for (let i = 0; i < m.sliceInfo.length; i++) {
            sliceInfo[i] = m.sliceInfo[i];
        }
        const material = JSON.parse(JSON.stringify(m.material));
        const result = new CompactModel(data, sliceInfo, material, m.surfaceCount);
        return result;
    }
    assign(dst, src) {
        const dataLen = src.surfaceCount * 6;
        if (dst.surfaceCount !== src.surfaceCount) {
            if (dst.data.length < src.data.length) {
                (0, pool_1.free)(dst.data.buffer);
                dst.data = new Uint8Array((0, pool_1.alloc)(dataLen));
            }
        }
        (0, voxle_fill_1.fillArray)(dst.data, 0);
        for (let i = 0; i < dataLen; i++) {
            dst.data[i] = src.data[i];
        }
        dst.sliceInfo = [];
        for (let i = 0; i < src.sliceInfo.length; i++) {
            dst.sliceInfo[i] = src.sliceInfo[i];
        }
        dst.material = JSON.parse(JSON.stringify(src.material));
        dst.surfaceCount = src.surfaceCount;
        return dst;
    }
    diff(base, target, out) {
        const surfaceCount = target.surfaceCount;
        const dataLen = surfaceCount * 6;
        out.grow(4);
        out.writeInt32(-11);
        out.grow(5);
        out.writeVarint(surfaceCount);
        const keys = Object.keys(target.material);
        out.grow(5);
        out.writeVarint(keys.length);
        out.grow(5);
        out.writeVarint(target.sliceInfo.length);
        for (let i = 0; i < keys.length; i++) {
            out.grow(7);
            const _m = target.material[keys[i]];
            out.writeUint8(Number(keys[i]));
            out.writeUint8(_m.rgb[0]);
            out.writeUint8(_m.rgb[1]);
            out.writeUint8(_m.rgb[2]);
            out.writeUint8(_m.pbr[0]);
            out.writeUint8(_m.pbr[1]);
            out.writeUint8(_m.pbr[2]);
        }
        let slice_ptr = 0;
        for (let i = 0; i < target.sliceInfo.length / 2; i++) {
            out.grow(1);
            out.writeUint8(target.sliceInfo[slice_ptr++]);
            out.grow(5);
            out.writeVarint(target.sliceInfo[slice_ptr++]);
        }
        for (let i = 0; i < dataLen; i++) {
            out.grow(1);
            out.writeUint8(target.data[i]);
        }
        return true;
    }
    patch(base, inp) {
        const flag = inp.readInt32();
        if (flag === -11) {
            const surfaceCount = inp.readVarint();
            const dataLen = surfaceCount * 6;
            const data = new Uint8Array((0, pool_1.alloc)(dataLen));
            (0, voxle_fill_1.fillArray)(data, 0);
            const materialCount = inp.readVarint();
            const sliceInfoCount = inp.readVarint();
            const sliceInfo = [];
            const material = {};
            for (let i = 0; i < materialCount; i++) {
                const m_idx = inp.readUint8();
                const r = inp.readUint8();
                const g = inp.readUint8();
                const b = inp.readUint8();
                const metalness = inp.readUint8();
                const smoothness = inp.readUint8();
                const emissive = inp.readUint8();
                material[m_idx] = {
                    rgb: [r, g, b],
                    pbr: [metalness, smoothness, emissive],
                };
            }
            for (let i = 0; i < sliceInfoCount / 2; i++) {
                sliceInfo.push(inp.readUint8());
                sliceInfo.push(inp.readVarint());
            }
            for (let i = 0; i < dataLen; i++) {
                data[i] = inp.readUint8();
            }
            return new CompactModel(data, sliceInfo, material, surfaceCount);
        }
        return null;
    }
    toJSON(m) {
        const out = new stream_1.MuWriteStream(1);
        this.diff(undefined, m, out);
        const buffer = out.buffer;
        const rst = [];
        for (let i = 0; i < buffer.uint8.byteLength; i++) {
            rst[i] = buffer.uint8[i];
        }
        out.destroy();
        return rst;
    }
    fromJSON(json) {
        const inp = new stream_1.MuReadStream(new Uint8Array(json));
        return this.patch(undefined, inp);
    }
}
exports.ModelMeshSchema = ModelMeshSchema;
function writeRun(out, runLength, value) {
    if (runLength) {
        out.grow(10);
        out.writeVarint(runLength - 1);
        out.writeVarint(value);
    }
}
function rle_compress(buffer, out, count) {
    let prevValue = -1;
    let runLength = 0;
    for (let i = 0; i < count; i++) {
        const v = buffer[i];
        if (v !== prevValue) {
            writeRun(out, runLength, prevValue);
            runLength = 0;
            prevValue = v;
        }
        runLength += 1;
    }
    writeRun(out, runLength, prevValue);
    return true;
}
function rle_decompress(inp, buffer, count) {
    for (let i = 0; i < count;) {
        const length = inp.readVarint() + 1;
        const value = inp.readVarint();
        for (let j = 0; j < length; j++) {
            buffer[i++] = value;
        }
    }
    return true;
}
//# sourceMappingURL=modelMeshSchema.js.map