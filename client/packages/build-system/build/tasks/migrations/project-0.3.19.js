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
const murda_tree_1 = require("@box/schema/project/murda-tree");
const defs_1 = require("@box/schema/project/ui-rda/defs");
exports.name = 'project';
exports.fromVersion = '0.3.18';
exports.toVersion = '0.3.19';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = exports.toVersion;
        project.prevHash = hash;
        const uiTree = {
            [murda_tree_1.ROOT_ID]: {
                id: murda_tree_1.ROOT_ID,
                name: murda_tree_1.ROOT_NAME,
                type: murda_tree_1.TreeNodeType.root,
                parentId: '',
                childrenIds: [defs_1.DEFAULT_SCREEN_ID],
                value: undefined,
            },
            /**
             * 默认有一个屏幕
             */
            [defs_1.DEFAULT_SCREEN_ID]: {
                id: defs_1.DEFAULT_SCREEN_ID,
                name: defs_1.DEFAULT_SCREEN_NAME,
                type: murda_tree_1.TreeNodeType.node,
                parentId: murda_tree_1.ROOT_ID,
                childrenIds: [],
                value: {
                    type: 'screen',
                    data: {
                        enable: true,
                    },
                },
            },
        };
        project.uiTree = yield bs.storeJSON(uiTree);
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.19.js.map