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
exports.buildWater = buildWater;
const voxel_utils_1 = require("./voxel-utils");
const bump_1 = require("../../utils/bump");
function buildWater(bs, waterBumpHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const waterHeight = yield (0, voxel_utils_1.readPixels)(bs, waterBumpHash);
        if (!waterHeight) {
            throw new Error(`cannot read pixels from hash ${waterBumpHash}`);
        }
        (0, bump_1.bumpDerivative)(waterHeight);
        return (0, voxel_utils_1.storePixelsOpt)(bs, waterHeight);
    });
}
//# sourceMappingURL=build-water.js.map