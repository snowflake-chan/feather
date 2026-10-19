"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRPCSchema = exports.OnlineEntry = exports.UserDetailSchema = exports.UserBaseInfoSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const nullable_schema_1 = require("./nullable-schema");
exports.UserBaseInfoSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    displayname: new schema_1.MuUTF8(),
    username: new schema_1.MuUTF8(),
    avatarHash: new schema_1.MuUTF8(),
});
exports.UserDetailSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    displayname: new schema_1.MuUTF8(),
    username: new schema_1.MuUTF8(),
    avatar_hash: new schema_1.MuUTF8(),
    avatar_status: new schema_1.MuVarint(),
    gender: new schema_1.MuVarint(),
    birthday: new schema_1.MuOption(new nullable_schema_1.MuNullable(new schema_1.MuDate())),
    description: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()),
    phone: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()),
    email: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()),
    language: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()),
    wearing_skins: new schema_1.MuJSON(),
    status: new schema_1.MuVarint(),
    auth_info: new schema_1.MuVarint(),
    permission: new schema_1.MuVarint(),
    password: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()),
    isSetPassword: new schema_1.MuOption(new schema_1.MuBoolean()),
    blocklist: new nullable_schema_1.MuNullable(new schema_1.MuArray(new schema_1.MuVarint(), Infinity)),
    first_login: new nullable_schema_1.MuNullable(new schema_1.MuBoolean()),
    reputation: new schema_1.MuVarint(),
    flags: new schema_1.MuVarint(),
    muted_till: new schema_1.MuOption(new nullable_schema_1.MuNullable(new schema_1.MuDate())),
    banned_till: new schema_1.MuOption(new nullable_schema_1.MuNullable(new schema_1.MuDate())),
    ban_editor: new schema_1.MuBoolean(),
    gold: new schema_1.MuVarint(),
    tag: new schema_1.MuVarint(),
    token: new nullable_schema_1.MuNullable(new schema_1.MuUTF8()),
});
var OnlineEntry;
(function (OnlineEntry) {
    OnlineEntry[OnlineEntry["test"] = 0] = "test";
    OnlineEntry[OnlineEntry["website"] = 1] = "website";
    OnlineEntry[OnlineEntry["play"] = 2] = "play";
    OnlineEntry[OnlineEntry["edit"] = 3] = "edit";
})(OnlineEntry || (exports.OnlineEntry = OnlineEntry = {}));
exports.AuthRPCSchema = {
    name: 'auth-server-rpc',
    api: {
        online: {
            arg: new schema_1.MuStruct({
                entry: new schema_1.MuVarint(),
            }),
            ret: new schema_1.MuUnion({
                authorized: exports.UserDetailSchema,
                unauthorized: new schema_1.MuVoid(),
            }),
        },
        offline: {
            arg: new schema_1.MuVoid(),
            ret: new schema_1.MuVoid(),
        },
    },
};
//# sourceMappingURL=auth-protocol.js.map