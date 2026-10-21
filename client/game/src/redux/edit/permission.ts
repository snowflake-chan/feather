import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PermissionAccessLevel,
  PermissionSetSchema,
  Permissions,
} from '@box/schema/permissions/permission-rda';

export type PermissionState = typeof PermissionSetSchema.identity & {
  localOwner: boolean;
  localGroups: string[];
  accessLevel: PermissionAccessLevel;
  owner: Permissions['owner'];
  users: Permissions['users'];
  collaborators: Permissions['collaborators'];
  groups: Permissions['groups'];
  banned: Permissions['banned'];
  // 地图商城权限
  mapPaidAccess: boolean;
  subMapCommonPermissions: {
    // 子图的公共权限
    editMarket: boolean;
    editStatisticsData: boolean;
    editPublish: boolean;
  };
};
const initialState: PermissionState = {
  chatEnabled: false,
  publish: false,
  playButton: false,
  debugger: false,
  editScripts: false,
  editPlayer: false,
  editProject: false,
  editModel: false,
  editScene: false,
  editFile: false,
  editHierarchy: false,
  editVoxels: false,
  editPermissions: false,
  // Platform permissions
  editMarket: false,
  editStatisticsData: false,
  editPublish: false,

  versionControl: false,
  localOwner: false,
  localGroups: [],
  accessLevel: PermissionAccessLevel.REGISTERED_ONLY,
  owner: '',
  users: {},
  collaborators: [],
  groups: {},
  banned: {},
  mapPaidAccess: false,
  subMapCommonPermissions: {
    // 子图的公共
    editMarket: false,
    editStatisticsData: false,
    editPublish: false,
  },
};

export const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    setPermission: (state, action: PayloadAction<Partial<PermissionState>>) => {
      Object.assign(state, action.payload);
      return state;
    },
  },
});

export const { setPermission } = permissionSlice.actions;
