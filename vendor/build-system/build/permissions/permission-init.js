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
exports.createDefaultPermissions = createDefaultPermissions;
const permission_rda_1 = require("@box/schema/permissions/permission-rda");
const permission_serialize_1 = require("./permission-serialize");
const PermissionGroupSchema = permission_rda_1.PermissionGroupRDA.stateSchema;
const VersionControlSchema = permission_rda_1.VersionControlRDA.stateSchema;
function createDefaultPermissions(spec) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId, contentServer, logger } = spec;
        const permissions = permission_rda_1.PermissionsSchema.clone(permission_rda_1.PermissionsSchema.identity);
        logger.info(`creating default permissions.  owner id = ${userId}`);
        // set owner hash
        permissions.owner = userId.toString();
        permissions.prevHash = '';
        {
            // guest
            const group = PermissionGroupSchema.clone(PermissionGroupSchema.identity);
            const groupPermissions = group.permissions;
            group.defaultGroup = true;
            groupPermissions.chatEnabled = true;
            permissions.groups['guest'] = group;
        }
        {
            // contributors
            const group = PermissionGroupSchema.clone(PermissionGroupSchema.identity);
            const groupPermissions = group.permissions;
            groupPermissions.editProject =
                groupPermissions.editModel =
                    groupPermissions.editPlayer =
                        groupPermissions.editScene =
                            groupPermissions.editFile =
                                groupPermissions.editHierarchy =
                                    groupPermissions.editScripts =
                                        groupPermissions.editVoxels =
                                            groupPermissions.playButton =
                                                groupPermissions.chatEnabled =
                                                    groupPermissions.debugger =
                                                        true;
            permissions.groups['contributor'] = group;
        }
        if (userId) {
            const userRecord = (permissions.users[userId] =
                permission_rda_1.PermissionUserRDA.stateSchema.alloc());
            userRecord.createdAt = new Date();
        }
        else {
            // admin
            const group = PermissionGroupSchema.clone(PermissionGroupSchema.identity);
            const groupPermissions = group.permissions;
            groupPermissions.versionControl =
                groupPermissions.editPermissions =
                    groupPermissions.editProject =
                        groupPermissions.editModel =
                            groupPermissions.editPlayer =
                                groupPermissions.editScene =
                                    groupPermissions.editFile =
                                        groupPermissions.editHierarchy =
                                            groupPermissions.editScripts =
                                                groupPermissions.editVoxels =
                                                    groupPermissions.playButton =
                                                        groupPermissions.publish =
                                                            groupPermissions.chatEnabled =
                                                                groupPermissions.debugger =
                                                                    true;
            group.defaultGroup = true;
            if (userId) {
                const ownerRecord = permission_rda_1.PermissionGroupMemberRDA.stateSchema.alloc();
                ownerRecord.addedAt = new Date();
                group.members[userId] = ownerRecord;
            }
            permissions.groups['test-admin'] = group;
            permissions.accessLevel = permission_rda_1.PermissionAccessLevel.REGISTERED_ONLY;
        }
        // initialize permissions
        const versionControl = VersionControlSchema.clone(VersionControlSchema.identity);
        versionControl.branches = {
            master: {
                name: 'master',
                headHash: spec.projectHash,
            },
        };
        versionControl.currentBranch = 'master';
        permissions.versionControl = versionControl;
        permissions.collaborators = [];
        // store permissions hash
        return (0, permission_serialize_1.storePermissions)(spec.buildSystem, permissions);
    });
}
//# sourceMappingURL=permission-init.js.map