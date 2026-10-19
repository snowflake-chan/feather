import { ScriptEntitySync, ScriptEntityWrapper } from './entity-synchronizer';
import { MuStruct } from '@box/mudb/schema';
import { ScriptDispatcher } from '@box/schema/script/dispatcher';
import {
  ScriptPostTick,
  ScriptConfig,
  ScriptPerfCounter,
} from '../script-protocol';
import { ScriptStateSnapshot } from '../script-state-schema';
import { Logger } from '@box/utils/logger';
import { ScriptVoxelSync } from './voxel-synchronizer';
import { GameVector3, GameBounds3 } from '@box/schema/api/js/math';
import {
  VoxelRaycastHitResult,
  raycast,
} from '@box/schema/voxel/voxel-raycast';
import {
  coerceNum,
  coerceVec3,
  coerceObject,
  coerceBool,
  coerceBounds,
  coerceString,
} from './coerce';
import { vec3 } from 'gl-matrix';
import {
  BodyRaycastSchema,
  raycastBoxes,
} from '@box/schema/physics/raycast-bodies';
import {
  GameWorld,
  GameRaycastOptions,
  GameTickEvent,
  GameEntityEvent,
  GameEntityContactEvent,
  GameVoxelContactEvent,
  GameFluidContactEvent,
  GameChatEvent,
  GameInputEvent,
  GameRaycastResult,
  GameEntity,
  GameClickEvent,
  GameDamageEvent,
  GameRespawnEvent,
  GameDieEvent,
  GameInteractEvent,
  GameDialogParams,
  GameDialogResponse,
  GamePlayerEntityEvent,
  GameWorldKeyframe,
  NavigatorEventType,
  Sound,
  TeleportType,
  TeleportResult,
} from '@box/schema/api/js/api';
import {
  WorldPhysicsBinding,
  WorldSkyBinding,
  WorldRainBinding,
  WorldSnowBinding,
  WorldSoundBinding,
  WorldFogBinding,
} from './world-bindings';
import { ScriptResourceSync } from './resource';
import { BlockInfo, BlockIndex } from '@box/schema/voxel/block-schema';
import { ScriptShell } from '../script-shell';
import { ScriptZoneSystem } from './zone-synchronizer';
import { PlaySoundPosition } from '@box/schema/sound/sound-protocol';
import { ScriptSynchronizer } from './synchronizer';
import { ScriptPhysicsSelectorManager } from './physics-selector';
import * as GameURL from '@box/schema/api/js/url';
import {
  ScriptAnimationManager,
  ScriptAnimationTarget,
  ScriptParserAPI,
} from './animations';
import { WORLD_ANIM_BINDING } from '@box/schema/keyframes/bindings/world-animation';
import { ScriptScheduler } from '@box/utils/script/script-scheduler';
import { ParsedSelector } from './selectors';
import { getById } from '@box/utils/id';
import {
  NavigatorEventListener,
  PostMessageScriptType,
} from '@box/schema/navigator/navigator-schema';

export const ScriptWorldUpdateSchema = new MuStruct({
  physics: WorldPhysicsBinding,
  fog: WorldFogBinding,
  sky: WorldSkyBinding,
  rain: WorldRainBinding,
  snow: WorldSnowBinding,
  sound: WorldSoundBinding,
});
export type ScriptWorldUpdate = typeof ScriptWorldUpdateSchema['identity'];

const coerceRaycastOptions = coerceObject<GameRaycastOptions>({
  maxDistance: coerceNum,
  ignoreFluid: coerceBool,
  ignoreEntities: coerceBool,
  ignoreVoxel: coerceBool,
  ignoreSelector: coerceString,
});

export class ScriptWorldSync {
  public world: GameWorld;
  public entity: ScriptEntitySync;
  public resource: ScriptResourceSync;
  public physicsSelectors = new ScriptPhysicsSelectorManager();

  public perf: ScriptPerfCounter;

  public zones: ScriptZoneSystem;

  public onTick = new ScriptDispatcher<GameTickEvent>();

  public onPlayerJoin = new ScriptDispatcher<GamePlayerEntityEvent>();
  public onPlayerLeave = new ScriptDispatcher<GamePlayerEntityEvent>();
  public onEntityCreate = new ScriptDispatcher<GameEntityEvent>();
  public onEntityDestroy = new ScriptDispatcher<GameEntityEvent>();

  public onDamage = new ScriptDispatcher<GameDamageEvent>();
  public onDie = new ScriptDispatcher<GameDieEvent>();
  public onRespawn = new ScriptDispatcher<GameRespawnEvent>();

  public onEntityContact = new ScriptDispatcher<GameEntityContactEvent>();
  public onEntitySeparate = new ScriptDispatcher<GameEntityContactEvent>();
  public onVoxelContact = new ScriptDispatcher<GameVoxelContactEvent>();
  public onVoxelSeparate = new ScriptDispatcher<GameVoxelContactEvent>();
  public onFluidEnter = new ScriptDispatcher<GameFluidContactEvent>();
  public onFluidLeave = new ScriptDispatcher<GameFluidContactEvent>();

  public onChat = new ScriptDispatcher<GameChatEvent>();
  public onClick = new ScriptDispatcher<GameClickEvent>();
  public onPress = new ScriptDispatcher<GameInputEvent>();
  public onRelease = new ScriptDispatcher<GameInputEvent>();

  public onInteract = new ScriptDispatcher<GameInteractEvent>();

  public logger: Logger;

  public config: ScriptConfig;

  public animationManager: ScriptAnimationManager<
    GameWorld,
    GameWorldKeyframe,
    typeof WORLD_ANIM_BINDING
  >;
  public animations: ScriptAnimationTarget<
    GameWorld,
    GameWorldKeyframe,
    typeof WORLD_ANIM_BINDING
  >;

  private _say: (
    senderId: number,
    recieverId: number,
    message: string,
    options?: { duration?: number; hideFloat?: boolean },
  ) => void;
  private _teleport: (
    mapId: string,
    playerIds: number[],
    serverId?: string,
  ) => Promise<TeleportResult>;
  private _playSound: (
    sample: string,
    position: PlaySoundPosition,
    gain: number,
    pitch: number,
    radius: number,
  ) => Sound;

  private _voxel: ScriptVoxelSync;
  private _blockInfo: BlockInfo;
  private _blockIndex: BlockIndex;


  private _shell: ScriptShell;
  private _schedule: <EventType extends { tick: number }>(
    dispatcher: ScriptDispatcher<EventType>,
    ev: EventType,
  ) => void;
  private _onEntityCreate = (entity: ScriptEntityWrapper) => {
    const t = this._shell.prevTickEvent.state.tick;
    const event = new GameEntityEvent(t, entity.entity);
    this._schedule(this.onEntityCreate, event);
    if (entity.isPlayer) {
      this._schedule(this.onPlayerJoin, <GamePlayerEntityEvent>event);
    }
  };
  private _onEntityDestroy = (entity: ScriptEntityWrapper) => {
    const t = this._shell.prevTickEvent.state.tick;
    const event = new GameEntityEvent(t, entity.entity);
    if (entity.isPlayer) {
      this._schedule(this.onPlayerLeave, <GamePlayerEntityEvent>event);
    }
    this._schedule(entity.onDestroy, event);
    this._schedule(this.onEntityDestroy, event);
  };

  public raycast = (
    origin: GameVector3,
    direction: GameVector3,
    options?: Partial<GameRaycastOptions>,
  ) => {
    const {
      x: ox,
      y: oy,
      z: oz,
    } = coerceVec3(origin, new GameVector3(0, 0, 0));
    let {
      x: dx,
      y: dy,
      z: dz,
    } = coerceVec3(direction, new GameVector3(0, 0, 0));
    const {
      maxDistance,
      ignoreEntities,
      ignoreFluid,
      ignoreVoxel,
      ignoreSelector,
    } = coerceRaycastOptions(options || {}, {
      maxDistance: Infinity,
      ignoreFluid: false,
      ignoreEntities: false,
      ignoreVoxel: false,
      ignoreSelector: '',
    });

    const l = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (l > 1e-8) {
      dx /= l;
      dy /= l;
      dz /= l;
    }

    const result = new GameRaycastResult(
      false,
      null,
      0,
      new GameVector3(ox, oy, oz),
      new GameVector3(dx, dy, dz),
      maxDistance,
      new GameVector3(0, 0, 0),
      new GameVector3(0, 0, 0),
      new GameVector3(0, 0, 0),
    );

    if (!ignoreEntities) {
      const bodyRaycast = BodyRaycastSchema.alloc();
      let { bodies } = this._shell.prevTickEvent.state.net;
      if (ignoreSelector) {
        const selector = new ParsedSelector(ignoreSelector);
        bodies = this.entity.entities
          .filter((e) => !selector.testEntity(e))
          .map((e) => getById(bodies, e.id)!)
          .filter((o) => o!);
      }
      if (raycastBoxes(bodyRaycast, bodies, ox, oy, oz, dx, dy, dz, 0)) {
        const e = this.entity.entityIndex.get(bodyRaycast.hitId);
        if (e && bodyRaycast.hitTime < maxDistance) {
          result.hit = true;
          result.hitEntity = e.entity;
          result.distance = bodyRaycast.hitTime;

          result.normal.x = bodyRaycast.hitNormal[0];
          result.normal.y = bodyRaycast.hitNormal[1];
          result.normal.z = bodyRaycast.hitNormal[2];

          result.hitPosition.x = bodyRaycast.hitPosition[0];
          result.hitPosition.y = bodyRaycast.hitPosition[1];
          result.hitPosition.z = bodyRaycast.hitPosition[2];
        }
      }
      BodyRaycastSchema.free(bodyRaycast);
    }

    if (!ignoreVoxel) {
      const rayHit = new VoxelRaycastHitResult();
      if (
        raycast(
          rayHit,
          this._blockIndex,
          this._voxel.voxels,
          vec3.fromValues(ox, oy, oz),
          vec3.fromValues(dx, dy, dz),
          result.distance,
          ignoreFluid,
        )
      ) {
        result.hit = true;
        result.hitEntity = null;
        result.hitVoxel = rayHit.hitBlock;

        result.distance = rayHit.hitDistance;

        result.hitPosition.x = rayHit.hitPosition[0];
        result.hitPosition.y = rayHit.hitPosition[1];
        result.hitPosition.z = rayHit.hitPosition[2];

        result.voxelIndex.x = rayHit.hitVoxel[0];
        result.voxelIndex.y = rayHit.hitVoxel[1];
        result.voxelIndex.z = rayHit.hitVoxel[2];

        result.normal.x = rayHit.hitNormal[0];
        result.normal.y = rayHit.hitNormal[1];
        result.normal.z = rayHit.hitNormal[2];
      }
    }

    return result;
  };

  public searchBox = (bounds: GameBounds3) => {
    const {
      lo: { x: lox, y: loy, z: loz },
      hi: { x: hix, y: hiy, z: hiz },
    } = coerceBounds(
      bounds,
      new GameBounds3(
        new GameVector3(Infinity, Infinity, Infinity),
        new GameVector3(-Infinity, -Infinity, -Infinity),
      ),
    );
    const entities: GameEntity[] = [];
    const bodies = this._shell.prevTickEvent.state.net.bodies;
    for (let i = 0; i < bodies.length; ++i) {
      const { id, px, py, pz, rx, ry, rz } = bodies[i];
      if (
        px - rx < hix &&
        lox < px + rx &&
        py - ry < hiy &&
        loy < py + ry &&
        pz - rz < hiz &&
        loz < pz + rz
      ) {
        const wrapper = this.entity.entityIndex.get(id);
        if (wrapper && !wrapper.destroyed) {
          entities.push(wrapper.entity);
        }
      }
    }
    return entities;
  };

  public addCollisionFilter = (a: string, b: string) => {
    this.physicsSelectors.addFilter(a + '', b + '');
  };

  public removeCollisionFilter = (a: string, b: string) => {
    this.physicsSelectors.removeFilter(a + '', b + '');
  };

  public clearCollisionFilters = () => {
    this.physicsSelectors.clear();
    this.zones.rebuildPhysicsSelectorIndex();
  };

  public collisionFilters = () => {
    return this.physicsSelectors.list();
  };

  constructor(spec: {
    perf: ScriptPerfCounter;
    blockInfo: BlockInfo;
    blockIndex: BlockIndex;
    config: ScriptConfig;
    resource: ScriptResourceSync;
    voxel: ScriptVoxelSync;
    shell: ScriptShell;
    schedule: <EventType extends { tick: number }>(
      dispatcher: ScriptDispatcher<EventType>,
      ev: EventType,
    ) => void;
    scheduler: ScriptScheduler;
    logger: Logger;
    say: (
      senderId: number,
      recieverId: number,
      message: string,
      options?: { duration?: number; hideFloat?: boolean },
    ) => void;
    hurtEntity: (
      target: ScriptEntityWrapper,
      attacker: ScriptEntityWrapper | null,
      amount: number,
      type: string,
    ) => void;
    forceRespawn: (entity: ScriptEntityWrapper) => void;
    openDialog: (
      entity: ScriptEntityWrapper,
      params: GameDialogParams,
    ) => Promise<GameDialogResponse>;
    cancelDialogs: (entity: ScriptEntityWrapper) => void;
    openLink: (
      entity: ScriptEntityWrapper,
      href: string,
      options?: { isConfirm?: boolean; isNewTab?: boolean },
    ) => void;
    postMessage: (
      entity: ScriptEntityWrapper,
      content: PostMessageScriptType,
    ) => void;
    addEventListener: (
      entity: ScriptEntityWrapper,
      type: NavigatorEventType,
      listener: NavigatorEventListener,
    ) => void;
    playSound: (
      sample: string,
      position: PlaySoundPosition,
      gain: number,
      pitch: number,
      radius: number,
    ) => Sound;
    keyframeParser: ScriptParserAPI;
    kick: (playerId: number) => void;
    setCameraPitch: (playerId: number, value: number) => void;
    setCameraYaw: (playerId: number, value: number) => void;
    teleport: (
      mapId: string,
      playerIds: number[],
      serverId?: string,
    ) => Promise<TeleportResult>;
  }) {
    this.logger = spec.logger.create('world');
    this.config = spec.config;
    this.resource = spec.resource;
    this.perf = spec.perf;
    this._shell = spec.shell;
    this._schedule = spec.schedule;
    this._say = spec.say;
    this._teleport = spec.teleport;
    this._playSound = spec.playSound;
    this._blockInfo = spec.blockInfo;
    this._blockIndex = spec.blockIndex;


    this.animationManager = new ScriptAnimationManager(
      WORLD_ANIM_BINDING,
      this._schedule,
      spec.scheduler,
      this.perf,
      spec.keyframeParser,
      spec.config,
    );
    this.animations = this.animationManager.createAnimationGroup(0, <any>null);
    this.entity = new ScriptEntitySync(
      this.config,
      this.resource,
      spec.logger.create('entity'),
      this.perf,
      spec.scheduler,
      this._onEntityCreate,
      this._onEntityDestroy,
      spec.schedule,
      this._say,
      spec.kick,
      spec.hurtEntity,
      spec.forceRespawn,
      spec.openDialog,
      spec.cancelDialogs,
      spec.openLink,
      spec.postMessage,
      spec.addEventListener,
      spec.playSound,
      spec.setCameraPitch,
      spec.setCameraYaw,
      this.physicsSelectors,
      spec.keyframeParser,
    );
    this.zones = new ScriptZoneSystem(
      this.resource,
      spec.schedule,
      spec.scheduler,
      this.physicsSelectors,
      this.perf,
    );
    this._voxel = spec.voxel;
    this.world = new GameWorld(
      new GameURL.URL(spec.config.url || 'https://localhost'),
      this.entity.quota,
      this.onRespawn.channel,
      this.onRespawn.future,
      this.entity.createEntity,
      this.entity.querySelector,
      this.entity.querySelectorAll,
      this.entity.testSelector,
      this.addCollisionFilter,
      this.removeCollisionFilter,
      this.clearCollisionFilters,
      this.collisionFilters,
      this.raycast,
      this.searchBox,
      this.animations.animate,
      this.animations.getAnimations,
      this.entity.animations.getAnimations,
      this.entity.playerAnimations.getAnimations,
      this.onTick.channel,
      this.onTick.future,
      this.onDamage.channel,
      this.onDamage.future,
      this.onDie.channel,
      this.onDie.future,
      this.onPlayerJoin.channel,
      this.onPlayerJoin.future,
      this.onPlayerLeave.channel,
      this.onPlayerLeave.future,
      this.onEntityCreate.channel,
      this.onEntityCreate.future,
      this.onEntityDestroy.channel,
      this.onEntityDestroy.future,
      this.say,
      this.onChat.channel,
      this.onChat.future,
      this.onClick.channel,
      this.onClick.future,
      this.onPress.channel,
      this.onPress.future,
      this.onRelease.channel,
      this.onRelease.future,
      this.onEntityContact.channel,
      this.onEntityContact.future,
      this.onEntitySeparate.channel,
      this.onEntitySeparate.future,
      this.onVoxelContact.channel,
      this.onVoxelContact.future,
      this.onVoxelSeparate.channel,
      this.onVoxelSeparate.future,
      this.onFluidEnter.channel,
      this.onFluidEnter.future,
      this.onFluidLeave.channel,
      this.onFluidLeave.future,
      this.zones.listZones,
      this.zones.addZone,
      this.zones.removeZone,
      this.onInteract.channel,
      this.onInteract.future,
      this.playWorldSound,
      this.teleport,
      spec.config.serverId,
    );
    this.animations.target = this.world;
  }


  public say = (message: string) => {
    this._say(0, 0, message);
  };

  public preTick(state: ScriptStateSnapshot) {
    this.world.currentTick = state.tick;
    this.entity.preTick(state);
    WorldPhysicsBinding.preTick(this.world, state.net.physics, this.resource);
    WorldSkyBinding.preTick(this.world, state.environment.sky, this.resource);
    WorldFogBinding.preTick(this.world, state.environment.fog, this.resource);
    WorldSnowBinding.preTick(this.world, state.environment.snow, this.resource);
    WorldRainBinding.preTick(this.world, state.environment.rain, this.resource);
    WorldSoundBinding.preTick(this.world, state.sound.ambient, this.resource);

    this.animationManager.preTick(state.tick);
  }

  private _tickWorldComponent<
    Binding extends ScriptSynchronizer<GameWorld, any>,
  >(
    binding: Binding,
    engine: Binding['engineSchema']['identity'],
    update: Binding['identity'],
  ) {
    const u = binding.postTick(this.world, engine, this.resource);
    if (u) {
      binding.assign(update, u);
      binding.free(u);
    } else {
      binding.assign(update, binding.identity);
    }
  }

  public postTick(packet: ScriptPostTick, state: ScriptStateSnapshot) {
    this.perf.animationsLive =
      this.perf.entitiesLive =
      this.perf.playersLive =
      this.perf.zonesLive =
        0;

    this.entity.postTick(packet, state);
    this.zones.postTick(packet.zoneUpdates);

    const update = packet.worldUpdates;
    this._tickWorldComponent(
      WorldPhysicsBinding,
      state.net.physics,
      update.physics,
    );
    this._tickWorldComponent(
      WorldFogBinding,
      state.environment.fog,
      update.fog,
    );
    this._tickWorldComponent(
      WorldSkyBinding,
      state.environment.sky,
      update.sky,
    );
    this._tickWorldComponent(
      WorldSnowBinding,
      state.environment.snow,
      update.snow,
    );
    this._tickWorldComponent(
      WorldRainBinding,
      state.environment.rain,
      update.rain,
    );
    this._tickWorldComponent(
      WorldSoundBinding,
      state.sound.ambient,
      update.sound,
    );

    this.animationManager.postTick(packet.animations.world);
  }

  public playWorldSound = (
    spec:
      | string
      | {
          sample: string;
          position?: GameVector3;
          pitch?: number;
          gain?: number;
          radius?: number;
        },
  ) => {
    if (typeof spec === 'string') {
      return this._playSound(spec, { type: 'global', data: void 0 }, 1, 1, 0);
    } else if (typeof spec === 'object') {
      const sample = '' + spec.sample || '';
      const pitch = 'pitch' in spec ? +(spec.pitch || 0) : 1;
      const gain = 'gain' in spec ? +(spec.gain || 0) : 1;
      const radius = +(spec.radius || 0);
      if ('position' in spec && radius) {
        const b = coerceVec3(spec.position, new GameVector3(0, 0, 0));
        return this._playSound(
          sample,
          { type: 'position', data: vec3.fromValues(b[0], b[1], b[2]) },
          gain,
          pitch,
          radius,
        );
      } else {
        return this._playSound(
          sample,
          { type: 'global', data: void 0 },
          gain,
          pitch,
          radius,
        );
      }
    }
    throw new Error('invalid arguments world.sound()');
  };

  public teleport: TeleportType = (mapId, players, serverId) => {
    if (
      !mapId ||
      typeof mapId !== 'string' ||
      !Array.isArray(players) ||
      players.length <= 0 ||
      players.length > 50 ||
      (typeof serverId !== 'undefined' && typeof serverId !== 'string')
    ) {
      throw new Error('invalid arguments world.teleport()');
    }
    const playerIds: number[] = [];
    for (const playerEntity of players) {
      const entityWrapper = this.entity.getEntityWrapper(playerEntity);
      if (!entityWrapper || !entityWrapper.isPlayer) {
        throw new Error('invalid arguments world.teleport()');
      }
      playerIds.push(entityWrapper.id);
    }
    return this._teleport(mapId, playerIds, serverId);
  };

}
