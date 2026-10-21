import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { GameClientState } from '../game-client-schema';
import { ChatProtocolSchema } from '@box/schema/chat/chat-schema';
import { getById } from '@box/utils/id';
import { ChatLogEventSchema } from '@box/schema/events/chat-event-schema';
import { ChatSchema } from '@box/schema/chat/chat-schema';

export class ChatClient {
  private _state: GameClientState;
  private _protocol: MuClientProtocol<typeof ChatProtocolSchema>;

  constructor(spec: { client: MuClient; state: GameClientState }) {
    this._state = spec.state;
    this._protocol = spec.client.protocol(ChatProtocolSchema);
    this._protocol.configure({
      message: {
        log: (ev) => {
          const valid = ev.valid || ev.id === this._state.secret.id;
          if (!valid) {
            return;
          }
          // generate chat event
          const event = ChatLogEventSchema.alloc();
          const chat = ChatSchema.alloc();
          const player = getById(this._state.replica.players, ev.id);

          event.message = chat.text = ev.text;
          event.msgType = ev.msgType;
          event.private = ev.private;
          chat.clock = this._state.clock.clock;
          chat.i18nPrefix = ev.i18nPrefix;
          chat.i18nSuffix = ev.i18nSuffix;
          event.senderId = ev.id;
          event.duration = ev.duration;
          chat.duration = ev.duration;
          if (!player && !ev.hideFloat) {
            // update chat
            ChatSchema.assign(this._state.chat, chat);
          }

          // push event to log
          this._state.events.chat.chats.push(event);
        },
        globalNotice: ({ title, detail }) => {
          this._state.globalNotice = { title, detail };
        },
      },
    });
  }

  public sendGlobalNotice = (title, detail) => {
    this._protocol.server.message.noticeMessage({ title, detail });
  };
}
