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
exports.toVersion = exports.fromVersion = exports.name = void 0;
exports.migration = migration;
const project_rda_1 = require("@box/schema/project/project-rda");
exports.name = 'project';
exports.fromVersion = '0.3.25';
exports.toVersion = '0.3.26';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.26';
        project.prevHash = hash;
        const assets = yield bs.retrieveJSON(project.assets);
        const audioAssets = {};
        for (const key in assets) {
            const asset = assets[key];
            if (asset.type === project_rda_1.AssetType.AUDIO) {
                audioAssets[key] = asset;
            }
        }
        project.audioAssets = yield bs.storeJSON(audioAssets);
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.26.js.map