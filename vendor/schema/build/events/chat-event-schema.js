"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatEventSchema = exports.ChatLogEventSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const chat_schema_1 = require("../chat/chat-schema");
exports.ChatLogEventSchema = new schema_1.MuStruct({
    senderId: new schema_1.MuInt32(-1),
    targetId: new schema_1.MuInt32(-1),
    name: new schema_1.MuUTF8(),
    msgType: new schema_1.MuUint8(chat_schema_1.MsgType.txt),
    message: new schema_1.MuUTF8(),
    private: new schema_1.MuBoolean(false),
    duration: new schema_1.MuInt32(0),
});
exports.ChatEventSchema = new schema_1.MuStruct({
    chats: new schema_1.MuArray(exports.ChatLogEventSchema, Infinity),
});
//# sourceMappingURL=chat-event-schema.js.map