import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { GameUIProtocol } from '@box/schema/game-ui/game-ui-protocol';
import type { GameServerState } from '../game-server-schema';

export class GameUIServer {
  private protocol: MuServerProtocol<typeof GameUIProtocol>;
  private state: GameServerState;

  constructor(spec: { server: MuServer; state: GameServerState }) {
    this.protocol = spec.server.protocol(GameUIProtocol);

    this.protocol.configure({
      message: {},
      connect: (client) => {
        const {
          project: { pictureAssets, uiTree, defaultScreenId },
          replica: { running },
        } = this.state;

        client.message.reset({
          running,
          uiTree,
          pictureAssets,
          defaultScreenId,
        });
      },
    });

    this.state = spec.state;
  }

  public reset(running: boolean) {
    const { uiTree, pictureAssets, defaultScreenId } = this.state.project;
    this.protocol.broadcast.reset({
      running,
      uiTree,
      pictureAssets,
      defaultScreenId,
    });
  }
}
