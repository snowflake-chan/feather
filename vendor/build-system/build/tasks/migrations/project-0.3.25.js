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
const defs_1 = require("@box/schema/project/ui-rda/defs");
const util_1 = require("@box/schema/project/ui-rda/util");
exports.name = 'project';
exports.fromVersion = '0.3.24';
exports.toVersion = '0.3.25';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.25';
        project.prevHash = hash;
        // 屏幕增加zIndex
        const uiTree = yield bs.retrieveJSON(project.uiTree);
        Object.keys(uiTree).forEach((treeNodeId) => {
            const treeNode = uiTree[treeNodeId];
            if (!treeNode || !treeNode.value) {
                return;
            }
            const value = treeNode.value;
            if ((0, util_1.isUIScreen)(value)) {
                value.data.zIndex = 1;
            }
        });
        project.uiTree = yield bs.storeJSON(uiTree);
        // defaultScreenId
        project.defaultScreenId = defs_1.DEFAULT_SCREEN_ID;
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.25.js.map