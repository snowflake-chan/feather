import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { GameConnectionState, GameServerState } from '../game-server-schema';
import {
  ChatProtocolSchema,
  ChatMessageSchema,
  MsgType,
  OPCode,
  Channel,
  ReceivedMsg,
  Message,
  genStickerText,
  ReceivedChatTxtMsg,
  ReceivedChatStickerMsg,
} from '@box/schema/chat/chat-schema';
import { getById } from '@box/utils/id';
import { ChatLogEventSchema } from '@box/schema/events/chat-event-schema';
import { Logger } from '@box/utils/logger';
import { ContainerType } from '../settings/server-settings-schema';
import { ServerPlayer } from '../player/player-server-schema';
import { BackendSocket } from '../../backendSocket';

export class ChatServer {
  private _state: GameServerState;
  private _webSocket: BackendSocket;
  private _protocol: MuServerProtocol<typeof ChatProtocolSchema>;

  private _logger: Logger;

  private _getPlayer(userId: string) {
    // userId为空表示游客，直接返回
    if (!userId) {
      return;
    }
    return this._state.serverPlayers.find((p) => p.userId === userId);
  }

  private _chatLog(id: number, message: string) {
    const conn = getById(this._state.connectionSet, id);
    let sessionId = '';
    let cmid = '';
    let name = 'anon';
    let ip = '???';
    let username = '';
    if (conn) {
      sessionId = conn.sessionId;
      name = conn.sessionData.name;
      ip = conn.sessionData.ipAddress;
      cmid = conn.sessionData.user.id;
      username = conn.sessionData.user.username;
    }
    const msg = `"${name}"(${username}:${cmid})#${id}/${sessionId}/${ip} : ${message}`;
    this._logger.log(msg);
  }

  public systemBroadcast(
    i18nPrefix: string,
    text: string = '',
    i18nSuffix: string = '',
    valid: boolean = true,
  ) {
    this._protocol.broadcast.log({
      id: 0,
      private: false,
      i18nPrefix,
      text,
      i18nSuffix,
      msgType: MsgType.txt,
      valid,
      duration: 0,
      hideFloat: false,
    });
  }

  constructor(spec: {
    server: MuServer;
    state: GameServerState;
    webSocket: BackendSocket;
  }) {
    this._state = spec.state;
    this._logger = spec.state.logger.create('chat');
    this._webSocket = spec.webSocket;
    this._logger.prefix = ['chat'];
    this._protocol = spec.server.protocol(ChatProtocolSchema);
    this._protocol.configure({
      message: {
        noticeMessage: (client, { title, detail }) => {
          const connection = this._state.connections[client.sessionId];
          if (!connection || connection.state !== GameConnectionState.CONNECTED || !connection.sessionData.isAdmin) return;
          this._logger.log(`global notice: title:${title} detail:${detail}`);
          this._protocol.broadcast.globalNotice({ title, detail });
        },
      },
    });
    this.subscribeChatSocket();
  }

  private subscribeChatSocket() {
    // 订阅聊天频道
    this.generateSubscribeMsg().forEach((message) => {
      this._webSocket.subscribe(JSON.stringify(message));
    });

    // 处理聊天消息
    this._webSocket.onMessage((data) => {
      const message: ReceivedMsg = JSON.parse(data);
      // 处理全量临时聊天数据
      if (
        message.opcode === OPCode.Dispatch &&
        message.event === 'CHAT_TEMP_DATA'
      ) {
        const { tempChats } = message.data;
        this._state.chat.tempChats = tempChats;
        return;
      }
      // 接收的消息非server需要订阅的类型直接返回
      if (
        message.opcode !== OPCode.Dispatch ||
        (message.event !== 'CHAT_TXT' && message.event !== 'CHAT_STICKER')
      ) {
        return;
      }

      switch (message.channel) {
        case Channel.CHAT_MAP_PLAY:
        case Channel.CHAT_MAP_EDIT:
        case Channel.CHAT_WORLD:
        case Channel.CHAT_TEAM:
          this.dealMessage(message, 'normal');
          break;
        case Channel.CHAT_TEMP_EDIT:
        case Channel.CHAT_TEMP_PLAY:
          this.dealMessage(message, 'temp');
          break;
        default:
          this._logger.warn('WARN: message.channel is invalid');
      }
    });
  }

  /**
   * 处理搜到websocket聊天消息
   * @param message
   * @param type temp: 临时聊天频道消息；normal：普通了聊天消息
   * @private
   */
  private dealMessage(
    message: ReceivedChatTxtMsg | ReceivedChatStickerMsg,
    type: 'temp' | 'normal',
  ) {
    const player = this._getPlayer(message.data.user.userId);
    if (!player) {
      this._logger.info(
        `BLOCKED: (chat cannot find player): ${message.data.user.userId}`,
      );
      return;
    }

    const chatMsg =
      message.event === 'CHAT_TXT'
        ? message.data.content
        : genStickerText(message.data.themeId, message.data.stickerId);

    const msgType =
      message.event === 'CHAT_TXT' ? MsgType.txt : MsgType.sticker;
    this._chatLog(player.id, chatMsg);
    if (type === 'normal') {
      this.broadcast({
        message: chatMsg,
        senderId: player.id,
        pushEvent: true,
        valid: message.data.valid,
        msgType,
      });
    } else {
      const { tempChats } = this._state.chat;
      const targetUserIds = tempChats[message.data.targetId];
      if (!targetUserIds.length) {
        this._logger.log('temp chat have no player received');
        return;
      }
      this.messageToPlayers(chatMsg, player, targetUserIds, msgType);
    }
  }

  private messageToPlayers = (
    text: string,
    sourcePlayer: ServerPlayer,
    targetUserIds: string[],
    msgType: MsgType,
  ) => {
    const ev = ChatMessageSchema.alloc();
    ev.id = sourcePlayer.id;
    ev.private = false;
    ev.text = text;
    ev.i18nSuffix = ev.i18nPrefix = '';
    ev.valid = true;
    ev.msgType = msgType;

    // send message to every targetPlayer
    for (let i = 0; i < targetUserIds.length; i++) {
      const targetUserId = targetUserIds[i];
      const targetPlayer = this._getPlayer(targetUserId);
      if (targetPlayer) {
        const targetClient = this._protocol.clients[targetPlayer.sessionId];
        if (targetClient) {
          targetClient.message.log(ev);
        } else {
          this._state.logger.error(
            `temp chat message to bad player id:  ${targetUserId}`,
          );
        }
      }
    }
    ChatMessageSchema.free(ev);
  };

  private generateSubscribeMsg = (): Message[] => {
    const { mode, contentId, containerType, teamId } = this._state.settings;
    if (containerType === ContainerType.Private && teamId) {
      this._logger.log(`chat socket subscribe CHAT_TEAM ${teamId}`);
      return [
        {
          opcode: OPCode.Subscribe,
          channel: Channel.CHAT_TEAM,
          data: {
            targetId: teamId,
          },
        },
      ];
    }

    this._logger.log(
      `chat socket subscribe CHAT_TEMP_MAP & CHAT_MAP ${contentId}, map mode ${mode}`,
    );
    return [
      // 临时聊天
      {
        opcode: OPCode.Subscribe,
        channel:
          mode === 'edit' ? Channel.CHAT_TEMP_EDIT : Channel.CHAT_TEMP_PLAY,
        data: {
          targetId: contentId.toString(),
        },
      },
      {
        opcode: OPCode.Subscribe,
        channel:
          mode === 'edit' ? Channel.CHAT_MAP_EDIT : Channel.CHAT_MAP_PLAY,
        data: {
          targetId: contentId.toString(),
        },
      },
    ];
  };

  public directMessage = (
    id: number,
    message: string,
    senderId: number = 0,
    duration: number,
    hideFloat: boolean,
  ) => {
    const targetPlayer = getById(this._state.serverPlayers, id);
    if (!targetPlayer) {
      this._state.logger.error(
        `bad target id direct message from ${senderId} to ${id}. "${message}"`,
      );
      return;
    }
    // push server log
    this._serverLog(senderId, id, message);

    const ev = ChatMessageSchema.alloc();
    ev.id = senderId;
    ev.private = true;
    ev.text = message;
    ev.i18nSuffix = ev.i18nPrefix = '';
    ev.valid = true;
    ev.msgType = MsgType.txt;
    ev.duration = duration;
    ev.hideFloat = hideFloat;

    // send message to target player
    const targetClient = this._protocol.clients[targetPlayer.sessionId];
    if (targetClient) {
      targetClient.message.log(ev);
    } else {
      this._state.logger.error(`direct message to bad player id`);
    }

    // mirror log to sender player
    if (senderId !== id) {
      const senderPlayer = getById(this._state.serverPlayers, senderId);
      if (senderPlayer) {
        const senderClient = this._protocol.clients[senderPlayer.sessionId];
        if (senderClient) {
          senderClient.message.log(ev);
        }
      }
    }
    ChatMessageSchema.free(ev);
  };

  public broadcast = (spec: {
    message: string;
    senderId?: number;
    pushEvent?: boolean;
    valid?: boolean;
    msgType?: MsgType;
    duration?: number;
    hideFloat?: boolean;
  }) => {
    const {
      message,
      senderId = 0,
      pushEvent = false,
      valid = true,
      msgType = MsgType.txt,
      duration = 0,
      hideFloat = false,
    } = spec;
    // broadcast message to clients
    const ev = ChatMessageSchema.alloc();
    ev.id = senderId;
    ev.private = false;
    ev.text = message;
    ev.i18nSuffix = ev.i18nPrefix = '';
    ev.valid = valid;
    ev.msgType = msgType;
    ev.duration = duration;
    ev.hideFloat = hideFloat;
    this._protocol.broadcast.log(ev);
    ChatMessageSchema.free(ev);

    // push message to chat event log
    if (pushEvent) {
      const log = ChatLogEventSchema.alloc();
      log.senderId = senderId;
      log.targetId = 0;
      log.private = false;
      log.msgType = msgType;
      const player = getById(this._state.replica.players, senderId);
      if (player) {
        log.name = player.name;
      } else {
        log.name = '';
      }
      log.message = message;
      this._state.events.chat.chats.push(log);
    }
  };

  private _serverLog(senderId: number, targetId: number, text: string) {
    const senderPlayer = getById(this._state.replica.players, senderId);
    const targetPlayer = getById(this._state.replica.players, targetId);
    this._logger.info(
      `${senderPlayer ? `${senderPlayer.name}(${senderId})` : ''}${
        targetPlayer ? `@${targetPlayer.name}(${targetPlayer.id})` : ''
      }: ${text}`,
    );
  }
}
