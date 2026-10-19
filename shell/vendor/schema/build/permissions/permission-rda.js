"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OWNER_PERMISSIONS = exports.PermissionTokenSchema = exports.PermissionActionSequenceSchema = exports.PermissionStoreSchema = exports.PermissionActionSchema = exports.PermissionsSchema = exports.PermissionRDA = exports.PermissionAccessLevel = exports.VersionControlRDA = exports.VersionControlBranchesSchema = exports.VersionControlBranchesRDA = exports.BanRDA = exports.PermissionUserRDA = exports.PermissionSetSchema = exports.PermissionGroupRDA = exports.PermissionSetRDA = exports.PermissionMemberRDA = exports.PermissionGroupMemberRDA = exports.UserIdSchema = void 0;
exports.combinePermissionSet = combinePermissionSet;
const array_1 = require("@box/mudb/schema/array");
const ascii_1 = require("@box/mudb/schema/ascii");
const boolean_1 = require("@box/mudb/schema/boolean");
const date_1 = require("@box/mudb/schema/date");
const struct_1 = require("@box/mudb/schema/struct");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
const rda_1 = require("@box/mudb/rda");
const index_1 = require("../content-server/index");
exports.UserIdSchema = new utf8_1.MuUTF8();
exports.PermissionGroupMemberRDA = new rda_1.MuRDAStruct({
    addedAt: new rda_1.MuRDAConstant(new date_1.MuDate()),
});
exports.PermissionMemberRDA = new rda_1.MuRDAMap(exports.UserIdSchema, exports.PermissionGroupMemberRDA);
exports.PermissionSetRDA = new rda_1.MuRDAStruct({
    publish: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    playButton: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    debugger: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    editScripts: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    editProject: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    editModel: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    editScene: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    editFile: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    editHierarchy: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    editVoxels: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    editPermissions: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    versionControl: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    /**
     * @deprecated 暂时无用，待删
     */
    chatEnabled: new rda_1.MuRDARegister(new boolean_1.MuBoolean(true)),
    /**
     * 平台权限
     */
    editMarket: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    editStatisticsData: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    editPublish: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
    /** 玩家模块权限: 每个地图独立控制 */
    editPlayer: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
});
exports.PermissionGroupRDA = new rda_1.MuRDAStruct({
    permissions: exports.PermissionSetRDA,
    members: exports.PermissionMemberRDA,
    defaultGroup: new rda_1.MuRDARegister(new boolean_1.MuBoolean(false)),
});
exports.PermissionSetSchema = exports.PermissionSetRDA.stateSchema;
exports.PermissionUserRDA = new rda_1.MuRDAStruct({
    createdAt: new rda_1.MuRDAConstant(new date_1.MuDate()),
});
exports.BanRDA = new rda_1.MuRDAConstant(new struct_1.MuStruct({
    reason: new utf8_1.MuUTF8(''),
    bannedBy: exports.UserIdSchema,
}));
exports.VersionControlBranchesRDA = new rda_1.MuRDAMap(new utf8_1.MuUTF8(''), new rda_1.MuRDAStruct({
    name: new rda_1.MuRDARegister(new utf8_1.MuUTF8('')),
    headHash: new rda_1.MuRDARegister(index_1.HashSchema),
}));
exports.VersionControlBranchesSchema = exports.VersionControlBranchesRDA.stateSchema;
exports.VersionControlRDA = new rda_1.MuRDAStruct({
    branches: exports.VersionControlBranchesRDA,
    currentBranch: new rda_1.MuRDARegister(new utf8_1.MuUTF8('')),
});
var PermissionAccessLevel;
(function (PermissionAccessLevel) {
    PermissionAccessLevel[PermissionAccessLevel["REGISTERED_ONLY"] = 1] = "REGISTERED_ONLY";
    PermissionAccessLevel[PermissionAccessLevel["INVITED_ONLY"] = 2] = "INVITED_ONLY";
    PermissionAccessLevel[PermissionAccessLevel["PRIVATE"] = 3] = "PRIVATE";
    PermissionAccessLevel[PermissionAccessLevel["SCRIPT_VIEW_ONLY"] = 4] = "SCRIPT_VIEW_ONLY";
})(PermissionAccessLevel || (exports.PermissionAccessLevel = PermissionAccessLevel = {}));
exports.PermissionRDA = new rda_1.MuRDAStruct({
    type: new rda_1.MuRDAConstant(new utf8_1.MuUTF8('permission')),
    version: new rda_1.MuRDAConstant(new ascii_1.MuASCII('0.1.8')),
    prevHash: new rda_1.MuRDARegister(index_1.HashSchema),
    timestamp: new rda_1.MuRDARegister(new date_1.MuDate(new Date(0))),
    versionControl: exports.VersionControlRDA,
    groups: new rda_1.MuRDAMap(new utf8_1.MuUTF8(), exports.PermissionGroupRDA),
    users: new rda_1.MuRDAMap(exports.UserIdSchema, exports.PermissionUserRDA),
    // collaborator
    collaborators: new rda_1.MuRDAList(new rda_1.MuRDAConstant(exports.UserIdSchema)),
    // owner of the project
    owner: new rda_1.MuRDAConstant(exports.UserIdSchema),
    // check if guest users are allowed to view the project
    accessLevel: new rda_1.MuRDARegister((new varint_1.MuVarint(PermissionAccessLevel.REGISTERED_ONLY)), (x) => {
        if ((+x) in PermissionAccessLevel) {
            return x;
        }
        return PermissionAccessLevel.INVITED_ONLY;
    }),
    // banned user list
    banned: new rda_1.MuRDAMap(exports.UserIdSchema, exports.BanRDA),
});
exports.PermissionsSchema = exports.PermissionRDA.stateSchema;
exports.PermissionActionSchema = exports.PermissionRDA.actionSchema;
exports.PermissionStoreSchema = exports.PermissionRDA.storeSchema;
exports.PermissionActionSequenceSchema = new array_1.MuArray(exports.PermissionActionSchema, Infinity);
exports.PermissionTokenSchema = new struct_1.MuStruct({
    expireAt: new date_1.MuDate(),
    group: new utf8_1.MuUTF8(''),
});
function combinePermissionSet(target, other) {
    target.debugger = target.debugger || other.debugger;
    target.editPermissions = target.editPermissions || other.editPermissions;
    target.editProject = target.editProject || other.editProject;
    target.editModel = target.editModel || other.editModel;
    target.editScene = target.editScene || other.editScene;
    target.editFile = target.editFile || other.editFile;
    target.editHierarchy = target.editHierarchy || other.editHierarchy;
    target.editScripts = target.editScripts || other.editScripts;
    target.editVoxels = target.editVoxels || other.editVoxels;
    target.publish = target.publish || other.publish;
    target.playButton = target.playButton || other.playButton;
    target.versionControl = target.versionControl || other.versionControl;
    target.chatEnabled = target.chatEnabled && other.chatEnabled;
    target.editMarket = target.editMarket || other.editMarket;
    target.editStatisticsData =
        target.editStatisticsData || other.editStatisticsData;
    target.editPublish = target.editPublish || other.editPublish;
    target.editPlayer = target.editPlayer || other.editPlayer;
}
exports.OWNER_PERMISSIONS = exports.PermissionSetSchema.clone(exports.PermissionSetSchema.identity);
exports.OWNER_PERMISSIONS.versionControl =
    exports.OWNER_PERMISSIONS.publish =
        exports.OWNER_PERMISSIONS.playButton =
            exports.OWNER_PERMISSIONS.editVoxels =
                exports.OWNER_PERMISSIONS.editScripts =
                    exports.OWNER_PERMISSIONS.editProject =
                        exports.OWNER_PERMISSIONS.editModel =
                            exports.OWNER_PERMISSIONS.editScene =
                                exports.OWNER_PERMISSIONS.editFile =
                                    exports.OWNER_PERMISSIONS.editHierarchy =
                                        exports.OWNER_PERMISSIONS.editPermissions =
                                            exports.OWNER_PERMISSIONS.debugger =
                                                exports.OWNER_PERMISSIONS.chatEnabled =
                                                    exports.OWNER_PERMISSIONS.editPublish =
                                                        exports.OWNER_PERMISSIONS.editStatisticsData =
                                                            exports.OWNER_PERMISSIONS.editMarket =
                                                                exports.OWNER_PERMISSIONS.editPlayer =
                                                                    true;
