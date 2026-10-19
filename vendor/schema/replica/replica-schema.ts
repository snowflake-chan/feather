import { ProjectRDA } from '../project/project-rda';
import {
  MuArray,
  MuStruct,
  MuASCII,
  MuVarint,
  MuBoolean,
  MuUTF8,
  MuVoid,
  MuDictionary,
  MuOption,
} from '@box/mudb/schema';
import { VoxelWriteSchema } from '../voxel/voxel-protocol';
import {
  PermissionStoreSchema,
  PermissionActionSequenceSchema,
  UserIdSchema,
} from '../permissions/permission-rda';
import { ExtraProjectInfoSchema } from '../project/hot-schema';

export const ProjectActionSchema = ProjectRDA.actionSchema;
export type ProjectAction = typeof ProjectActionSchema.identity;
export const ProjectStateSchema = ProjectRDA.stateSchema;
export type ProjectStateSchema = typeof ProjectStateSchema.identity;
export const ProjectStoreSchema = ProjectRDA.storeSchema;
export type ProjectStoreSchema = typeof ProjectStoreSchema.identity;
export const ProjectActionSequenceSchema = new MuArray(
  ProjectActionSchema,
  Infinity,
);

export const VoxelWriteSequenceSchema = new MuArray(VoxelWriteSchema, Infinity);

export const RPCTokenSchema = new MuVarint();
export type RPCToken = typeof RPCTokenSchema.identity;
export const RPCResultSchema = new MuStruct({
  token: RPCTokenSchema,
  result: new MuUTF8(''),
  error: new MuUTF8(''),
});
export type RPCResult = typeof RPCResultSchema.identity;

export const EditReplicaInitSchema = new MuStruct({
  project: ProjectStoreSchema,
  permissions: PermissionStoreSchema,
  extraProjectInfo: ExtraProjectInfoSchema,
});

export const EditRequestPermissionTokenSchema = new MuStruct({
  token: RPCTokenSchema,
  duration: new MuVarint(),
  group: new MuUTF8(),
});

export const EditCheckoutRequestSchema = new MuStruct({
  token: RPCTokenSchema,
  hash: new MuASCII(),
  oldHash: new MuASCII(),
});

export const EditCreateBranchSchema = new MuStruct({
  token: RPCTokenSchema,
  branch: new MuUTF8(),
});

export const EditSwitchBranchSchema = new MuStruct({
  token: RPCTokenSchema,
  branch: new MuUTF8(),
});

export const EditRenameBranchSchema = new MuStruct({
  token: RPCTokenSchema,
  branch: new MuUTF8(),
  oldBranch: new MuUTF8(),
});

export const AddCollaboratorSchema = new MuStruct({
  id: UserIdSchema,
  group: new MuUTF8(),
});

export const EditReplicaProtocol = {
  name: 'edit-replica',
  client: {
    init: EditReplicaInitSchema,
    reset: ProjectStoreSchema,

    project: ProjectActionSequenceSchema,
    voxel: VoxelWriteSequenceSchema,
    permissions: PermissionActionSequenceSchema,

    updateBusyState: new MuBoolean(false),

    updateApplications: new MuArray(UserIdSchema, Infinity),
    updateNewApplicants: new MuDictionary(new MuBoolean(false), Infinity),
    applicationAccepted: new MuVoid(),

    rpcResponse: RPCResultSchema,
    inviteLinkExpired: new MuBoolean(false),

    inviteLinkGroup: new MuUTF8(),
  },
  server: {
    // transaction execution
    project: ProjectActionSequenceSchema,
    voxel: VoxelWriteSequenceSchema,
    permission: PermissionActionSequenceSchema,
    updateExtraProject: new MuVoid(),

    // apply a single optimistic project update action (useful when implementing things like sliders or whatever)
    optimisticProjectAction: ProjectActionSequenceSchema,

    // transaction rollback
    rollbackProject: ProjectActionSequenceSchema,
    rollbackVoxel: VoxelWriteSequenceSchema,
    rollbackPermission: PermissionActionSequenceSchema,

    // execution state
    startProject: RPCTokenSchema,
    stopProject: RPCTokenSchema,

    // version control and saving
    saveProject: new MuStruct({
      token: RPCTokenSchema,
      userId: UserIdSchema,
    }),
    checkoutProject: EditCheckoutRequestSchema,
    createBranch: EditCreateBranchSchema,
    switchBranch: EditSwitchBranchSchema,
    renameBranch: EditRenameBranchSchema,

    // restart server
    restart: new MuVoid(),
    // upgrade databasePing
    upgradeDatabase: new MuStruct({
      token: RPCTokenSchema,
    }),

    // permission token management
    requestToken: EditRequestPermissionTokenSchema,
    inviteLinkExpired: new MuASCII(),

    // application manage
    applyForEditing: new MuVoid(),
    acceptApplication: UserIdSchema,
    rejectApplication: UserIdSchema,
    clearNewApplicants: new MuVoid(),

    // cancel collaborator
    cancelCollaborator: UserIdSchema,
    // add collaborator
    addCollaborator: AddCollaboratorSchema,
    inviteLinkGroup: new MuStruct({
      token: RPCTokenSchema,
      linkString: new MuUTF8(''),
    }),
  },
};
