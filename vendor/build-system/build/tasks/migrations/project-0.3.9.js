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
var EditItemType;
(function (EditItemType) {
    EditItemType["Folder"] = "folder";
    EditItemType["Entity"] = "entity";
})(EditItemType || (EditItemType = {}));
exports.name = 'project';
exports.fromVersion = '0.3.8';
exports.toVersion = '0.3.9';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.9';
        project.prevHash = hash;
        // add folder data
        const editRoot = [];
        const entities = yield bs.retrieveJSON(project.entities);
        Object.keys(entities).forEach((id) => {
            entities[id].folderId = '';
            editRoot.push({
                id,
                type: EditItemType.Entity,
            });
        });
        project.entities = yield bs.storeJSON(entities);
        project.editRoot = yield bs.storeJSON(editRoot);
        project.folders = yield bs.storeJSON({});
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.9.js.map