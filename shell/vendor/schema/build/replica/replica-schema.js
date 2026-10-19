"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditReplicaProtocol = exports.AddCollaboratorSchema = exports.EditRenameBranchSchema = exports.EditSwitchBranchSchema = exports.EditCreateBranchSchema = exports.EditCheckoutRequestSchema = exports.EditRequestPermissionTokenSchema = exports.EditReplicaInitSchema = exports.RPCResultSchema = exports.RPCTokenSchema = exports.VoxelWriteSequenceSchema = exports.ProjectActionSequenceSchema = exports.ProjectStoreSchema = exports.ProjectStateSchema = exports.ProjectActionSchema = void 0;
const project_rda_1 = require("../project/project-rda");
const array_1 = require("@box/mudb/schema/array");
const ascii_1 = require("@box/mudb/schema/ascii");
const boolean_1 = require("@box/mudb/schema/boolean");
const dictionary_1 = require("@box/mudb/schema/dictionary");
const struct_1 = require("@box/mudb/schema/struct");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
const void_1 = require("@box/mudb/schema/void");
const voxel_protocol_1 = require("../voxel/voxel-protocol");
const permission_rda_1 = require("../permissions/permission-rda");
const hot_schema_1 = require("../project/hot-schema");
exports.ProjectActionSchema = project_rda_1.ProjectRDA.actionSchema;
exports.ProjectStateSchema = project_rda_1.ProjectRDA.stateSchema;
exports.ProjectStoreSchema = project_rda_1.ProjectRDA.storeSchema;
exports.ProjectActionSequenceSchema = new array_1.MuArray(exports.ProjectActionSchema, Infinity);
exports.VoxelWriteSequenceSchema = new array_1.MuArray(voxel_protocol_1.VoxelWriteSchema, Infinity);
exports.RPCTokenSchema = new varint_1.MuVarint();
exports.RPCResultSchema = new struct_1.MuStruct({
    token: exports.RPCTokenSchema,
    result: new utf8_1.MuUTF8(''),
    error: new utf8_1.MuUTF8(''),
});
exports.EditReplicaInitSchema = new struct_1.MuStruct({
    project: exports.ProjectStoreSchema,
    permissions: permission_rda_1.PermissionStoreSchema,
    extraProjectInfo: hot_schema_1.ExtraProjectInfoSchema,
});
exports.EditRequestPermissionTokenSchema = new struct_1.MuStruct({
    token: exports.RPCTokenSchema,
    duration: new varint_1.MuVarint(),
    group: new utf8_1.MuUTF8(),
});
exports.EditCheckoutRequestSchema = new struct_1.MuStruct({
    token: exports.RPCTokenSchema,
    hash: new ascii_1.MuASCII(),
    oldHash: new ascii_1.MuASCII(),
});
exports.EditCreateBranchSchema = new struct_1.MuStruct({
    token: exports.RPCTokenSchema,
    branch: new utf8_1.MuUTF8(),
});
exports.EditSwitchBranchSchema = new struct_1.MuStruct({
    token: exports.RPCTokenSchema,
    branch: new utf8_1.MuUTF8(),
});
exports.EditRenameBranchSchema = new struct_1.MuStruct({
    token: exports.RPCTokenSchema,
    branch: new utf8_1.MuUTF8(),
    oldBranch: new utf8_1.MuUTF8(),
});
exports.AddCollaboratorSchema = new struct_1.MuStruct({
    id: permission_rda_1.UserIdSchema,
    group: new utf8_1.MuUTF8(),
});
exports.EditReplicaProtocol = {
    name: 'edit-replica',
    client: {
        init: exports.EditReplicaInitSchema,
        reset: exports.ProjectStoreSchema,
        project: exports.ProjectActionSequenceSchema,
        voxel: exports.VoxelWriteSequenceSchema,
        permissions: permission_rda_1.PermissionActionSequenceSchema,
        updateBusyState: new boolean_1.MuBoolean(false),
        updateApplications: new array_1.MuArray(permission_rda_1.UserIdSchema, Infinity),
        updateNewApplicants: new dictionary_1.MuDictionary(new boolean_1.MuBoolean(false), Infinity),
        applicationAccepted: new void_1.MuVoid(),
        rpcResponse: exports.RPCResultSchema,
        inviteLinkExpired: new boolean_1.MuBoolean(false),
        inviteLinkGroup: new utf8_1.MuUTF8(),
    },
    server: {
        // transaction execution
        project: exports.ProjectActionSequenceSchema,
        voxel: exports.VoxelWriteSequenceSchema,
        permission: permission_rda_1.PermissionActionSequenceSchema,
        updateExtraProject: new void_1.MuVoid(),
        // apply a single optimistic project update action (useful when implementing things like sliders or whatever)
        optimisticProjectAction: exports.ProjectActionSequenceSchema,
        // transaction rollback
        rollbackProject: exports.ProjectActionSequenceSchema,
        rollbackVoxel: exports.VoxelWriteSequenceSchema,
        rollbackPermission: permission_rda_1.PermissionActionSequenceSchema,
        // execution state
        startProject: exports.RPCTokenSchema,
        stopProject: exports.RPCTokenSchema,
        // version control and saving
        saveProject: new struct_1.MuStruct({
            token: exports.RPCTokenSchema,
            userId: permission_rda_1.UserIdSchema,
        }),
        checkoutProject: exports.EditCheckoutRequestSchema,
        createBranch: exports.EditCreateBranchSchema,
        switchBranch: exports.EditSwitchBranchSchema,
        renameBranch: exports.EditRenameBranchSchema,
        // restart server
        restart: new void_1.MuVoid(),
        // upgrade databasePing
        upgradeDatabase: new struct_1.MuStruct({
            token: exports.RPCTokenSchema,
        }),
        // permission token management
        requestToken: exports.EditRequestPermissionTokenSchema,
        inviteLinkExpired: new ascii_1.MuASCII(),
        // application manage
        applyForEditing: new void_1.MuVoid(),
        acceptApplication: permission_rda_1.UserIdSchema,
        rejectApplication: permission_rda_1.UserIdSchema,
        clearNewApplicants: new void_1.MuVoid(),
        // cancel collaborator
        cancelCollaborator: permission_rda_1.UserIdSchema,
        // add collaborator
        addCollaborator: exports.AddCollaboratorSchema,
        inviteLinkGroup: new struct_1.MuStruct({
            token: exports.RPCTokenSchema,
            linkString: new utf8_1.MuUTF8(''),
        }),
    },
};
