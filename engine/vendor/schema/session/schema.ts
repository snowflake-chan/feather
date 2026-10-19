import {
  MuUTF8,
  MuStruct,
  MuVarint,
  MuJSON,
  MuBoolean,
  MuSchema,
  MuArray,
  MuDate,
  MuOption,
  MuASCII,
} from '@box/mudb/schema';
import { PlayerSkinHashSchema, PlayerSkinHash } from '../player/player-schema';
import { Vec3Schema } from '../utils/math-schema';
import { MuNullable } from '../backend/rpc/nullable-schema';
import { UserAuthType } from '../backend/rpc/auth-protocol';
import { UserTag } from '../backend/rpc/user-protocol';
import { DB } from '../backend/database-type';
import { UserIdSchema } from '../permissions/permission-rda';

export const UserDetailSchema = new MuStruct({
  id: UserIdSchema,
  displayname: new MuUTF8(),
  username: new MuUTF8(),
  // Stable save identity override configured by the server owner.
  userKey: new MuASCII(''),
  // 也支持 URL
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

export const GameSessionDataSchema = new MuStruct({
  sessionId: new MuUTF8(''),
  ipAddress: new MuASCII(''),
  url: new MuASCII(''),
  fingerPrint: new MuASCII(''),
  deviceHash: new MuASCII(''),
  user: UserDetailSchema,
  isAdmin: new MuBoolean(),
  name: new MuUTF8(''),
  tag: new MuVarint(0),
  position: Vec3Schema,
  avatarSkin: PlayerSkinHashSchema,
  blocklist: new MuArray(new MuVarint(), Infinity),
  region: new MuUTF8('CN'),
});
export type GameSessionData = typeof GameSessionDataSchema.identity;
