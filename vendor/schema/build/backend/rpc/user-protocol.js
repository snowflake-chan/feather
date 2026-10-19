"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventChoseStatus = exports.UserRPCSchema = exports.UploadScene = exports.AVATARSIZE = exports.MAX_RETRY_RESET = exports.MAX_BLOCK_LIMIT = exports.UserFollowSchema = exports.UserSchema = exports.IllegalTab = exports.UserTag = void 0;
const array_1 = require("@box/mudb/schema/array");
const boolean_1 = require("@box/mudb/schema/boolean");
const date_1 = require("@box/mudb/schema/date");
const json_1 = require("@box/mudb/schema/json");
const option_1 = require("@box/mudb/schema/option");
const struct_1 = require("@box/mudb/schema/struct");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
const nullable_schema_1 = require("./nullable-schema");
var UserTag;
(function (UserTag) {
    UserTag[UserTag["normal"] = 0] = "normal";
    UserTag[UserTag["official"] = 1] = "official";
})(UserTag || (exports.UserTag = UserTag = {}));
var IllegalTab;
(function (IllegalTab) {
    IllegalTab[IllegalTab["displayname"] = 0] = "displayname";
    IllegalTab[IllegalTab["description"] = 1] = "description";
})(IllegalTab || (exports.IllegalTab = IllegalTab = {}));
exports.UserSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    cmid: new varint_1.MuVarint(),
    displayname: new utf8_1.MuUTF8(),
    wearing_skins: new json_1.MuJSON(),
    permission: new varint_1.MuVarint(),
    birthday: new option_1.MuOption(new nullable_schema_1.MuNullable(new date_1.MuDate())),
    avatar: new utf8_1.MuUTF8(),
    avatar_hash: new utf8_1.MuUTF8(),
    avatar_status: new varint_1.MuVarint(),
    status: new varint_1.MuVarint(),
    gender: new varint_1.MuVarint(),
    username: new utf8_1.MuUTF8(),
    description: new utf8_1.MuUTF8(),
    reputation: new varint_1.MuVarint(),
    flags: new varint_1.MuVarint(),
    tag: new varint_1.MuVarint(),
});
exports.UserFollowSchema = new struct_1.MuStruct(Object.assign(Object.assign({}, exports.UserSchema.muData), { is_following: new boolean_1.MuBoolean() }));
exports.MAX_BLOCK_LIMIT = 50;
exports.MAX_RETRY_RESET = 10;
exports.AVATARSIZE = 512;
var UploadScene;
(function (UploadScene) {
    UploadScene[UploadScene["avatarUpdate"] = 0] = "avatarUpdate";
    UploadScene[UploadScene["contentThumbnailUpload"] = 1] = "contentThumbnailUpload";
    UploadScene[UploadScene["musicEditorSourceUpload"] = 2] = "musicEditorSourceUpload";
    UploadScene[UploadScene["musicEditorPublish"] = 3] = "musicEditorPublish";
    UploadScene[UploadScene["eventPublish"] = 4] = "eventPublish";
})(UploadScene || (exports.UploadScene = UploadScene = {}));
exports.UserRPCSchema = {
    name: 'user-server-rpc',
    api: {
        get: {
            arg: new struct_1.MuStruct({
                condition: new utf8_1.MuUTF8(),
                value: new utf8_1.MuUTF8(),
                publishedContentsCount: new boolean_1.MuBoolean(),
            }),
            ret: new struct_1.MuStruct(Object.assign(Object.assign({}, exports.UserSchema.muData), { is_following: new boolean_1.MuBoolean(), follower_count: new varint_1.MuVarint(), following_count: new varint_1.MuVarint(), published_map_count: new varint_1.MuVarint(), published_model_count: new varint_1.MuVarint(), published_music_count: new varint_1.MuVarint() })),
        },
        getList: {
            arg: new struct_1.MuStruct({
                condition: new utf8_1.MuUTF8(),
                values: new array_1.MuArray(new utf8_1.MuUTF8(), Infinity),
                limit: new varint_1.MuVarint(),
                offset: new varint_1.MuVarint(0),
            }),
            ret: new array_1.MuArray(exports.UserSchema, Infinity),
        },
    },
};
// the event of 2021/06/01, give user new skins
var EventChoseStatus;
(function (EventChoseStatus) {
    EventChoseStatus[EventChoseStatus["none"] = 0] = "none";
    EventChoseStatus[EventChoseStatus["codeWriter"] = 1] = "codeWriter";
    EventChoseStatus[EventChoseStatus["modeler"] = 2] = "modeler";
    EventChoseStatus[EventChoseStatus["architect"] = 3] = "architect";
    EventChoseStatus[EventChoseStatus["audioMaker"] = 4] = "audioMaker";
})(EventChoseStatus || (exports.EventChoseStatus = EventChoseStatus = {}));
