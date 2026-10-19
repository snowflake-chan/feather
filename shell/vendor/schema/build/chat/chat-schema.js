"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatProtocolSchema = exports.GlobalNoticeSchema = exports.ChatMessageSchema = exports.MsgType = exports.ChatSchema = exports.BroadcastDataType = exports.P2PDataType = exports.Channel = exports.OPCode = void 0;
exports.genStickerText = genStickerText;
const ascii_1 = require("@box/mudb/schema/ascii");
const boolean_1 = require("@box/mudb/schema/boolean");
const float64_1 = require("@box/mudb/schema/float64");
const int32_1 = require("@box/mudb/schema/int32");
const struct_1 = require("@box/mudb/schema/struct");
const uint32_1 = require("@box/mudb/schema/uint32");
const uint8_1 = require("@box/mudb/schema/uint8");
const utf8_1 = require("@box/mudb/schema/utf8");
var OPCode;
(function (OPCode) {
    /**
     * Send/Receive 推送数据
     * 推送数据
     */
    OPCode[OPCode["Dispatch"] = 0] = "Dispatch";
    /**
     * Send 心跳
     */
    OPCode[OPCode["Heartbeat"] = 1] = "Heartbeat";
    /**
     * Send 用户登陆
     */
    OPCode[OPCode["Login"] = 2] = "Login";
    /**
     * Send 用户登出
     */
    OPCode[OPCode["Logout"] = 3] = "Logout";
    /**
     * Send 订阅
     */
    OPCode[OPCode["Subscribe"] = 4] = "Subscribe";
    /**
     * Send 取消订阅
     */
    OPCode[OPCode["Unsubscribe"] = 5] = "Unsubscribe";
    /**
     * Receive 心跳ACK
     */
    OPCode[OPCode["Heartbeat_ACK"] = 6] = "Heartbeat_ACK";
})(OPCode || (exports.OPCode = OPCode = {}));
var Channel;
(function (Channel) {
    /**
     * 平台
     */
    Channel["PLATFORM"] = "PLATFORM";
    /**
     * 聊天-地图-游玩
     */
    Channel["CHAT_MAP_PLAY"] = "CHAT_MAP_PLAY";
    /**
     * 聊天-地图-编辑
     */
    Channel["CHAT_MAP_EDIT"] = "CHAT_MAP_EDIT";
    /**
     * 聊天-世界
     */
    Channel["CHAT_WORLD"] = "CHAT_WORLD";
    /**
     * 聊天-队伍
     */
    Channel["CHAT_TEAM"] = "CHAT_TEAM";
    /**
     * 队伍
     */
    Channel["TEAM"] = "TEAM";
    /**
     * 聊天-临时-游玩
     */
    Channel["CHAT_TEMP_PLAY"] = "CHAT_TEMP_PLAY";
    /**
     * 聊天-临时-编辑
     */
    Channel["CHAT_TEMP_EDIT"] = "CHAT_TEMP_EDIT";
    /**
     * 代码共享
     */
    Channel["SCRIPT_SHARE"] = "SCRIPT";
    /**
     * ENGINE_CUSTOM
     */
    Channel["ENGINE_CUSTOM"] = "ENGINE_CUSTOM";
})(Channel || (exports.Channel = Channel = {}));
var P2PDataType;
(function (P2PDataType) {
    /**
     * 请求共享的状态
     */
    P2PDataType["GROUP_PROJECT_REQUEST"] = "GROUP_PROJECT_REQUEST";
    /**
     * 发送共享的状态
     */
    P2PDataType["GROUP_PROJECT_RESPONSE"] = "GROUP_PROJECT_RESPONSE";
})(P2PDataType || (exports.P2PDataType = P2PDataType = {}));
var BroadcastDataType;
(function (BroadcastDataType) {
    /**
     * Actions
     */
    BroadcastDataType["ACTION"] = "ACTION";
})(BroadcastDataType || (exports.BroadcastDataType = BroadcastDataType = {}));
exports.ChatSchema = new struct_1.MuStruct({
    i18nPrefix: new ascii_1.MuASCII(),
    i18nSuffix: new ascii_1.MuASCII(),
    text: new utf8_1.MuUTF8(),
    clock: new float64_1.MuFloat64(),
    duration: new int32_1.MuInt32(0),
});
var MsgType;
(function (MsgType) {
    /**
     * 文本
     */
    MsgType[MsgType["txt"] = 0] = "txt";
    /**
     * 表情
     */
    MsgType[MsgType["sticker"] = 1] = "sticker";
})(MsgType || (exports.MsgType = MsgType = {}));
function genStickerText(themeId, stickerId) {
    return `{"themeId":"${themeId}","stickerId":${stickerId}}`;
}
exports.ChatMessageSchema = new struct_1.MuStruct({
    id: new uint32_1.MuUint32(),
    private: new boolean_1.MuBoolean(false),
    i18nPrefix: new ascii_1.MuASCII(),
    text: new utf8_1.MuUTF8(),
    i18nSuffix: new ascii_1.MuASCII(),
    msgType: new uint8_1.MuUint8(MsgType.txt),
    /**
     * 是否有效，无效只能本人看到
     */
    valid: new boolean_1.MuBoolean(true),
    duration: new int32_1.MuInt32(0),
    hideFloat: new boolean_1.MuBoolean(false),
});
exports.GlobalNoticeSchema = new struct_1.MuStruct({
    title: new utf8_1.MuUTF8(),
    detail: new utf8_1.MuUTF8(),
});
exports.ChatProtocolSchema = {
    name: 'game-chat',
    client: {
        // server返回的log，包含社交聊天+系统消息+npc说话，就是所有关于聊天的一切
        log: exports.ChatMessageSchema,
        // 跟对话和消息没关系，纯编辑模式下发全局通知的🙄，查到只有版本控制恢复的时候有这个通知，然鹅版本控制整个功能都没了目前
        globalNotice: exports.GlobalNoticeSchema,
    },
    server: {
        // 跟对话和消息没关系，纯编辑模式下发全局通知的🙄，查到只有版本控制恢复的时候有这个通知，然鹅版本控制整个功能都没了目前
        noticeMessage: exports.GlobalNoticeSchema,
    },
};
