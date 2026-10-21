import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { GameClientState } from '../game-client-schema';
import { NavigatorProtocol } from '@box/schema/navigator/navigator-protocol';
import { PostMessageSchema } from '@box/schema/navigator/navigator-schema';

export class NavigatorClient {
  public protocol: MuClientProtocol<typeof NavigatorProtocol>;
  public state: GameClientState;
  public stopAcceptPostMessage: boolean;

  constructor(spec: { client: MuClient; state: GameClientState }) {
    this.protocol = spec.client.protocol(NavigatorProtocol);
    this.state = spec.state;
    this.stopAcceptPostMessage = false;

    this.protocol.configure({
      message: {
        postMessage: (message) => {
          if (this.stopAcceptPostMessage) {
            return;
          }
          this.stopAcceptPostMessage = true;
          this.state.navigator.postMessage = PostMessageSchema.clone(message);
        },
      },
    });
  }

  public postMessage = (payload: string) => {
    this.protocol.server.message.messageEvent({ data: JSON.parse(payload) });
  };

  public clearPostMessage = () => {
    PostMessageSchema.free(this.state.navigator.postMessage);
    PostMessageSchema.assign(
      this.state.navigator.postMessage,
      PostMessageSchema.identity,
    );
    this.stopAcceptPostMessage = false;
  };
}
