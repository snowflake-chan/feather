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
exports.buildAnim = buildAnim;
const ik_schema_1 = require("@box/schema/animation/ik-schema");
function buildAnim(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const playerJSON = yield bs.retrieveJSON(hash);
        const playerRig = ik_schema_1.IKPaletteSchema.fromJSON(playerJSON);
        return yield bs.storeBinarySchema(ik_schema_1.IKPaletteSchema, playerRig);
    });
}
//# sourceMappingURL=build-anim.js.map