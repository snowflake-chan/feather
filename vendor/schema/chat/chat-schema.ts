import {
  MuStruct,
  MuUint32,
  MuUTF8,
  MuBoolean,
  MuASCII,
  MuSchema,
  MuFloat64,
  MuUint8,
  MuInt32,
} from '@box/mudb/schema';
import type { ProjectAction } from '../replica/replica-schema';
import type { GroupProjectStore } from '../group-project/rda';

export enum OPCode {
  /**
   * Send/Receive 推送数据
   * 推送数据
   */
  Dispatch = 0,
  /**
   * Send 心跳
   */
  Heartbeat,
  /**
   * Send 用户登陆
   */
  Login,
  /**
   * Send 用户登出
   */
  Logout,
  /**
   * Send 订阅
   */
  Subscribe,
  /**
   * Send 取消订阅
   */
  Unsubscribe,
  /**
   * Receive 心跳ACK
   */
  Heartbeat_ACK,
}

export enum Channel {
  /**
   * 平台
   */
  PLATFORM = 'PLATFORM',
  /**
   * 聊天-地图-游玩
   */
  CHAT_MAP_PLAY = 'CHAT_MAP_PLAY',
  /**
   * 聊天-地图-编辑
   */
  CHAT_MAP_EDIT = 'CHAT_MAP_EDIT',
  /**
   * 聊天-世界
   */
  CHAT_WORLD = 'CHAT_WORLD',
  /**
   * 聊天-队伍
   */
  CHAT_TEAM = 'CHAT_TEAM',
  /**
   * 队伍
   */
  TEAM = 'TEAM',
  /**
   * 聊天-临时-游玩
   */
  CHAT_TEMP_PLAY = 'CHAT_TEMP_PLAY',
  /**
   * 聊天-临时-编辑
   */
  CHAT_TEMP_EDIT = 'CHAT_TEMP_EDIT',
  /**
   * 代码共享
   */
  SCRIPT_SHARE = 'SCRIPT',
  /**
   * ENGINE_CUSTOM
   */
  ENGINE_CUSTOM = 'ENGINE_CUSTOM',
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

export enum P2PDataType {
  /**
   * 请求共享的状态
   */
  GROUP_PROJECT_REQUEST = 'GROUP_PROJECT_REQUEST',
  /**
   * 发送共享的状态
   */
  GROUP_PROJECT_RESPONSE = 'GROUP_PROJECT_RESPONSE',
}

export enum BroadcastDataType {
  /**
   * Actions
   */
  ACTION = 'ACTION',
}

export interface NormalMsg {
  opcode:
    | OPCode.Heartbeat
    | OPCode.Login
    | OPCode.Logout
    | OPCode.Heartbeat_ACK;
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

export type P2PData =
  | {
      type: P2PDataType.GROUP_PROJECT_REQUEST;
    }
  | {
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

export interface ReceivedOnlineConnectionDataMsg
  extends Omit<DispatchMsg, 'data'> {
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

export type ReceivedMsg =
  | ReceivedChatTxtMsg
  | ReceivedChatStickerMsg
  | ReceivedChatTempDataMsg
  | ReceivedScriptShareDataMsg
  | ReceivedOnlineConnectionDataMsg
  | P2PDataMsg
  | BroadcastMsg;

export const ChatSchema = new MuStruct({
  i18nPrefix: <MuSchema<any>>new MuASCII(),
  i18nSuffix: <MuSchema<any>>new MuASCII(),
  text: new MuUTF8(),
  clock: new MuFloat64(),
  duration: new MuInt32(0),
});

export enum MsgType {
  /**
   * 文本
   */
  txt,
  /**
   * 表情
   */
  sticker,
}

/**
 * 如果type为表情包，text的字符串解析出json结构为StickMessage
 */
export type StickMessage = {
  themeId: string;
  stickerId: number;
};

export function genStickerText(themeId: string, stickerId: number) {
  return `{"themeId":"${themeId}","stickerId":${stickerId}}`;
}

export const ChatMessageSchema = new MuStruct({
  id: new MuUint32(),
  private: new MuBoolean(false),
  i18nPrefix: new MuASCII(),
  text: new MuUTF8(),
  i18nSuffix: new MuASCII(),
  msgType: <MuSchema<MsgType>>new MuUint8(MsgType.txt),
  /**
   * 是否有效，无效只能本人看到
   */
  valid: new MuBoolean(true),
  duration: new MuInt32(0),
  hideFloat: new MuBoolean(false),
});

export const GlobalNoticeSchema = new MuStruct({
  title: new MuUTF8(),
  detail: new MuUTF8(),
});

export type GlobalNotice = typeof GlobalNoticeSchema.identity;

export const ChatProtocolSchema = {
  name: 'game-chat',
  client: {
    // server返回的log，包含社交聊天+系统消息+npc说话，就是所有关于聊天的一切
    log: ChatMessageSchema,
    // 跟对话和消息没关系，纯编辑模式下发全局通知的🙄，查到只有版本控制恢复的时候有这个通知，然鹅版本控制整个功能都没了目前
    globalNotice: GlobalNoticeSchema,
  },
  server: {
    // 跟对话和消息没关系，纯编辑模式下发全局通知的🙄，查到只有版本控制恢复的时候有这个通知，然鹅版本控制整个功能都没了目前
    noticeMessage: GlobalNoticeSchema,
  },
};
