import { MuStruct, MuUint32, MuUTF8, MuBoolean, MuASCII, MuSchema, MuFloat64, MuInt32 } from '@box/mudb/schema';
import type { ProjectAction } from '../replica/replica-schema';
export declare enum OPCode {
    /**
     * Send/Receive 推送数据
     * 推送数据
     */
    Dispatch = 0,
    /**
     * Send 心跳
     */
    Heartbeat = 1,
    /**
     * Send 用户登陆
     */
    Login = 2,
    /**
     * Send 用户登出
     */
    Logout = 3,
    /**
     * Send 订阅
     */
    Subscribe = 4,
    /**
     * Send 取消订阅
     */
    Unsubscribe = 5,
    /**
     * Receive 心跳ACK
     */
    Heartbeat_ACK = 6
}
export declare enum Channel {
    /**
     * 平台
     */
    PLATFORM = "PLATFORM",
    /**
     * 聊天-地图-游玩
     */
    CHAT_MAP_PLAY = "CHAT_MAP_PLAY",
    /**
     * 聊天-地图-编辑
     */
    CHAT_MAP_EDIT = "CHAT_MAP_EDIT",
    /**
     * 聊天-世界
     */
    CHAT_WORLD = "CHAT_WORLD",
    /**
     * 聊天-队伍
     */
    CHAT_TEAM = "CHAT_TEAM",
    /**
     * 队伍
     */
    TEAM = "TEAM",
    /**
     * 聊天-临时-游玩
     */
    CHAT_TEMP_PLAY = "CHAT_TEMP_PLAY",
    /**
     * 聊天-临时-编辑
     */
    CHAT_TEMP_EDIT = "CHAT_TEMP_EDIT",
    /**
     * 代码共享
     */
    SCRIPT_SHARE = "SCRIPT",
    /**
     * ENGINE_CUSTOM
     */
    ENGINE_CUSTOM = "ENGINE_CUSTOM"
}
interface BasicData {
    /**
     * 地图ID/teamId/world/serverId
     */
    targetId: string;
}
export interface SubscribeMsg {
    opcode: OPCode.Subscribe | OPCode.Unsubscribe;
    channel: Channel;
    data: BasicData;
}
export interface DispatchMsg {
    opcode: OPCode.Dispatch;
    channel: Channel;
    event: string;
    data: BasicData;
}
export declare enum P2PDataType {
    /**
     * 请求共享的状态
     */
    GROUP_PROJECT_REQUEST = "GROUP_PROJECT_REQUEST",
    /**
     * 发送共享的状态
     */
    GROUP_PROJECT_RESPONSE = "GROUP_PROJECT_RESPONSE"
}
export declare enum BroadcastDataType {
    /**
     * Actions
     */
    ACTION = "ACTION"
}
export interface NormalMsg {
    opcode: OPCode.Heartbeat | OPCode.Login | OPCode.Logout | OPCode.Heartbeat_ACK;
    data?: Object;
}
export type Message = DispatchMsg | SubscribeMsg | NormalMsg;
interface ReceivedDataBasic extends BasicData {
    user: {
        userId: string;
        nickname: string;
        avatar: string;
        avatarFrame: string;
    };
    messageId: string;
    valid: true;
    timestamp: number;
}
interface ReceivedTxtData extends ReceivedDataBasic {
    /**
     * 文本内容本身
     */
    content: string;
}
export type P2PData = {
    type: P2PDataType.GROUP_PROJECT_REQUEST;
} | {
    type: P2PDataType.GROUP_PROJECT_RESPONSE;
    payload: string;
};
/**
 * 广播的数据结构，现在只有Action，后面添加其它类型时候联合类型定义
 */
export interface BroadcastData {
    type: BroadcastDataType.ACTION;
    payload: ProjectAction[];
}
export interface ReceivedChatTxtMsg extends DispatchMsg {
    event: 'CHAT_TXT';
    data: ReceivedTxtData;
}
interface ReceivedStickerData extends ReceivedDataBasic {
    themeId: string;
    stickerId: number;
}
interface ReceivedChatTempData extends BasicData {
    tempChats: Record<string, string[]>;
}
type ScriptData = {
    name: string;
    hash: string;
    lockedMapId: number;
    lockedMapTitle: string;
    share: boolean;
    type: number;
    id: string;
};
export interface ReceivedScriptShareData {
    clientScripts: ScriptData[];
    serverScripts: ScriptData[];
}
export interface ReceivedChatStickerMsg extends DispatchMsg {
    event: 'CHAT_STICKER';
    data: ReceivedStickerData;
}
export interface ReceivedChatTempDataMsg extends DispatchMsg {
    event: 'CHAT_TEMP_DATA';
    data: ReceivedChatTempData;
}
export interface ReceivedScriptShareDataMsg extends Omit<DispatchMsg, 'data'> {
    event: 'SCRIPT_LIST';
    data: ReceivedScriptShareData;
}
export interface ReceivedOnlineConnectionDataMsg extends Omit<DispatchMsg, 'data'> {
    event: 'ONLINE_CONNECTION';
    data: {
        connections: Array<{
            serverId: string;
            engineReady: boolean;
        }>;
    };
}
export interface P2PDataMsg extends DispatchMsg {
    event: 'POINT_TO_POINT';
    data: {
        targetId: string;
        data: P2PData;
    };
}
export interface BroadcastMsg extends Omit<DispatchMsg, 'data'> {
    event: 'BROADCAST';
    data: BroadcastData;
}
export type ReceivedMsg = ReceivedChatTxtMsg | ReceivedChatStickerMsg | ReceivedChatTempDataMsg | ReceivedScriptShareDataMsg | ReceivedOnlineConnectionDataMsg | P2PDataMsg | BroadcastMsg;
export declare const ChatSchema: MuStruct<{
    i18nPrefix: MuSchema<any>;
    i18nSuffix: MuSchema<any>;
    text: MuUTF8;
    clock: MuFloat64;
    duration: MuInt32;
}>;
export declare enum MsgType {
    /**
     * 文本
     */
    txt = 0,
    /**
     * 表情
     */
    sticker = 1
}
/**
 * 如果type为表情包，text的字符串解析出json结构为StickMessage
 */
export type StickMessage = {
    themeId: string;
    stickerId: number;
};
export declare function genStickerText(themeId: string, stickerId: number): string;
export declare const ChatMessageSchema: MuStruct<{
    id: MuUint32;
    private: MuBoolean;
    i18nPrefix: MuASCII;
    text: MuUTF8;
    i18nSuffix: MuASCII;
    msgType: MuSchema<MsgType>;
    /**
     * 是否有效，无效只能本人看到
     */
    valid: MuBoolean;
    duration: MuInt32;
    hideFloat: MuBoolean;
}>;
export declare const GlobalNoticeSchema: MuStruct<{
    title: MuUTF8;
    detail: MuUTF8;
}>;
export type GlobalNotice = typeof GlobalNoticeSchema.identity;
export declare const ChatProtocolSchema: {
    name: string;
    client: {
        log: MuStruct<{
            id: MuUint32;
            private: MuBoolean;
            i18nPrefix: MuASCII;
            text: MuUTF8;
            i18nSuffix: MuASCII;
            msgType: MuSchema<MsgType>;
            /**
             * 是否有效，无效只能本人看到
             */
            valid: MuBoolean;
            duration: MuInt32;
            hideFloat: MuBoolean;
        }>;
        globalNotice: MuStruct<{
            title: MuUTF8;
            detail: MuUTF8;
        }>;
    };
    server: {
        noticeMessage: MuStruct<{
            title: MuUTF8;
            detail: MuUTF8;
        }>;
    };
};
export {};
//# sourceMappingURL=chat-schema.d.ts.map