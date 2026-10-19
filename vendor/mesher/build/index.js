"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mesher = void 0;
exports.voxelToRectangles = voxelToRectangles;
exports.getTexture = getTexture;
exports.textureToMeshTexture = textureToMeshTexture;
exports.rectanglesToMeshData = rectanglesToMeshData;
exports.voxelsToMeshes = voxelsToMeshes;
exports.unpackTextureData = unpackTextureData;
exports.unpackMeshData = unpackMeshData;
exports.getVertexCount = getVertexCount;
const texture_1 = require("./texture");
const murmur3_1 = require("./murmur3");
const schema_1 = require("./schema");
function checkTexture(texture, textureMap) {
    let baseHash;
    const strSize = [texture.width.toString(36), texture.height.toString(36)];
    for (let flip = 0; flip < 2; flip++) {
        for (let rotation = 0; rotation < 4; rotation++) {
            const sizeIndex = flip ^ (rotation & 1);
            const hash = `${strSize[sizeIndex]}_${strSize[1 - sizeIndex]}_` +
                (0, murmur3_1.murmur3)(texture, 123456, flip, rotation).toString(36) +
                (0, murmur3_1.murmur3)(texture, 452362, flip, rotation).toString(36) +
                (0, murmur3_1.murmur3)(texture, 7456443, flip, rotation).toString(36) +
                (0, murmur3_1.murmur3)(texture, 143525, flip, rotation).toString(36);
            if (!baseHash) {
                baseHash = hash;
            }
            if (textureMap.has(hash)) {
                return {
                    hash,
                    flipped: flip !== 0,
                    rotation,
                    existed: true,
                };
            }
        }
    }
    return {
        hash: baseHash,
        flipped: false,
        rotation: 0,
        existed: false,
    };
}
function scanModel(rectangles, textureMap, data, offset, stride, shape, order, faceNormal, hasVoxel, compress = true, extendEdge = false, needSquash = false) {
    const inverseOrder = Array(3);
    order.forEach((x, i) => (inverseOrder[x] = i));
    const scanStride = order.map((i) => stride[i]);
    const scanShape = order.map((i) => shape[i]);
    const layerBegin = faceNormal & 1 ? scanShape[2] - 1 : 0;
    const layerEnd = faceNormal & 1 ? -1 : scanShape[2];
    const layerStep = faceNormal & 1 ? -1 : 1;
    function adjustVertex(...v) {
        return {
            x: v[inverseOrder[0]],
            y: v[inverseOrder[1]],
            z: v[inverseOrder[2]],
        };
    }
    for (let layer = layerBegin; layer !== layerEnd; layer += layerStep) {
        const lastSegments = [];
        for (let row = 0; row <= scanShape[1]; row++) {
            const segments = [];
            let start = -1;
            for (let x = 0; x <= scanShape[0] && row < scanShape[1]; x++) {
                const ptr = x * scanStride[0] +
                    row * scanStride[1] +
                    layer * scanStride[2] +
                    offset;
                const prePtr = x * scanStride[0] +
                    row * scanStride[1] +
                    (layer - layerStep) * scanStride[2] +
                    offset;
                if (x < scanShape[0] &&
                    hasVoxel(ptr) &&
                    (layer === layerBegin || data[prePtr] === 0)) {
                    if (start === -1) {
                        start = x;
                    }
                }
                else if (start !== -1) {
                    segments.push({
                        row,
                        start,
                        width: x - start,
                    });
                    start = -1;
                }
            }
            let ptr0 = 0;
            for (let i = 0; i < lastSegments.length; i++) {
                let flag = true;
                const s0 = lastSegments[i];
                let ptr1 = 0;
                for (let j = 0; j < segments.length && row < scanShape[1]; j++) {
                    const s1 = segments[j];
                    if (s0.start === s1.start && s0.width === s1.width) {
                        flag = false;
                    }
                    else {
                        segments[ptr1++] = segments[j];
                    }
                }
                segments.length = ptr1;
                if (flag) {
                    const height = row - s0.row;
                    const texture = new texture_1.Texture(s0.width, height);
                    for (let j = 0; j < texture.width; j++) {
                        for (let k = 0; k < texture.height; k++) {
                            const x = s0.start + j;
                            const y = s0.row + k;
                            texture.set(j, k, data[x * scanStride[0] + y * scanStride[1] + layer * scanStride[2]]);
                        }
                    }
                    const bias = faceNormal & 1;
                    const optimizedTexture = compress
                        ? (0, texture_1.optimizeTexture)(texture, extendEdge)
                        : extendEdge
                            ? (0, texture_1.extendTextureEdge)(texture)
                            : texture;
                    const { existed, flipped, rotation, hash } = checkTexture(optimizedTexture, textureMap);
                    if (!existed) {
                        textureMap.set(hash, optimizedTexture);
                    }
                    rectangles.push(Object.assign(Object.assign({}, adjustVertex(s0.start, +s0.row, needSquash ? 0 : bias + layer)), { width: s0.width, height, texture: {
                            hash,
                            rotation,
                            flipped,
                        } }));
                }
                else {
                    lastSegments[ptr0++] = lastSegments[i];
                }
            }
            for (let i = 0; i < segments.length; i++) {
                lastSegments[ptr0++] = segments[i];
            }
            lastSegments.length = ptr0;
        }
    }
}
function getAirVoxels(voxel, pos, s) {
    const { shape: [nx, ny, nz], stride: [sx, sy, sz], offset, data, } = voxel;
    const stack = pos.slice();
    while (stack.length > 0) {
        const z = stack.pop();
        const y = stack.pop();
        const x = stack.pop();
        const ptr = x * sx + y * sy + z * sz + offset;
        if (x < 0 ||
            y < 0 ||
            z < 0 ||
            x >= nx ||
            y >= ny ||
            z >= nz ||
            s.has(ptr) ||
            data[offset + ptr]) {
            continue;
        }
        s.add(ptr);
        stack.push(x + 1, y, z);
        stack.push(x - 1, y, z);
        stack.push(x, y + 1, z);
        stack.push(x, y - 1, z);
        stack.push(x, y, z + 1);
        stack.push(x, y, z - 1);
    }
}
function voxelToRectangles(voxel, textureMap, compress = true, extendEdge = false, surfaceOnly = false, squashDimension = 3) {
    const needSquash = squashDimension === 0 || squashDimension === 1 || squashDimension === 2;
    const { data, offset, stride, shape } = voxel;
    let orders = [
        [1, 2, 0],
        [1, 2, 0],
        [0, 2, 1],
        [0, 2, 1],
        [0, 1, 2],
        [0, 1, 2],
    ];
    let orderIdxOffset = 0;
    if (needSquash) {
        orders = orders.slice(squashDimension * 2, squashDimension * 2 + 2);
        orderIdxOffset = squashDimension * 2;
    }
    const hasVoxel = surfaceOnly
        ? (() => {
            const airVoxelSet = new Set();
            const [nx, ny, nz] = shape;
            for (let x = 0; x < nx; x++) {
                for (let y = 0; y < ny; y++) {
                    getAirVoxels(voxel, [x, y, 0], airVoxelSet);
                    getAirVoxels(voxel, [x, y, nz - 1], airVoxelSet);
                }
                for (let z = 0; z < nz; z++) {
                    getAirVoxels(voxel, [x, 0, z], airVoxelSet);
                    getAirVoxels(voxel, [x, ny - 1, z], airVoxelSet);
                }
            }
            for (let z = 0; z < nz; z++) {
                for (let y = 0; y < ny; y++) {
                    getAirVoxels(voxel, [0, y, z], airVoxelSet);
                    getAirVoxels(voxel, [nx - 1, y, z], airVoxelSet);
                }
            }
            return (ptr) => !airVoxelSet.has(ptr);
        })()
        : (ptr) => data[ptr] !== 0;
    const rectangles = [[], [], [], [], [], []];
    for (let i = 0; i < orders.length; i++) {
        scanModel(rectangles[i + orderIdxOffset], textureMap, data, offset, stride, shape, orders[i], i + orderIdxOffset, hasVoxel, compress, extendEdge, needSquash);
    }
    return rectangles;
}
function getTexture(textureMap) {
    const { texture } = (0, texture_1.packTextures)(Array.from(textureMap.values()));
    return (0, texture_1.textureNodeToTexture)(texture);
}
async function textureToMeshTexture(texture, palette, emissivePalette = Array(palette.length).fill(0)) {
    const meshTexture = schema_1.MeshTextureSchema.alloc();
    const plet = meshTexture.palette;
    if (typeof palette[0] === 'number') {
        for (let i = 0; i < palette.length; i++) {
            plet.push((palette[i] << 8) | (emissivePalette[i] & 0xff));
        }
    }
    else {
        for (let i = 0; i < palette.length; i++) {
            const [r, g, b] = palette[i];
            plet.push((r << 24) | (g << 16) | (b << 8) | (emissivePalette[i] & 0xff));
        }
    }
    meshTexture.data = texture.data;
    meshTexture.width = texture.width;
    return meshTexture;
}
function rectanglesToMeshData(rectangles, textureMap, positions, extendEdge = false) {
    const meshData = schema_1.MeshDataSchema.alloc();
    const bias = extendEdge ? 1 : 0;
    for (let i = 0; i < 6; i++) {
        meshData.push({ vertices: [], uvs: [], sizes: [], uvFlags: [] });
    }
    for (let i = 0; i < rectangles.length; i++) {
        for (let j = 0; j < rectangles[i].length; j++) {
            const r = rectangles[i][j];
            const pos = positions.get(textureMap.get(r.texture.hash));
            const u0 = pos.x + bias; // / width;
            const v0 = pos.y + bias; // / height;
            const u1 = pos.x + pos.width - bias; // / width;
            const v1 = pos.y + pos.height - bias; // / height;
            meshData[i].vertices.push(r.x, r.y, r.z);
            meshData[i].sizes.push(r.width, r.height);
            meshData[i].uvs.push(u0, v0, u1, v1);
            // 2 bits for rotation, 1 bit for flip
            const uvFlag = 
            // rotation and flipping steps:
            // 1. rotate the texture r.texture.rotation * 90 degree
            // 2. flip the texture if r.texture.flipped is true
            // 3. rotate the texture  pos.rotation * 90 degree
            // there are two rotate operations, so we can merge step 3 into step 1 to reduce one step
            // to achieve it, should reverse the second rotation and add it into the first rotation
            ((r.texture.rotation +
                (r.texture.flipped ? 4 - pos.rotation : pos.rotation)) &
                0b11) |
                (r.texture.flipped << 2);
            const { uvFlags } = meshData[i];
            if (j & 1) {
                uvFlags[j >> 1] |= uvFlag;
            }
            else {
                uvFlags[j >> 1] = uvFlag << 4;
            }
        }
    }
    return meshData;
}
class Mesher {
    constructor(compress = true, extendEdge = false, surfaceOnly = false) {
        this.compress = compress;
        this.extendEdge = extendEdge;
        this.surfaceOnly = surfaceOnly;
        this.textureMap = new Map();
        this.models = [];
        this.textureCache = null;
    }
    addModel(voxel, squashDimension = 3) {
        this.models.push(voxelToRectangles(voxel, this.textureMap, this.compress, this.extendEdge, this.surfaceOnly, squashDimension));
        this.textureCache = null;
    }
    getTextureData() {
        if (!this.textureCache) {
            this.textureCache = getTexture(this.textureMap);
        }
        return this.textureCache;
    }
    getMeshes(extendEdge = this.extendEdge) {
        const { positions } = this.getTextureData();
        return this.models.map((rectangles) => rectanglesToMeshData(rectangles, this.textureMap, positions, extendEdge));
    }
    getMesh(index, extendEdge = this.extendEdge) {
        const { positions } = this.getTextureData();
        return rectanglesToMeshData(this.models[index], this.textureMap, positions, extendEdge);
    }
    getTexture(palette, emissivePalette) {
        return textureToMeshTexture(this.getTextureData().texture, palette, emissivePalette);
    }
}
exports.Mesher = Mesher;
async function voxelsToMeshes(voxels, palette, emissivePalette, compress = true, extendEdge = true) {
    const mesher = new Mesher(compress, extendEdge, false);
    for (const voxel of voxels) {
        mesher.addModel(voxel);
    }
    return {
        meshes: mesher.getMeshes(),
        texture: await mesher.getTexture(palette, emissivePalette),
    };
}
function unpackTextureData(texture, channels) {
    const { data, palette } = texture;
    const image = new Uint8Array(data.length * channels.length);
    for (let i = 0; i < data.length; i++) {
        const idx = i * channels.length;
        const color = palette[data[i]];
        for (let j = 0; j < channels.length; j++) {
            image[idx + j] = (color >> channels[j]) & 0xff;
        }
    }
    return image;
}
function unpackMeshData(meshData, VertexDataType = Uint8Array, UVDataType = Uint16Array) {
    let nums = 0; // rectangle nums
    for (let k = 0; k < 6; k++) {
        nums += meshData[k].sizes.length / 2;
    }
    const data = new VertexDataType(nums * 4 * 4);
    const uvData = new UVDataType(nums * 4 * 2);
    //const floatView = new Float32Array(meshData.buffer);
    let ptr = 0;
    const swapPtrIdx = [1, 0, 0, 1, 1, 0];
    function pushData(x, y, z, normalCode, u, v) {
        const p = ptr++ ^ swapPtrIdx[normalCode];
        data[p * 4 + 0] = x;
        data[p * 4 + 1] = y;
        data[p * 4 + 2] = z;
        data[p * 4 + 3] = normalCode;
        uvData[p * 2 + 0] = u;
        uvData[p * 2 + 1] = v;
    }
    const uvFlagMap = [
        [0, 1, 2, 3], // flipped: false, rotation: 0
        [1, 3, 0, 2], // flipped: false, rotation: 1
        [3, 2, 1, 0], // flipped: false, rotation: 2
        [2, 0, 3, 1], // flipped: false, rotation: 3
        [0, 2, 1, 3], // flipped: true,  rotation: 0
        [2, 3, 0, 1], // flipped: true,  rotation: 1
        [3, 1, 2, 0], // flipped: true,  rotation: 2
        [1, 0, 3, 2], // flipped: true,  rotation: 3
    ];
    // calculate bounding box
    let lox = Infinity;
    let loy = Infinity;
    let loz = Infinity;
    let hix = -Infinity;
    let hiy = -Infinity;
    let hiz = -Infinity;
    for (let k = 0; k < 6; k++) {
        const p = meshData[k];
        const cnt = p.vertices.length / 3;
        for (let i = 0; i < cnt; i++) {
            const x0 = p.vertices[i * 3 + 0];
            const y0 = p.vertices[i * 3 + 1];
            const z0 = p.vertices[i * 3 + 2];
            const w = p.sizes[i * 2 + 0];
            const h = p.sizes[i * 2 + 1];
            const u0 = p.uvs[i * 4 + 0];
            const v0 = p.uvs[i * 4 + 1];
            const u1 = p.uvs[i * 4 + 2];
            const v1 = p.uvs[i * 4 + 3];
            const x1 = x0 + (k >= 2 ? w : 0);
            const y1 = y0 + (k <= 1 ? w : k >= 4 ? h : 0);
            const z1 = z0 + (k <= 3 ? h : 0);
            const uvFlagIdx = i;
            const uvFlag = uvFlagIdx & 1
                ? p.uvFlags[uvFlagIdx >> 1] & 0b1111
                : p.uvFlags[uvFlagIdx >> 1] >> 4;
            const uvs = [
                [u0, v0],
                [u1, v0],
                [u0, v1],
                [u1, v1],
            ];
            lox = Math.min(lox, x0);
            hix = Math.max(hix, x1);
            loy = Math.min(loy, y0);
            hiy = Math.max(hiy, y1);
            loz = Math.min(loz, z0);
            hiz = Math.max(hiz, z1);
            const uvMap = uvFlagMap[uvFlag];
            if (k <= 1) {
                pushData(x0, y0, z0, k, ...uvs[uvMap[0]]);
                pushData(x0, y1, z0, k, ...uvs[uvMap[1]]);
                pushData(x0, y0, z1, k, ...uvs[uvMap[2]]);
                pushData(x0, y1, z1, k, ...uvs[uvMap[3]]);
            }
            else if (k <= 3) {
                pushData(x0, y0, z0, k, ...uvs[uvMap[0]]);
                pushData(x1, y0, z0, k, ...uvs[uvMap[1]]);
                pushData(x0, y0, z1, k, ...uvs[uvMap[2]]);
                pushData(x1, y0, z1, k, ...uvs[uvMap[3]]);
            }
            else {
                pushData(x0, y0, z0, k, ...uvs[uvMap[0]]);
                pushData(x1, y0, z0, k, ...uvs[uvMap[1]]);
                pushData(x0, y1, z0, k, ...uvs[uvMap[2]]);
                pushData(x1, y1, z0, k, ...uvs[uvMap[3]]);
            }
        }
    }
    return {
        meshData: data,
        uvData,
        count: nums * 6, // 1 rectangle = 3 triangles = 6 vertices
        lox,
        loy,
        loz,
        hix,
        hiy,
        hiz,
    };
}
/**
 * 通过矩形二维数组计算顶点总数
 * 这部分计算逻辑参照：
 * - rectanglesToMeshData更新sizes数组
 * - unpackMeshData计算count
 */
function getVertexCount(rectangles) {
    const nums = rectangles.reduce((prev, cur) => {
        return prev + cur.length;
    }, 0);
    return nums * 6;
}
