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
exports.buildVoxel = buildVoxel;
const stream_1 = require("@box/mudb/stream");
const helper_1 = require("@box/utils/helper");
const voxel_1 = require("@box/schema/mesh/voxel");
const new_mesher_1 = require("@box/schema/mesh/new-mesher");
const rle_compress_1 = require("@box/utils/rle-compress");
const heavy_mutex_1 = require("./heavy_mutex");
function buildVoxel(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        yield heavy_mutex_1.BUILD_HEAVY_LOCK.p();
        const t = Date.now();
        try {
            const projectData = yield bs.retrieveJSON(hash);
            const CURRENTCOLORINDEX = projectData.CURRENTCOLORINDEX;
            const palette = projectData.HEXCOLORS[CURRENTCOLORINDEX].map((hex) => hex ? parseInt(hex, 16) : 0xffffff);
            const emissivePalette = projectData.PBRATTRBS[CURRENTCOLORINDEX].map((a) => a[2]);
            const inp = new stream_1.MuReadStream(new Uint8Array(projectData.ENCODEVOXELS));
            const nx = inp.readInt32();
            const ny = inp.readInt32();
            const nz = inp.readInt32();
            const voxel = (0, helper_1.allocEmptyVoxels)(nx, ny, nz);
            (0, rle_compress_1.decompress)(inp, voxel);
            return bs.storeBinarySchema(voxel_1.NewMeshSchema, yield (0, new_mesher_1.generateNewMesh)(voxel, palette, emissivePalette));
        }
        finally {
            bs.logger.info(`build voxel mesh ${hash} elapsed time ${Date.now() - t}ms`);
            heavy_mutex_1.BUILD_HEAVY_LOCK.v();
        }
    });
}
// const projectData = require('/tmp/ggm.vb.json');
// const CURRENTCOLORINDEX = projectData.CURRENTCOLORINDEX;
// const palette = projectData.HEXCOLORS[CURRENTCOLORINDEX].map((hex) => hex ? parseInt(hex, 16) : 0xffffff);
// const emissivePalette =  projectData.PBRATTRBS[CURRENTCOLORINDEX].map((a:number[]) => a[2]);
// const inp = new MuReadStream(new Uint8Array(projectData.ENCODEVOXELS));
// const nx = inp.readInt32();
// const ny = inp.readInt32();
// const nz = inp.readInt32();
// const voxel = allocEmptyVoxels(nx, ny, nz);
// decompress(inp, voxel);
// generateNewMesh(voxel, palette, emissivePalette).then(console.log);
//# sourceMappingURL=build-voxel.js.map