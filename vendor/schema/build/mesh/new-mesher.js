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
exports.generateNewMesh = generateNewMesh;
const mesher_1 = require("@box/mesher");
const voxel_1 = require("./voxel");
function generateNewMesh(voxel_2, palette_1, emissivePalette_1) {
    return __awaiter(this, arguments, void 0, function* (voxel, palette, emissivePalette, surfaceOnly = false) {
        const mesher = new mesher_1.Mesher(true, true, surfaceOnly);
        mesher.addModel(voxel);
        const mesh = voxel_1.NewMeshSchema.alloc();
        if (mesher.textureMap.size > 0) {
            mesh.data = mesher.getMesh(0);
            mesh.texture = yield mesher.getTexture(palette, emissivePalette);
        }
        return mesh;
    });
}
//# sourceMappingURL=new-mesher.js.map