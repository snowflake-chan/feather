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
exports.invertSkinIndex = invertSkinIndex;
const player_schema_1 = require("@box/schema/player/player-schema");
function invertSkinIndex(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const skins = yield bs.retrieveJSON(hash);
        const inverseIndex = {};
        const skinNames = Object.keys(skins);
        for (let i = 0; i < skinNames.length; ++i) {
            const skinName = skinNames[i];
            const skin = skins[skinName];
            Object.keys(skin).forEach((partName) => {
                if (!(partName in player_schema_1.BodyPart) || !isNaN(parseInt(partName))) {
                    return;
                }
                if (!(partName in inverseIndex)) {
                    inverseIndex[partName] = {};
                }
                inverseIndex[partName][skin[partName]] = skinName;
            });
        }
        return bs.storeJSON(inverseIndex);
    });
}
//# sourceMappingURL=build-skin.js.map