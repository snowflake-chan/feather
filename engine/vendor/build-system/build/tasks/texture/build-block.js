"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBlocks = buildBlocks;
const ndarray_1 = __importDefault(require("ndarray"));
const voxel_utils_1 = require("./voxel-utils");
const voxel_atlas_1 = require("./voxel-atlas");
const block_schema_1 = require("@box/schema/voxel/block-schema");
function buildBlocks(bs, blockSpecHash, voxelsIndexHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield readVoxelData(bs, blockSpecHash, voxelsIndexHash);
        (0, voxel_atlas_1.computeAtlas)(data);
        const blockInfoHash = yield saveVoxelData(bs, data);
        const blockInfo = yield bs.retrieveBinarySchema(block_schema_1.BlockInfoSchema, blockInfoHash);
        return yield bs.storeJSON({
            blockInfo: blockInfoHash,
            textures: blockInfo.bumpAtlas
                .concat(blockInfo.colorAtlas)
                .concat(blockInfo.materialAtlas),
        });
    });
}
function readVoxelData(buildSystem, blockSpecHash, voxelsIndexHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const [blockSData, voxelsIndex] = (yield Promise.all([
            buildSystem.retrieveJSON(blockSpecHash),
            buildSystem.retrieveJSON(voxelsIndexHash),
        ]));
        const readVoxel = (texPath) => __awaiter(this, void 0, void 0, function* () {
            const parts = texPath.split('/');
            let dir = voxelsIndex;
            for (let i = 0; i < parts.length; ++i) {
                if (parts[i].length > 0) {
                    dir = dir[parts[i]];
                }
            }
            if (typeof dir !== 'string') {
                return null;
            }
            return (0, voxel_utils_1.readPixels)(buildSystem, dir);
        });
        function readTexture(texture, texPath) {
            return __awaiter(this, void 0, void 0, function* () {
                const [color, bump, emissive, metalness, smoothness] = yield Promise.all([
                    Promise.all(texPath.map((tex) => __awaiter(this, void 0, void 0, function* () { return (yield readVoxel(tex)) || voxel_utils_1.blankImage; }))),
                    Promise.all(texPath.map((tex) => __awaiter(this, void 0, void 0, function* () { return (yield readVoxel(tex + '_bump')) || voxel_utils_1.blankBumpImage; }))),
                    Promise.all(texPath.map((tex) => __awaiter(this, void 0, void 0, function* () { return (yield readVoxel(tex + '_emissive')) || voxel_utils_1.blankImage; }))),
                    Promise.all(texPath.map((tex) => __awaiter(this, void 0, void 0, function* () { return (yield readVoxel(tex + '_metalness')) || voxel_utils_1.blankImage; }))),
                    Promise.all(texPath.map((tex) => __awaiter(this, void 0, void 0, function* () { return (yield readVoxel(tex + '_smoothness')) || voxel_utils_1.blankImage; }))),
                ]);
                texture.color = color;
                texture.bump = bump;
                texture.emissive = emissive;
                texture.metalness = metalness;
                texture.smoothness = smoothness;
                texture.animLength = texPath.length;
            });
        }
        let maxId = 0;
        const idList = [];
        // reassign voxel ids so first bit encodes transparent flag
        Object.keys(blockSData).forEach((id) => {
            const spec = blockSData[id];
            spec.id = (spec.id << 1) | (spec.transparent ? 0 : 1);
            idList.push(spec.id);
            maxId = Math.max(maxId, spec.id);
        });
        idList.sort((a, b) => a - b);
        for (let i = 1; i < idList.length; ++i) {
            if (idList[i - 1] === idList[i]) {
                throw new Error('duplicate id');
            }
        }
        const blockIds = Object.keys(blockSData);
        blockIds.sort((a, b) => blockSData[a].id - blockSData[b].id);
        const result = new voxel_utils_1.VoxelAssetSpec();
        const textureIds = {};
        function getTextureId(paths) {
            return __awaiter(this, void 0, void 0, function* () {
                const id = paths.join(';');
                if (id in textureIds) {
                    return textureIds[id];
                }
                const texture = new voxel_utils_1.VoxelTextureInfo(result.textures.length);
                textureIds[id] = texture.id;
                result.textures.push(texture);
                yield readTexture(texture, paths);
                return textureIds[id];
            });
        }
        result.blocks = yield Promise.all(blockIds.map((name) => __awaiter(this, void 0, void 0, function* () {
            const block = blockSData[name];
            const texIds = block.fluid
                ? [0, 0, 0, 0, 0, 0]
                : yield Promise.all(block.texture.map((tex) => {
                    if (Array.isArray(tex)) {
                        return getTextureId(tex);
                    }
                    return getTextureId([tex]);
                }));
            return new voxel_utils_1.VoxelBlockInfo(block.id, name, texIds, block.soundGroup, block.category, !!block.transparent, block.emissive, +block.friction, +block.mass, +block.restitution || 0, !!block.fluid, block.fluidColor || [0, 0, 0], +block.fluidExtinction || 0, block.velocity || [0, 0, 0]);
        })));
        result.blocks.sort((a, b) => a.id - b.id);
        return result;
    });
}
function saveVoxelData(buildSystem, voxels) {
    return __awaiter(this, void 0, void 0, function* () {
        function saveMipMap(mipmap) {
            return __awaiter(this, void 0, void 0, function* () {
                const hashes = yield Promise.all(mipmap.map(({ data, shape }) => (0, voxel_utils_1.storePixelsOpt)(buildSystem, (0, ndarray_1.default)(data, [shape[0] * shape[2], shape[1] * shape[3], shape[4]]))));
                return hashes.map((h) => h + '.png');
            });
        }
        const [colorAtlas, bumpAtlas, materialAtlas,
        // thumbnail,
        ] = yield Promise.all([
            saveMipMap(voxels.colorAtlas),
            saveMipMap(voxels.bumpAtlas),
            saveMipMap(voxels.materialAtlas),
            // storePixelsOpt(buildSystem, <any>voxels.thumbnails),
        ]);
        const result = block_schema_1.BlockInfoSchema.clone(block_schema_1.BlockInfoSchema.identity);
        // copy texture info
        result.colorAtlas = colorAtlas;
        result.bumpAtlas = bumpAtlas;
        result.materialAtlas = materialAtlas;
        result.blockBumpShift = voxel_utils_1.BLOCK_BUMP_SHIFT;
        result.blockColorShift = voxel_utils_1.BLOCK_COLOR_SHIFT;
        result.atlasRadius = voxels.atlasRadius;
        // copy blocks
        voxels.blocks.sort((a, b) => a.id - b.id);
        voxels.blocks.forEach((block) => {
            if (!block.id) {
                return;
            }
            result.ids.push(block.id);
            result.restitution.push(block.restitution);
            result.friction.push(block.friction);
            result.names.push(block.name);
            result.emissive.push(block.emissive);
            for (let i = 0; i < 6; ++i) {
                const id = block.textureId[i];
                const index = voxels.textures[id];
                result.texture.push(index.column + (index.row << 8));
                result.animLength.push(index.animLength);
            }
            const category = block.category;
            if (category in result.category) {
                result.category[category].push(block.id);
            }
            else {
                result.category[category] = [block.id];
            }
            result.velocity.push(+block.velocity[0] || 0, +block.velocity[1] || 0, +block.velocity[2] || 0);
            if (block.fluid) {
                result.fluids.push({
                    id: block.id,
                    mass: block.mass,
                    info: (Math.floor(255 * block.fluidColor[0]) +
                        (Math.floor(255 * block.fluidColor[1]) << 8) +
                        (Math.floor(255 * block.fluidColor[2]) << 16) +
                        (Math.floor(255 * block.fluidExtinction) << 24)) >>>
                        0,
                });
            }
        });
        return yield buildSystem.storeBinarySchema(block_schema_1.BlockInfoSchema, result);
    });
}
//# sourceMappingURL=build-block.js.map