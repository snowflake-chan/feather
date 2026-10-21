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
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcVoxelBounds = calcVoxelBounds;
const stream_1 = require("@box/mudb/stream");
const helper_1 = require("@box/utils/helper");
const rle_compress_1 = require("@box/utils/rle-compress");
const bounds_schema_1 = require("../project/bounds-schema");
function calcVoxelBounds(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectData = yield bs.retrieveJSON(hash);
        const inp = new stream_1.MuReadStream(new Uint8Array(projectData.ENCODEVOXELS));
        const nx = inp.readInt32();
        const ny = inp.readInt32();
        const nz = inp.readInt32();
        const voxel = (0, helper_1.allocEmptyVoxels)(nx, ny, nz);
        (0, rle_compress_1.decompress)(inp, voxel);
        let minX = nx;
        let minY = ny;
        let minZ = nz;
        let maxX = 0;
        let maxY = 0;
        let maxZ = 0;
        for (let z = 0; z < nz; ++z) {
            for (let y = 0; y < ny; ++y) {
                for (let x = 0; x < nx; ++x) {
                    if (voxel.getVoxel(x, y, z) !== 0) {
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        minZ = Math.min(minZ, z);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                        maxZ = Math.max(maxZ, z);
                    }
                }
            }
        }
        const result = bounds_schema_1.IntBoundsSchema.alloc();
        result.lox = minX;
        result.loy = minY;
        result.loz = minZ;
        result.hix = maxX;
        result.hiy = maxY;
        result.hiz = maxZ;
        const resultHash = bs.storeBinarySchema(bounds_schema_1.IntBoundsSchema, result);
        bounds_schema_1.IntBoundsSchema.free(result);
        return resultHash;
    });
}
//# sourceMappingURL=voxel-bounds.js.map