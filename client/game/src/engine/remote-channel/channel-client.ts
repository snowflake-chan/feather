import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { RemoteChannelProtocol } from '@box/schema/remote-channel/channel-protocol';
import { RemoteClientEventSchema } from '@box/schema/events/remote-channel-event-schema';
import type { JSONValue } from '@box/schema/api/common';
import { GameClientState } from '../game-client-schema';

export class RemoteChannelClient {
  public protocol: MuClientProtocol<typeof RemoteChannelProtocol>;
  public state: GameClientState;

  constructor(spec: { client: MuClient; state: GameClientState }) {
    this.protocol = spec.client.protocol(RemoteChannelProtocol);
    this.state = spec.state;

    this.protocol.configure({
      message: {
        sendClientEvent: (event) => {
          const e = RemoteClientEventSchema.clone(event);
          this.state.clientScript.events.remoteChannel.push(e);
        },
      },
    });
  }

  public sendServerEvent(args: JSONValue) {
    const val = JSON.stringify(args);
    this.protocol.server.message.sendServerEvent({
      tick: this.state.clock.tick,
      args: val,
    });
  }
}
