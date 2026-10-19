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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateSkin = migrateSkin;
const voxa_project_1 = require("@box/voxa-project");
const heavy_mutex_1 = require("./heavy_mutex");
function migrateSkin(bs, hash, metaData) {
    return __awaiter(this, void 0, void 0, function* () {
        yield heavy_mutex_1.BUILD_HEAVY_LOCK.p();
        const t = Date.now();
        try {
            return yield migrateS3Skin(bs, hash, metaData);
        }
        finally {
            bs.logger.info(`migrate skin mesh ${hash} elapsed time ${Date.now() - t}ms`);
            heavy_mutex_1.BUILD_HEAVY_LOCK.v();
        }
    });
}
const migrateS3Skin = (bs, hash, metaData) => __awaiter(void 0, void 0, void 0, function* () {
    if (metaData.version === voxa_project_1.VOXA_SKIN_VERSION) {
        return hash;
    }
    const { version } = metaData, bodyParts = __rest(metaData, ["version"]);
    const newMetaData = {
        version: voxa_project_1.VOXA_SKIN_VERSION,
    };
    const migrationList = [];
    Object.keys(bodyParts).forEach((partName) => {
        const hash = bodyParts[partName];
        if (!hash) {
            return;
        }
        const partMigration = new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            const bytes = yield bs.retrieveContentFromS3(hash);
            const schema = yield (0, voxa_project_1.migrateSkin)(bytes);
            if (!schema) {
                reject(`Failed to migrate a part to latest version, ${hash}`);
                return;
            }
            const latestBytes = (0, voxa_project_1.bodyPartSchemaToBytes)(schema);
            const dataHash = yield bs.storeContentToS3(latestBytes);
            newMetaData[partName] = dataHash;
            resolve();
        }));
        migrationList.push(partMigration);
    });
    yield Promise.all(migrationList);
    const latestMetaBytes = new Uint8Array(Buffer.from(JSON.stringify(newMetaData), 'utf8'));
    return yield bs.storeContentToS3(latestMetaBytes);
});
//# sourceMappingURL=migrate-skin.js.map