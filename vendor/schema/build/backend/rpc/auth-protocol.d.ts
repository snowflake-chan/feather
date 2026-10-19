import { MuRPCClient } from '@box/mudb/rpc/client';
import { MuArray, MuBoolean, MuDate, MuOption, MuSchema, MuStruct, MuUnion, MuUTF8, MuVarint, MuVoid } from '@box/mudb/schema';
import { PlayerSkinHash } from '../../player/player-schema';
import { DB } from '../database-type';
import { MuNullable } from './nullable-schema';
import { UserTag } from './user-protocol';
export declare const UserBaseInfoSchema: MuStruct<{
    id: MuVarint;
    displayname: MuUTF8;
    username: MuUTF8;
    avatarHash: MuUTF8;
}>;
export declare const UserDetailSchema: MuStruct<{
    id: MuVarint;
    displayname: MuUTF8;
    username: MuUTF8;
    avatar_hash: MuUTF8;
    avatar_status: MuSchema<DB.AvatarStatus>;
    gender: MuSchema<DB.Gender>;
    birthday: MuOption<MuNullable<MuDate>>;
    description: MuNullable<MuUTF8>;
    phone: MuNullable<MuUTF8>;
    email: MuNullable<MuUTF8>;
    language: MuNullable<MuUTF8>;
    wearing_skins: MuSchema<PlayerSkinHash>;
    status: MuSchema<DB.UserStatus>;
    auth_info: MuSchema<UserAuthType>;
    permission: MuSchema<DB.UserPermission>;
    password: MuNullable<MuUTF8>;
    isSetPassword: MuOption<MuBoolean>;
    blocklist: MuNullable<MuArray<MuVarint>>;
    first_login: MuNullable<MuBoolean>;
    reputation: MuVarint;
    flags: MuSchema<DB.UserFlags>;
    muted_till: MuOption<MuNullable<MuDate>>;
    banned_till: MuOption<MuNullable<MuDate>>;
    ban_editor: MuBoolean;
    gold: MuVarint;
    tag: MuSchema<UserTag>;
    token: MuNullable<MuUTF8>;
}>;
export type UserDetail = typeof UserDetailSchema.identity;
export declare enum OnlineEntry {
    test = 0,
    website = 1,
    play = 2,
    edit = 3
}
export declare const AuthRPCSchema: {
    name: string;
    api: {
        online: {
            arg: MuStruct<{
                entry: MuSchema<OnlineEntry>;
            }>;
            ret: MuUnion<{
                authorized: MuStruct<{
                    id: MuVarint;
                    displayname: MuUTF8;
                    username: MuUTF8;
                    avatar_hash: MuUTF8;
                    avatar_status: MuSchema<DB.AvatarStatus>;
                    gender: MuSchema<DB.Gender>;
                    birthday: MuOption<MuNullable<MuDate>>;
                    description: MuNullable<MuUTF8>;
                    phone: MuNullable<MuUTF8>;
                    email: MuNullable<MuUTF8>;
                    language: MuNullable<MuUTF8>;
                    wearing_skins: MuSchema<PlayerSkinHash>;
                    status: MuSchema<DB.UserStatus>;
                    auth_info: MuSchema<UserAuthType>;
                    permission: MuSchema<DB.UserPermission>;
                    password: MuNullable<MuUTF8>;
                    isSetPassword: MuOption<MuBoolean>;
                    blocklist: MuNullable<MuArray<MuVarint>>;
                    first_login: MuNullable<MuBoolean>;
                    reputation: MuVarint;
                    flags: MuSchema<DB.UserFlags>;
                    muted_till: MuOption<MuNullable<MuDate>>;
                    banned_till: MuOption<MuNullable<MuDate>>;
                    ban_editor: MuBoolean;
                    gold: MuVarint;
                    tag: MuSchema<UserTag>;
                    token: MuNullable<MuUTF8>;
                }>;
                unauthorized: MuVoid;
            }>;
        };
        offline: {
            arg: MuVoid;
            ret: MuVoid;
        };
    };
};
/** Opaque authentication flags supplied by the local player service. */
export type UserAuthType = number;
export type AuthAPI = MuRPCClient<typeof AuthRPCSchema>;
//# sourceMappingURL=auth-protocol.d.ts.map