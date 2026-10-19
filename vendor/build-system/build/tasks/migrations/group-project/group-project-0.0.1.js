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
exports.AudioAssets_001 = exports.UiTree_001 = void 0;
const util_1 = require("@box/schema/project/ui-rda/util");
const fromVersion = '0.0.0';
const toVersion = '0.0.1';
function noMigration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        return hash;
    });
}
// project 中 0.3.19 -> 0.3.25 uiTree的改动
// 主要做了以下几件事：
// 1, 添加“布局”属性: layoutOrder:1,layout:noneLayout
// 2, 新增“裁剪”属性: clipsDescendants:false；删除没用的oderType
// 3, 文本框添加 autoWordWrap: false,textLineHeight: 1.2
// 4, 屏幕添加zIndex:1
function uiTreeMigration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const uiTree = yield bs.retrieveJSON(hash);
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
                //layout
                if (treeNode.value.data.data.layout === undefined) {
                    treeNode.value.data.data.layout = noneLayout;
                }
                // layoutOrder
                if (treeNode.value.data.data.layoutOrder === undefined) {
                    treeNode.value.data.data.layoutOrder = 1;
                }
                // clipsDescendants
                if (treeNode.value.data.data.clipsDescendants === undefined) {
                    treeNode.value.data.data.clipsDescendants = false;
                }
                // 文本框添加 autoWordWrap: false,textLineHeight: 1.2
                if ((0, util_1.isUITextElement)(treeNode.value.data)) {
                    if (treeNode.value.data.data.autoWordWrap === undefined) {
                        treeNode.value.data.data.autoWordWrap = false;
                    }
                    if (treeNode.value.data.data.textLineHeight === undefined) {
                        treeNode.value.data.data.textLineHeight = 1.2;
                    }
                }
            }
            else if ((0, util_1.isUIScreen)(treeNode.value)) {
                // 屏幕添加layout
                if (treeNode.value.data.layout === undefined) {
                    treeNode.value.data.layout = noneLayout;
                }
                // 屏幕添加zIndex
                if (treeNode.value.data.zIndex === undefined) {
                    treeNode.value.data.zIndex = 1;
                }
            }
            const autoLayout = (0, util_1.pickAutoLayoutProp)(treeNode.value);
            // 删除没用的oderType
            if (autoLayout) {
                delete autoLayout.data['orderType'];
            }
        });
        return bs.storeJSON(uiTree);
    });
}
exports.UiTree_001 = {
    name: 'uiTree',
    fromVersion,
    toVersion,
    migration: uiTreeMigration,
};
exports.AudioAssets_001 = {
    name: 'audioAssets',
    fromVersion,
    toVersion,
    migration: noMigration,
};
//# sourceMappingURL=group-project-0.0.1.js.map