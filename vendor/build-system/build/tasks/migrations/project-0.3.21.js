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
const util_1 = require("@box/schema/project/ui-rda/util");
exports.name = 'project';
exports.fromVersion = '0.3.20';
exports.toVersion = '0.3.21';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.21';
        project.prevHash = hash;
        const uiTree = yield bs.retrieveJSON(project.uiTree);
        // 添加“布局”属性
        Object.keys(uiTree).forEach((treeNodeId) => {
            const treeNode = uiTree[treeNodeId];
            if (!treeNode || !treeNode.value) {
                return;
            }
            const noneLayout = {
                type: 'none',
                data: undefined,
            };
            if ((0, util_1.isUIElement)(treeNode.value)) {
                treeNode.value.data.data.layoutOrder = 1;
                treeNode.value.data.data.layout = noneLayout;
            }
            else if ((0, util_1.isUIScreen)(treeNode.value)) {
                treeNode.value.data.layout = noneLayout;
            }
        });
        project.uiTree = yield bs.storeJSON(uiTree);
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.21.js.map