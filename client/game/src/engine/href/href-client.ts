import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { GameClientState } from '../game-client-schema';
import { HyperlinkProtocol } from './href-protocol';
import { HyperLinkSchema } from './href-client-state';

export class HrefClient {
  public protocol: MuClientProtocol<typeof HyperlinkProtocol>;
  public state: GameClientState;
  private stopAcceptHyperLink: boolean;

  constructor(spec: { client: MuClient; state: GameClientState }) {
    this.protocol = spec.client.protocol(HyperlinkProtocol);
    this.state = spec.state;
    this.stopAcceptHyperLink = false;

    this.protocol.configure({
      message: {
        openLink: (hyperLink) => {
          if (this.stopAcceptHyperLink) {
            return;
          }
          this.stopAcceptHyperLink = true;
          this.state.hyperLink = HyperLinkSchema.clone(hyperLink);
        },
      },
    });
  }
  public clearHyperLink = () => {
    HyperLinkSchema.free(this.state.hyperLink);
    HyperLinkSchema.assign(this.state.hyperLink, HyperLinkSchema.identity);
    this.stopAcceptHyperLink = false;
  };
}
