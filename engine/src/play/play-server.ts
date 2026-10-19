import { MuServer } from '@box/mudb/server';
import { MuScheduler } from '@box/mudb/scheduler/scheduler';
import type { Logger } from 'pino';

import { GameServer } from '../';
import { ContentServer } from '@box/content-server';
import { HotProject } from '@box/schema/project/hot-schema';
import { ServerVoxelPreloadData } from '../voxel/voxel-server-schema';
import { GameSessionInterface } from '@box/schema/session/type';
import { Logger as LegacyLogger } from '@box/utils/logger';
import { ServerSettings } from '../settings/server-settings-schema';
import { GameAdminServer } from '../admin/admin-server';
import { ScriptServer } from '../utils/script-server/type';
import { PlayServerSchema } from './play-server-schema';
import { CommonSQL } from '../storage/types';
import { BackendRPC } from '@box/schema/backend/rpc-interface';
import { BackendSocket } from '../../backendSocket';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function startPlayServer(spec: {
  server: MuServer;
  scheduler: MuScheduler;
  contentServer: ContentServer;
  ossContentServer: ContentServer;
  scriptServer: ScriptServer;
  logger: Logger;
  legacyLogger: LegacyLogger;
  session: GameSessionInterface;
  hotProject: HotProject;
  voxel: ServerVoxelPreloadData;
  settings: ServerSettings;
  sql: CommonSQL;
  brpc: BackendRPC;
  backendSocket: BackendSocket;
  featureFlags?: string[];
}) {
  const server = new PlayServer({
    server: spec.server,
    scheduler: spec.scheduler,
    contentServer: spec.contentServer,
    ossContentServer: spec.ossContentServer,
    scriptServer: spec.scriptServer,
    logger: spec.logger,
    legacyLogger: spec.legacyLogger,
    initVoxels: spec.voxel,
    session: spec.session,
    hotProject: spec.hotProject,
    settings: spec.settings,
    sql: spec.sql,
    brpc: spec.brpc,
    backendSocket: spec.backendSocket,
  });
  await server.start();
  spec.logger.info('PlayServer started.');
  await server.state.game.synchronizeProject(spec.hotProject, {
    skipVoxels: false,
    play: true,
  });
  return server;
}

export class PlayServer {
  public state = PlayServerSchema.clone(PlayServerSchema.identity);

  constructor(spec: {
    server: MuServer;
    scheduler: MuScheduler;
    contentServer: ContentServer;
    ossContentServer: ContentServer;
    scriptServer: ScriptServer;
    logger: Logger;
    legacyLogger: LegacyLogger;
    initVoxels: ServerVoxelPreloadData;
    session: GameSessionInterface;
    hotProject: HotProject;
    settings: ServerSettings;
    sql: CommonSQL;
    brpc: BackendRPC;
    backendSocket: BackendSocket;
    featureFlags?: string[];
  }) {
    const game = (this.state.game = new GameServer(spec));
    const adminServer = new GameAdminServer({
      server: spec.server,
      game,
      containerName: spec.settings.containerName,
      contentId: spec.settings.contentId,
      brpc: spec.brpc,
    });
    this.state.logger = spec.legacyLogger.create('play');
    if (spec.settings.containerName) {
      const gameState = this.state.game.state;
      this.state.game.onTick.sub(() => {
        for (let i = 0; i < gameState.connectionSet.length; i++) {
          const conn = gameState.connectionSet[i];
          if (
            conn.joinTime === 0 || // the player is not joined the game
            gameState.clock.clock - conn.joinTime < 1000 * 60 || // player is joined less than 1min
            conn.playCounted // already counted
          ) {
            continue;
          }
          conn.playCounted = true;
        }
      });
    }

    // restart project
    game.script.onScriptCrash.sub(async () => {
      game.chat.systemBroadcast('scriptCrash');
      for (let i = 3; i > 0; --i) {
        game.chat.systemBroadcast('restartIn', '' + i);
        await delay(1000);
      }
      await game.synchronizeProject(game.state.project, {
        skipVoxels: false,
        play: true,
      });
    });

  }

  public async start() {
    return await this.state.game.start();
  }
}
