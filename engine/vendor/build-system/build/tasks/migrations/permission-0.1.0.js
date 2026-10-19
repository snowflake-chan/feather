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
exports.name = 'permission';
exports.fromVersion = '0.0.2';
exports.toVersion = '0.1.0';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const permissions = yield bs.retrieveJSON(hash);
        permissions.version = '0.1.0';
        permissions.type = 'permission';
        permissions.prevHash = hash;
        //  will be handled when we call fromJSON on the project
        const versionControl = permissions.versionControl;
        const groups = permissions.groups;
        const users = permissions.users;
        const banned = permissions.banned;
        const [versionControlHash, groupsHash, usersHash, bannedHash] = yield Promise.all([
            bs.storeJSON(versionControl),
            bs.storeJSON(groups),
            bs.storeJSON(users),
            bs.storeJSON(banned),
        ]);
        permissions.versionControl = versionControlHash;
        permissions.groups = groupsHash;
        permissions.users = usersHash;
        permissions.banned = bannedHash;
        return bs.storeJSON(permissions);
    });
}
//# sourceMappingURL=permission-0.1.0.js.map