import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { getById } from '@box/utils/id';
import { Logger } from '@box/utils/logger';
import { GameServerState } from '../game-server-schema';
import { HyperlinkProtocol } from './href-protocol';
import { HyperlinkScriptProtocol } from './href-script-protocol';
import { isSafeUrl } from './safe-url';

export class HrefServer {
  public netProtocol: MuServerProtocol<typeof HyperlinkProtocol>;
  public scriptProtocol: MuServerProtocol<typeof HyperlinkScriptProtocol>;
  public state: GameServerState;
  public logger: Logger;

  constructor(spec: {
    server: MuServer;
    scriptServer: MuServer;
    state: GameServerState;
  }) {
    this.netProtocol = spec.server.protocol(HyperlinkProtocol);
    this.scriptProtocol = spec.scriptServer.protocol(HyperlinkScriptProtocol);
    this.state = spec.state;
    this.logger = this.state.logger.create('href');

    this.netProtocol.configure({
      message: {},
    });
    this.scriptProtocol.configure({
      message: {
        openLink: (_, { clientId, href, isConfirm, isNewTab }) => {
          this.testSafeURL(href)
            .then((result) => {
              if (!result) {
                this.logger.info(`blocked link "${href}"`);
                return;
              }
              const conn = getById(this.state.connectionSet, clientId);
              if (!conn) {
                return;
              }
              const netClient = this.netProtocol.clients[conn.sessionId];
              if (!netClient) {
                return;
              }
              // href 添加 teamId=${TEAM_ID}&refererServerId=${SERVER_ID}
              const url = new URL(href);
              url.searchParams.set('teamId', this.state.settings.teamId);
              url.searchParams.set(
                'refererServerId',
                this.state.settings.serverId,
              );
              const newHref = url.toString();
              netClient.message.openLink({
                ...result,
                href: newHref,
                isConfirm,
                isNewTab,
              });
              this.logger.log(
                `link with teamId and refererServerId: ${newHref}`,
              );
            })
            .catch((err) => {
              this.logger.error(`error testing link safety: ${href}`);
              this.logger.error(err);
            });
        },
      },
    });
  }

  private async testSafeURL(href: string) {
    if (!isSafeUrl(href)) {
      return;
    }
    return {
      href,
      warning: true, // FIXME: check if domain is game
    };
  }
}
