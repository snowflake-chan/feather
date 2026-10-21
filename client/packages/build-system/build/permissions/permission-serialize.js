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
exports.storePermissions = storePermissions;
exports.retrievePermissions = retrievePermissions;
const migrations_1 = require("../migrations");
const permission_rda_1 = require("@box/schema/permissions/permission-rda");
const CURRENT_VERSION = permission_rda_1.PermissionRDA.stateSchema.identity.version;
function storePermissions(bs, permissions) {
    return __awaiter(this, void 0, void 0, function* () {
        const rawJSON = permission_rda_1.PermissionRDA.stateSchema.toJSON(permissions);
        const [versionControlHash, groupsHash, usersHash, bannedHash, collaboratorsHash,] = yield Promise.all([
            bs.storeJSON(rawJSON.versionControl),
            bs.storeJSON(rawJSON.groups),
            bs.storeJSON(rawJSON.users),
            bs.storeJSON(rawJSON.banned),
            bs.storeJSON(rawJSON.collaborators),
        ]);
        rawJSON.versionControl = versionControlHash;
        rawJSON.groups = groupsHash;
        rawJSON.users = usersHash;
        rawJSON.banned = bannedHash;
        rawJSON.collaborators = collaboratorsHash;
        return bs.storeJSON(rawJSON);
    });
}
function retrievePermissions(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const json = yield bs.retrieveJSON(hash);
        if (!(json.type === 'permission' || json.type === 'permissions')) {
            throw new Error('invalid permissions hash, incorrect type: ' + json.type);
        }
        if (json.version !== CURRENT_VERSION) {
            bs.logger.info(`permssions ${hash} is an older version ${json.version}, migrating to ${CURRENT_VERSION}`);
            const nextHash = yield (0, migrations_1.buildMigrate)(bs, bs.logger, 'permission', json.version, CURRENT_VERSION, hash);
            if (!nextHash) {
                throw new Error(`error migrating permissions ${hash} from ${json.version} to ${CURRENT_VERSION}`);
            }
            bs.logger.info(`successfully migrated permssions ${hash} from ${json.version} to ${CURRENT_VERSION}.  new hash = ${nextHash}`);
            return retrievePermissions(bs, nextHash);
        }
        const [versionControl, groups, users, banned, collaborators] = yield Promise.all([
            bs.retrieveJSON(json.versionControl),
            bs.retrieveJSON(json.groups),
            bs.retrieveJSON(json.users),
            bs.retrieveJSON(json.banned),
            bs.retrieveJSON(json.collaborators),
        ]);
        json.versionControl = versionControl;
        json.groups = groups;
        json.users = users;
        json.banned = banned;
        json.collaborators = collaborators;
        return {
            hash,
            permissions: permission_rda_1.PermissionRDA.stateSchema.fromJSON(json),
        };
    });
}
//# sourceMappingURL=permission-serialize.js.map