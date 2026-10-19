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
exports.fromVersion = '0.3.27';
exports.toVersion = '0.3.28';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.28';
        project.prevHash = hash;
        const uiTree = yield bs.retrieveJSON(project.uiTree);
        // UI图片元素新增‘展示方式’
        Object.keys(uiTree).forEach((treeNodeId) => {
            const treeNode = uiTree[treeNodeId];
            if (!treeNode || !treeNode.value) {
                return;
            }
            if ((0, util_1.isUIImageNode)(treeNode.value)) {
                treeNode.value.data.data.imageDisplayMode = defs_1.ImageDisplayMode.Fill;
                return;
            }
            if ((0, util_1.isUITextNode)(treeNode.value) || (0, util_1.isUIInputNode)(treeNode.value)) {
                treeNode.value.data.data.textStrokeColor = [255, 255, 255];
                treeNode.value.data.data.textStrokeOpacity = 1;
                treeNode.value.data.data.textStrokeThickness = 0;
                treeNode.value.data.data.textFontFamily = defs_1.UITextFontFamily.Default;
                return;
            }
        });
        project.uiTree = yield bs.storeJSON(uiTree);
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.28.js.map