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
exports.GROUP_VERSION_MAP = exports.MERGED_VERSION = void 0;
exports.retrieveGroupProject = retrieveGroupProject;
const rda_1 = require("@box/schema/group-project/rda");
const migrations_1 = require("../migrations");
/**
 * 当前后端做merge拼接的版本
 * 日后新增字段迁移至group的话这个版本号就要跟随变动
 */
exports.MERGED_VERSION = '0.3.27';
/**
 * group旧版本号到group新版本号的对应map
 * 用于做一些数据fix，版本迁移
 * 这个数据永远不会变动了
 */
exports.GROUP_VERSION_MAP = {
    '0.0.0': '0.3.26',
    '0.0.1': '0.3.26',
    '0.0.2': '0.3.26',
};
/**
 * 这个数据永远不会变动了，0.0.2版本之后的group数据跟随project一起迁移
 */
const GROUP_PROJECT_VERSION = '0.0.2';
/**
 * 后续对每个keys都需要有对应的migration文件
 * 比如加了audio，后面也要有audio-0.0.1.ts 文件，即使原封不动的返回
 * 以上流程可能可以优化，可以在这里读取migrationTasks，做一些判断处理
 *
 * 加更：不会优化了，这个方法也不会有任何的改动，此方法用于兼容旧数据迁移，就老死在这里就行了
 */
function retrieveGroupProject(bs, groupProject) {
    return __awaiter(this, void 0, void 0, function* () {
        const newGroup = Object.assign({}, groupProject);
        /**
         * 同时存在于metaData和schema中的key才需要处理
         */
        const hashKeys = Object.keys(groupProject.hashes).filter((key) => key in rda_1.GroupProjectStateSchema.identity && groupProject.hashes[key]);
        if (groupProject.version !== GROUP_PROJECT_VERSION) {
            bs.logger.info(`group ${JSON.stringify(groupProject.hashes)} is an older version (${groupProject.version}), migrating to latest group ${GROUP_PROJECT_VERSION}`);
            yield Promise.all(hashKeys.map((item) => __awaiter(this, void 0, void 0, function* () {
                // run a migration
                const nextHash = yield (0, migrations_1.buildMigrate)(bs, bs.logger, item, groupProject.version, GROUP_PROJECT_VERSION, groupProject.hashes[item]);
                if (!nextHash) {
                    throw new Error(`error migrating ${item} ${groupProject.hashes[item]} from ${groupProject.version} to ${GROUP_PROJECT_VERSION}.  DID YOU REMEMBER TO WRITE A MIGRATION IN src/build/migrations/group ????  DID YOU???????????`);
                }
                newGroup.hashes[item] = nextHash;
                bs.logger.info(`successfully migrated ${item} ${groupProject.hashes[item]} from ${groupProject.version} to ${GROUP_PROJECT_VERSION}.  new hash = ${nextHash}`);
            })));
            newGroup.version = GROUP_PROJECT_VERSION;
            return retrieveGroupProject(bs, newGroup);
        }
        // load all the subresources
        const result = {};
        yield Promise.all(hashKeys.map((item) => __awaiter(this, void 0, void 0, function* () {
            result[item] = yield bs.retrieveJSON(groupProject.hashes[item]);
        })));
        return result;
    });
}
//# sourceMappingURL=index.js.map