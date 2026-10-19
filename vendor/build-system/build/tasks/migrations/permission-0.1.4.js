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
exports.fromVersion = '0.1.3';
exports.toVersion = '0.1.4';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const permissions = yield bs.retrieveJSON(hash);
        permissions.version = '0.1.4';
        permissions.type = 'permission';
        permissions.prevHash = hash;
        // migrate the collaborator list duplicate
        const collaboratorsHash = permissions.collaborators;
        let collaborators = yield bs.retrieveJSON(collaboratorsHash);
        const users = yield bs.retrieveJSON(permissions.users);
        const groups = yield bs.retrieveJSON(permissions.groups);
        const banned = yield bs.retrieveJSON(permissions.banned);
        collaborators = [];
        const bannedId = Object.keys(banned);
        for (let i = 0; i < bannedId.length; i++) {
            const index = collaborators.indexOf(+bannedId[i]);
            if (index !== -1) {
                collaborators.splice(index, 1);
            }
        }
        const userList = [];
        const groupNames = Object.keys(groups);
        const userIds = Object.keys(users).sort((a, b) => users[a].createdAt - users[b].createdAt);
        for (let i = 0; i < userIds.length; i++) {
            const userId = +userIds[i];
            userList[i] = { userId: userId, roles: [] };
            if (userId === permissions.owner) {
                userList[i].roles.push('owner');
            }
            for (let j = 0; j < groupNames.length; j++) {
                const members = groups[groupNames[j]].members;
                if (members[userId]) {
                    userList[i].roles.push(groupNames[j]);
                }
            }
        }
        collaborators = userList
            .filter(({ userId, roles }) => {
            if (permissions.owner === userId) {
                return false;
            }
            if (banned[userId]) {
                return false;
            }
            if (roles.length === 0 || (roles.length === 1 && roles[0] === 'guest')) {
                return false;
            }
            return true;
        })
            .map((user) => user.userId);
        const newCollaboratorsHash = yield bs.storeJSON(collaborators);
        permissions.collaborators = newCollaboratorsHash;
        return bs.storeJSON(permissions);
    });
}
//# sourceMappingURL=permission-0.1.4.js.map