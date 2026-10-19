import { MuServerProtocol, MuServer } from '@box/mudb/server';
import {
  InteractProtocol,
  InteractComponentSetSchema,
} from '@box/schema/interact/interact-protocol';
import { GameConnectionState, GameServerState } from '../game-server-schema';
import { getById } from '@box/utils/id';
import { InteractEventSchema } from './interact-server-state';
import { GameScriptRunState, scriptRunState } from '../script/script-schema';

export class InteractServer {
  public protocol: MuServerProtocol<typeof InteractProtocol>;
  public state: GameServerState;

  constructor(spec: { server: MuServer; state: GameServerState }) {
    this.state = spec.state;
    this.protocol = spec.server.protocol(InteractProtocol);
    this.protocol.configure({
      message: {
        interact: (client, event) => {
          client.message.acknowledgeInteract();

          if (
            scriptRunState(this.state.script) !== GameScriptRunState.RUNNING
          ) {
            return;
          }
          const connection = this.state.connections[client.sessionId];
          if (!connection?.id || connection.state !== GameConnectionState.CONNECTED) {
            return;
          }
          const interact = getById(this.state.replica.interactive, event.id);
          if (!interact) {
            return;
          }
          const e = InteractEventSchema.alloc();
          e.id = connection.id;
          e.targetId = interact.id;
          e.tick = event.tick;
          this.state.script.curTickEvent.events.interactEvents.push(e);
        },

        playEmote: (client, emote) => {
          const connection = this.state.connections[client.sessionId];
          if (!connection?.id || connection.state !== GameConnectionState.CONNECTED) {
            return;
          }
          this.protocol.broadcast.emoteEvent({
            id: connection.id,
            emote,
          });
        },
      },
    });
  }

  public tick() {
    if (this.state.sync) {
      InteractComponentSetSchema.assign(this.state.replica.interactive, []);
    }
  }
}
