import {
  MuStruct,
  MuBoolean,
  MuUnion,
  MuArray,
  MuSchema,
  MuVarint,
  MuUTF8,
  MuDictionary,
  MuUint32,
} from '@box/mudb/schema';
import {
  ProjectActionSequenceSchema,
  VoxelWriteSequenceSchema,
  ProjectStateSchema,
  RPCTokenSchema,
} from '@box/schema/replica/replica-schema';
import { MuRDATypes } from '@box/mudb/rda';
import { ProjectRDA } from '@box/schema/project/project-rda';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import {
  PermissionRDA,
  PermissionActionSequenceSchema,
  PermissionsSchema,
  PermissionSetSchema,
  UserIdSchema,
} from '@box/schema/permissions/permission-rda';
import { ExtraProjectInfoSchema } from '@box/schema/project/hot-schema';

// locale string, should be used to mark actions in the undo/redo history label
export enum EditActionLabel {
  PROJECT,
  VOXEL,
  PERMISSION,
}

export const ClientProjectActionSchema = new MuStruct({
  label: <MuSchema<EditActionLabel>>new MuVarint(EditActionLabel.PROJECT),
  forward: ProjectActionSequenceSchema,
  inverse: ProjectActionSequenceSchema,
});
export type ClientProjectAction = typeof ClientProjectActionSchema.identity;

export const ClientVoxelActionSchema = new MuStruct({
  label: <MuSchema<EditActionLabel>>new MuVarint(EditActionLabel.VOXEL),
  forward: VoxelWriteSequenceSchema,
  inverse: VoxelWriteSequenceSchema,
});
export type ClientVoxelAction = typeof ClientVoxelActionSchema.identity;

export const ClientPermissionActionSchema = new MuStruct({
  label: <MuSchema<EditActionLabel>>new MuVarint(EditActionLabel.PERMISSION),
  forward: PermissionActionSequenceSchema,
  inverse: PermissionActionSequenceSchema,
});
export type ClientPermissionAction =
  typeof ClientPermissionActionSchema.identity;

export const ClientEditActionSchema = new MuUnion({
  project: ClientProjectActionSchema,
  voxel: ClientVoxelActionSchema,
  permission: ClientPermissionActionSchema,
});
export type ClientEditAction = typeof ClientEditActionSchema.identity;

export const ClientEditSequenceSchema = new MuArray(
  ClientEditActionSchema,
  Infinity,
);

export const PendingPromiseSchema = new MuStruct({
  resolve: new MuRefSchema<(x: string) => void>(),
  reject: new MuRefSchema<(x: string) => void>(),
});

export const PendingRPCSchema = new MuDictionary(
  PendingPromiseSchema,
  Infinity,
);

export const ReplicaClientStateSchema = new MuStruct({
  playButtonBusy: new MuBoolean(false),

  // project state
  projectDirty: new MuBoolean(false),
  projectStore: <MuSchema<MuRDATypes<typeof ProjectRDA>['store']>>(
    new MuRefSchema<MuRDATypes<typeof ProjectRDA>['store']>()
  ),
  project: ProjectStateSchema,
  extraProjectInfo: ExtraProjectInfoSchema,

  // permission state
  permissionStore: <MuSchema<MuRDATypes<typeof PermissionRDA>['store']>>(
    new MuRefSchema<MuRDATypes<typeof PermissionRDA>['store']>()
  ),
  permissions: PermissionsSchema,
  localGroups: new MuArray(new MuUTF8(), Infinity),
  localPermissions: PermissionSetSchema,
  /**
   * Admin + Owner
   */
  localOwner: new MuBoolean(false),
  userId: new MuVarint(),
  applications: new MuArray(UserIdSchema, Infinity),
  newApplicants: new MuDictionary(new MuBoolean(false), Infinity),
  isInviteLinkExpired: new MuBoolean(false),

  // undo/redo history
  undoHistory: ClientEditSequenceSchema,
  redoHistory: ClientEditSequenceSchema,

  // rpc counters
  rpcCounter: RPCTokenSchema,
  pendingRPC: PendingRPCSchema,
});
