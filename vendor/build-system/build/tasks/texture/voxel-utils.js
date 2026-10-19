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
exports.VoxelAssetSpec = exports.VoxelBlockInfo = exports.VoxelTextureInfo = exports.blankBumpImage = exports.blankImage = exports.BLOCK_COLOR_SIZE = exports.BLOCK_COLOR_SHIFT = exports.BLOCK_BUMP_SIZE = exports.BLOCK_BUMP_SHIFT = void 0;
exports.storePixels = storePixels;
exports.storePixelsOpt = storePixelsOpt;
exports.readPixels = readPixels;
const ndarray_1 = __importDefault(require("ndarray"));
const get_pixels_1 = __importDefault(require("get-pixels"));
const save_pixels_1 = __importDefault(require("save-pixels"));
const block_schema_1 = require("@box/schema/voxel/block-schema");
exports.BLOCK_BUMP_SHIFT = 6;
exports.BLOCK_BUMP_SIZE = 1 << exports.BLOCK_BUMP_SHIFT;
exports.BLOCK_COLOR_SHIFT = 4;
exports.BLOCK_COLOR_SIZE = 1 << exports.BLOCK_COLOR_SHIFT;
exports.blankImage = (0, ndarray_1.default)(new Uint8Array(exports.BLOCK_COLOR_SIZE * exports.BLOCK_COLOR_SIZE * 4), [exports.BLOCK_COLOR_SIZE, exports.BLOCK_COLOR_SIZE, 4]);
exports.blankBumpImage = (0, ndarray_1.default)(new Uint8Array(exports.BLOCK_BUMP_SIZE * exports.BLOCK_BUMP_SIZE * 4), [64, 64, 4]);
class VoxelTextureInfo {
    constructor(id) {
        this.id = id;
        this.row = 0;
        this.column = 0;
        this.animLength = 1;
        this.color = [exports.blankImage];
        this.emissive = [exports.blankImage];
        this.metalness = [exports.blankImage];
        this.smoothness = [exports.blankImage];
        this.bump = [exports.blankBumpImage];
    }
}
exports.VoxelTextureInfo = VoxelTextureInfo;
class VoxelBlockInfo {
    constructor(id, name, textureId, soundGroup, category, transparent, emissive, friction, mass, restitution, fluid, fluidColor, fluidExtinction, velocity) {
        this.id = id;
        this.name = name;
        this.textureId = textureId;
        this.transparent = transparent;
        this.friction = friction;
        this.mass = mass;
        this.restitution = restitution;
        this.fluid = fluid;
        this.fluidColor = fluidColor;
        this.fluidExtinction = fluidExtinction;
        this.velocity = velocity;
        // approximate face color
        this.averageColor = [0, 0, 0];
        this.soundGroup = block_schema_1.BlockSoundGroup[soundGroup] || block_schema_1.BlockSoundGroup.default;
        this.category = block_schema_1.BlockCategory[category] || block_schema_1.BlockCategory.default;
        this.emissive =
            (emissive[0] & 0xf) |
                ((emissive[1] & 0xf) << 4) |
                ((emissive[2] & 0xf) << 8);
    }
}
exports.VoxelBlockInfo = VoxelBlockInfo;
class VoxelAssetSpec {
    constructor() {
        this.blocks = [];
        this.textures = [];
        // texture atlas resources
        this.atlasShift = 0;
        this.atlasRadius = 0;
        this.colorAtlas = [];
        this.bumpAtlas = [];
        this.materialAtlas = [];
    }
}
exports.VoxelAssetSpec = VoxelAssetSpec;
function storePixels(buildSystem, image) {
    return new Promise((resolve, reject) => {
        const bufs = [];
        const stream = (0, save_pixels_1.default)(image, 'png');
        // TODO: maybe this way is not good, just improve it
        stream.on('data', (d) => bufs.push(d));
        stream.on('error', reject);
        stream.on('end', () => __awaiter(this, void 0, void 0, function* () {
            resolve(buildSystem.storeContent(Buffer.concat(bufs)));
        }));
    });
}
function storePixelsOpt(buildSystem, image) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield buildSystem.build('optimizePNG', yield storePixels(buildSystem, image));
    });
}
function readPixels(buildSystem, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield buildSystem.retrieveContent(hash);
        const type = getImageFormat(data);
        return new Promise((resolve, reject) => {
            (0, get_pixels_1.default)(Buffer.from(data), type, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    });
}
function getImageFormat(data) {
    const intView = new Uint32Array(data.buffer, data.byteOffset, 4);
    const magic4 = intView[0];
    const magic2 = magic4 & 0xffff;
    if (magic4 === 0x474e5089) {
        return 'image/png';
    }
    else if (magic4 === 0x38464947) {
        return 'image/gif';
    }
    else if (magic2 === 0xd8ff) {
        return 'image/jpg';
    }
    else if (magic2 === 0x4d42) {
        return 'image/bmp';
    }
    return `unknown/${magic4.toString(16)}`;
}
//# sourceMappingURL=voxel-utils.js.map