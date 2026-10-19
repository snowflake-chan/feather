"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAtlas = computeAtlas;
const ndarray_1 = __importDefault(require("ndarray"));
const ndarray_ops_1 = __importDefault(require("ndarray-ops"));
const tile_mip_map_1 = __importDefault(require("tile-mip-map"));
const pixels_1 = require("../../utils/pixels");
const voxel_utils_1 = require("./voxel-utils");
const bump_1 = require("../../utils/bump");
function combineVoxelTextures(tiles, index, atlasRadius) {
    const tileRadius = tiles[0][0].shape[0];
    const atlas = (0, pixels_1.alloc)(tileRadius * atlasRadius, tileRadius * atlasRadius);
    for (let i = 0; i < tiles.length; ++i) {
        const anim = tiles[i];
        for (let j = 0; j < anim.length; ++j) {
            const tile = anim[j];
            const radius = tile.shape[0];
            ndarray_ops_1.default.assign(atlas
                .lo((index[i][0] + j) * radius, index[i][1] * radius)
                .hi(radius, radius), tile);
        }
    }
    const formatted = (0, ndarray_1.default)(atlas.data, [atlasRadius, atlasRadius, tileRadius, tileRadius, 4], [
        atlas.stride[0] * tileRadius,
        atlas.stride[1] * tileRadius,
        atlas.stride[0],
        atlas.stride[1],
        atlas.stride[2],
    ], 0);
    const mipmap = (0, tile_mip_map_1.default)(formatted);
    while (mipmap[mipmap.length - 1].shape[0] > 1) {
        mipmap.push(mipmap[mipmap.length - 1].step(2, 2));
    }
    return mipmap;
}
function solvePacking(size, textures) {
    const rows = new Array(size);
    for (let i = 0; i < size; ++i) {
        rows[i] = 0;
    }
    outer_loop: for (let i = 0; i < textures.length; ++i) {
        const t = textures[i];
        for (let j = 0; j < rows.length; ++j) {
            const c = rows[j];
            if (c + t.animLength <= size) {
                t.column = c;
                t.row = j;
                rows[j] += t.animLength;
                continue outer_loop;
            }
        }
        return false;
    }
    return true;
}
function computeAtlas(voxelResources) {
    // compute texture packing
    const sortedTextures = voxelResources.textures
        .slice()
        .sort((a, b) => b.animLength - a.animLength);
    let count = 0;
    sortedTextures.forEach((t) => (count += t.animLength));
    for (let i = 1; i < 12; ++i) {
        voxelResources.atlasShift = i;
        const r = (voxelResources.atlasRadius = 1 << voxelResources.atlasShift);
        if (r * r >= count && solvePacking(r, sortedTextures)) {
            break;
        }
    }
    // unpack index data
    const index = voxelResources.textures.map(({ row, column }) => [column, row]);
    // compute atlases
    voxelResources.colorAtlas = combineVoxelTextures(voxelResources.textures.map(({ color }) => color), index, voxelResources.atlasRadius);
    voxelResources.bumpAtlas = combineVoxelTextures(voxelResources.textures.map(({ bump }) => bump.map((b) => (0, bump_1.computeBumpImage)(b, 1, 1))), index, voxelResources.atlasRadius);
    voxelResources.materialAtlas = combineVoxelTextures(voxelResources.textures.map(({ metalness, smoothness, emissive }) => {
        const array = [];
        for (let i = 0; i < metalness.length; ++i) {
            const result = (0, pixels_1.alloc)(voxel_utils_1.BLOCK_COLOR_SIZE, voxel_utils_1.BLOCK_COLOR_SIZE);
            ndarray_ops_1.default.assign(result.pick(-1, -1, 0), metalness[i].pick(-1, -1, 0));
            ndarray_ops_1.default.assign(result.pick(-1, -1, 1), smoothness[i].pick(-1, -1, 0));
            ndarray_ops_1.default.assign(result.pick(-1, -1, 2), emissive[i].pick(-1, -1, 0));
            ndarray_ops_1.default.assigns(result.pick(-1, -1, 3), 255);
            array.push(result);
        }
        return array;
    }), index, voxelResources.atlasRadius);
}
//# sourceMappingURL=voxel-atlas.js.map