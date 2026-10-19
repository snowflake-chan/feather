"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBlockIndex = setBlockIndex;
exports.rebuildCollisionChunk = rebuildCollisionChunk;
exports.intializeCollision = intializeCollision;
exports.testCollideSolid = testCollideSolid;
exports.collideSolid = collideSolid;
exports.collideFluid = collideFluid;
const voxel_collision_schema_1 = require("./voxel-collision-schema");
const rbush_schema_1 = require("../utils/rbush-schema");
const rbush_1 = require("./rbush");
let BLOCK_FLUID = new Uint8Array(1);
function setBlockIndex(blockIndex) {
    if (blockIndex.isFluid) {
        BLOCK_FLUID = blockIndex.isFluid;
    }
}
const VISITED = new Uint8Array(voxel_collision_schema_1.CHUNK_SIZE * voxel_collision_schema_1.CHUNK_SIZE * voxel_collision_schema_1.CHUNK_SIZE);
const SOLID_BOXES = [];
const FLUID_BOXES = [];
const clearVisited = VISITED.fill
    ? () => VISITED.fill(0)
    : () => {
        for (let i = 0; i < VISITED.length; ++i) {
            VISITED[i] = 0;
        }
    };
clearVisited();
const VSTEP0 = 1;
const VSTEP1 = voxel_collision_schema_1.CHUNK_SIZE;
const VSTEP2 = voxel_collision_schema_1.CHUNK_SIZE * voxel_collision_schema_1.CHUNK_SIZE;
function sweepXFluid(v_ptr, a_ptr, i0, val, data, stride0) {
    let u_ptr = v_ptr + VSTEP0;
    let b_ptr = a_ptr + stride0;
    for (let j0 = 1 + i0; j0 < voxel_collision_schema_1.CHUNK_SIZE; ++j0) {
        if (VISITED[u_ptr] || data[b_ptr] !== val) {
            return j0;
        }
        VISITED[u_ptr++] = 1;
        b_ptr += stride0;
    }
    return voxel_collision_schema_1.CHUNK_SIZE;
}
function sweepYFluid(v_ptr, a_ptr, ustep1, bstep1, i0, i1, j0, val, data, stride0, stride1) {
    let u_ptr = v_ptr + VSTEP1;
    let b_ptr = a_ptr + stride1;
    for (let j1 = 1 + i1; j1 < voxel_collision_schema_1.CHUNK_SIZE; ++j1) {
        for (let k0 = i0; k0 < j0; ++k0) {
            if (VISITED[u_ptr] || data[b_ptr] !== val) {
                for (let k = i0; k < k0; ++k) {
                    VISITED[--u_ptr] = 0;
                }
                return j1;
            }
            VISITED[u_ptr++] = 1;
            b_ptr += stride0;
        }
        u_ptr += ustep1;
        b_ptr += bstep1;
    }
    return voxel_collision_schema_1.CHUNK_SIZE;
}
function sweepZFluid(v_ptr, a_ptr, ustep1, bstep1, i0, i1, i2, j0, j1, val, data, stride0, stride1, stride2) {
    const d1 = j1 - i1;
    const ustep2 = (VSTEP2 - VSTEP1 * d1) | 0;
    const bstep2 = (stride2 - stride1 * d1) | 0;
    let u_ptr = v_ptr + VSTEP2;
    let b_ptr = a_ptr + stride2;
    for (let j2 = 1 + i2; j2 < voxel_collision_schema_1.CHUNK_SIZE; ++j2) {
        for (let k1 = i1; k1 < j1; ++k1) {
            for (let k0 = i0; k0 < j0; ++k0) {
                if (VISITED[u_ptr] || data[b_ptr] !== val) {
                    for (let k = i0; k < k0; ++k) {
                        VISITED[--u_ptr] = 0;
                    }
                    for (let j = i1; j < k1; ++j) {
                        u_ptr -= ustep1;
                        for (let k = i0; k < j0; ++k) {
                            VISITED[--u_ptr] = 0;
                        }
                    }
                    return j2;
                }
                VISITED[u_ptr++] = 1;
                b_ptr += stride0;
            }
            u_ptr += ustep1;
            b_ptr += bstep1;
        }
        u_ptr += ustep2;
        b_ptr += bstep2;
    }
    return voxel_collision_schema_1.CHUNK_SIZE;
}
function checkSolid(block, faces, data, ptr, stride0, stride1, stride2) {
    return (data[ptr] === block &&
        BLOCK_FLUID[data[ptr - stride0] & 0x0fff] === (faces & 1) &&
        BLOCK_FLUID[data[ptr + stride0] & 0x0fff] === ((faces >>> 1) & 1) &&
        BLOCK_FLUID[data[ptr - stride1] & 0x0fff] === ((faces >>> 2) & 1) &&
        BLOCK_FLUID[data[ptr + stride1] & 0x0fff] === ((faces >>> 3) & 1) &&
        BLOCK_FLUID[data[ptr - stride2] & 0x0fff] === ((faces >>> 4) & 1) &&
        BLOCK_FLUID[data[ptr + stride2] & 0x0fff] === ((faces >>> 5) & 1));
}
function sweepXSolid(v_ptr, a_ptr, i0, block, faces, data, stride0, stride1, stride2) {
    let u_ptr = v_ptr + VSTEP0;
    let b_ptr = a_ptr + stride0;
    for (let j0 = 1 + i0; j0 < voxel_collision_schema_1.CHUNK_SIZE; ++j0) {
        if (VISITED[u_ptr] ||
            !checkSolid(block, faces, data, b_ptr, stride0, stride1, stride2)) {
            return j0;
        }
        VISITED[u_ptr++] = 1;
        b_ptr += stride0;
    }
    return voxel_collision_schema_1.CHUNK_SIZE;
}
function sweepYSolid(v_ptr, a_ptr, ustep1, bstep1, i0, i1, j0, block, faces, data, stride0, stride1, stride2) {
    let u_ptr = v_ptr + VSTEP1;
    let b_ptr = a_ptr + stride1;
    for (let j1 = 1 + i1; j1 < voxel_collision_schema_1.CHUNK_SIZE; ++j1) {
        for (let k0 = i0; k0 < j0; ++k0) {
            if (VISITED[u_ptr] ||
                !checkSolid(block, faces, data, b_ptr, stride0, stride1, stride2)) {
                for (let k = i0; k < k0; ++k) {
                    VISITED[--u_ptr] = 0;
                }
                return j1;
            }
            VISITED[u_ptr++] = 1;
            b_ptr += stride0;
        }
        u_ptr += ustep1;
        b_ptr += bstep1;
    }
    return voxel_collision_schema_1.CHUNK_SIZE;
}
function sweepZSolid(v_ptr, a_ptr, ustep1, bstep1, i0, i1, i2, j0, j1, block, faces, data, stride0, stride1, stride2) {
    const d1 = j1 - i1;
    const ustep2 = (VSTEP2 - VSTEP1 * d1) | 0;
    const bstep2 = (stride2 - stride1 * d1) | 0;
    let u_ptr = v_ptr + VSTEP2;
    let b_ptr = a_ptr + stride2;
    for (let j2 = 1 + i2; j2 < voxel_collision_schema_1.CHUNK_SIZE; ++j2) {
        for (let k1 = i1; k1 < j1; ++k1) {
            for (let k0 = i0; k0 < j0; ++k0) {
                if (VISITED[u_ptr] ||
                    !checkSolid(block, faces, data, b_ptr, stride0, stride1, stride2)) {
                    for (let k = i0; k < k0; ++k) {
                        VISITED[--u_ptr] = 0;
                    }
                    for (let j = i1; j < k1; ++j) {
                        u_ptr -= ustep1;
                        for (let k = i0; k < j0; ++k) {
                            VISITED[--u_ptr] = 0;
                        }
                    }
                    return j2;
                }
                VISITED[u_ptr++] = 1;
                b_ptr += stride0;
            }
            u_ptr += ustep1;
            b_ptr += bstep1;
        }
        u_ptr += ustep2;
        b_ptr += bstep2;
    }
    return voxel_collision_schema_1.CHUNK_SIZE;
}
function greedyMesh3D(voxels, tx, ty, tz) {
    const { offset, data } = voxels;
    let a_ptr = offset;
    let v_ptr = 0;
    let [stride0, stride1, stride2] = voxels.stride;
    if (voxels.dataStride) {
        stride0 = voxels.dataStride[0];
        stride1 = voxels.dataStride[1];
        stride2 = voxels.dataStride[2];
    }
    if (voxels.dataStart && voxels.dataEnd && voxels.dataStride) {
        let oz = Math.floor(voxels.offset / voxels.stride[2]);
        let oy = Math.floor((voxels.offset % voxels.stride[2]) / voxels.stride[1]);
        let ox = voxels.offset % voxels.stride[1];
        let ex = Math.min(ox + voxels.shape[0], voxels.dataEnd[0]);
        let ey = Math.min(oy + voxels.shape[1], voxels.dataEnd[1]);
        let ez = Math.min(oz + voxels.shape[2], voxels.dataEnd[2]);
        ox = ox - voxels.dataStart[0];
        oy = oy - voxels.dataStart[1];
        oz = oz - voxels.dataStart[2];
        ex = ex - voxels.dataStart[0];
        ey = ey - voxels.dataStart[1];
        ez = ez - voxels.dataStart[2];
        const startX = Math.max(ox, 0);
        const startY = Math.max(oy, 0);
        const startZ = Math.max(oz, 0);
        const endX = Math.min(startX + voxel_collision_schema_1.CHUNK_SIZE, ex);
        const endY = Math.min(startY + voxel_collision_schema_1.CHUNK_SIZE, ey);
        const endZ = Math.min(startZ + voxel_collision_schema_1.CHUNK_SIZE, ez);
        const nx = endX - startX;
        const ny = endY - startY;
        const nz = endZ - startZ;
        if (nx !== voxel_collision_schema_1.CHUNK_SIZE || ny !== voxel_collision_schema_1.CHUNK_SIZE || nz !== voxel_collision_schema_1.CHUNK_SIZE) {
            return;
        }
        a_ptr = stride0 * startX + stride1 * startY + stride2 * startZ;
    }
    const astep0 = stride0 | 0;
    const astep1 = (stride1 - stride0 * voxel_collision_schema_1.CHUNK_SIZE) | 0;
    const astep2 = (stride2 - stride1 * voxel_collision_schema_1.CHUNK_SIZE) | 0;
    for (let i2 = 0; i2 < voxel_collision_schema_1.CHUNK_SIZE; ++i2) {
        for (let i1 = 0; i1 < voxel_collision_schema_1.CHUNK_SIZE; ++i1) {
            for (let i0 = 0; i0 < voxel_collision_schema_1.CHUNK_SIZE;) {
                if (VISITED[v_ptr] === 0) {
                    const block = data[a_ptr];
                    VISITED[v_ptr] = 1;
                    if (block) {
                        if (BLOCK_FLUID[block & 0x0fff]) {
                            const j0 = sweepXFluid(v_ptr, a_ptr, i0, block, data, stride0);
                            const d0 = j0 - i0;
                            const ustep1 = (VSTEP1 - VSTEP0 * d0) | 0;
                            const bstep1 = (stride1 - stride0 * d0) | 0;
                            const j1 = sweepYFluid(v_ptr, a_ptr, ustep1, bstep1, i0, i1, j0, block, data, stride0, stride1);
                            const j2 = sweepZFluid(v_ptr, a_ptr, ustep1, bstep1, i0, i1, i2, j0, j1, block, data, stride0, stride1, stride2);
                            const box = rbush_schema_1.VoxelCollisionBoxSchema.alloc();
                            box.minX = i0 + tx;
                            box.minY = i1 + ty;
                            box.minZ = i2 + tz;
                            box.maxX = j0 + tx;
                            box.maxY = j1 + ty;
                            box.maxZ = j2 + tz;
                            box.block = block;
                            box.faces = 0x3f;
                            FLUID_BOXES.push(box);
                            i0 = j0;
                            v_ptr += d0;
                            a_ptr += astep0 * d0;
                        }
                        else {
                            const faces = BLOCK_FLUID[data[a_ptr - stride0] & 0x0fff] |
                                (BLOCK_FLUID[data[a_ptr + stride0] & 0x0fff] << 1) |
                                (BLOCK_FLUID[data[a_ptr - stride1] & 0x0fff] << 2) |
                                (BLOCK_FLUID[data[a_ptr + stride1] & 0x0fff] << 3) |
                                (BLOCK_FLUID[data[a_ptr - stride2] & 0x0fff] << 4) |
                                (BLOCK_FLUID[data[a_ptr + stride2] & 0x0fff] << 5);
                            const j0 = sweepXSolid(v_ptr, a_ptr, i0, block, faces, data, stride0, stride1, stride2);
                            const d0 = j0 - i0;
                            const ustep1 = (VSTEP1 - VSTEP0 * d0) | 0;
                            const bstep1 = (stride1 - stride0 * d0) | 0;
                            const j1 = sweepYSolid(v_ptr, a_ptr, ustep1, bstep1, i0, i1, j0, block, faces, data, stride0, stride1, stride2);
                            const j2 = sweepZSolid(v_ptr, a_ptr, ustep1, bstep1, i0, i1, i2, j0, j1, block, faces, data, stride0, stride1, stride2);
                            const box = rbush_schema_1.VoxelCollisionBoxSchema.alloc();
                            box.minX = i0 + tx;
                            box.minY = i1 + ty;
                            box.minZ = i2 + tz;
                            box.maxX = j0 + tx;
                            box.maxY = j1 + ty;
                            box.maxZ = j2 + tz;
                            box.block = block;
                            box.faces = faces;
                            SOLID_BOXES.push(box);
                            i0 = j0;
                            v_ptr += d0;
                            a_ptr += astep0 * d0;
                        }
                    }
                    else {
                        ++i0;
                        ++v_ptr;
                        a_ptr += astep0;
                    }
                }
                else {
                    ++i0;
                    ++v_ptr;
                    a_ptr += astep0;
                }
            }
            a_ptr += astep1;
        }
        a_ptr += astep2;
    }
}
function rebuildCollisionChunk(voxels, chunk) {
    // clear visited voxels
    clearVisited();
    // generate mesh
    const tx = chunk.i << voxel_collision_schema_1.CHUNK_SHIFT;
    const ty = chunk.j << voxel_collision_schema_1.CHUNK_SHIFT;
    const tz = chunk.k << voxel_collision_schema_1.CHUNK_SHIFT;
    greedyMesh3D(voxels, tx, ty, tz);
    // update rbushes
    if (SOLID_BOXES.length > 0) {
        chunk.hasSolid = true;
        rbush_schema_1.RBushSchema.free(chunk.rbush);
        chunk.rbush = (0, rbush_1.createRBush)(SOLID_BOXES, 0, SOLID_BOXES.length - 1, 0);
    }
    else {
        chunk.hasSolid = false;
        rbush_schema_1.RBushSchema.assign(chunk.rbush, rbush_schema_1.RBushSchema.identity);
    }
    SOLID_BOXES.length = 0;
    if (FLUID_BOXES.length > 0) {
        chunk.hasFluid = true;
        rbush_schema_1.RBushSchema.free(chunk.fluidRBush);
        chunk.fluidRBush = (0, rbush_1.createRBush)(FLUID_BOXES, 0, FLUID_BOXES.length - 1, 0);
    }
    else {
        chunk.hasFluid = false;
        rbush_schema_1.RBushSchema.assign(chunk.fluidRBush, rbush_schema_1.RBushSchema.identity);
    }
    FLUID_BOXES.length = 0;
}
function intializeCollision(blockIndex, collision, voxels) {
    // clear all memory
    voxel_collision_schema_1.VoxelCollisionSchema.assign(collision, voxel_collision_schema_1.VoxelCollisionSchema.identity);
    // initialize shape
    const cx = (collision.chunkDimI = voxels.shape[0] >> voxel_collision_schema_1.CHUNK_SHIFT);
    const cy = (collision.chunkDimJ = voxels.shape[1] >> voxel_collision_schema_1.CHUNK_SHIFT);
    const cz = (collision.chunkDimK = voxels.shape[2] >> voxel_collision_schema_1.CHUNK_SHIFT);
    // initialize chunks
    let ptr = 0;
    collision.chunks.length = cx * cy * cz;
    setBlockIndex(blockIndex);
    for (let z = 0; z < cz; ++z) {
        for (let y = 0; y < cy; ++y) {
            for (let x = 0; x < cx; ++x) {
                const c = voxel_collision_schema_1.VoxelCollisionChunkSchema.alloc();
                c.i = x;
                c.j = y;
                c.k = z;
                rebuildCollisionChunk(voxels.slice([x << voxel_collision_schema_1.CHUNK_SHIFT, y << voxel_collision_schema_1.CHUNK_SHIFT, z << voxel_collision_schema_1.CHUNK_SHIFT], [
                    (x + 1) << voxel_collision_schema_1.CHUNK_SHIFT,
                    (y + 1) << voxel_collision_schema_1.CHUNK_SHIFT,
                    (z + 1) << voxel_collision_schema_1.CHUNK_SHIFT,
                ]), c);
                collision.chunks[ptr++] = c;
            }
        }
    }
}
function clampShift(x, chunkDim) {
    return Math.max(Math.min(x >> voxel_collision_schema_1.CHUNK_SHIFT, chunkDim), 0);
}
function testCollideSolid(collision, lox, loy, loz, hix, hiy, hiz) {
    const { chunkDimI, chunkDimJ, chunkDimK, chunks } = collision;
    const i0 = clampShift(Math.floor(lox), chunkDimI);
    const j0 = clampShift(Math.floor(loy), chunkDimJ);
    const k0 = clampShift(Math.floor(loz), chunkDimK);
    const i1 = clampShift(Math.ceil(hix + voxel_collision_schema_1.CHUNK_SIZE), chunkDimI);
    const j1 = clampShift(Math.ceil(hiy + voxel_collision_schema_1.CHUNK_SIZE), chunkDimJ);
    const k1 = clampShift(Math.ceil(hiz + voxel_collision_schema_1.CHUNK_SIZE), chunkDimK);
    for (let k = k0; k < k1; ++k) {
        for (let j = j0; j < j1; ++j) {
            for (let i = i0; i < i1; ++i) {
                const c = chunks[i + chunkDimI * (j + chunkDimJ * k)];
                if (c.hasSolid) {
                    if ((0, rbush_1.testRBush)(c.rbush, lox, loy, loz, hix, hiy, hiz)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
function collideSolid(result, collision, lox, loy, loz, hix, hiy, hiz) {
    const { chunkDimI, chunkDimJ, chunkDimK, chunks } = collision;
    const i0 = clampShift(Math.floor(lox), chunkDimI);
    const j0 = clampShift(Math.floor(loy), chunkDimJ);
    const k0 = clampShift(Math.floor(loz), chunkDimK);
    const i1 = clampShift(Math.ceil(hix + voxel_collision_schema_1.CHUNK_SIZE), chunkDimI);
    const j1 = clampShift(Math.ceil(hiy + voxel_collision_schema_1.CHUNK_SIZE), chunkDimJ);
    const k1 = clampShift(Math.ceil(hiz + voxel_collision_schema_1.CHUNK_SIZE), chunkDimK);
    for (let k = k0; k < k1; ++k) {
        for (let j = j0; j < j1; ++j) {
            for (let i = i0; i < i1; ++i) {
                const c = chunks[i + chunkDimI * (j + chunkDimJ * k)];
                if (c.hasSolid) {
                    (0, rbush_1.searchRBush)(result, c.rbush, lox, loy, loz, hix, hiy, hiz);
                }
            }
        }
    }
}
function collideFluid(result, collision, lox, loy, loz, hix, hiy, hiz) {
    const { chunkDimI, chunkDimJ, chunkDimK, chunks } = collision;
    const i0 = clampShift(Math.floor(lox), chunkDimI);
    const j0 = clampShift(Math.floor(loy), chunkDimJ);
    const k0 = clampShift(Math.floor(loz), chunkDimK);
    const i1 = clampShift(Math.ceil(hix + voxel_collision_schema_1.CHUNK_SIZE), chunkDimI);
    const j1 = clampShift(Math.ceil(hiy + voxel_collision_schema_1.CHUNK_SIZE), chunkDimJ);
    const k1 = clampShift(Math.ceil(hiz + voxel_collision_schema_1.CHUNK_SIZE), chunkDimK);
    for (let k = k0; k < k1; ++k) {
        for (let j = j0; j < j1; ++j) {
            for (let i = i0; i < i1; ++i) {
                const chunk = chunks[i + chunkDimI * (j + chunkDimJ * k)];
                if (chunk.hasFluid) {
                    (0, rbush_1.searchRBush)(result, chunk.fluidRBush, lox, loy, loz, hix, hiy, hiz);
                }
            }
        }
    }
}
//# sourceMappingURL=voxel-collision.js.map