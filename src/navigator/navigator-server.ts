import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { getById } from '@box/utils/id';
import { Logger } from '@box/utils/logger';
import { GameServerState } from '../game-server-schema';
import { NavigatorProtocol } from '@box/schema/navigator/navigator-protocol';
import {
  PostMessageSchema,
  PostMessageType,
} from '@box/schema/navigator/navigator-schema';
import { filterSwear } from '@box/utils/swears/index';
import { NavigatorScriptProtocol } from './navigator-script-protocol';
import { getConfigSync } from '../../config/server';

function censorShare(message: PostMessageType) {
  const config = getConfigSync();
  const content = message.value;
  message.value = filterSwear(content, config.SWEAR_KEY);
}

export class NavigatorServer {
  public netProtocol: MuServerProtocol<typeof NavigatorProtocol>;
  public scriptProtocol: MuServerProtocol<typeof NavigatorScriptProtocol>;
  public state: GameServerState;
  public logger: Logger;

  constructor(spec: {
    state: GameServerState;
    server: MuServer;
    scriptServer: MuServer;
  }) {
    this.state = spec.state;
    this.logger = this.state.logger.create('navigator');

    this.netProtocol = spec.server.protocol(NavigatorProtocol);
    this.netProtocol.configure({
      message: {
        messageEvent: (client, data) => {
          const conn = this.state.connections[client.sessionId];
          if (conn) {
            this.scriptProtocol.broadcast.notifyMessageEvent({
              playerId: conn.id,
              event: data,
            });
          }
        },
      },
    });

    this.scriptProtocol = spec.scriptServer.protocol(NavigatorScriptProtocol);
    this.scriptProtocol.configure({
      message: {
        postMessage: (client, message) => {
          this.logger.info(`postMessage: ${JSON.stringify(message)}`);
          this.postMessage(message.playerId, message.content);
        },
      },
    });
  }

  public postMessage = (playerId: number, content: PostMessageType) => {
    const connection = getById(this.state.connectionSet, playerId);
    if (!connection) {
      this.state.logger.warn(
        'attempt to post message on closed connection: ' + playerId,
      );
      return;
    }

    const client = this.netProtocol.clients[connection.sessionId];
    if (!client) {
      return;
    }
    if (content.type === 'share') {
      content = this.getShareContent(playerId, content);
    }
    client.message.postMessage(content);
  };

  public getShareContent = (playerId: number, content: PostMessageType) => {
    censorShare(content);
    const value = JSON.parse(content.value);

    const conn = getById(this.state.connectionSet, playerId);
    const playerLanguage = conn?.sessionData.user.language;
    const intlTitle = playerLanguage === 'zh_CN' ? '分享' : 'Share';
    const intlTags =
      playerLanguage === 'zh_CN'
        ? `#神奇代码岛 #地图`
        : `@createra_ #createra #game`;
    const validText =
      value.text.length <= 40
        ? value.text
        : `${value.text.slice(0, 40)}${
            playerLanguage === 'zh_CN' ? '……' : '...'
          }`;

    const shareValue = {
      title: intlTitle,
      text: `${validText}\n${intlTags}`,
      // 以下属性虽然引擎不需要控制，但如果不传就会引发弹窗在移动端无法关闭的问题。
      // 如果平台侧处理了这个问题，那么这里就可以不用传了。
      // 这里我们只是为了解决这个问题，所以这些属性全都是固定值，不需要配置。
      modalProps: {
        mask: {
          closable: true, // 固定为 true，点击空白处可以关闭，如果平台处理了，这边可以去掉
        },
        content: {
          placement: {
            mobile: 'bottom', // 不传的话移动端会盖满整个屏幕，就关不掉了
            tablet: 'bottom', // 所以如果平台处理了，这边可以去掉
          },
        },
      },
    };
    const shareContent = {
      type: content.type,
      isOld: content.isOld,
      value: JSON.stringify(shareValue),
    };
    return PostMessageSchema.clone(shareContent);
  };

  public reset() {
    this.scriptProtocol.broadcast.reset();
  }
}
