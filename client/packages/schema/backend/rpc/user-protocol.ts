import { MuRPCClient } from '@box/mudb/rpc/client';
import {
  MuUTF8,
  MuVoid,
  MuStruct,
  MuVarint,
  MuArray,
  MuJSON,
  MuSchema,
  MuBoolean,
  MuDate,
  MuUnion,
  MuOption,
} from '@box/mudb/schema';
import { DB } from '../database-type';
import { MuNullable } from './nullable-schema';

export enum UserTag {
  normal,
  official,
}

export enum IllegalTab {
  displayname,
  description,
}

export const UserSchema = new MuStruct({
  id: new MuVarint(),
  cmid: new MuVarint(),
  displayname: new MuUTF8(),
  wearing_skins: new MuJSON(),
  permission: <MuSchema<DB.UserPermission>>new MuVarint(),
  birthday: new MuOption(new MuNullable(new MuDate())),
  avatar: new MuUTF8(),
  avatar_hash: new MuUTF8(),
  avatar_status: <MuSchema<DB.AvatarStatus>>new MuVarint(),
  status: <MuSchema<DB.UserStatus>>new MuVarint(),
  gender: new MuVarint(),
  username: new MuUTF8(),
  description: new MuUTF8(),

  reputation: new MuVarint(),
  flags: <MuSchema<DB.UserFlags>>new MuVarint(),

  tag: <MuSchema<UserTag>>new MuVarint(),
});

export const UserFollowSchema = new MuStruct({
  ...UserSchema.muData,
  is_following: new MuBoolean(),
});

export type User = typeof UserSchema.identity;

export type UserInfoType =
  | 'username'
  | 'displayname'
  | 'description'
  | 'gender'
  | 'birthday'
  | 'avatar';
export type GetUserCondition = 'id' | 'username' | 'displayname' | 'cmid';

export const MAX_BLOCK_LIMIT = 50;
export const MAX_RETRY_RESET = 10;
export const AVATARSIZE = 512;

export enum UploadScene {
  avatarUpdate,
  contentThumbnailUpload,
  musicEditorSourceUpload,
  musicEditorPublish,
  eventPublish,
}

export const UserRPCSchema = {
  name: 'user-server-rpc',
  api: {
    get: {
      arg: new MuStruct({
        condition: <MuSchema<GetUserCondition>>new MuUTF8(),
        value: new MuUTF8(),
        publishedContentsCount: new MuBoolean(),
      }),
      ret: new MuStruct({
        ...UserSchema.muData,
        is_following: new MuBoolean(),
        follower_count: new MuVarint(),
        following_count: new MuVarint(),
        published_map_count: new MuVarint(),
        published_model_count: new MuVarint(),
        published_music_count: new MuVarint(),
      }),
    },
    getList: {
      arg: new MuStruct({
        condition: <MuSchema<GetUserCondition>>new MuUTF8(),
        values: new MuArray(new MuUTF8(), Infinity),
        limit: new MuVarint(),
        offset: new MuVarint(0),
      }),
      ret: new MuArray(UserSchema, Infinity),
    },
  },
};

// the event of 2021/06/01, give user new skins
export enum EventChoseStatus {
  none = 0,
  codeWriter = 1,
  modeler = 2,
  architect = 3,
  audioMaker = 4,
}

export type UserAPI = MuRPCClient<typeof UserRPCSchema>;
