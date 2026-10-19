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
exports.name = 'project';
exports.fromVersion = '0.3.14';
exports.toVersion = '0.3.15';
var EditItemType;
(function (EditItemType) {
    EditItemType["Folder"] = "folder";
    EditItemType["Entity"] = "entity";
})(EditItemType || (EditItemType = {}));
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.15';
        project.prevHash = hash;
        // 构造根目录节点
        const editRoot = yield bs.retrieveJSON(project.editRoot);
        const entitiesTree = {
            [murda_tree_1.ROOT_ID]: {
                id: murda_tree_1.ROOT_ID,
                name: murda_tree_1.ROOT_NAME,
                type: murda_tree_1.TreeNodeType.root,
                parentId: '',
                childrenIds: editRoot.map((i) => i.id),
                value: undefined,
            },
        };
        delete project.editRoot;
        // 构造所有的父节点
        const folders = yield bs.retrieveJSON(project.folders);
        Object.keys(folders).forEach((folderId) => {
            const folder = folders[folderId];
            entitiesTree[folderId] = {
                id: folderId,
                name: folder.name,
                type: murda_tree_1.TreeNodeType.node,
                parentId: folder.parentId === '' ? murda_tree_1.ROOT_ID : folder.parentId,
                childrenIds: folder.children.map((i) => i.id),
                value: undefined,
            };
        });
        delete project.folders;
        // 构造所有的叶子节点
        const entities = yield bs.retrieveJSON(project.entities);
        Object.keys(entities).forEach((entityId) => {
            const entity = entities[entityId];
            entitiesTree[entityId] = {
                id: entityId,
                name: entity.name,
                type: murda_tree_1.TreeNodeType.leaf,
                parentId: entity.folderId === '' ? murda_tree_1.ROOT_ID : entity.folderId,
                childrenIds: [],
                value: entity,
            };
            delete entity.folderId;
        });
        delete project.entities;
        project.entitiesTree = yield bs.storeJSON(entitiesTree);
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.15.js.map