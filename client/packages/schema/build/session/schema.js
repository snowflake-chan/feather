"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSessionDataSchema = exports.UserDetailSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const player_schema_1 = require("../player/player-schema");
const math_schema_1 = require("../utils/math-schema");
const nullable_schema_1 = require("../backend/rpc/nullable-schema");
const permission_rda_1 = require("../permissions/permission-rda");
exports.UserDetailSchema = new schema_1.MuStruct({
    id: permission_rda_1.UserIdSchema,
    displayname: new schema_1.MuUTF8(),
    username: new schema_1.MuUTF8(),
    // Stable save identity override configured by the server owner.
    userKey: new schema_1.MuASCII(''),
    // 也支持 URL
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
exports.GameSessionDataSchema = new schema_1.MuStruct({
    sessionId: new schema_1.MuUTF8(''),
    ipAddress: new schema_1.MuASCII(''),
    url: new schema_1.MuASCII(''),
    fingerPrint: new schema_1.MuASCII(''),
    deviceHash: new schema_1.MuASCII(''),
    user: exports.UserDetailSchema,
    isAdmin: new schema_1.MuBoolean(),
    name: new schema_1.MuUTF8(''),
    tag: new schema_1.MuVarint(0),
    position: math_schema_1.Vec3Schema,
    avatarSkin: player_schema_1.PlayerSkinHashSchema,
    blocklist: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    region: new schema_1.MuUTF8('CN'),
});
//# sourceMappingURL=schema.js.map