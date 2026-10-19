import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { MuSocket } from '@box/mudb/socket/socket';
import { MuReadStream } from '@box/mudb/stream';
import { GameConsole, GameLogLevel } from '@box/schema/api/console';
import {
  GameAssetType,
  GameButtonType,
  GameChatEvent,
  GameClickEvent,
  GameDamageEvent,
  GameDialogParams,
  GameDialogResponse,
  GameDieEvent,
  GameEntity,
  GameEntityContactEvent,
  GameFluidContactEvent,
  GameInputEvent,
  GameInteractEvent,
  GameKeyBoardEvent,
  GamePlayerEntity,
  GameRaycastResult,
  GameRespawnEvent,
  GameTickEvent,
  GameVoxelContactEvent,
  Sound,
} from '@box/schema/api/js/api';
import {
  SendClientEventType,
  ServerRemoteChannel,
} from '@box/schema/api/js/remote-channel';
import {
  GameBounds3,
  GameRGBAColor,
  GameRGBColor,
  GameVector3,
} from '@box/schema/api/js/math';
import * as GameURL from '@box/schema/api/js/url';
import { MS_PER_TICK } from '@box/schema/clock/clock-schema';
import {
  DialogCommonConfig,
  DialogConfig,
  DialogResult,
  DialogSelectResult,
} from '@box/schema/dialog/dialog-protocol';
import { HurtEventSchema } from '@box/schema/events/damage-event-schema';
import { ScriptSentEventSchema } from '@box/schema/events/script-events';
import { NetInputEvent, NetInputEventBits } from '@box/schema/net/net-schema';
import { PlayerFlags } from '@box/schema/player/player-schema';
import { EnvironmentSkyType } from '@box/schema/project/project-rda';
import {
  DISPATCHER_CREATE_COUNT,
  DISPATCHER_DESTROY_COUNT,
  DISPATCHER_EVENT_COUNT,
  DISPATCHER_HANDLER_COUNT,
  DISPATCHER_PROMISE_COUNT,
  ScriptDispatcher,
} from '@box/schema/script/dispatcher';
import { PlaySoundPosition } from '@box/schema/sound/sound-protocol';
import {
  BlockIndexSchema,
  BlockInfoSchema,
} from '@box/schema/voxel/block-schema';
import { unpackBlockIndex } from '@box/schema/voxel/blocks';
import { getById } from '@box/utils/id';
import { LogMessage, LogMessageSchema, Logger } from '@box/utils/logger';
import { createMuLogger } from '@box/utils/mutracer';
import { createScriptScheduler } from '@box/utils/script/script-scheduler';

import { vec3 } from 'gl-matrix';
import type { Level } from 'pino';

import { GUIScriptShell } from '../gui/gui-script';
import { HrefScriptShell } from '../href/href-script';
import { HttpScriptShell } from '../http/http-script';
import { NavigatorScriptShell } from '../navigator/navigator-script';
import { RTCScriptShell } from '../rtc/rtc-script';
import { StorageSynchronizer } from '../storage/storage-script';
import { TeleportScriptShell } from '../teleport/teleport-script';
import { ModerationScript } from '../moderation/moderation-script';
import { AnticheatScript } from '../anticheat/anticheat-script';
import { warnDeprecate } from '../utils/deprecate';
import { PromiseWrapper } from '../utils/script-promise';
import { ScriptParserAPI } from './bindings/animations';
import { createScriptAPI } from './bindings/api';
import { WRAPPER_INDEX } from './bindings/binding-factory';
import {
  coerceBool,
  coerceRGBA,
  coerceString,
  coerceVec3,
} from './bindings/coerce';
import { unpackAxis } from './bindings/entity-bindings';
import { ScriptEntityWrapper } from './bindings/entity-synchronizer';
import { WRAPPER_PLAYER_INDEX } from './bindings/binding-factory';
import { ScriptResourceSync } from './bindings/resource';
import {
  ScriptVoxelSync,
  VOXEL_TYPE_MASK,
} from './bindings/voxel-synchronizer';
import { ScriptWorldSync } from './bindings/world-synchronizer';
import { ParsedErrorSchema, parseError } from './parse-error';
import { createSafeEval, createUnsafeEval } from './safe-eval';
import { RemoteChannelScriptShell } from '../remote-channel/channel-script';
import {
  ScriptConfigSchema,
  ScriptPerfCounterSchema,
  ScriptPostTickSchema,
  ScriptProtocol,
  ScriptTickSchema,
} from './script-protocol';
import { ScriptEvents, ScriptStateSnapshotSchema } from './script-state-schema';

const RESPAWN_TIME = 16;
const MAX_LOGS_PER_TICK = 32;
const MAX_CHATS_PER_TICK = 64;

const BUTTONS = [
  { f: NetInputEventBits.ACTION0, t: GameButtonType.ACTION0 },
  { f: NetInputEventBits.ACTION1, t: GameButtonType.ACTION1 },
  { f: NetInputEventBits.CROUCH, t: GameButtonType.CROUCH },
  { f: NetInputEventBits.WALK, t: GameButtonType.WALK },
  { f: NetInputEventBits.DOUBLE_JUMP, t: GameButtonType.DOUBLE_JUMP },
  { f: NetInputEventBits.FLY, t: GameButtonType.FLY },
  { f: NetInputEventBits.JUMP, t: GameButtonType.JUMP },
  { f: NetInputEventBits.RUN, t: GameButtonType.RUN },
];

function packDialogParams(params: GameDialogParams): DialogConfig {
  const commonProp: DialogCommonConfig = {
    title: coerceString(params.title || '', ''),
    content: coerceString(params.content || '', ''),
    titleBackgroundColor: coerceRGBA(
      params.titleBackgroundColor,
      new GameRGBAColor(1, 1, 1, 1),
    ),
    titleTextColor: coerceRGBA(
      params.titleTextColor,
      new GameRGBAColor(0, 0, 0, 1),
    ),
    contentBackgroundColor: coerceRGBA(
      params.contentBackgroundColor,
      new GameRGBAColor(0, 0, 0, 0.56),
    ),
    contentTextColor: coerceRGBA(
      params.contentTextColor,
      new GameRGBAColor(1, 1, 1, 1),
    ),

    lookTargetEnabled: false,
    lookTargetEntity: 0,
    lookTargetOffset: new GameVector3(0, 0, 0),

    lookUpEnabled: false,
    lookUp: new GameVector3(0, 0, 0),

    lookEyeEnabled: false,
    lookEyeEntity: 0,
    lookEyeOffset: new GameVector3(0, 0, 0),
  };

  const target = params.lookTarget;
  if (target instanceof GameEntity) {
    const wrapper = WRAPPER_INDEX.get(target);
    if (wrapper) {
      commonProp.lookTargetEnabled = true;
      commonProp.lookTargetEntity = wrapper.id;
      coerceVec3(params.lookTargetOffset, <any>commonProp.lookTargetOffset);
    }
  } else if (target) {
    commonProp.lookTargetEnabled = true;
    coerceVec3(target, <any>commonProp.lookTargetOffset);
  }

  const up = params.lookUp;
  if (up) {
    commonProp.lookUpEnabled = true;
    coerceVec3(up, <any>commonProp.lookUp);
  }

  const eye = params.lookEye;
  if (eye instanceof GameEntity) {
    const wrapper = WRAPPER_INDEX.get(eye);
    if (wrapper) {
      commonProp.lookEyeEnabled = true;
      commonProp.lookEyeEntity = wrapper.id;
      coerceVec3(params.lookEyeOffset, <any>commonProp.lookEyeOffset);
    }
  } else if (eye) {
    commonProp.lookEyeEnabled = true;
    coerceVec3(eye, <any>commonProp.lookEyeOffset);
  }

  switch (params.type) {
    case 'text':
      return {
        type: 'text',
        data: {
          common: commonProp,
          hasArrow: coerceBool(params.hasArrow, false),
        },
      };
    case 'select':
      return {
        type: 'select',
        data: {
          common: commonProp,
          options: params.options || [],
        },
      };
    case 'input':
      return {
        type: 'input',
        data: {
          common: commonProp,
          placeholder: params.placeholder || '',
          confirmText: params.confirmText || '',
        },
      };
  }
  throw new Error('invalid dialog parameters');
}

// TODO: expand this as more dialog results are added
function unpackDialogResult(result: DialogResult): GameDialogResponse {
  const { data } = result;
  switch (result.type) {
    case 'close':
      return null;
    case 'text':
      return <string>data;
    case 'select':
      return {
        index: (data as DialogSelectResult).index,
        value: (data as DialogSelectResult).value,
      };
    case 'input':
      return <string>data;
  }
  return null;
}

export type ScriptShellSysLog = (
  level: Level,
  object: any,
  message?: any,
  ...args: any[]
) => void;

export class ScriptShell {
  public client: MuClient;
  public protocol: MuClientProtocol<typeof ScriptProtocol>;

  public config = ScriptConfigSchema.clone(ScriptConfigSchema.identity);

  public scheduler: ReturnType<typeof createScriptScheduler>;
  public prevTickEvent = ScriptTickSchema.clone(ScriptTickSchema.identity);

  public voxels: ScriptVoxelSync;
  public world: ScriptWorldSync;
  public resource: ScriptResourceSync;
  public console: GameConsole;
  public api: ReturnType<typeof createScriptAPI>;
  public logger: Logger;
  public storage: StorageSynchronizer;
  public href: HrefScriptShell;
  public http: HttpScriptShell;
  public rtc: RTCScriptShell;
  public gui: GUIScriptShell;
  public navigator: NavigatorScriptShell;
  public teleport: TeleportScriptShell;
  public remoteChannel: RemoteChannelScriptShell;
  public perf = ScriptPerfCounterSchema.clone(ScriptPerfCounterSchema.identity);

  public keyframeParser: ScriptParserAPI;

  public blockIndex = BlockIndexSchema.clone(BlockIndexSchema.identity);
  public blockInfo = BlockInfoSchema.clone(BlockInfoSchema.identity);

  public pendingEvents = ScriptSentEventSchema.alloc();

  public promiseCounter = 0;
  public pendingDialogs: {
    [promiseId: number]: (result: GameDialogResponse) => void;
  } = {};
  public miaoShellsPromiseWrappers: {
    [promiseId: number]: PromiseWrapper<number>;
  } = {};

  public soundCounter = 0;

  private _eval: {
    expr: (x: string) => any;
    module: (env: { [id: string]: any }, src: string, filename: string) => any;
  } = {
    expr: () => {},
    module: () => {},
  };

  private _reconstructRaycast(ev: NetInputEvent) {
    const origin = new GameVector3(
      ev.rayOrigin[0],
      ev.rayOrigin[1],
      ev.rayOrigin[2],
    );
    const direction = new GameVector3(
      ev.rayDirection[0],
      ev.rayDirection[1],
      ev.rayDirection[2],
    );
    const l = Math.sqrt(
      Math.pow(direction.x, 2) +
        Math.pow(direction.y, 2) +
        Math.pow(direction.z, 2),
    );
    if (l > 1e-8) {
      direction.x /= l;
      direction.y /= l;
      direction.z /= l;
    }
    const entity = this.world.entity.entityIndex.get(ev.rayHitEntity);
    const index = new GameVector3(
      ev.rayHitVoxelX,
      ev.rayHitVoxelY,
      ev.rayHitVoxelZ,
    );
    const t = Math.max(ev.rayTime, 0);
    const position = new GameVector3(
      origin.x + direction.x * t,
      origin.y + direction.y * t,
      origin.z + direction.z * t,
    );
    const normal = new GameVector3(
      ev.rayHitNormal[0],
      ev.rayHitNormal[1],
      ev.rayHitNormal[2],
    );
    const nl = Math.sqrt(
      Math.pow(normal.x, 2) + Math.pow(normal.y, 2) + Math.pow(normal.z, 2),
    );
    if (nl > 1e-8) {
      normal.x /= nl;
      normal.y /= nl;
      normal.z /= nl;
    }
    return new GameRaycastResult(
      ev.rayTime >= 0,
      entity ? entity.entity : null,
      ev.rayTime >= 0 && !ev.rayHitEntity
        ? this.voxels.getVoxel(
            ev.rayHitVoxelX,
            ev.rayHitVoxelY,
            ev.rayHitVoxelZ,
          )
        : 0,
      origin,
      direction,
      ev.rayTime < 0 ? Infinity : ev.rayTime,
      position,
      normal,
      index,
    );
  }

  private _dispatch = <EventType extends { tick: number }>(
    dispatcher: ScriptDispatcher<EventType>,
    event: EventType,
  ) => {
    this.scheduler.scheduleAt(
      () =>
        dispatcher.notify(event, (e) => {
          const err = e instanceof Error ? e : new Error(JSON.stringify(e));
          this.sysLog('error', err, 'Error in script event handler.');
          this.raiseException(err);
        }),
      event.tick * MS_PER_TICK,
    );
  };

  private _prevTickMS: number = Date.now();
  private _dispatchEvents(
    event: ScriptEvents,
    prevTick: number,
    skip: boolean,
  ) {
    const tick = this.prevTickEvent.state.tick;

    // Dispatch physics events
    event.physicsEvents.bodyContact.forEach((ev) => {
      const entity = this.world.entity.entityIndex.get(ev.id);
      const other = this.world.entity.entityIndex.get(ev.otherId);
      if (!entity || !other) {
        return;
      }
      const wrapEvent = new GameEntityContactEvent(
        ev.tick,
        entity.entity,
        other.entity,
        new GameVector3(ev.nx, ev.ny, ev.nz),
        new GameVector3(ev.fx, ev.fy, ev.fz),
      );
      this._dispatch(this.world.onEntityContact, wrapEvent);
      this._dispatch(entity.onEntityContact, wrapEvent);
    });
    event.physicsEvents.bodySeparate.forEach((ev) => {
      const entity = this.world.entity.entityIndex.get(ev.id);
      const other = this.world.entity.entityIndex.get(ev.otherId);
      if (!entity || !other) {
        return;
      }
      const wrapEvent = new GameEntityContactEvent(
        ev.tick,
        entity.entity,
        other.entity,
        new GameVector3(ev.nx, ev.ny, ev.nz),
        new GameVector3(ev.fx, ev.fy, ev.fz),
      );
      this._dispatch(this.world.onEntitySeparate, wrapEvent);
      this._dispatch(entity.onEntitySeparate, wrapEvent);
    });
    event.physicsEvents.voxelContact.forEach((ev) => {
      const entity = this.world.entity.entityIndex.get(ev.id);
      if (!entity) {
        return;
      }
      const b = this.voxels.voxels.getVoxel(ev.x, ev.y, ev.z);
      if (this.blockIndex.fluid[b & VOXEL_TYPE_MASK]) {
        return;
      }
      const normal = unpackAxis(ev.axis);
      const wrapEvent = new GameVoxelContactEvent(
        ev.tick,
        entity.entity,
        ev.x,
        ev.y,
        ev.z,
        b,
        normal,
        new GameVector3(ev.fx, ev.fy, ev.fz),
      );
      this._dispatch(this.world.onVoxelContact, wrapEvent);
      this._dispatch(entity.onVoxelContact, wrapEvent);
    });
    event.physicsEvents.voxelSeparate.forEach((ev) => {
      const entity = this.world.entity.entityIndex.get(ev.id);
      if (!entity) {
        return;
      }
      const b = this.voxels.voxels.getVoxel(ev.x, ev.y, ev.z);
      if (this.blockIndex.fluid[b & VOXEL_TYPE_MASK]) {
        return;
      }
      const normal = unpackAxis(ev.axis);
      const wrapEvent = new GameVoxelContactEvent(
        ev.tick,
        entity.entity,
        ev.x,
        ev.y,
        ev.z,
        b,
        normal,
        new GameVector3(ev.fx, ev.fy, ev.fz),
      );
      this._dispatch(this.world.onVoxelSeparate, wrapEvent);
      this._dispatch(entity.onVoxelSeparate, wrapEvent);
    });
    event.physicsEvents.fluidContact.forEach((ev) => {
      const entity = this.world.entity.entityIndex.get(ev.id);
      if (!entity) {
        this.sysLog('error', new Error(JSON.stringify(ev)), 'Bad voxel event.');
        return;
      }
      const wrapEvent = new GameFluidContactEvent(ev.tick, entity.entity, ev.b);
      this._dispatch(this.world.onFluidEnter, wrapEvent);
      this._dispatch(entity.onFluidEnter, wrapEvent);
    });
    event.physicsEvents.fluidSeparate.forEach((ev) => {
      const entity = this.world.entity.entityIndex.get(ev.id);
      if (!entity) {
        this.sysLog('error', new Error(JSON.stringify(ev)), 'Bad voxel event.');
        return;
      }
      const wrapEvent = new GameFluidContactEvent(ev.tick, entity.entity, ev.b);
      this._dispatch(this.world.onFluidLeave, wrapEvent);
      this._dispatch(entity.onFluidLeave, wrapEvent);
    });

    //Dispatch keyboard events
    event.keyboardEvents.forEach((ev) => {
      const entity = this.world.entity.entityIndex.get(ev.id);
      if (!entity) {
        return;
      }
      const currentCodes = ev.keyDownState;
      const prevCodes = ev.prevKeyDownState;
      currentCodes.forEach((keyCode) => {
        if (!prevCodes.includes(keyCode)) {
          this._dispatch(
            entity.onKeyDown,
            new GameKeyBoardEvent(ev.tick, keyCode),
          );
        }
      });
      prevCodes.forEach((keyCode) => {
        if (!currentCodes.includes(keyCode)) {
          this._dispatch(
            entity.onKeyUp,
            new GameKeyBoardEvent(ev.tick, keyCode),
          );
        }
      });
    });

    // Dispatch chat events
    event.chatEvents.chats.forEach((ev) => {
      if (ev.private) {
        return;
      }
      const entity = this.world.entity.entityIndex.get(ev.senderId);
      if (entity) {
        const wrapEvent = new GameChatEvent(
          this.prevTickEvent.state.tick,
          entity.entity,
          ev.message,
        );
        this._dispatch(this.world.onChat, wrapEvent);
        if (entity) {
          this._dispatch(entity.onChat, wrapEvent);
        }
      }
    });

    // Dispatch player input events
    event.inputEvents.forEach((ev) => {
      const entity = this.world.entity.entityIndex.get(ev.id);
      if (!entity) {
        return;
      }

      // do not allow action events if action0/1 are disabled
      const player = getById(this.prevTickEvent.state.net.players, ev.id);
      let playerFlags = 0;
      if (player) {
        playerFlags = player.flags;
      }
      let mask = 0xffffffff;
      if ((playerFlags & PlayerFlags.ALLOW_ACTION_0) === 0) {
        mask &= ~NetInputEventBits.ACTION0;
      }
      if ((playerFlags & PlayerFlags.ALLOW_ACTION_1) === 0) {
        mask &= ~NetInputEventBits.ACTION1;
      }
      if ((playerFlags & PlayerFlags.ALLOW_JUMP) === 0) {
        mask &= ~NetInputEventBits.JUMP;
      }
      if ((playerFlags & PlayerFlags.ALLOW_DOUBLE_JUMP) === 0) {
        mask &= ~NetInputEventBits.DOUBLE_JUMP;
      }
      if ((playerFlags & PlayerFlags.ALLOW_CROUCH) === 0) {
        mask &= ~NetInputEventBits.CROUCH;
      }

      // detect changed buttons
      const changed = (ev.buttonState ^ ev.prevButtonState) & mask;
      const pressed = changed & ev.buttonState & mask;

      // Special case: For action buttons we fire a click event whenever a player clicks on an entity in the context of the clicked entity
      const raycast = this._reconstructRaycast(ev);
      if (pressed & (NetInputEventBits.ACTION0 | NetInputEventBits.ACTION1)) {
        const clickTarget = this.world.entity.entityIndex.get(ev.rayHitEntity);
        if (clickTarget) {
          const clickEvent = new GameClickEvent(
            ev.tick,
            clickTarget.entity,
            <any>entity.entity,
            pressed & NetInputEventBits.ACTION0
              ? GameButtonType.ACTION0
              : GameButtonType.ACTION1,
            vec3.dist(
              ev.position,
              vec3.fromValues(
                raycast.hitPosition.x,
                raycast.hitPosition.y,
                raycast.hitPosition.z,
              ),
            ),
            new GameVector3(ev.position[0], ev.position[1], ev.position[2]),
            raycast,
          );
          this._dispatch(this.world.onClick, clickEvent);
          this._dispatch(clickTarget.onClick, clickEvent);
        }
      }

      // check dead flag
      const dead =
        entity.dieTick + RESPAWN_TIME < this.prevTickEvent.state.tick;
      if (
        dead &&
        pressed &
          (NetInputEventBits.ACTION0 |
            NetInputEventBits.ACTION1 |
            NetInputEventBits.JUMP)
      ) {
        this.forceRespawn(entity);
      }

      BUTTONS.forEach(({ f, t }) => {
        if (!(changed & f)) {
          return;
        }
        const press = ev.buttonState & f & mask;
        const wrapEvent = new GameInputEvent(
          ev.tick,
          <any>entity.entity,
          new GameVector3(ev.position[0], ev.position[1], ev.position[2]),
          t,
          !!press,
          raycast,
        );
        if (press) {
          this._dispatch(this.world.onPress, wrapEvent);
          this._dispatch(entity.onPress, wrapEvent);
        } else {
          this._dispatch(this.world.onRelease, wrapEvent);
          this._dispatch(entity.onRelease, wrapEvent);
        }
      });
    });
    event.respawnEvents.forEach((ev) => {
      const entity = this.world.entity.entityIndex.get(ev.id);
      if (!entity) {
        return;
      }
      const wrapEvent = new GameRespawnEvent(
        ev.tick,
        <GamePlayerEntity>(<any>entity.entity),
      );
      this._dispatch(entity.onRespawn, wrapEvent);
      this._dispatch(this.world.onRespawn, wrapEvent);
    });
    event.interactEvents.forEach((ev) => {
      const entity = this.world.entity.entityIndex.get(ev.id);
      if (!entity) {
        return;
      }
      const targetEntity = this.world.entity.entityIndex.get(ev.targetId);
      if (!targetEntity) {
        return;
      }
      const wrapEvent = new GameInteractEvent(
        ev.tick,
        <GamePlayerEntity>(<any>entity.entity),
        targetEntity.entity,
      );

      this._dispatch(targetEntity.onInteract, wrapEvent);
      this._dispatch(this.world.onInteract, wrapEvent);
    });
    event.dialogEvents.forEach((ev) => {
      const pending = this.pendingDialogs[ev.promiseId];
      if (!pending) {
        return;
      }

      // remove handler
      delete this.pendingDialogs[ev.promiseId];

      // unpack result
      const result = unpackDialogResult(ev.result);
      this.scheduler.scheduleAt(() => {
        pending(result);
        return true;
      }, ev.tick * MS_PER_TICK);
    });
    // remote channel event
    event.remoteChannelEvents.forEach((ev) => {
      const entity = this.world.entity.entityIndex.get(ev.id);
      if (!entity) {
        return;
      }
      try {
        const args = JSON.parse(ev.args);
        this._dispatch(this.remoteChannel.onRemoteChannel, {
          tick: ev.tick,
          entity: <any>entity.entity,
          args,
        });
      } catch (error) {}
    });

    // Dispatch tick event
    const n = Date.now();
    this._dispatch(
      this.world.onTick,
      new GameTickEvent(tick, prevTick, skip, n - this._prevTickMS),
    );
    this._prevTickMS = n;
  }

  public hurtEntity = (
    target: ScriptEntityWrapper,
    attacker: ScriptEntityWrapper | null,
    amount: number,
    type: string,
  ) => {
    if (
      target.destroyed ||
      isNaN(amount) ||
      !target.entity.enableDamage ||
      target.entity.hp <= 0
    ) {
      return;
    }

    // if HP is already outside bounds, then continue
    if (amount < 0) {
      // hurt with negative value = heal
      target.lastAttacker = null;
      target.lastDamageType = '';
      if (target.entity.hp < target.entity.maxHp) {
        target.entity.hp = Math.min(
          target.entity.maxHp,
          target.entity.hp - amount,
        );
      }
    } else {
      target.lastAttacker = attacker ? attacker.entity : null;
      target.lastDamageType = type || '';
      if (target.entity.hp > 0) {
        target.entity.hp = Math.max(0, target.entity.hp - amount);
      }
    }

    // send event
    const event = new GameDamageEvent(
      this.prevTickEvent.state.tick,
      target.entity,
      amount,
      (attacker && attacker.entity) || null,
      type,
    );
    this._dispatch(target.onDamage, event);
    this._dispatch(this.world.onDamage, event);

    // dispatch hurt event for special effects
    const base = this.pendingEvents.damage.hurt.find(
      (ev) => ev.id === target.id,
    );
    if (base) {
      base.damage += amount;
    } else {
      const ev = HurtEventSchema.alloc();
      ev.damage = amount;
      ev.id = target.id;
      this.pendingEvents.damage.hurt.push(ev);
    }
  };

  public forceRespawn = (wrapper: ScriptEntityWrapper) => {
    if (!wrapper.isPlayer) {
      return;
    }
    wrapper.dieTick = Infinity;
    if (this.pendingEvents.damage.respawn.indexOf(wrapper.id) < 0) {
      this.pendingEvents.damage.respawn.push(wrapper.id);
    }
  };

  private _handleDieEvents() {
    const entityIndex = this.world.entity.entityIndex;
    const damage = this.prevTickEvent.state.damage;
    const tick = this.prevTickEvent.state.tick;
    for (let i = 0; i < damage.length; ++i) {
      const d = damage[i];
      const e = entityIndex.get(d.id);
      if (e) {
        if (d.hp > 0 && e && e.entity.hp <= 0 && e.entity.enableDamage) {
          e.dieTick = tick;
          const dieEvent = new GameDieEvent(
            tick,
            e.entity,
            e.lastAttacker,
            e.lastDamageType,
          );
          this._dispatch(e.onDie, dieEvent);
          this._dispatch(this.world.onDie, dieEvent);
        } else {
          e.dieTick = Infinity;
        }
      }
    }
  }

  private _postTick() {
    // handle die events from player
    this._handleDieEvents();

    // synchronize state with server
    const postTick = ScriptPostTickSchema.alloc();

    // copy over events
    const tmp = postTick.events;
    postTick.events = this.pendingEvents;
    this.pendingEvents = ScriptSentEventSchema.assign(
      tmp,
      ScriptSentEventSchema.identity,
    );

    // post synchronize voxel updates
    this.voxels.postTick(postTick.voxelUpdates);

    // compute state synchronizations
    this.world.postTick(postTick, this.prevTickEvent.state);

    // copy performance counters
    this.perf.dispatcherEvents = DISPATCHER_EVENT_COUNT;
    this.perf.dispatchersDestroyed = DISPATCHER_DESTROY_COUNT;
    this.perf.dispatchersCreated = DISPATCHER_CREATE_COUNT;
    this.perf.dispatcherPromises = DISPATCHER_PROMISE_COUNT;
    this.perf.dispatcherHandlers = DISPATCHER_HANDLER_COUNT;
    this.scheduler.stats(this.perf);
    ScriptPerfCounterSchema.assign(postTick.perf, this.perf);

    // send to main thread
    this.protocol.server.message.postTick(postTick);
    ScriptPostTickSchema.free(postTick);

    // clear index dirty flag
    this.world.physicsSelectors.indexDirty = false;
  }

  private _targetPollTick = 0;
  private _pollDone = false;
  private _poll = () => {
    if (this._pollDone) {
      this.scheduler.setTime(this._targetPollTick);
      this._postTick();
    } else {
      if (!this.scheduler.poll(this._targetPollTick)) {
        this._pollDone = true;
      } else {
        while (this.scheduler.poll(this._targetPollTick)) {
          continue;
        }
      }
      this.protocol.server.message.pump();
    }
  };

  private _startPoll(timeMS: number) {
    this._targetPollTick = timeMS + this.scheduler.currentMS();
    this._pollDone = false;
    this._poll();
  }

  public playSound = (
    sample: string,
    position: PlaySoundPosition,
    gain: number,
    pitch: number,
    radius: number,
  ) => {
    if (!this.resource.resolveAsset(sample, GameAssetType.SOUND)) {
      throw new Error('invalid sound: ' + sample);
    }
    if (!(gain >= 0)) {
      throw new Error('gain, must be >= 0');
    }
    if (!(pitch >= 0.1)) {
      throw new Error('min pitch scaling is 0.1');
    }
    const soundId = this.soundCounter++;
    this.protocol.server.message.sound({
      soundId,
      sample,
      position,
      pitch,
      gain,
      radius,
    });
    return new Sound(
      (currentTime?: number) => {
        if (typeof currentTime === 'number') {
          this.protocol.server.message.setSoundCurrentTimeAndResume({
            soundId,
            currentTime,
          });
        } else {
          this.protocol.server.message.resumeSound(soundId);
        }
      },
      (currentTime: number) =>
        this.protocol.server.message.setSoundCurrentTime({
          soundId,
          currentTime,
        }),
      () => this.protocol.server.message.pauseSound(soundId),
      () => this.protocol.server.message.stopSound(soundId),
    );
  };

  constructor(
    socket: MuSocket,
    unsafeMode: boolean,
    private sysLog: ScriptShellSysLog,
  ) {
    const _pendingMessages: LogMessage[] = [];
    this.logger = new Logger(
      (ev) => {
        if (this.client && this.client.running) {
          return this.protocol.server.message.systemLogSink(ev);
        }
        _pendingMessages.push(LogMessageSchema.clone(ev));
      },
      ['script-shell'],
      '',
    );

    this.client = new MuClient(
      socket,
      createMuLogger(this.logger, '../mudb/src-script'),
      true,
    );
    this.protocol = this.client.protocol(ScriptProtocol);
    this.scheduler = createScriptScheduler((e) => {
      const err = e instanceof Error ? e : new Error(JSON.stringify(e));
      this.sysLog('error', err, 'Error in script scheduler handler.');
      this.raiseException(err);
    });

    this.storage = new StorageSynchronizer({
      client: this.client,
      schedule: this.scheduler.schedule,
      logger: this.logger,
    });
    this.navigator = new NavigatorScriptShell(this);
    this.href = new HrefScriptShell(this.client);
    this.http = new HttpScriptShell(this.client, this.scheduler.schedule);
    this.rtc = new RTCScriptShell(this);
    this.gui = new GUIScriptShell(this);
    this.teleport = new TeleportScriptShell(
      this.client,
      this.scheduler.schedule,
    );
    const moderation = new ModerationScript(this.client,this.scheduler.schedule, player => {
      const wrapper = WRAPPER_PLAYER_INDEX.get(player);
      if (!wrapper || !wrapper.isPlayer || this.world.entity.entityIndex.get(wrapper.id) !== wrapper || wrapper.entity.player !== player) throw new Error('目标不是当前地图的玩家');
      return wrapper.id;
    }, this.scheduler.scheduler);
    this.remoteChannel = new RemoteChannelScriptShell(this.client, this.logger);

    this.console = new GameConsole(this.log, this.clearLog);

    this.resource = new ScriptResourceSync(this._eval);

    this.voxels = new ScriptVoxelSync(
      this.blockInfo,
      this.blockIndex,
      this.logger,
    );
    this.keyframeParser = new ScriptParserAPI(this.resource);
    this.world = new ScriptWorldSync({
      perf: this.perf,
      config: this.config,
      resource: this.resource,
      shell: this,
      voxel: this.voxels,
      schedule: this._dispatch,
      scheduler: this.scheduler,
      logger: this.logger,
      say: this.say,
      hurtEntity: this.hurtEntity,
      forceRespawn: this.forceRespawn,
      blockInfo: this.blockInfo,
      blockIndex: this.blockIndex,
      openDialog: this.openDialog,
      openLink: this.openLink,
      postMessage: this.navigator.postMessage,
      addEventListener: this.navigator.addEventListener,
      cancelDialogs: this.cancelDialogs,
      playSound: this.playSound,
      keyframeParser: this.keyframeParser,
      kick: this.kick,
      setCameraPitch: this.setCameraPitch,
      setCameraYaw: this.setCameraYaw,
      teleport: this.teleport.teleport,
    });
    this.world.world.moderation = moderation;
    const anticheat = new AnticheatScript(this.client,
      id => this.world.entity.entityIndex.get(id)?.entity.player,
      error => this.sysLog('error', error, 'Anticheat listener failed.'),
      id => this.world.entity.entityIndex.get(id)?.entity,
      () => this.prevTickEvent.state.tick);
    this.world.world.anticheat = anticheat;
    this.api = createScriptAPI({
      // world.moderation is installed before any user code is evaluated.
      scheduler: this.scheduler.scheduler,
      console: this.console,
      world: this.world.world,
      voxels: this.voxels.voxelAPI,
      raiseException: (e) => {
        const err = e instanceof Error ? e : new Error(JSON.stringify(e));
        this.sysLog('error', err, 'User raised exception.');
        this.raiseException(err);
      },
      sleep: this.sleep,
      require: (id: string) => this.resource.loadModule(id, null),
      resources: this.resource.resources,
      db: this.storage.db,
      storage: this.storage.storage,
      http: this.http.httpAPI,
      rtc: this.rtc.rtcAPI,
      gui: this.gui.guiAPI,
      remoteChannel: new ServerRemoteChannel(
        this.sendClientEvent,
        this.remoteChannel.sendEventToAllClient,
        this.remoteChannel.onRemoteChannel.channel,
      ),
    });

    let evalFuncs;
    if (unsafeMode) {
      this.sysLog('warn', 'Running script in an unsafe execution environment.');
      evalFuncs = createUnsafeEval(this.api);
    } else {
      evalFuncs = createSafeEval(this.api);
    }
    this._eval.expr = evalFuncs.expr;
    this._eval.module = evalFuncs.module;

    this.protocol.configure({
      ready: () => {
        this.sysLog('debug', 'ScriptShell protocol is ready.');
        for (let i = 0; i < _pendingMessages.length; ++i) {
          this.protocol.server.message.systemLogSink(_pendingMessages[i]);
          LogMessageSchema.free(_pendingMessages[i]);
        }
        _pendingMessages.length = 0;
      },
      message: {
        start: (config) => {
          this.sysLog('debug', 'ScriptShell starting.');
          // Copy script config
          ScriptConfigSchema.assign(this.config, config.config);

          // update block index
          BlockInfoSchema.assign(this.blockInfo, config.blocks);
          unpackBlockIndex(config.blocks, this.blockIndex);

          // Advance clock to current tick
          this.scheduler.setTime(config.state.tick * MS_PER_TICK);

          // initialize voxel configuration
          this.voxels.reset(config.voxels);

          // update resources
          this.world.resource.synchronizeResources(config.resources);

          // sync name
          this.world.world.projectName = config.projectName;
          // sync group id
          this.storage.groupId = config.groupId;

          // sync url, serverId
          this.world.world.url = new GameURL.URL(config.config.url);
          this.world.world.serverId = config.config.serverId;

          // synchronize special features
          if (config.featureFlags.enableTriggerAPI) {
            (<any>this.world.world).triggers = warnDeprecate(
              this.world.world.zones,
              'triggers',
              'zones',
            );
            (<any>this.world.world).addTrigger = warnDeprecate(
              this.world.world.addZone,
              'addTrigger',
              'addZone',
            );
            (<any>this.world.world).removeTrigger = warnDeprecate(
              this.world.world.removeZone,
              'removeTrigger',
              'removeZone',
            );
          }

          // initialize state
          ScriptTickSchema.assign(
            this.prevTickEvent,
            ScriptTickSchema.identity,
          );
          ScriptStateSnapshotSchema.assign(
            this.prevTickEvent.state,
            config.state,
          );
          this.world.preTick(config.state);

          // initialize seeds
          this.world.entity.initSeeds(config.seed);

          if (config.scriptIndex) {
            try {
              anticheat.initialize();
              this.sysLog('debug', `Loading module: ${config.scriptIndex}...`);
              this.resource.loadModule(config.scriptIndex, null);
              anticheat.finishInitialization();
              this.sysLog('debug', 'Module loaded.');
            } catch (e) {
              const err = e instanceof Error ? e : new Error(JSON.stringify(e));
              this.sysLog('error', err, 'Script module loading failed.');
              this.raiseException(err);
            }
          } else {
            anticheat.initialize();
            anticheat.finishInitialization();
          }
          // initialize collision rules
          config.collisionFilter.forEach(({ a, b }) =>
            this.world.addCollisionFilter(a, b),
          );

          // initialize zones
          config.zones.forEach((zone) => {
            this.world.zones.addZone({
              bounds: new GameBounds3(
                new GameVector3(
                  zone.bounds.lox,
                  zone.bounds.loy,
                  zone.bounds.loz,
                ),
                new GameVector3(
                  zone.bounds.hix,
                  zone.bounds.hiy,
                  zone.bounds.hiz,
                ),
              ),

              selector: zone.selector,

              massScale: zone.massScale,
              force: new GameVector3(zone.force.x, zone.force.y, zone.force.z),

              fogEnabled: zone.overrideFog,
              fogColor: new GameRGBColor(
                zone.fog.fogColor.r,
                zone.fog.fogColor.g,
                zone.fog.fogColor.b,
              ),
              fogStartDistance: zone.fog.fogStartDistance,
              fogHeightOffset: zone.fog.fogHeightOffset,
              fogHeightFalloff: zone.fog.fogHeightFalloff,
              fogDensity: zone.fog.fogDensity,
              fogMax: zone.fog.maxFog,

              snowEnabled: zone.overrideSnow,
              snowDensity: zone.snow.density,
              snowSizeLo: zone.snow.size.w,
              snowSizeHi: zone.snow.size.h,
              snowFallSpeed: zone.snow.fallSpeed,
              snowSpinSpeed: zone.snow.spinSpeed,
              snowColor: new GameRGBAColor(
                zone.snow.color.r,
                zone.snow.color.g,
                zone.snow.color.b,
                zone.snow.color.a,
              ),
              snowTexture: zone.snow.texture,

              rainEnabled: zone.overrideRain,
              rainDensity: zone.rain.density,
              rainDirection: new GameVector3(
                zone.rain.direction.x,
                zone.rain.direction.y,
                zone.rain.direction.z,
              ),
              rainSpeed: zone.rain.speed,
              rainSizeLo: zone.rain.size.w,
              rainSizeHi: zone.rain.size.h,
              rainInterference: zone.rain.interference,
              rainColor: new GameRGBAColor(
                zone.rain.color.r,
                zone.rain.color.g,
                zone.rain.color.b,
                zone.rain.color.a,
              ),

              skyEnabled: zone.overrideSky,
              skyMode:
                zone.sky.skyType === EnvironmentSkyType.NATURAL
                  ? 'natural'
                  : 'manual',
              skySunPhase: zone.sky.sunPhase,
              skySunFrequency: zone.sky.sunFrequency,
              skyLunarPhase: zone.sky.lunarPhase,
              skySunDirection: new GameVector3(
                zone.sky.sunDirection.x,
                zone.sky.sunDirection.y,
                zone.sky.sunDirection.z,
              ),
              skySunLight: new GameRGBColor(
                zone.sky.sunColor.r,
                zone.sky.sunColor.g,
                zone.sky.sunColor.b,
              ),
              skyLeftLight: new GameRGBColor(
                zone.sky.skyLeft.r,
                zone.sky.skyLeft.g,
                zone.sky.skyLeft.b,
              ),
              skyRightLight: new GameRGBColor(
                zone.sky.skyRight.r,
                zone.sky.skyRight.g,
                zone.sky.skyRight.b,
              ),
              skyBottomLight: new GameRGBColor(
                zone.sky.skyBottom.r,
                zone.sky.skyBottom.g,
                zone.sky.skyBottom.b,
              ),
              skyTopLight: new GameRGBColor(
                zone.sky.skyTop.r,
                zone.sky.skyTop.g,
                zone.sky.skyTop.b,
              ),
              skyFrontLight: new GameRGBColor(
                zone.sky.skyFront.r,
                zone.sky.skyFront.g,
                zone.sky.skyFront.b,
              ),
              skyBackLight: new GameRGBColor(
                zone.sky.skyBack.r,
                zone.sky.skyBack.g,
                zone.sky.skyBack.b,
              ),
            });
          });

          // start polling
          this._startPoll(0);
        },

        poll: this._poll,

        invokeEval: ({ handle, expr }) => {
          this.scheduler.scheduleAt(() => {
            try {
              this.protocol.server.message.replyEval({
                handle,
                success: true,
                expr: '' + this._eval.expr.call(null, expr),
              });
            } catch (e) {
              const err = e instanceof Error ? e : new Error(JSON.stringify(e));
              this.sysLog('error', err, 'ScriptShell `invokeEval` failed.');
              this.protocol.server.message.replyEval({
                handle,
                success: false,
                expr: '' + e,
              });
            }
            return true;
          }, 0);
        },

        syncResources: (resources) => {
          this.resource.synchronizeResources(resources);
        },
      },
      raw: (bytes) => {
        if (typeof bytes === 'string') {
          return;
        }

        // drain log buffer
        this.drainLog();
        this.drainChat();

        // decode input event
        const prevEvent = this.prevTickEvent;
        const nextEvent = (this.prevTickEvent = ScriptTickSchema.patch(
          prevEvent,
          new MuReadStream(bytes),
        ));

        // compute elapsed time
        const prevTick = prevEvent.state.tick;
        const dt = nextEvent.state.tick - prevTick;

        // release old tick event
        ScriptTickSchema.free(prevEvent);

        // send tick events
        try {
          this.voxels.preTick(nextEvent.voxelUpdate);
          this.world.preTick(nextEvent.state);
        } catch (e) {
          // log to container
          this.sysLog('error', e, 'ScriptShell pretick failed.');
          // log to client debug console
          this.protocol.server.message.exception(parseError(e));
        }

        // Schedule all script events
        this._dispatchEvents(nextEvent.events, prevTick, dt > 1);

        this.world.zones.pollZones(
          nextEvent.state.tick,
          this.world.entity.entities,
        );

        // pump scheduled events
        this._startPoll(MS_PER_TICK * dt);
      },
    });

    this.client.start();
    this.sysLog('debug', 'ScriptShell socket client started.');
  }

  // buffered chats
  private chatCount = MAX_CHATS_PER_TICK;
  private bufferedChat: {
    senderId: number;
    receiverId: number;
    message: string;
    duration: number;
    hideFloat: boolean;
  }[] = [];

  private drainChat() {
    if (this.bufferedChat.length > 0) {
      this.protocol.server.message.chatLog(this.bufferedChat);
      this.bufferedChat.length = 0;
    }
    this.chatCount = MAX_CHATS_PER_TICK;
  }

  public say = (
    senderId: number,
    receiverId: number,
    message: string,
    options?: { duration?: number; hideFloat?: boolean },
  ) => {
    if (senderId) {
      const s = this.world.entity.entityIndex.get(senderId);
      if (!s || s.destroyed) {
        return;
      }
    }
    if (receiverId) {
      const r = this.world.entity.entityIndex.get(receiverId);
      if (!r || r.destroyed) {
        return;
      }
    }
    const duration = options?.duration
      ? options.duration === Infinity
        ? -1
        : options.duration
      : 0;
    const hideFloat = options?.hideFloat || false;
    if (this.chatCount > 0) {
      this.protocol.server.message.chatLog([
        {
          senderId,
          receiverId,
          message: '' + message,
          duration,
          hideFloat,
        },
      ]);
      this.chatCount -= 1;
    } else {
      this.bufferedChat.push({
        senderId,
        receiverId,
        message: '' + message,
        duration,
        hideFloat,
      });
    }
  };

  // buffered logs
  private logCount = MAX_LOGS_PER_TICK;
  private bufferedLog: { message: string; level: number }[] = [];
  private bufferedClear: boolean = false;

  public log = (level: GameLogLevel, message: string) => {
    if (this.logCount > 0) {
      this.protocol.server.message.log([{ level, message }]);
      this.logCount -= 1;
    } else {
      this.bufferedLog.push({ level, message });
    }
  };

  public clearLog = () => {
    if (this.logCount > 0) {
      this.protocol.server.message.clearLog();
      this.logCount -= 1;
    } else {
      this.bufferedLog.length = 0;
      this.bufferedClear = true;
    }
  };

  private drainLog() {
    if (this.bufferedClear) {
      this.protocol.server.message.clearLog();
    }
    if (this.bufferedLog.length > 0) {
      this.protocol.server.message.log(this.bufferedLog);
      this.bufferedLog.length = 0;
    }
    this.logCount = MAX_LOGS_PER_TICK;
  }

  public sleep = (timeMS: number) => {
    const targetTime = this.scheduler.currentMS() + (+timeMS || 0);
    return new Promise<void>((resolve) => {
      this.scheduler.scheduleAt(() => {
        resolve();
        return true;
      }, targetTime);
    });
  };

  /**
   * Log and send user script exception to debug console
   */
  public raiseException = (e: Error) => {
    const parsed = parseError(e);
    this.protocol.server.message.exception(parsed);
    ParsedErrorSchema.free(parsed);
  };

  public openDialog = (
    wrapper: ScriptEntityWrapper,
    params: GameDialogParams,
  ) => {
    const promiseId = this.promiseCounter++;
    const config = packDialogParams(params);
    const result = new Promise<GameDialogResponse>((resolve) => {
      this.pendingDialogs[promiseId] = resolve;
      this.protocol.server.message.dialog({
        playerId: wrapper.id,
        promiseId,
        config,
      });
    });
    (<any>result).cancel = () => {
      if (this.pendingDialogs[promiseId]) {
        this.protocol.server.message.cancelDialog(
          {
            playerId: wrapper.id,
            promiseId,
          },
          true,
        );
      }
    };
    return result;
  };

  public cancelDialogs = (wrapper: ScriptEntityWrapper) => {
    this.protocol.server.message.cancelAllDialogs(wrapper.id, true);
  };

  public openLink = (
    wrapper: ScriptEntityWrapper,
    href: string,
    options?: { isConfirm?: boolean; isNewTab?: boolean },
  ) => {
    this.sysLog('debug', `openLink: ${href}`);
    this.href.openLink(wrapper.id, href, options);
  };

  public kick = (playerId: number) => {
    this.protocol.server.message.kick(playerId);
  };

  public setCameraPitch = (playerId: number, value: number) => {
    this.protocol.server.message.setCameraPitch({
      playerId,
      value: Math.round((255 * (value + Math.PI / 2)) / Math.PI) % 256,
    });
  };

  public setCameraYaw = (playerId: number, value: number) => {
    this.protocol.server.message.setCameraYaw({
      playerId,
      value: Math.round((256 * value) / (2 * Math.PI)) % 256,
    });
  };


  public sendClientEvent: SendClientEventType = (entities, clientEvent) => {
    const ids: number[] = [];
    const entityArr: GameEntity[] = Array.isArray(entities)
      ? entities
      : [entities];
    for (let i = 0; i < entityArr.length; i++) {
      const wrapper = WRAPPER_INDEX.get(entityArr[i]);
      if (wrapper && wrapper.isPlayer) {
        ids.push(wrapper.id);
      }
    }
    this.remoteChannel.sendEventToClients(ids, clientEvent);
  };
}
