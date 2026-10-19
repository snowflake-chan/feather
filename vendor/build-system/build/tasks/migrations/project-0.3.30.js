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
exports.fromVersion = '0.3.29';
exports.toVersion = '0.3.30';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.30';
        project.prevHash = hash;
        // 由于 entitiesTree 可能非常大，存取都会比较耗时
        const entitiesTree = yield bs.retrieveJSON(project.entitiesTree);
        Object.keys(entitiesTree).forEach((id) => {
            const node = entitiesTree[id];
            if (!node.value) {
                return;
            }
            node.value.staticShadow = true;
            // 某次发版后实体添加了editLock字段但没有做过数据迁移
            // 本次顺便修正一下
            if (node.value.editLock) {
                return;
            }
            node.value.editLock = false;
        });
        project.entitiesTree = yield bs.storeJSON(entitiesTree);
        // update bakedShadow for environment
        const environment = yield bs.retrieveJSON(project.environment);
        environment.bakedShadow = {
            texture: '',
            data: '',
            chunkShift: 6,
        };
        project.environment = yield bs.storeJSON(environment);
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.30.js.map