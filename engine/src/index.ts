import { MuServer } from '@box/mudb/server';
import { ModerationClient } from './moderation/moderation-client';
import { MuScheduler } from '@box/mudb/scheduler/scheduler';
import { ContentServer, Hash } from '@box/content-server';
import { ContentPerf } from '@box/content-server/content-perf';
import { Semaphore } from '@box/utils/semaphore';
import { Logger as LegacyLogger } from '@box/utils/logger';
import { compareId } from '@box/utils/id';
import { MS_PER_TICK } from '@box/schema/clock/clock-schema';
import { PlayerLoginState } from '@box/schema/player/player-schema';
import {
  ExtraProjectInfo,
  HotProject,
  HotProjectSchema,
} from '@box/schema/project/hot-schema';
import { Vec3Schema } from '@box/schema/utils/math-schema';
import { CloseType } from '@box/schema/types/game';
import { ServerEventSchema } from '@box/schema/events/server-event-schema';
import { GameSessionDataSchema } from '@box/schema/session/schema';
import { GameSessionInterface } from '@box/schema/session/type';
import type { Logger } from 'pino';

import { CommonSQL } from './storage/types';

import {
  GameServerStateSchema,
  GameConnectionSchema,
  GameConnectionState,
} from './game-server-schema';
import { NetServer } from './net/net-server-controller';
import { ClockServer } from './clock/clock-server-controller';
import {
  VoxelServer,
  voxelServerChanged,
  computeVoxelPrefetchHashes,
} from './voxel/voxel-server';
import { ServerVoxelPreloadData } from './voxel/voxel-server-schema';
import {
  handleServerPlayerConnections,
  handleServerPlayerDisconnections,
  tickServerPlayers,
} from './player/player-server-controller';
import {
  destroyEntityId,
  finalizeDestroyedEntities,
} from './entity/entity-controller';
import {
  forgetServerNetState,
  getServerNetState,
  updateServerNetInput,
  synchronizeServerNetState,
  clearServerNetState,
} from './net/net-server-tick';
import { EventBus } from '@box/utils/event';
import { ChatServer } from './chat/chat-server';
import {
  tickServerModels,
  ModelServer,
  computeSkinPartPrefetchHashes,
} from './mesh/server-model-controller';
import { tickSeeds } from './seed/seed-controller';
import { SERVER_REWIND_TICKS } from './net/net-server-state';
import { ScriptHost } from './script/script-host';
import { tickServerDamage, clearDamageComponent } from './damage/damage-server';
import { tickServerPhysics } from './physics/physics-server-controller';
import {
  ServerSettings,
  ServerSettingsSchema,
} from './settings/server-settings-schema';
import { tickEnvironmentServer } from './environment/server-environment-controller';
import { ScriptServer } from './utils/script-server/type';
import { updateParticleReplica } from './particle/particle-server-controller';
import { SoundServer } from './sound/server-sound-controller';
import { InteractServer } from './interact/interact-server';
import { DialogServer } from './dialog/dialog-server';
import { clearServerZones } from './zone/zone-server';
import {
  tickServerKeyframes,
  clearServerKeyframes,
} from './keyframes/keyframe-server';
import { BackendRPC } from '@box/schema/backend/rpc-interface';
import { InputServer } from './input/server-input-controller';
import { PlayerServer } from './player/player-server';
import { GameUIServer } from './game-ui/game-ui-server';
import { BackendSocket } from '../backendSocket';

export const TICK_RATE = 64;
export const CAPACITY = 50;

type handleUserJoinType = {
  canJoin: boolean;
  reason?: CloseType;
};
export class GameServer {
  public server: MuServer;
  public scheduler: MuScheduler;
  public session: GameSessionInterface;

  public state = GameServerStateSchema.clone(GameServerStateSchema.identity);

  public net: NetServer;
  public model: ModelServer;
  public clock: ClockServer;
  public input: InputServer;
  public sound: SoundServer;
  public voxel: VoxelServer;
  public chat: ChatServer;
  public player: PlayerServer;
  public interact: InteractServer;
  public dialog: DialogServer;
  public script: ScriptHost;
  public gameUI: GameUIServer;
  public webSocket: BackendSocket;

  private _loopInterval: any;

  public onReady = new EventBus<void>();
  public onPoll = new EventBus<void>();
  public onTick = new EventBus<void>();

  public brpc: BackendRPC;

  private logger: Logger;

  // check if a user is valid
  public handleUserJoin: (
    sessionId: string,
    userId: string,
    admin: boolean,
  ) => Promise<handleUserJoinType> = async () => ({ canJoin: true });

  // We call poll all the time, this does light weight stuff like update
  private _poll = () => {
    // update tcp buffer count
    this.net.updateBufferedAmount();

    // poll clock
    this.clock.poll();

    // handle ready event
    if (!this.state.ready) {
      this.state.ready = this.server.running && this.state.voxelState.ready;
      if (this.state.ready) {
        this.onReady.notify();
      }
    }

    // call user poll
    this.onPoll.notify();
  };

  private _tick = () => {
    const startTime =
      typeof process !== 'undefined' && process.hrtime
        ? process.hrtime()
        : [0, Date.now() * 1e6];

    // update write state
    this.state.perf.ipfsWriteBytes = this.state.content.storeBytes;
    this.state.perf.ipfsReadBytes = this.state.content.retrieveBytes;
    this.state.perf.ipfsMiss = this.state.content.cacheMiss;

    // at start of tick synchronize state with network state
    // 先将net数据同步到server，net数据包含各个客户端通过input发上来的上一帧数据
    const baseState = getServerNetState(this.state, this.state.clock.tick - 1);
    forgetServerNetState(
      this.state,
      this.state.clock.tick - SERVER_REWIND_TICKS,
    );
    if (baseState) {
      synchronizeServerNetState(this.state, baseState);
    }

    // Synchronize script state
    // 给api赋值，更新script数据
    this.script.preTickApplyScriptUpdates();

    // call user tick
    this.onTick.notify();

    // clear damage on sync
    if (this.state.sync) {
      clearDamageComponent(this.state);
    }

    // sync model components
    this.model.tick();

    // update seed states
    tickSeeds(this.state);

    // update voxel geometry and broadcast writes
    this.voxel.tick();

    // handle player connections, add to input packet
    handleServerPlayerConnections(this.model, this.state, this.player);

    // ------------------------------------------------
    //  begin main system tick stuff
    // ------------------------------------------------

    // tick animations
    tickServerKeyframes(this.state);

    // update damage component, handle player death
    tickServerDamage(this.state);

    // update physics
    tickServerPhysics(this.state);

    // apply server player events, add corrections to input packet
    tickServerPlayers(this.state);

    // apply model transformation updates to physics state
    // 根据旋转缩放信息更新物理模型的bounds
    tickServerModels(this.state);

    // compute environment state
    tickEnvironmentServer(this.state);

    // synchronize any changes to the particle system
    updateParticleReplica(this.state);

    // tick interactive components
    this.interact.tick();

    // tick sound
    this.sound.tick();

    // ------------------------------------------------
    //  end main system tick stuff
    // ------------------------------------------------

    // handle player disconnection events
    for (let i = 0; i < this.state.connectionSet.length; ++i) {
      const conn = this.state.connectionSet[i];
      const sessionId = conn.sessionId;
      if (!(sessionId in this.net.protocol.clients)) {
        if (this.state.events.disconnect.indexOf(sessionId) < 0) {
          this.state.logger.warn('socket was not correctly closed.g');
          conn.state = GameConnectionState.CLOSED;
          this.state.events.disconnect.push(sessionId);
        }
      }
    }
    handleServerPlayerDisconnections(this.state, this.player);
    for (let i = 0; i < this.state.serverPlayers.length; ++i) {
      const s = this.state.serverPlayers[i].sessionId;
      if (!(s in this.state.connections)) {
        destroyEntityId(this.state, this.state.serverPlayers[i].id);
      }
    }

    // finalize entity deletions
    finalizeDestroyedEntities(this.state);

    // save net state into server synchronization buffer
    updateServerNetInput(this.state, this.state.clock.tick);

    // read out next state
    // 计算下一帧的net数据
    const nextState = getServerNetState(this.state, this.state.clock.tick);
    if (nextState) {
      // server的net数据同步，sendRaw
      this.net.synchronizePublic(nextState);
      // api赋值
      this.script.postTickSyncScript(nextState);
    }

    // synchronize all secret info
    this.net.synchronizeSecrets();

    // send all pings out
    this.clock.processPings();

    // clear all event queues
    ServerEventSchema.assign(this.state.events, ServerEventSchema.identity);

    // update edge flags
    this.state.prevRunning = this.state.replica.running;

    // notify script if necessary
    const prevSync = this.state.sync;
    this.state.replica.sync = this.state.sync = false;
    if (prevSync) {
      this.script.notifySync();
    }

    const endTime =
      typeof process !== 'undefined' && process.hrtime
        ? process.hrtime()
        : [0, Date.now() * 1e6];
    const tickTime =
      (endTime[0] - startTime[0]) * 1e3 + (endTime[1] - startTime[1]) * 1e-6;

    this.state.perf.minTickTime = Math.min(
      this.state.perf.minTickTime,
      tickTime,
    );
    this.state.perf.maxTickTime = Math.min(
      this.state.perf.maxTickTime,
      tickTime,
    );
    this.state.perf.avgTickTime += tickTime;
    this.state.perf.tickCounter += 1;
  };

  private _loop = () => {
    this._poll();
    if (this.clock.tick()) {
      this._tick();
    }
  };

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
  }) {
    // 新的使用方式不建议走 GameState，建议根据需要区分 caller
    this.logger = spec.logger;
    this.state.logger = spec.legacyLogger.create('engine');
    this.webSocket = spec.backendSocket;

    this.server = spec.server;
    this.scheduler = spec.scheduler;
    this.session = spec.session;
    this.state.content = new ContentPerf(spec.contentServer);
    this.state.ossContent = new ContentPerf(spec.ossContentServer);
    this.brpc = spec.brpc;

    ServerSettingsSchema.assign(this.state.settings, spec.settings);

    // create initial network state
    clearServerNetState(this.state.net, 0);
    this.model = new ModelServer({
      server: this.server,
      state: this.state,
    });
    this.net = new NetServer({
      server: this.server,
      state: this.state,
      hotProject: spec.hotProject,
      connect: async (sessionId) => {
        const data = await this.session.getSessionData(sessionId);
        if (!data) {
          this.logger.warn(`Bad session data for sessionID=${sessionId}.`);
          this.net.kickSession(sessionId);
          return false;
        }

        // Map-scoped bans are checked before allocating a connection, including reconnects.
        try {
          if (!await new ModerationClient().admission(data.user.id,data.ipAddress,data.deviceHash)) {
            this.net.kickSession(sessionId,CloseType.NoAuth);
            return false;
          }
        } catch {
          this.net.kickSession(sessionId,CloseType.Server);
          return false;
        }
        // test if user is valid
        const userId = data.user.id;
        const ipAddress = data.ipAddress;
        const admin = data.isAdmin;
        if (!admin) {
          if (this.state.banned[userId] || this.state.banned[ipAddress]) {
            this.logger.warn(
              `Rejected banned client with sessionID=${sessionId}, userID=${userId}, ip=${ipAddress}`,
            );
            this.net.kickSession(sessionId);
            return false;
          }

          // check for multiple logins
          for (let i = 0; i < this.state.connectionSet.length; ++i) {
            const c = this.state.connectionSet[i];

            if (data.user.id && c.sessionData.user.id === data.user.id) {
              this.logger.warn(
                `Rejected client of session id ${sessionId}, attempt to log in from second device. ${data.user.id}, ip=${ipAddress}.`,
              );
              this.net.kickSession(c.sessionId);
              this.state.events.disconnect.push(c.sessionId);
            }

            if (data.ipAddress === c.sessionData.ipAddress) {
              this.logger.warn(
                `Duplicate ip address ${data.ipAddress} from user ${userId} detected for session id ${sessionId} and ${c.sessionId}.`,
              );
            }
          }
        }

        // check for other validation
        const validUser = await this.handleUserJoin(sessionId, userId, admin);
        if (!validUser.canJoin) {
          this.logger.warn(
            `Rejected client, sessionId=${sessionId}, userId=${userId}, ip=${ipAddress}, reason=${validUser.reason}.`,
          );
          this.net.kickSession(sessionId, validUser.reason);
          return false;
        }

        if (!(sessionId in this.net.protocol.clients)) {
          this.logger.warn('Client disconnected before cookie validated.');
          return false;
        }

        // allocate new connection
        const connection = GameConnectionSchema.clone(
          GameConnectionSchema.identity,
        );
        connection.sessionId = sessionId;
        connection.loginState = data.user.id
          ? PlayerLoginState.GUEST
          : PlayerLoginState.USER;
        GameSessionDataSchema.assign(connection.sessionData, data);

        // update connection index
        this.state.connections[sessionId] = connection;
        this.state.connectionSet.push(connection);
        this.state.connectionSet.sort(compareId);
        this.state.events.connect.push(sessionId);

        // connection successful
        this.logger.debug(
          `Connection accepted. sessionId=${sessionId} userId=${userId} ip=${ipAddress}.`,
        );
        return true;
      },
      disconnect: (sessionId) => {
        this.state.perf.socketClosed++;

        const connection = this.state.connections[sessionId];
        this.state.events.disconnect.push(sessionId);
        if (!connection) {
          this.logger.error(`disconnection from bad session id: ${sessionId}`);
          return;
        }
        connection.state = GameConnectionState.CLOSED;
      },
    });
    this.clock = new ClockServer({
      server: this.server,
      scheduler: spec.scheduler,
      state: this.state,
    });
    this.input = new InputServer({
      state: this.state,
      server: this.server,
    });
    this.sound = new SoundServer({
      server: this.server,
      state: this.state,
    });
    this.voxel = new VoxelServer({
      server: this.server,
      state: this.state,
      preloadVoxels: spec.initVoxels,
      blockInfo: spec.hotProject.blockInfo,
      blockInfoHash: spec.hotProject.blockInfoHash,
    });
    this.chat = new ChatServer({
      server: this.server,
      state: this.state,
      webSocket: this.webSocket,
    });
    this.player = new PlayerServer({
      server: this.server,
      state: this.state,
      modelServer: this.model,
    });
    this.interact = new InteractServer({
      server: this.server,
      state: this.state,
    });
    this.dialog = new DialogServer({
      server: this.server,
      state: this.state,
    });
    this.script = new ScriptHost({
      netServer: this.server,
      scriptServer: spec.scriptServer,
      logger: this.logger.child({ caller: 'script-host' }),
      legacyLogger: this.state.logger,
      state: this.state,
      voxels: this.voxel,
      chat: this.chat,
      net: this.net,
      dialog: this.dialog,
      sql: spec.sql,
      input: this.input,
      sound: this.sound,
      player: this.player,
    });
    this.gameUI = new GameUIServer({
      server: this.server,
      state: this.state,
    });
  }

  public start() {
    // FIXME: need to wait until script has started
    return new Promise<void>((resolve) => {
      this.server.start({
        ready: () => {
          this.state.logger.info('game server loop initialized');
          this._loopInterval = this.scheduler.setInterval(
            this._loop,
            0.25 * MS_PER_TICK,
          );
          resolve();
        },
        close: (err) => {
          if (err) {
            this.state.logger.error(err);
          }
          this.scheduler.clearInterval(this._loopInterval);
          this.state.logger.info('game server loop stopped');
        },
      });
    });
  }

  // --------------------------------------------------------------------
  // Project state synchronization code
  // --------------------------------------------------------------------
  public syncSemaphore = new Semaphore();
  public syncInProgress() {
    return this.syncSemaphore.counter <= 0;
  }

  public async synchronizeProject(
    _project: HotProject,
    options: {
      skipVoxels: boolean;
      play: boolean;
    },
  ) {
    const { skipVoxels, play } = options;

    const project = HotProjectSchema.clone(_project);
    await this.syncSemaphore.p();
    this.logger.info('Syncing project.');
    try {
      await this.script.stop();
      const pendingTasks = this._getAsynchronousUpdates(_project, skipVoxels);
      if (pendingTasks.length > 0) {
        const tasks: (() => void)[] = [];
        for (let i = 0; i < pendingTasks.length; ++i) {
          const task = await pendingTasks[i];
          if (!task) {
            this.logger.error(`Synchronizing task failed.`);
            return false;
          }
          tasks.push(task);
        }
        tasks.forEach((t) => t());
      }
      await this._applySynchronousUpdates(_project, play);
      this.logger.debug('Synchronous updates applied.');
    } catch (e) {
      this.state.logger.error(`error synchronizing project: ${e}`);
      if (e.stack) {
        this.state.logger.error(e.stack);
      }
    } finally {
      HotProjectSchema.free(project);
      this.syncSemaphore.v();
    }

    this.state.logger.log(`sync finished`);

    return true;
  }

  private _getAsynchronousUpdates(
    project: HotProject,
    skipVoxels: boolean,
  ): Promise<(() => void) | null>[] {
    const result: Promise<(() => void) | null>[] = [];
    if (!skipVoxels) {
      if (
        project.blockInfoHash !== this.state.blockInfoHash ||
        voxelServerChanged(this.state, project.voxels)
      ) {
        this.state.logger.log('voxels changed, reloading...');
        result.push(
          this.voxel.synchronizeVoxelInfo(
            project.voxels,
            project.blockInfo,
            project.blockInfoHash,
          ),
        );
      }
    }

    result.push(this.script.synchronizeScriptSrc(project));

    return result;
  }

  private async _applySynchronousUpdates(project: HotProject, play: boolean) {
    HotProjectSchema.assign(this.state.project, project);

    // send client script modules
    this.net.sendClientScriptModules(this.net.getClientScriptModules());

    this.state.replica.sync = this.state.sync = true;
    this.state.replica.running = play;

    // sync models
    this.model.syncNetMeshSkinTable();

    // clear all zones
    clearServerZones(this.state);

    // clear all animations
    clearServerKeyframes(this.state);

    this.gameUI.reset(play);

    await this.script.start();
  }

  // -----------------------------------------------------------------------
  // List of hashes that client should prefetch
  // - audioHashes is computed in computeAudioPrefetch()
  // -----------------------------------------------------------------------
  public async prefetch(): Promise<Hash[]> {
    const voxelHashes = await computeVoxelPrefetchHashes(this.state);
    const modelHashes = this.model.prefetchHashes();
    const skinPartHashes = await computeSkinPartPrefetchHashes(this.state);

    // concatenate all hashes, remove duplicates, add ipfs prefix
    const hashSet: { [hash: string]: boolean } = {};

    function insertHash(h: string) {
      h && (hashSet[h] = true);
    }
    modelHashes.forEach(insertHash);
    skinPartHashes.forEach(insertHash);
    voxelHashes.forEach(insertHash);

    const uniqueHashes = Object.keys(hashSet);

    // append all images hashes separately
    function appendHash(h: string) {
      h && uniqueHashes.push(h);
    }
    this.state.blockInfo.bumpAtlas.forEach(appendHash);
    this.state.blockInfo.materialAtlas.forEach(appendHash);
    this.state.blockInfo.colorAtlas.forEach(appendHash);
    appendHash(this.state.project.blockInfoHash);

    return uniqueHashes.reverse();
  }
}
