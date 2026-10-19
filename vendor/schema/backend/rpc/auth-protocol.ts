import { MuRPCClient } from '@box/mudb/rpc/client';
import {
  MuArray,
  MuBoolean,
  MuDate,
  MuJSON,
  MuOption,
  MuSchema,
  MuStruct,
  MuUnion,
  MuUTF8,
  MuVarint,
  MuVoid,
} from '@box/mudb/schema';
import { PlayerSkinHash } from '../../player/player-schema';
import { DB } from '../database-type';
import { MuNullable } from './nullable-schema';
import { UserTag } from './user-protocol';

export const UserBaseInfoSchema = new MuStruct({
  id: new MuVarint(),
  displayname: new MuUTF8(),
  username: new MuUTF8(),
  avatarHash: new MuUTF8(),
});

export const UserDetailSchema = new MuStruct({
  id: new MuVarint(),
  displayname: new MuUTF8(),
  username: new MuUTF8(),
  avatar_hash: new MuUTF8(),
  avatar_status: <MuSchema<DB.AvatarStatus>>new MuVarint(),
  gender: <MuSchema<DB.Gender>>new MuVarint(),
  birthday: new MuOption(new MuNullable(new MuDate())),
  description: new MuNullable(new MuUTF8()),
  phone: new MuNullable(new MuUTF8()),
  email: new MuNullable(new MuUTF8()),
  language: new MuNullable(new MuUTF8()),
  wearing_skins: <MuSchema<PlayerSkinHash>>new MuJSON(),
  status: <MuSchema<DB.UserStatus>>new MuVarint(),
  auth_info: <MuSchema<UserAuthType>>new MuVarint(),
  permission: <MuSchema<DB.UserPermission>>new MuVarint(),
  password: new MuNullable(new MuUTF8()),
  isSetPassword: new MuOption(new MuBoolean()),
  blocklist: new MuNullable(new MuArray(new MuVarint(), Infinity)),
  first_login: new MuNullable(new MuBoolean()),
  reputation: new MuVarint(),
  flags: <MuSchema<DB.UserFlags>>new MuVarint(),
  muted_till: new MuOption(new MuNullable(new MuDate())),
  banned_till: new MuOption(new MuNullable(new MuDate())),
  ban_editor: new MuBoolean(),
  gold: new MuVarint(),
  tag: <MuSchema<UserTag>>new MuVarint(),
  token: new MuNullable(new MuUTF8()),
});
export type UserDetail = typeof UserDetailSchema.identity;

export enum OnlineEntry {
  test,
  website,
  play,
  edit,
}

export const AuthRPCSchema = {
  name: 'auth-server-rpc',
  api: {
    online: {
      arg: new MuStruct({
        entry: <MuSchema<OnlineEntry>>new MuVarint(),
      }),
      ret: new MuUnion({
        authorized: UserDetailSchema,
        unauthorized: new MuVoid(),
      }),
    },
    offline: {
      arg: new MuVoid(),
      ret: new MuVoid(),
    },
  },
};

/** Opaque authentication flags supplied by the local player service. */
export type UserAuthType = number;

export type AuthAPI = MuRPCClient<typeof AuthRPCSchema>;
