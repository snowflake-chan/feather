import { MuRPCClient } from '@box/mudb/rpc/client';
import { MuUTF8, MuStruct, MuVarint, MuArray, MuJSON, MuSchema, MuBoolean, MuDate, MuOption } from '@box/mudb/schema';
import { DB } from '../database-type';
import { MuNullable } from './nullable-schema';
export declare enum UserTag {
    normal = 0,
    official = 1
}
export declare enum IllegalTab {
    displayname = 0,
    description = 1
}
export declare const UserSchema: MuStruct<{
    id: MuVarint;
    cmid: MuVarint;
    displayname: MuUTF8;
    wearing_skins: MuJSON;
    permission: MuSchema<DB.UserPermission>;
    birthday: MuOption<MuNullable<MuDate>>;
    avatar: MuUTF8;
    avatar_hash: MuUTF8;
    avatar_status: MuSchema<DB.AvatarStatus>;
    status: MuSchema<DB.UserStatus>;
    gender: MuVarint;
    username: MuUTF8;
    description: MuUTF8;
    reputation: MuVarint;
    flags: MuSchema<DB.UserFlags>;
    tag: MuSchema<UserTag>;
}>;
export declare const UserFollowSchema: MuStruct<{
    is_following: MuBoolean;
    id: MuVarint;
    cmid: MuVarint;
    displayname: MuUTF8;
    wearing_skins: MuJSON;
    permission: MuSchema<DB.UserPermission>;
    birthday: MuOption<MuNullable<MuDate>>;
    avatar: MuUTF8;
    avatar_hash: MuUTF8;
    avatar_status: MuSchema<DB.AvatarStatus>;
    status: MuSchema<DB.UserStatus>;
    gender: MuVarint;
    username: MuUTF8;
    description: MuUTF8;
    reputation: MuVarint;
    flags: MuSchema<DB.UserFlags>;
    tag: MuSchema<UserTag>;
}>;
export type User = typeof UserSchema.identity;
export type UserInfoType = 'username' | 'displayname' | 'description' | 'gender' | 'birthday' | 'avatar';
export type GetUserCondition = 'id' | 'username' | 'displayname' | 'cmid';
export declare const MAX_BLOCK_LIMIT = 50;
export declare const MAX_RETRY_RESET = 10;
export declare const AVATARSIZE = 512;
export declare enum UploadScene {
    avatarUpdate = 0,
    contentThumbnailUpload = 1,
    musicEditorSourceUpload = 2,
    musicEditorPublish = 3,
    eventPublish = 4
}
export declare const UserRPCSchema: {
    name: string;
    api: {
        get: {
            arg: MuStruct<{
                condition: MuSchema<GetUserCondition>;
                value: MuUTF8;
                publishedContentsCount: MuBoolean;
            }>;
            ret: MuStruct<{
                is_following: MuBoolean;
                follower_count: MuVarint;
                following_count: MuVarint;
                published_map_count: MuVarint;
                published_model_count: MuVarint;
                published_music_count: MuVarint;
                id: MuVarint;
                cmid: MuVarint;
                displayname: MuUTF8;
                wearing_skins: MuJSON;
                permission: MuSchema<DB.UserPermission>;
                birthday: MuOption<MuNullable<MuDate>>;
                avatar: MuUTF8;
                avatar_hash: MuUTF8;
                avatar_status: MuSchema<DB.AvatarStatus>;
                status: MuSchema<DB.UserStatus>;
                gender: MuVarint;
                username: MuUTF8;
                description: MuUTF8;
                reputation: MuVarint;
                flags: MuSchema<DB.UserFlags>;
                tag: MuSchema<UserTag>;
            }>;
        };
        getList: {
            arg: MuStruct<{
                condition: MuSchema<GetUserCondition>;
                values: MuArray<MuUTF8>;
                limit: MuVarint;
                offset: MuVarint;
            }>;
            ret: MuArray<MuStruct<{
                id: MuVarint;
                cmid: MuVarint;
                displayname: MuUTF8;
                wearing_skins: MuJSON;
                permission: MuSchema<DB.UserPermission>;
                birthday: MuOption<MuNullable<MuDate>>;
                avatar: MuUTF8;
                avatar_hash: MuUTF8;
                avatar_status: MuSchema<DB.AvatarStatus>;
                status: MuSchema<DB.UserStatus>;
                gender: MuVarint;
                username: MuUTF8;
                description: MuUTF8;
                reputation: MuVarint;
                flags: MuSchema<DB.UserFlags>;
                tag: MuSchema<UserTag>;
            }>>;
        };
    };
};
export declare enum EventChoseStatus {
    none = 0,
    codeWriter = 1,
    modeler = 2,
    architect = 3,
    audioMaker = 4
}
export type UserAPI = MuRPCClient<typeof UserRPCSchema>;
//# sourceMappingURL=user-protocol.d.ts.map