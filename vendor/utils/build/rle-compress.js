"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compress = compress;
exports.decompress = decompress;
exports.sectionDecompress = sectionDecompress;
exports.old_decompress = old_decompress;
function writeRun(out, runLength, block) {
    if (runLength) {
        out.grow(10);
        out.writeVarint(runLength - 1);
        out.writeVarint(block);
    }
}
function compress(voxels, out) {
    const { data, shape: [nx, ny, nz], stride: [sx, sy, sz], offset, } = voxels;
    let prevBlock = -1;
    let runLength = 0;
    let ptr = offset;
    const stepi = sx;
    const stepj = sy - sx * nx;
    const stepk = sz - sy * ny;
    for (let k = 0; k < nz; ++k) {
        for (let j = 0; j < ny; ++j) {
            for (let i = 0; i < nx; ++i) {
                const b = data[ptr];
                if (b !== prevBlock) {
                    writeRun(out, runLength, prevBlock);
                    runLength = 0;
                    prevBlock = b;
                }
                runLength += 1;
                ptr += stepi;
            }
            ptr += stepj;
        }
        ptr += stepk;
    }
    writeRun(out, runLength, prevBlock);
    return true;
}
function fastDecompress(inp, data, count) {
    for (let ptr = 0; ptr < count;) {
        const length = inp.readVarint() + 1;
        const block = inp.readVarint();
        for (let i = 0; i < length; ++i) {
            data[ptr++] = block;
        }
    }
    return true;
}
function decompress(inp, voxels) {
    const { data, shape: [nx, ny, nz], stride: [sx, sy, sz], offset, } = voxels;
    let curBlock = -1;
    let curLength = 0;
    if (sx === 1 && sy === nx && sz === nx * ny && offset === 0) {
        return fastDecompress(inp, data, nx * ny * nz);
    }
    let ptr = offset;
    const stepi = sx;
    const stepj = sy - sx * nx;
    const stepk = sz - sy * ny;
    for (let k = 0; k < nz; ++k) {
        for (let j = 0; j < ny; ++j) {
            for (let i = 0; i < nx; ++i) {
                if (curLength <= 0) {
                    curLength = inp.readVarint() + 1;
                    curBlock = inp.readVarint();
                }
                data[ptr] = curBlock;
                curLength -= 1;
                ptr += stepi;
            }
            ptr += stepj;
        }
        ptr += stepk;
    }
    return curLength === 0;
}
function sectionDecompress(rle, voxels, start, end) {
    const { data, stride: [sx, sy, sz], offset, } = voxels;
    const rleLength = rle.length;
    let curBlock = -1;
    let curLength = 0;
    let rlePtr = 0;
    const l = end[0] - start[0] + 1;
    const h = end[1] - start[1] + 1;
    const stepi = sx;
    const stepj = sy - sx * l;
    const stepk = sz - sy * h;
    let ptr = sx * start[0] + sy * start[1] + sz * start[2] + offset;
    for (let k = start[2]; k <= end[2]; k++) {
        for (let j = start[1]; j <= end[1]; j++) {
            for (let i = start[0]; i <= end[0]; i++) {
                if (curLength <= 0) {
                    if (rlePtr >= rleLength) {
                        return false;
                    }
                    const runPrefix = rle[rlePtr++];
                    if (runPrefix < 255) {
                        curLength = runPrefix;
                    }
                    else {
                        if (rlePtr + 1 >= rleLength) {
                            return false;
                        }
                        curLength = (rle[rlePtr] << 8) + rle[rlePtr + 1];
                        rlePtr += 2;
                    }
                    if (rlePtr >= rleLength) {
                        return false;
                    }
                    const blockPrefix = rle[rlePtr++];
                    if (blockPrefix < 255) {
                        curBlock = blockPrefix;
                    }
                    else {
                        if (rlePtr + 1 >= rleLength) {
                            return false;
                        }
                        curBlock = (rle[rlePtr] << 8) + rle[rlePtr + 1];
                        rlePtr += 2;
                    }
                }
                data[ptr] = curBlock;
                curLength -= 1;
                ptr += stepi;
            }
            ptr += stepj;
        }
        ptr += stepk;
    }
    return rlePtr === rle.length && curLength === 0;
}
function old_decompress(rle, voxels) {
    return sectionDecompress(rle, voxels, [0, 0, 0], voxels.shape.map((v) => v - 1));
}
