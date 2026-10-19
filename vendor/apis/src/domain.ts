/** Stable wire values used by Local Engine Creator, VOXA and game runtime. */
export type LocaleFullType = 'en_US' | 'zh_CN';

export enum UserInfoPermissions {
  Admin = 1 << 16,
}

export interface UserInfoVO {
  authType: number;
  avatar: string;
  birthday: string;
  email: string;
  gender: number;
  hasSetPwd?: boolean;
  language: string;
  nickname: string;
  token?: string;
  userId: number;
  wallet?: string;
  walletType?: number;
  phone: string;
  permission: UserInfoPermissions;
}

export enum AvatarBodyPart {
  head = 1,
  hips = 2,
  leftFoot = 3,
  leftHand = 4,
  leftLowerArm = 5,
  leftLowerLeg = 6,
  leftShoulder = 7,
  leftUpperArm = 8,
  leftUpperLeg = 9,
  neck = 10,
  rightFoot = 11,
  rightHand = 12,
  rightLowerArm = 13,
  rightLowerLeg = 14,
  rightShoulder = 15,
  rightUpperArm = 16,
  rightUpperLeg = 17,
  torso = 18,
}

export enum ModelType {
  Private,
  Public,
  Project,
  ExtensionLib,
}

export enum CreativeMode {
  Model = 1,
  Skin,
}

export enum SortOrder {
  CreateTimeDesc,
  NameAsc,
  ModifyTimeDesc,
}

export enum SourceType {
  Snapshot,
  Release,
}

export enum CopyEvent {
  ActiveCopy,
  PassiveCopy,
}

export enum ModelErrorCode {
  NameExisted = 10020013,
  ModelNotExisted = 10020011,
}

export enum ShareScriptErrorCode {
  ScriptNotExist = 21010001,
  ScriptGetLockFailed = 21010002,
  ScriptLockedByAnotherMap = 21010003,
  NotCombMap = 21010005,
  ScriptNameRepeat = 21010007,
  ScriptGlobalLockFailed = 21010008,
}

export enum ScriptType {
  Server = 0,
  Client = 1,
}

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
}

export const REQUEST_TIMEOUT = 10 * 1000;

export interface ModelResp {
  animated: boolean;
  createdAt: string;
  creativeMode: CreativeMode;
  fileHash: string;
  modelDescription: string;
  modelFileHash: string;
  modelFileUUID: string;
  modelFileUrl: string;
  modelId: number;
  modelName: string;
  modelPreviewHash: string;
  modelPreviewUUID: string;
  modelPreviewUrl: string;
  modelType: ModelType;
  projectFileHash: string;
  projectFileUUID: string;
  projectFileUrl: string;
  updatedAt: string;
}

export interface Timestamp {
  date?: number;
  day?: number;
  hours?: number;
  minutes?: number;
  month?: number;
  nanos?: number;
  seconds?: number;
  time?: number;
  timezoneOffset?: number;
  year?: number;
}

export interface ModelSnapshotResp {
  createdAt: Timestamp;
  modelFileHash: string;
  modelFileUUID: string;
  modelPreviewHash: string;
  modelPreviewUUID: string;
  projectFileHash: string;
  projectFileUUID: string;
  snapshotId: number;
}

export type ShapEModel = {
  colors: [number, number, number][];
  grid_index: [number, number, number][];
  shape: [number, number, number];
};

export interface CollaborationApplyVO {
  applyId: string;
  avatar: string;
  checked: boolean;
  createdAt: number;
  nickname: string;
  userId: string;
}

export interface CollaborationRoleVO {
  id: string;
  name: string;
  permissions: string[];
}

export interface CollaborationMigrationVO {
  mapId: string;
  members: Array<{
    ban: boolean;
    guest: boolean;
    roles: Array<{ id: string; roleName: string }>;
    userId: string;
  }>;
  privacy: number;
  roles: CollaborationRoleVO[];
}
