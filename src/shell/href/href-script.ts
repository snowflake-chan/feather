import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { HyperlinkScriptProtocol } from './href-script-protocol';

export class HrefScriptShell {
  public protocol: MuClientProtocol<typeof HyperlinkScriptProtocol>;

  constructor(client: MuClient) {
    this.protocol = client.protocol(HyperlinkScriptProtocol);
  }

  public openLink(
    clientId: number,
    href: string,
    options?: { isConfirm?: boolean; isNewTab?: boolean },
  ) {
    const isConfirm =
      !options || typeof options.isConfirm === 'undefined' || options.isConfirm;
    const isNewTab =
      !options || typeof options.isNewTab === 'undefined' || options.isNewTab;
    this.protocol.server.message.openLink({
      clientId,
      href,
      isConfirm,
      isNewTab,
    });
  }
}
