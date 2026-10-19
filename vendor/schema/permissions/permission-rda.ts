import {
  MuStruct,
  MuBoolean,
  MuASCII,
  MuArray,
  MuUTF8,
  MuVarint,
  MuDate,
  MuSchema,
} from '@box/mudb/schema';
import {
  MuRDAConstant,
  MuRDAStruct,
  MuRDAMap,
  MuRDARegister,
  MuRDAList,
} from '@box/mudb/rda';
import { HashSchema } from '../content-server/index';

export const UserIdSchema = new MuUTF8();
export const PermissionGroupMemberRDA = new MuRDAStruct({
  addedAt: new MuRDAConstant(new MuDate()),
});
export const PermissionMemberRDA = new MuRDAMap(
  UserIdSchema,
  PermissionGroupMemberRDA,
);
export const PermissionSetRDA = new MuRDAStruct({
  publish: new MuRDARegister(new MuBoolean(false)),
  playButton: new MuRDARegister(new MuBoolean(false)),
  debugger: new MuRDARegister(new MuBoolean(false)),
  editScripts: new MuRDARegister(new MuBoolean(false)),
  editProject: new MuRDARegister(new MuBoolean(false)),
  editModel: new MuRDARegister(new MuBoolean(false)),
  editScene: new MuRDARegister(new MuBoolean(false)),
  editFile: new MuRDARegister(new MuBoolean(false)),
  editHierarchy: new MuRDARegister(new MuBoolean(false)),
  editVoxels: new MuRDARegister(new MuBoolean(false)),
  editPermissions: new MuRDARegister(new MuBoolean(false)),
  versionControl: new MuRDARegister(new MuBoolean(false)),
  /**
   * @deprecated 暂时无用，待删
   */
  chatEnabled: new MuRDARegister(new MuBoolean(true)),
  /**
   * 平台权限
   */
  editMarket: new MuRDARegister(new MuBoolean(false)),
  editStatisticsData: new MuRDARegister(new MuBoolean(false)),
  editPublish: new MuRDARegister(new MuBoolean(false)),
  /** 玩家模块权限: 每个地图独立控制 */
  editPlayer: new MuRDARegister(new MuBoolean(false)),
});
export const PermissionGroupRDA = new MuRDAStruct({
  permissions: PermissionSetRDA,
  members: PermissionMemberRDA,
  defaultGroup: new MuRDARegister(new MuBoolean(false)),
});
export const PermissionSetSchema = PermissionSetRDA.stateSchema;
export type PermissionSet = typeof PermissionSetSchema.identity;
export const PermissionUserRDA = new MuRDAStruct({
  createdAt: new MuRDAConstant(new MuDate()),
});
export const BanRDA = new MuRDAConstant(
  new MuStruct({
    reason: new MuUTF8(''),
    bannedBy: UserIdSchema,
  }),
);

export const VersionControlBranchesRDA = new MuRDAMap(
  new MuUTF8(''),
  new MuRDAStruct({
    name: new MuRDARegister(new MuUTF8('')),
    headHash: new MuRDARegister(HashSchema),
  }),
);

export const VersionControlBranchesSchema =
  VersionControlBranchesRDA.stateSchema;

export type VersionControlBranches =
  typeof VersionControlBranchesSchema.identity;

export const VersionControlRDA = new MuRDAStruct({
  branches: VersionControlBranchesRDA,
  currentBranch: new MuRDARegister(new MuUTF8('')),
});
export type BranchTable = typeof VersionControlRDA.stateSchema;

export enum PermissionAccessLevel {
  REGISTERED_ONLY = 1, // any registered users can access
  INVITED_ONLY = 2, // only invited can access
  PRIVATE = 3, // only owner can access
  SCRIPT_VIEW_ONLY = 4, // script read-only to anyone
}

export const PermissionRDA = new MuRDAStruct({
  type: new MuRDAConstant(new MuUTF8('permission')),
  version: new MuRDAConstant(new MuASCII('0.1.8')),
  prevHash: new MuRDARegister(HashSchema),
  timestamp: new MuRDARegister(new MuDate(new Date(0))),

  versionControl: VersionControlRDA,
  groups: new MuRDAMap(new MuUTF8(), PermissionGroupRDA),
  users: new MuRDAMap(UserIdSchema, PermissionUserRDA),
  // collaborator
  collaborators: new MuRDAList(new MuRDAConstant(UserIdSchema)),

  // owner of the project
  owner: new MuRDAConstant(UserIdSchema),

  // check if guest users are allowed to view the project
  accessLevel: new MuRDARegister(
    <MuSchema<PermissionAccessLevel>>(
      new MuVarint(PermissionAccessLevel.REGISTERED_ONLY)
    ),
    (x: number) => {
      if ((+x) in PermissionAccessLevel) {
        return x;
      }
      return PermissionAccessLevel.INVITED_ONLY;
    },
  ),

  // banned user list
  banned: new MuRDAMap(UserIdSchema, BanRDA),
});

export const PermissionsSchema = PermissionRDA.stateSchema;
export const PermissionActionSchema = PermissionRDA.actionSchema;
export const PermissionStoreSchema = PermissionRDA.storeSchema;
export const PermissionActionSequenceSchema = new MuArray(
  PermissionActionSchema,
  Infinity,
);

export type Permissions = typeof PermissionsSchema.identity;
export type PermissionAction = typeof PermissionActionSchema.identity;

export const PermissionTokenSchema = new MuStruct({
  expireAt: new MuDate(),
  group: new MuUTF8(''),
});
export type PermissionToken = typeof PermissionTokenSchema.identity;

export function combinePermissionSet(
  target: PermissionSet,
  other: PermissionSet,
) {
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

export const OWNER_PERMISSIONS = PermissionSetSchema.clone(
  PermissionSetSchema.identity,
);
OWNER_PERMISSIONS.versionControl =
  OWNER_PERMISSIONS.publish =
  OWNER_PERMISSIONS.playButton =
  OWNER_PERMISSIONS.editVoxels =
  OWNER_PERMISSIONS.editScripts =
  OWNER_PERMISSIONS.editProject =
  OWNER_PERMISSIONS.editModel =
  OWNER_PERMISSIONS.editScene =
  OWNER_PERMISSIONS.editFile =
  OWNER_PERMISSIONS.editHierarchy =
  OWNER_PERMISSIONS.editPermissions =
  OWNER_PERMISSIONS.debugger =
  OWNER_PERMISSIONS.chatEnabled =
  OWNER_PERMISSIONS.editPublish =
  OWNER_PERMISSIONS.editStatisticsData =
  OWNER_PERMISSIONS.editMarket =
  OWNER_PERMISSIONS.editPlayer =
    true;
