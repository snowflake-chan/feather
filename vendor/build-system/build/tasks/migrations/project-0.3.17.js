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
exports.name = 'project';
exports.fromVersion = '0.3.16';
exports.toVersion = '0.3.17';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.17';
        project.prevHash = hash;
        const entitiesTree = yield bs.retrieveJSON(project.entitiesTree);
        // 添加默认动作ID
        Object.keys(entitiesTree).forEach((id) => {
            const node = entitiesTree[id];
            if (!node.value) {
                return;
            }
            node.value.defaultMotionId = '';
        });
        project.entitiesTree = yield bs.storeJSON(entitiesTree);
        // add animated in assets
        const assets = yield bs.retrieveJSON(project.assets);
        Object.keys(assets).forEach((key) => {
            assets[key].animated = false;
        });
        // add animated in delete assets
        const deleteAssets = yield bs.retrieveJSON(project.deleteAssets);
        deleteAssets.forEach((deleteAsset) => {
            deleteAsset.value.animated = false;
        });
        project.assets = yield bs.storeJSON(assets);
        project.deleteAssets = yield bs.storeJSON(deleteAssets);
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.17.js.map