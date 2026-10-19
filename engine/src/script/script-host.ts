import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { Logger as LegacyLogger, LogMessageSchema } from '@box/utils/logger';
import { Logger } from 'pino';

import { GameServerState } from '../game-server-schema';
import {
  ScriptProtocol,
  ScriptInitSchema,
  ScriptTickSchema,
  ScriptPostTickSchema,
  ScriptSeedInfo,
  ScriptSeedInfoSchema,
  ScriptVoxelPreTickSchema,
  ScriptCollisionSpecSchema,
  SciptCollisionFilterSpecSchema,
  ScriptPerfCounterSchema,
} from './script-protocol';
import { ScriptServer } from '../utils/script-server/type';
import { VoxelServer } from '../voxel/voxel-server';
import { NetState, NetStateSchema } from '@box/schema/net/net-schema';
import { EntitySetSchema } from '@box/schema/entity/entity-schema';
import { GamePrivateReplicaSetSchema } from '@box/schema/replica/game-private-replica';
import { getServerNetState } from '../net/net-server-tick';
import { applyScriptEntityUpdates } from './bindings/entity-update';
import { applyScriptWorldUpdates } from './bindings/world-update';
import { EventBus } from '@box/utils/event';
import { GameLogLevel } from '@box/schema/api/console';
import {
  ScriptStateSnapshot,
  ScriptStateSnapshotSchema,
  ScriptEventsSchema,
} from './script-state-schema';
import { MuSchema } from '@box/mudb/schema';
import { decodeUTF8 } from '@box/mudb/stream';
import {
  VoxelContactEventSchema,
  BodyContactEventSchema,
  FluidContactEventSchema,
} from '@box/schema/events/physics-event-schema';
import { ChatLogEventSchema } from '@box/schema/events/chat-event-schema';
import { EngineVoxelSync } from './bindings/voxel-update';
import { ServerPlayerListSchema } from '../player/player-server-schema';
import { ScriptNetInputSchema } from '@box/schema/events/net-events';
import { ChatServer } from '../chat/chat-server';
import {
  GameScriptRunState,
  scriptRunState,
  ScriptSrcSchema,
} from './script-schema';
import {
  formatError,
  ParsedError,
  parseError,
  ParsedErrorSchema,
} from './parse-error';
import { ScriptSentEventSchema } from '@box/schema/events/script-events';
import { NetServer } from '../net/net-server-controller';
import { respawnPlayer } from '../player/player-server-controller';
import { EnvironmentParamSchema } from '@box/schema/environment/environment-schema';
import { NetModelSetSchema } from '@box/schema/mesh/model-schema';
import { PlayerDisplaySetSchema } from '@box/schema/player/player-schema';
import { DamageSetSchema } from '@box/schema/damage/damage-schema';
import { ContactIndexSchema } from '@box/schema/physics/physics-schema';
import { BlockInfoSchema } from '@box/schema/voxel/block-schema';
import { Semaphore } from '@box/utils/semaphore';
import { getById } from '@box/utils/id';
import { MuWriteStream } from '@box/mudb/stream';
import {
  ScriptResourceEntrySchema,
  ScriptResourceSchema,
} from './bindings/resource';
import { ServerParticleSetSchema } from '../particle/particle-server-state';
import { InteractComponentSetSchema } from '@box/schema/interact/interact-protocol';
import { DialogServer } from '../dialog/dialog-server';
import { StorageController } from '../storage/storage-controller';
import { resolveGroupStorageNamespace } from '../storage/storage-namespace';
import { CommonSQL } from '../storage/types';
import { ServerSoundStateSchema } from '../sound/server-sound-state';
import { SoundServer } from '../sound/server-sound-controller';
import { MAX_BODIES } from '@box/schema/physics/physics-solve';
import { filterSwear } from '@box/utils/swears/index';
import { HrefServer } from '../href/href-server';
import { HttpScriptController } from '../http/http-controller';
import { AssetType, ZoneSetRDA } from '@box/schema/project/project-rda';
import { applyScriptZoneUpdates } from './bindings/zone-updates';
import {
  clearServerKeyframes,
  postTickServerKeyframes,
} from '../keyframes/keyframe-server';
import { RTCServer } from '../rtc/rtc-server';
import { NavigatorServer } from '../navigator/navigator-server';
import { GUIServer } from '../gui/gui-server';
import { MarketProtocol } from '@box/schema/market/market-protocol';
import { InputServer } from '../input/server-input-controller';
import {
  HashType,
  HotProject,
  MotionListSchema,
} from '@box/schema/project/hot-schema';
import { getConfigSync } from '../../config/server';
import { RemoteChannelServer } from '../remote-channel/channel-server';
import { PlayerServer } from '../player/player-server';
import { TeleportServer } from '../teleport/teleport-server';
import { ModerationHost } from '../moderation/moderation-host';
import { AnticheatAudit } from '../anticheat/audit';
import { AnticheatHost } from '../anticheat/anticheat-host';
import { ModerationMetadataReporter } from '../moderation/moderation-metadata';
import { ClientKeyboardEventSchema } from '@box/schema/events/client-keyboard-event-schema';
import { EntityNameComponentSetSchema } from '@box/schema/entity-name/entity-name';
import { SCRIPT_OSS_CDN_PATH } from '@box/content-server/index';
import { Vec3Schema } from '@box/schema/utils/math-schema';
import { resolveRuntimeScriptEntry } from './script-entry';

function appendSchema<T, Schema extends MuSchema<T>>(
  schema: Schema,
  base: T[],
  src: T[],
) {
  for (let i = 0; i < src.length; ++i) {
    base.push(schema.clone(src[i]));
  }
}

export class ScriptHost {
  public scriptServer: ScriptServer;
  public muServer: MuServer;
  public protocol: MuServerProtocol<typeof ScriptProtocol>;
  public logger: Logger;
  public legacyLogger: LegacyLogger;
  public voxels: EngineVoxelSync;
  public chat: ChatServer;
  public dialog: DialogServer;
  public net: NetServer;
  public storage: StorageController;
  public sound: SoundServer;
  public href: HrefServer;
  public http: HttpScriptController;
  public rtc: RTCServer;
  public navigator: NavigatorServer;
  public gui: GUIServer;
  private marketProtocol: MuServerProtocol<typeof MarketProtocol>;
  public teleport: TeleportServer;
  private moderationMetadata: ModerationMetadataReporter;
  private anticheat?: AnticheatHost;
  public remoteChannel: RemoteChannelServer;
  public input: InputServer;
  public player: PlayerServer;

  // EditorServer should hook these things to get some kind of script log
  public onConsoleLog = new EventBus<{
    level: GameLogLevel;
    message: string;
  }>();
  public onConsoleClear = new EventBus<void>();
  public onException = new EventBus<ParsedError>();

  // called when scripts timeout
  public onScriptCrash = new EventBus<void>();

  private _state: GameServerState;

  private _handleCounter: number = 0;
  private _pendingEvals: {
    [id: string]: (success: boolean, result: any) => void;
  } = {};

  private _getState(state: ScriptStateSnapshot, net: NetState) {
    state.tick = this._state.clock.tick;
    state.entities = EntitySetSchema.assign(
      state.entities,
      this._state.entity.entities,
    );
    state.net = NetStateSchema.assign(state.net, net);
    state.environment = EnvironmentParamSchema.assign(
      state.environment,
      this._state.replica.environment,
    );
    state.models = NetModelSetSchema.assign(
      state.models,
      this._state.replica.models,
    );
    state.players = PlayerDisplaySetSchema.assign(
      state.players,
      this._state.replica.players,
    );
    state.particles = ServerParticleSetSchema.assign(
      state.particles,
      this._state.particles.entities,
    );
    state.damage = DamageSetSchema.assign(
      state.damage,
      this._state.replica.damage,
    );
    state.contact = ContactIndexSchema.assign(
      state.contact,
      this._state.contact,
    );
    state.interact = InteractComponentSetSchema.assign(
      state.interact,
      this._state.replica.interactive,
    );
    state.entityName = EntityNameComponentSetSchema.assign(
      state.entityName,
      this._state.replica.entityName,
    );
    state.sound = ServerSoundStateSchema.assign(state.sound, this._state.sound);
    state.playerReplicas = GamePrivateReplicaSetSchema.assign(
      state.playerReplicas,
      this._state.secrets,
    );
    state.entityCounter = this._state.entity.counter;

    // Clear private session id variable
    state.serverPlayers = ServerPlayerListSchema.assign(
      state.serverPlayers,
      this._state.serverPlayers,
    );
    for (let i = 0; i < state.serverPlayers.length; ++i) {
      state.serverPlayers[i].sessionId = '';
    }
  }

  public async synchronizeScriptSrc(project: HotProject) {
    const scriptSrc = ScriptSrcSchema.clone(ScriptSrcSchema.identity);

    const pending: Promise<void>[] = [];
    Object.keys(project.modules).forEach((k) => {
      const module = project.modules[k];
      const load = async () => {
        let src: Uint8Array | undefined;
        // Qm开头的hash模型大概率在IPFS上，优先从IPFS中拉取资源
        if (module.hash.startsWith('Qm')) {
          src = await this._state.content.retrieve(module.hash);

          if (!src) {
            src = await this._state.ossContent.retrieve(module.hash, {
              ossCdnPath: SCRIPT_OSS_CDN_PATH,
            });
          }
        } else {
          src = await this._state.ossContent.retrieve(module.hash, {
            ossCdnPath: SCRIPT_OSS_CDN_PATH,
          });
        }
        if (!src) {
          throw new Error('invalid script hash ' + module.hash);
        }
        const dict = module.isClient
          ? scriptSrc.clientSrc
          : scriptSrc.serverSrc;
        dict[k] = decodeUTF8(src);
      };
      pending.push(load());
    });

    if (pending.length) {
      await Promise.all(pending);
    }
    return () => {
      ScriptSrcSchema.assign(this._state.scriptSrc, scriptSrc);
      ScriptSrcSchema.free(scriptSrc);
    };
  }

  private _getResources(resources: typeof ScriptResourceSchema.identity) {
    Object.keys(this._state.project.modules).forEach((name) => {
      resources.modules[name] = this._state.scriptSrc.serverSrc[name];
    });

    Object.keys(this._state.project.assets).forEach((name) => {
      const asset = this._state.project.assets[name];
      /**
       *  TODO
       *  Picture目前提供给两个地方使用
       *  1. GameUI使用，只在客户端脚本使用
       *  2. 按键皮肤API使用，在服务端脚本使用
       *  理论上此处的assets中不再有AssetType.PICTURE的资源
       *  但是以防出错先保留这段逻辑，未来确保没问题后可以删除
       */
      /**
       * Audio也排除掉，Audio只从audioAssets中取数据
       */
      if (asset.type === AssetType.PICTURE || asset.type === AssetType.AUDIO) {
        return;
      }
      if (name in resources.resources) {
        return;
      }
      const info = (resources.resources[name] =
        ScriptResourceEntrySchema.alloc());
      info.hash = asset.hash;
      info.type = asset.type;
    });

    Object.keys(this._state.project.audioAssets).forEach((name) => {
      const asset = this._state.project.audioAssets[name];

      if (asset.type !== AssetType.AUDIO || name in resources.resources) {
        return;
      }
      const info = (resources.resources[name] =
        ScriptResourceEntrySchema.alloc());
      info.hash = asset.hash;
      info.type = asset.type;
    });

    Object.keys(this._state.project.meshAssets).forEach((name) => {
      const asset = this._state.project.meshAssets[name];
      if (name in resources.resources) {
        return;
      }
      const info = (resources.resources[name] =
        ScriptResourceEntrySchema.alloc());
      info.hash = asset.hash;
      if (asset.hashType === HashType.GLTF_MODEL) {
        info.type = AssetType.GLTF_MODEL;
      } else {
        info.type = AssetType.VOXEL_MODEL;
      }
    });

    Object.keys(this._state.modelInfo.meshHashIndex).forEach((hash) => {
      const mesh = this._state.modelInfo.meshHashIndex[hash];
      resources.meshMotions[hash] = MotionListSchema.clone(mesh.motionList);
      resources.meshRigidBodyOffset[hash] = Vec3Schema.clone(
        mesh.rigidBodyOffset,
      );
      resources.meshRenderBoxOffset[hash] = Vec3Schema.clone(
        mesh.renderBoxOffset,
      );
    });

    resources.meshTable = this._state.modelInfo.meshTableFiles.slice();

    resources.skinTable = this._state.modelInfo.skinTableFiles.slice();

    resources.defaultSkinId = this._state.modelInfo.defaultSkinId;

    Object.keys(this._state.project.pictureAssets).forEach((name) => {
      const asset = this._state.project.pictureAssets[name];
      if (name in resources.resources) {
        return;
      }
      const info = (resources.resources[name] =
        ScriptResourceEntrySchema.alloc());
      info.hash = asset.metadataHash;
      info.type = AssetType.PICTURE;
    });
    const gamepad = this._state.project.gamepad;
    const defaultGamepad = resources.defaultGamepadPath;
    defaultGamepad.joystickBackground = gamepad.joystick.background;
    defaultGamepad.joystickController = gamepad.joystick.controller;
    defaultGamepad.flyButton = gamepad.fly.button;
    defaultGamepad.flyingBackground = gamepad.fly.flyingBackground;
    defaultGamepad.flyingController = gamepad.fly.flyingController;
    Object.keys(gamepad.buttons).forEach((buttonName) => {
      defaultGamepad[buttonName] = gamepad.buttons[buttonName];
    });
  }

  private _getSeedInfo(infoSet: ScriptSeedInfo[]) {
    const seeds = this._state.project.seeds;
    const links = this._state.seed.entityToSeed;

    for (let i = 0; i < links.length; ++i) {
      const id = links[i].id;
      const seedId = links[i].seedId;
      const seed = seeds[seedId];

      const info = ScriptSeedInfoSchema.alloc();
      info.id = id;
      info.seed = seedId;
      info.name = seed.name;
      info.tags.length = 0;
      const tags = seed.tags;
      for (let j = 0; j < tags.length; ++j) {
        info.tags.push(tags[j]);
      }
      info.tags.sort();
      infoSet.push(info);
    }
  }

  private _clearNonSeeds(packet: typeof ScriptInitSchema.identity) {
    const seeds = this._state.seed.entityToSeed;
    packet.state.entities = seeds.map(({ id }) => id);
  }

  private _scriptReady(sessionId: string) {
    return (
      scriptRunState(this._state.script) === GameScriptRunState.RUNNING &&
      sessionId === this._state.script.activeScriptId
    );
  }

  /**
   * Show errors on user debug console
   */
  private _scriptError = (error: ParsedError) => {
    this.logger.info(
      `!!SCRIPT MICROTASK EXCEPTION!!! ${error.message}:${JSON.stringify(
        error.stack?.length > 0 ? error.stack : error,
      )}`,
    );

    if (scriptRunState(this._state.script) !== GameScriptRunState.RUNNING) {
      this.logger.info('error discarded while state was running');
      return;
    }

    this.onException.notify(error);
    ParsedErrorSchema.free(error);
  };

  constructor(spec: {
    netServer: MuServer;
    scriptServer: ScriptServer;
    chat: ChatServer;
    logger: Logger;
    legacyLogger: LegacyLogger;
    state: GameServerState;
    voxels: VoxelServer;
    net: NetServer;
    input: InputServer;
    dialog: DialogServer;
    sql: CommonSQL;
    sound: SoundServer;
    player: PlayerServer;
  }) {
    this._state = spec.state;
    this.moderationMetadata = new ModerationMetadataReporter(() => ({ name: this._state.project.name }));
    this._state.script.runSemaphore = new Semaphore(0);
    this._state.script.stopSemaphore = new Semaphore(1);
    this._state.script.isolateStopSemaphore = new Semaphore(0);

    this.scriptServer = spec.scriptServer;
    this.logger = spec.logger;
    this.legacyLogger = spec.legacyLogger;
    this.chat = spec.chat;
    this.dialog = spec.dialog;
    this.net = spec.net;
    this.input = spec.input;
    this.sound = spec.sound;
    this.player = spec.player;
    const config = getConfigSync();
    // TODO MuServer 应当改为使用 debugjs 来输出log，方便按组件调试
    // 这里因为本来debug就没开过，就都不传logger进去了，后面直接换debug即可
    this.muServer = new MuServer(this.scriptServer, void 0, true);
    this.voxels = new EngineVoxelSync(spec.state, spec.voxels);

    // HACK: Catch errors generated by microtasks within the script execution environment
    if (typeof this.scriptServer.onIsolateException !== 'undefined') {
      const exc = this.scriptServer.onIsolateException;
      exc.sub(this._scriptError);
    }

    this.onException.sub(() => this._state.perf.scriptErrors++);
    this.onConsoleLog.sub(() => this._state.perf.scriptLogLines++);

    this.protocol = this.muServer.protocol(ScriptProtocol);
    this.protocol.configure({
      message: {
        log: (client, logs) => {
          for (let i = 0; i < logs.length; ++i) {
            const { level, message } = logs[i];
            if (this._state.settings.debug) {
              this.logger.trace(`<${client.sessionId}>: ${message}`);
            }
            this.onConsoleLog.notify({ level, message });
          }
        },

        clearLog: () => {
          if (this._state.settings.debug) {
            this.logger.trace('clear log');
          }
          this.onConsoleClear.notify();
        },

        systemLogSink: (client, payload) => {
          const npayload = LogMessageSchema.clone(payload);
          npayload.uuid = this.legacyLogger.uuid;
          npayload.timestamp = new Date();
          for (let i = this.legacyLogger.prefix.length - 1; i >= 0; --i) {
            npayload.prefix.unshift(this.legacyLogger.prefix[i]);
          }
          this.legacyLogger.sink(npayload);
          LogMessageSchema.free(npayload);
        },

        chatLog: (_, chats) => {
          for (let i = 0; i < chats.length; ++i) {
            const { senderId, receiverId, message, duration, hideFloat } =
              chats[i];
            const isPlayer = !!getById(this._state.players, senderId);
            if (isPlayer) {
              this.logger.debug('Script attempted to player say: ' + message);
            } else {
              if (receiverId) {
                this.chat.directMessage(
                  receiverId,
                  filterSwear(message, config.SWEAR_KEY),
                  senderId,
                  duration,
                  hideFloat,
                );
              } else {
                this.chat.broadcast({
                  message: filterSwear(message, config.SWEAR_KEY),
                  senderId,
                  duration,
                  hideFloat,
                });
              }
            }
          }
        },

        dialog: (client, { playerId, promiseId, config }) => {
          if (this._scriptReady(client.sessionId)) {
            this.dialog.openDialog(playerId, promiseId, config);
          }
        },

        cancelAllDialogs: (client, playerId) => {
          if (this._scriptReady(client.sessionId)) {
            this.dialog.cancelAllPlayerDialogs(playerId);
          }
        },

        cancelDialog: (client, { playerId, promiseId }) => {
          if (this._scriptReady(client.sessionId)) {
            this.dialog.cancelPlayerDialog(playerId, promiseId);
          }
        },

        exception: (client, error) => {
          this.onException.notify(error);
        },

        postTick: (client, data) => {
          if (this._scriptReady(client.sessionId)) {
            ScriptPerfCounterSchema.assign(this._state.perf.script, data.perf);
            this._state.script.scriptSync.push(
              ScriptPostTickSchema.clone(data),
            );
          }
        },

        replyEval: (_, { handle, success, expr }) => {
          if (handle in this._pendingEvals) {
            const resolve = this._pendingEvals[handle];
            delete this._pendingEvals[handle];
            resolve(success, expr);
          }
        },

        pump: (client) => {
          // help client clear out their microtask queue
          if (this._scriptReady(client.sessionId)) {
            client.message.poll();
          }
        },

        sound: (client, message) => {
          if (this._scriptReady(client.sessionId)) {
            this.sound.playSound(
              message.soundId,
              message.sample,
              message.position,
              message.radius,
              message.gain,
              message.pitch,
            );
          }
        },
        resumeSound: (client, soundId) => {
          if (this._scriptReady(client.sessionId)) {
            this.sound.resumeSound(soundId);
          }
        },
        pauseSound: (client, soundId) => {
          if (this._scriptReady(client.sessionId)) {
            this.sound.pauseSound(soundId);
          }
        },
        stopSound: (client, soundId) => {
          if (this._scriptReady(client.sessionId)) {
            this.sound.stopSound(soundId);
          }
        },
        setSoundCurrentTime: (client, message) => {
          if (this._scriptReady(client.sessionId)) {
            this.sound.setSoundCurrentTime(
              message.soundId,
              message.currentTime,
            );
          }
        },
        setSoundCurrentTimeAndResume: (client, message) => {
          if (this._scriptReady(client.sessionId)) {
            this.sound.setSoundCurrentTimeAndResume(
              message.soundId,
              message.currentTime,
            );
          }
        },

        kick: (client, playerId) => {
          const conn = getById(this._state.connectionSet, playerId);
          if (conn) {
            this.net.kickSession(conn.sessionId);
          }
        },

        setCameraPitch: (client, { playerId, value }) => {
          this.input.setCameraPitch(playerId, value);
        },

        setCameraYaw: (client, { playerId, value }) => {
          this.input.setCameraYaw(playerId, value);
        },

      },
      connect: (client) => {
        this._state.perf.scriptConnects += 1;
        try {
          this.logger.debug(
            `User script connected: ${
              client.sessionId
            } runState=${scriptRunState(this._state.script)}`,
          );

          this._state.script.activeScriptId = client.sessionId;

          // clear animations
          clearServerKeyframes(this._state);

          // send initialization message to script
          const initPacket = ScriptInitSchema.clone(ScriptInitSchema.identity);

          // Project name
          initPacket.projectName = this._state.project.name;
          initPacket.groupId = config.method === 'local'
            ? resolveGroupStorageNamespace(config)
            : (this._state.settings.groupId &&
                this._state.settings.groupId.toString()) || '';

          // copy resources
          this._getResources(initPacket.resources);

          // copy config
          initPacket.config.entityLimit =
            MAX_BODIES - this._state.settings.playerLimit;
          initPacket.config.url = this._state.settings.gameURL;

          const { serverId } = this._state.settings;
          initPacket.config.serverId = serverId;

          // copy zones
          ZoneSetRDA.stateSchema.assign(
            initPacket.zones,
            this._state.project.zones,
          );

          // set up features
          initPacket.featureFlags.enableTriggerAPI =
            this._state.project.features.enableTriggerAPI;

          // copy initial state
          this._getSeedInfo(initPacket.seed);
          const net = getServerNetState(this._state, this._state.clock.tick);
          if (net) {
            this._getState(initPacket.state, net);
          } else {
            this.logger.error('network physics state not initialized');
            ScriptStateSnapshotSchema.assign(
              initPacket.state,
              ScriptStateSnapshotSchema.identity,
            );
          }

          // copy voxels
          BlockInfoSchema.assign(initPacket.blocks, this._state.blockInfo);
          this.voxels.getVoxelConfig(initPacket.voxels);

          // set script start point
          if (this._state.replica.running) {
            initPacket.scriptIndex = resolveRuntimeScriptEntry(
              this._state.project.scriptIndex,
              this._state.project.assets,
            );
          } else {
            initPacket.scriptIndex = '';
          }
          void this.moderationMetadata.refresh();

          // clear non-seed entities
          this._clearNonSeeds(initPacket);

          // save state into sent script snapshot
          ScriptTickSchema.assign(
            this._state.script.prevTickEvent,
            ScriptTickSchema.identity,
          );
          ScriptStateSnapshotSchema.assign(
            this._state.script.prevTickEvent.state,
            initPacket.state,
          );

          // update collision rules
          if (this._state.replica.running) {
            ScriptCollisionSpecSchema.assign(
              initPacket.collisionFilter,
              this._state.project.collisionRules,
            );
          } else {
            initPacket.collisionFilter.length = 0;
            const rule = SciptCollisionFilterSpecSchema.alloc();
            rule.a = '*';
            rule.b = '*';
            initPacket.collisionFilter.push(rule);
          }

          // send init packetpacket
          try {
            client.message.start(initPacket);
            this.logger.debug('Script server message "start" sended.');
          } catch (err) {
            // TODO 两个catch属实没必要，后面可以去掉其中一个（但得调整一下逻辑
            this.logger.error(
              err,
              'Error sending start message to ScriptShell.',
            );
            this._scriptError(parseError(err));
          }

          // clean up
          ScriptInitSchema.free(initPacket);
        } catch (err) {
          this.logger.error(err, 'Error connecting ScriptShell.');
          this._scriptError(parseError(err));
        }
      },
      disconnect: (client) => {
        this._state.perf.scriptDisconnects += 1;
        const sessionId = client.sessionId;
        try {
          this.logger.debug(
            `User script disconnected: ${client.sessionId} run=${
              GameScriptRunState[scriptRunState(this._state.script)]
            }`,
          );

          // close off any pending promises
          Object.keys(this._pendingEvals).forEach((handle) => {
            const resolve = this._pendingEvals[handle];
            delete this._pendingEvals[handle];
            resolve(false, 'script terminated');
            this.logger.error(
              new Error('Script terminated with pending eval.'),
            );
          });

          // cancel any pending dialogs
          this.dialog.cancelDialog();
        } finally {
          if (this._state.script.markedForDeath[sessionId]) {
            delete this._state.script.markedForDeath[sessionId];
            this._state.script.isolateStopSemaphore.v();
          }
        }

        if (client.sessionId === this._state.script.activeScriptId) {
          this.logger.error(new Error('User script terminated unexpectedly'));
          this.onScriptCrash.notify();
        }
      },
    });

    this.storage = new StorageController({
      state: spec.state,
      server: this.muServer,
      sql: spec.sql,
    });
    this.navigator = new NavigatorServer({
      state: spec.state,
      server: spec.netServer,
      scriptServer: this.muServer,
    });
    this.href = new HrefServer({
      state: spec.state,
      server: spec.netServer,
      scriptServer: this.muServer,
    });
    this.http = new HttpScriptController({
      server: this.muServer,
    });
    this.rtc = new RTCServer({
      state: spec.state,
      server: spec.netServer,
      scriptServer: this.muServer,
    });
    this.gui = new GUIServer({
      state: spec.state,
      server: spec.netServer,
      scriptServer: this.muServer,
    });
    // Keep the engine wire protocol order aligned with GameClient. Marketplace
    // remains a transport-only slot; teleport is backed by the local room
    // allocator instead of the retired platform container API.
    this.marketProtocol = spec.netServer.protocol(MarketProtocol);
    this.marketProtocol.configure({ message: {} });
    this.teleport = new TeleportServer({
      server: spec.netServer,
      scriptServer: this.muServer,
      state: spec.state,
    });
    new ModerationHost(this.muServer, id => this._scriptReady(id), id => {
      const connection = getById(this._state.connectionSet,id);
      return connection ? {userId:connection.sessionData.user.id,ipAddress:connection.sessionData.ipAddress,deviceHash:connection.sessionData.deviceHash} : undefined;
    }, id => {
      const connection = getById(this._state.connectionSet,id);
      if (connection) this.net.kickSession(connection.sessionId);
    });
    this.remoteChannel = new RemoteChannelServer({
      server: spec.netServer,
      scriptServer: this.muServer,
      state: spec.state,
    });
    // Private protocol order must match ScriptShell: moderation, channel, anticheat.
    const audit = process.env.BOX_ANTICHEAT_AUDIT_PATH ? new AnticheatAudit(
      process.env.BOX_ANTICHEAT_AUDIT_PATH, process.env.BOX_DATA_STORAGE_NAMESPACE || 'local',
      message => this.logger.warn(message)) : undefined;
    this.anticheat = new AnticheatHost(this.muServer, spec.netServer, this._state, id => this._scriptReady(id),
      id => id === this._state.script.activeScriptId && !!this.protocol.clients[id], record => audit?.record({ ...record,
        mapId: process.env.BOX_WORLD_PERMANENT_MAP_ID || null,
        mode: process.env.MODE === 'edit' ? 'edit' : 'play',
      }));
    this.muServer.start();
    this.logger.info('Script server started.');
  }

  public preTickApplyScriptUpdates() {
    const state = this._state;

    // if script is blocked or suspended, defer handling any updates
    if (
      state.script.scriptSync.length === 0 ||
      scriptRunState(state.script) !== GameScriptRunState.RUNNING
    ) {
      state.script.scriptBlocked = true;
      return;
    }

    // apply all script synchronize events
    const pendingSync = state.script.scriptSync;
    for (let i = 0; i < pendingSync.length; ++i) {
      const sync = pendingSync[i];

      // apply state updates
      this.voxels.applyVoxelUpdates(sync.voxelUpdates);
      applyScriptEntityUpdates(sync.entityUpdates, this._state);
      applyScriptZoneUpdates(sync.zoneUpdates, this._state);
      applyScriptWorldUpdates(sync.worldUpdates, this._state);

      // sync anim updates
      postTickServerKeyframes(this._state, sync.animations);

      if (
        !ScriptSentEventSchema.equal(
          sync.events,
          ScriptSentEventSchema.identity,
        )
      ) {
        const respawn = sync.events.damage.respawn;
        for (let j = 0; j < respawn.length; ++j) {
          respawnPlayer(this._state, respawn[j]);
        }
        this.net.sendScriptEvents(sync.events);
      }

      ScriptPostTickSchema.free(sync);
    }
    pendingSync.length = 0;

    // clear blocked flag
    state.script.scriptBlocked = false;
  }

  private _bufferEvents() {
    const state = this._state;

    // handle reset condition
    this.voxels.bufferVoxelWrites();

    // update pending buffers
    const pendingEvents = state.script.curTickEvent.events;
    appendSchema(
      VoxelContactEventSchema,
      pendingEvents.physicsEvents.voxelContact,
      state.events.physics.voxelContact,
    );
    appendSchema(
      VoxelContactEventSchema,
      pendingEvents.physicsEvents.voxelSeparate,
      state.events.physics.voxelSeparate,
    );
    appendSchema(
      BodyContactEventSchema,
      pendingEvents.physicsEvents.bodyContact,
      state.events.physics.bodyContact,
    );
    appendSchema(
      BodyContactEventSchema,
      pendingEvents.physicsEvents.bodySeparate,
      state.events.physics.bodySeparate,
    );
    appendSchema(
      FluidContactEventSchema,
      pendingEvents.physicsEvents.fluidContact,
      state.events.physics.fluidContact,
    );
    appendSchema(
      FluidContactEventSchema,
      pendingEvents.physicsEvents.fluidSeparate,
      state.events.physics.fluidSeparate,
    );
    appendSchema(
      ChatLogEventSchema,
      pendingEvents.chatEvents.chats,
      state.events.chat.chats,
    );
    appendSchema(
      ScriptNetInputSchema,
      pendingEvents.inputEvents,
      state.events.net,
    );
    appendSchema(
      ClientKeyboardEventSchema,
      pendingEvents.keyboardEvents,
      state.events.keyboard,
    );
  }

  public postTickSyncScript(netState: NetState) {
    const state = this._state;
    if (scriptRunState(this._state.script) !== GameScriptRunState.RUNNING) {
      return;
    }

    // resync resources
    if (this._state.sync) {
      const resources = ScriptResourceSchema.alloc();
      this._getResources(resources);
      this.protocol.broadcast.syncResources(resources);
      ScriptResourceSchema.free(resources);
    }

    // queue up buffered events
    this._bufferEvents();

    // check if script is blocked, if so then discard
    if (state.script.scriptBlocked) {
      return;
    }

    // construct tick event packet
    const prevEvent = this._state.script.prevTickEvent;
    const tickEvent = this._state.script.curTickEvent;

    // set event state
    this._getState(tickEvent.state, netState);

    // update voxels
    this.voxels.preTick(tickEvent.voxelUpdate);

    // send packet
    const stream = new MuWriteStream(1 << 20);
    ScriptTickSchema.diff(prevEvent, tickEvent, stream);
    this.protocol.broadcastRaw(stream.bytes());
    stream.destroy();

    // swap ticks
    this._state.script.prevTickEvent = tickEvent;
    this._state.script.curTickEvent = prevEvent;

    // clear buffered events
    ScriptVoxelPreTickSchema.assign(
      prevEvent.voxelUpdate,
      ScriptVoxelPreTickSchema.identity,
    );
    ScriptEventsSchema.assign(prevEvent.events, ScriptEventsSchema.identity);
  }

  private _waitForSync = false;
  private _syncFinish = new Semaphore(0);

  public notifySync() {
    if (this._waitForSync) {
      this._waitForSync = false;
      this._syncFinish.v();
    }
  }

  // start running a user script
  public async start() {
    if (this._state.script.runSemaphore.counter > 0) {
      this.logger.info(`Start called while script already running.`);
      return;
    }

    // clear active script id
    this._state.script.activeScriptId = '';
    this.anticheat?.reset();

    // wait for baton
    this.logger.debug(`Wait for all scripts to stop.`);
    await this._state.script.stopSemaphore.p();

    // reset storage
    await this.storage.reset();

    // reset navigator
    this.navigator.reset();

    // reset http
    this.http.reset();

    // reset rtc
    await this.rtc.reset();

    // reset gui
    await this.gui.reset();

    // wait for state to synchronize if we are stuck here
    while (this._state.sync) {
      this._waitForSync = true;
      await this._syncFinish.p();
    }

    // launch script
    try {
      this.logger.debug('Launching script isolate');
      await this.scriptServer.launch('', '');
      this.logger.debug('Script server launched new client.');
    } catch (e) {
      this.logger.error(`Could not start user script`);
      this.logger.error(e);
    }

    // done
    this.logger.info('start finished');

    // signal run semaphore
    this._state.script.runSemaphore.v();
    this.anticheat?.running();
  }

  // stop all running scripts
  public async stop() {
    if (this._state.script.stopSemaphore.counter > 0) {
      this.logger.info('Stop called while script already stopped.');
      return;
    }
    this.logger.debug(`Stopping all scripts...`);

    // wait for the run flag to clear
    await this._state.script.runSemaphore.p();

    // clear active script
    this._state.script.activeScriptId = '';
    this.anticheat?.reset();

    // clear all buffered script inputs
    const pendingSync = this._state.script.scriptSync;
    for (let i = 0; i < pendingSync.length; ++i) {
      ScriptPostTickSchema.free(pendingSync[i]);
    }
    pendingSync.length = 0;

    // Clear all buffered events
    ScriptTickSchema.assign(
      this._state.script.curTickEvent,
      ScriptTickSchema.identity,
    );
    ScriptTickSchema.assign(
      this._state.script.prevTickEvent,
      ScriptTickSchema.identity,
    );

    // terminate all clients
    const clients = this.protocol.clients;
    const ids = Object.keys(clients);

    // clear semaphore
    this._state.script.isolateStopSemaphore.counter = 0;

    let pendingStop = 0;
    for (let i = 0; i < ids.length; ++i) {
      this.logger.trace(`closing user script ${ids[i]}`);
      // omae wa mou shindeiru
      this._state.script.markedForDeath[ids[i]] = true;
      clients[ids[i]].close();
      pendingStop++;
    }

    // wait for all scripts to stop
    if (pendingStop > 0) {
      this.logger.info('wait for script to finish');
      await this._state.script.isolateStopSemaphore.p(pendingStop);
    }

    // clear any evals left open
    Object.keys(this._pendingEvals).forEach((handle) => {
      const resolve = this._pendingEvals[handle];
      delete this._pendingEvals[handle];
      resolve(false, 'script terminated');
      this.logger.error('script terminated with pending eval');
    });

    // signal stop is finished

    this.logger.debug('All scripts stopped.');
    this._state.script.stopSemaphore.v();
  }

  // Evaluates an expression in the script thread
  public async scriptEval(expr: string): Promise<string> {
    const handle = this._handleCounter++;
    return new Promise((resolve, reject) => {
      if (scriptRunState(this._state.script) !== GameScriptRunState.RUNNING) {
        return reject(new Error('script not running'));
      }
      const activeClient =
        this.protocol.clients[this._state.script.activeScriptId];
      if (!activeClient) {
        return reject(new Error('internal script error'));
      }
      this._pendingEvals[handle] = (success, result) => {
        if (success) {
          resolve(result);
        } else {
          reject(result);
        }
      };
      activeClient.message.invokeEval({
        handle,
        expr,
      });
    });
  }
}
