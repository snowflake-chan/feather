"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatEventSchema = exports.ChatLogEventSchema = void 0;
const array_1 = require("@box/mudb/schema/array");
const boolean_1 = require("@box/mudb/schema/boolean");
const int32_1 = require("@box/mudb/schema/int32");
const struct_1 = require("@box/mudb/schema/struct");
const uint8_1 = require("@box/mudb/schema/uint8");
const utf8_1 = require("@box/mudb/schema/utf8");
const chat_schema_1 = require("../chat/chat-schema");
exports.ChatLogEventSchema = new struct_1.MuStruct({
    senderId: new int32_1.MuInt32(-1),
    targetId: new int32_1.MuInt32(-1),
    name: new utf8_1.MuUTF8(),
    msgType: new uint8_1.MuUint8(chat_schema_1.MsgType.txt),
    message: new utf8_1.MuUTF8(),
    private: new boolean_1.MuBoolean(false),
    duration: new int32_1.MuInt32(0),
});
exports.ChatEventSchema = new struct_1.MuStruct({
    chats: new array_1.MuArray(exports.ChatLogEventSchema, Infinity),
});
