"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deinterleave3 = deinterleave3;
exports.boxDecompress = boxDecompress;
exports.blitBoxesToChunk = blitBoxesToChunk;
const voxel_collision_schema_1 = require("./voxel-collision-schema");
const rbush_schema_1 = require("../utils/rbush-schema");
function signDecode(x) {
    if (x & 1) {
        return -(x >> 1) - 1;
    }
    return x >> 1;
}
function deinterleave3(v_) {
    let v = v_ & 1227133513;
    v = (v | (v >>> 2)) & 3272356035;
    v = (v | (v >>> 4)) & 251719695;
    v = (v | (v >>> 8)) & 4278190335;
    v = (v | (v >>> 16)) & 0x3ff;
    return (v << 22) >>> 22;
}
// read input from stream
function boxDecompress(inp) {
    const numIds = inp.readVarint();
    const numBoxes = inp.readVarint();
    const idTable = new Array(numIds);
    for (let i = 0; i < numIds; ++i) {
        idTable[i] = inp.readVarint();
    }
    const boxList = rbush_schema_1.VoxelCollisionBoxListSchema.clone(rbush_schema_1.VoxelCollisionBoxListSchema.identity);
    boxList.length = numBoxes;
    let pX = 0;
    let pY = 0;
    let pZ = 0;
    for (let i = 0; i < numBoxes; ++i) {
        const b = (boxList[i] = rbush_schema_1.VoxelCollisionBoxSchema.alloc());
        const minCode = inp.readVarint();
        const maxCode = inp.readVarint();
        const idCode = inp.readVarint();
        const x0 = deinterleave3(minCode);
        const y0 = deinterleave3(minCode >>> 1);
        const z0 = deinterleave3(minCode >>> 2);
        b.minX = (signDecode(x0) + pX) & voxel_collision_schema_1.CHUNK_MASK;
        b.minY = (signDecode(y0) + pY) & voxel_collision_schema_1.CHUNK_MASK;
        b.minZ = (signDecode(z0) + pZ) & voxel_collision_schema_1.CHUNK_MASK;
        const x1 = deinterleave3(maxCode);
        const y1 = deinterleave3(maxCode >>> 1);
        const z1 = deinterleave3(maxCode >>> 2);
        b.maxX = x1 + b.minX;
        b.maxY = y1 + b.minY;
        b.maxZ = z1 + b.minZ;
        b.block = idTable[idCode];
        b.faces = 0;
        pX = b.minX;
        pY = b.minY;
        pZ = b.minZ;
    }
    return boxList;
}
// more-or-less inverse of mesh3d
function blitBoxesToChunk(chunk, boxes) {
    const { setVoxelByPtr, stride: [sx, sy, sz], offset, } = chunk;
    for (let boxId = 0; boxId < boxes.length; ++boxId) {
        const { minX, minY, minZ, maxX, maxY, maxZ, block } = boxes[boxId];
        const nx = maxX - minX;
        const ny = maxY - minY;
        const nz = maxZ - minZ;
        let tptr = offset + sx * minX + sy * minY + sz * minZ;
        const dtdi = sx;
        const dtdj = sy - nx * sx;
        const dtdk = sz - ny * sy;
        for (let k = 0; k < nz; ++k) {
            for (let j = 0; j < ny; ++j) {
                for (let i = 0; i < nx; ++i) {
                    setVoxelByPtr(tptr, block);
                    tptr += dtdi;
                }
                tptr += dtdj;
            }
            tptr += dtdk;
        }
    }
}
