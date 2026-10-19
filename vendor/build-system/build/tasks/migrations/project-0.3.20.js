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
exports.fromVersion = '0.3.19';
exports.toVersion = '0.3.20';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.20';
        project.prevHash = hash;
        const entitiesTree = yield bs.retrieveJSON(project.entitiesTree);
        const assets = yield bs.retrieveJSON(project.assets);
        // 添加模型ID
        Object.keys(entitiesTree).forEach((id) => {
            var _a;
            const node = entitiesTree[id];
            if (!node.value) {
                return;
            }
            node.value.meshId = ((_a = assets[node.value.mesh]) === null || _a === void 0 ? void 0 : _a.contentId) || 0;
        });
        project.entitiesTree = yield bs.storeJSON(entitiesTree);
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.20.js.map