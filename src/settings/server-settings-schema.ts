import {
  MuStruct,
  MuVarint,
  MuFloat64,
  MuUTF8,
  MuBoolean,
  MuASCII,
  MuSchema,
} from '@box/mudb/schema';

/**
 * 容器类型
 */
export enum ContainerType {
  /**
   * 正常容器
   */
  Public = 'public',
  /**
   * 通过传送建立的容器
   */
  Teleport = 'teleport',
  /**
   * 通过组队建立的容器
   * 即私服
   */
  Private = 'private',
}

export const ServerSettingsSchema = new MuStruct({
  // script limits
  scriptHeapSizeMB: new MuFloat64(256),
  scriptTimeout: new MuFloat64(10 * 1000),

  playerLimit: new MuVarint(100),

  groupId: new MuVarint(),
  containerName: new MuUTF8(),
  /**
   * 容器类型
   * 正常/传送/私服
   */
  containerType: <MuSchema<ContainerType>>new MuASCII(ContainerType.Public),
  /**
   * 通过组队功能创建的队伍ID
   * 容器为私服的时候有这个
   */
  teamId: new MuASCII(),
  contentId: new MuVarint(),
  serverId: new MuUTF8(),
  gameURL: new MuASCII(),
  mode: new MuASCII(),
  env: new MuUTF8(),
  autoSaveInterval: new MuFloat64(5 * 60 * 1000),
  zeroPlayerTimeout: new MuFloat64(10 * 60 * 1000),

  sqlLiteHeapQuota: new MuFloat64(128 * 1024 * 1024),
  dbSizeLimit: new MuFloat64(128 * 1024 * 1024),
  dbChunkSize: new MuVarint(1024),

  permissionTokenSecret: new MuUTF8(),

  debug: new MuBoolean(false),

  teleportAccess: new MuBoolean(false),
  paidAccess: new MuBoolean(false),
});

export type ServerSettings = typeof ServerSettingsSchema.identity;
