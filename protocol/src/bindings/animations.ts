import {
  GameAnimation,
  GameAnimationDirection,
  GameAnimationEvent,
  GameAnimationPlaybackConfig,
  GameAnimationPlaybackState,
  GameAssetType,
  GameEntity,
} from '@box/schema/api/js/api';
import { MuSchema } from '@box/mudb/schema';
import { compareId } from '@box/utils/id';
import {
  AnimationBinding,
  animEndTick,
  GenericAnimationIndex,
  KeyframeScriptParserAPI,
  KeyframeType,
} from '@box/schema/keyframes/keyframe-binding';
import {
  AnimationPlaybackMode,
  GenericAnimation,
} from '@box/schema/keyframes/type';
import { ScriptConfig, ScriptPerfCounter } from '../script-protocol';
import { ScriptScheduler } from '@box/utils/script/script-scheduler';
import { ENTITY_INDEX, WRAPPER_INDEX } from './binding-factory';
import { coerceNum, coerceObject } from './coerce';
import { ScriptDispatcher } from '@box/schema/script/dispatcher';
import { ScriptResourceSync } from './resource';
import { GameUIDEntity } from './entity-synchronizer';

function compareNum(a: number, b: number) {
  return a - b;
}

const coercePlaybackInfo = coerceObject<GameAnimationPlaybackConfig>({
  startTick: coerceNum,
  delay: coerceNum,
  endDelay: coerceNum,
  duration: coerceNum,
  iterationStart: coerceNum,
  iterations: coerceNum,
  direction: (x: any, y: GameAnimationDirection) => {
    if (!x || typeof x !== 'string') {
      return y;
    }
    const xl = x.toLowerCase();
    if (
      xl === GameAnimationDirection.NORMAL ||
      xl === GameAnimationDirection.REVERSE ||
      xl === GameAnimationDirection.WRAP ||
      xl === GameAnimationDirection.WRAP_REVERSE ||
      xl === GameAnimationDirection.ALTERNATE ||
      xl === GameAnimationDirection.ALTERNATE_REVERSE
    ) {
      return xl;
    }
    return y;
  },
});

export class ScriptAnimationWrapper<
  ScriptObjectType,
  KT extends KeyframeType,
  AnimationType extends AnimationBinding<
    KT,
    MuSchema<GenericAnimation>,
    MuSchema<GenericAnimationIndex>,
    any,
    any,
    any
  >,
> {
  public scheduled = false;
  public readyFired = false;

  public animation: GameAnimation<KT, ScriptObjectType>;

  public onReady = new ScriptDispatcher<
    GameAnimationEvent<KT, ScriptObjectType>
  >();
  public onFinish = new ScriptDispatcher<
    GameAnimationEvent<KT, ScriptObjectType>
  >();

  constructor(
    public group: ScriptAnimationTarget<ScriptObjectType, KT, AnimationType>,
    public data: AnimationType['schema']['identity'],
  ) {
    this.animation = new GameAnimation(
      group.target,
      this.frames,
      this.currentTime,
      this.startTime,
      this.playState,
      this.playbackRate,
      this.play,
      this.cancel,
      this.onReady.channel,
      this.onReady.future,
      this.onFinish.channel,
      this.onFinish.future,
    );
  }

  private _checkTarget() {
    if (this.group.destroyed) {
      throw new Error('Animation target is destroyed');
    }
  }

  public currentTime = () => {
    this._checkTarget();

    const tick = this.group.manager.currentTick;
    const startTick = this.data.startTick;
    if (tick < startTick) {
      return 0;
    }
    if (this.data.cycleCount > 0) {
      const animTicks = Math.max(
        this.data.cycleTicks * (this.data.cycleCount - this.data.cyclePhase),
        0,
      );
      return Math.min(tick - startTick, animTicks);
    } else {
      return tick - startTick;
    }
  };

  public startTime = () => {
    this._checkTarget();
    return this.data.startTick;
  };

  public playState = () => {
    this._checkTarget();
    if (!this.scheduled) {
      return GameAnimationPlaybackState.FINISHED;
    }
    const curTick = this.group.manager.currentTick;
    if (curTick < this.data.startTick) {
      return GameAnimationPlaybackState.PENDING;
    }
    if (curTick < animEndTick(this.data)) {
      return GameAnimationPlaybackState.RUNNING;
    }
    return GameAnimationPlaybackState.FINISHED;
  };

  public playbackRate = () => {
    this._checkTarget();
    return (
      this.data.keyframes[this.data.keyframes.length - 1].tick /
      this.data.cycleTicks
    );
  };

  public parsePlayback(playback?: Partial<GameAnimationPlaybackConfig>) {
    const data = this.data;
    const info = coercePlaybackInfo(playback, {
      startTick: this.group.manager.currentTick,
      delay: 16,
      endDelay: 0,
      duration: 16,
      direction: GameAnimationDirection.NORMAL,
      iterationStart: 0,
      iterations: 1,
    });
    data.startTick = info.startTick + Math.max(info.delay || 0, 0);
    data.endTicks = Math.max(info.endDelay, 0);
    data.cycleTicks = Math.max(0, info.duration);
    data.cycleCount =
      info.iterations === Infinity ? -1 : Math.max(info.iterations, 0);
    data.cyclePhase = Math.max(info.iterationStart, 0);
    switch (info.direction) {
      case GameAnimationDirection.REVERSE:
        data.playbackMode = AnimationPlaybackMode.REVERSE;
        break;
      case GameAnimationDirection.ALTERNATE:
        data.playbackMode = AnimationPlaybackMode.MIRROR;
        break;
      case GameAnimationDirection.ALTERNATE_REVERSE:
        data.playbackMode = AnimationPlaybackMode.MIRROR_REVERSE;
        break;
      case GameAnimationDirection.WRAP:
        data.playbackMode = AnimationPlaybackMode.WRAP;
        break;
      case GameAnimationDirection.WRAP_REVERSE:
        data.playbackMode = AnimationPlaybackMode.WRAP_REVERSE;
        break;
      default:
        data.playbackMode = AnimationPlaybackMode.FORWARD;
        break;
    }
  }

  public play = (playback?: Partial<GameAnimationPlaybackConfig>) => {
    this._checkTarget();
    if (!this.scheduled) {
      if (
        this.group.manager.animations.size >=
        this.group.manager.config.animationLimit
      ) {
        throw new Error('Animation limit exceeded');
      }
    }
    this.parsePlayback(playback);
    this.fixReverseWrapOffset(playback);
    this.group.manager.modifyAnimationSet(this, true, true);
  };

  public cancel = () => {
    this._checkTarget();
    this.group.manager.modifyAnimationSet(this, false, true);
  };

  public frames = () => {
    this._checkTarget();
    return this.group.manager.binding.serialize(
      this.data,
      this.group.manager.parserAPI,
    );
  };

  public fixReverseWrapOffset(
    playbackInfo?: Partial<GameAnimationPlaybackConfig>,
  ) {
    if (
      this.data.playbackMode !== AnimationPlaybackMode.WRAP_REVERSE ||
      typeof playbackInfo !== 'object' ||
      'iterationStart' in playbackInfo
    ) {
      return;
    }
    const keyframes = this.data.keyframes;
    const l = keyframes[keyframes.length - 1].tick;
    const offset =
      (l - (keyframes.length >= 2 ? keyframes[keyframes.length - 2].tick : 0)) /
      Math.max(0.0001, l);
    this.data.cyclePhase += offset;
    if (this.data.cycleCount > 0) {
      this.data.cycleCount += offset;
    }
  }
}

export class ScriptAnimationTarget<
  ScriptObjectType,
  KT extends KeyframeType,
  AnimationType extends AnimationBinding<KT, any, any, any, any, any>,
> {
  public destroyed: boolean = false;

  public animations = new Set<
    ScriptAnimationWrapper<ScriptObjectType, KT, AnimationType>
  >();
  public flags: AnimationType['flagSchema']['identity'];

  // animation set
  constructor(
    public id: number,
    public manager: ScriptAnimationManager<ScriptObjectType, KT, AnimationType>,
    public target: ScriptObjectType,
  ) {
    this.flags = manager.binding.flagSchema.clone(
      manager.binding.flagSchema.identity,
    );
  }

  public animate = (
    keyframes: Partial<KT>[],
    playbackInfo?: Partial<GameAnimationPlaybackConfig>,
  ) => {
    if (this.destroyed) {
      throw new Error('Animation target is destroyed');
    }
    if (!Array.isArray(keyframes) || keyframes.length < 1) {
      throw new Error('Must specify keyframes for animation');
    }
    if (keyframes.length > this.manager.config.keyframeLimit) {
      throw new Error(
        'Too many keyframes.  Maximum allowed keyframes is ' +
          this.manager.config.keyframeLimit,
      );
    }
    if (this.manager.animations.size >= this.manager.config.animationLimit) {
      throw new Error('Animation limit exceeded');
    }
    const data = this.manager.binding.schema.alloc();
    data.id = this.manager.idCounter++;
    data.targetId = this.id;
    const animation = new ScriptAnimationWrapper<
      ScriptObjectType,
      KT,
      AnimationType
    >(this, data);
    // have to parse playback before keyframes
    animation.parsePlayback(playbackInfo);
    this.manager.binding.parse(keyframes, data, this.manager.parserAPI);
    animation.fixReverseWrapOffset(playbackInfo);
    this.manager.modifyAnimationSet(animation, true, true);
    return animation.animation;
  };

  public getAnimations = () => {
    if (this.destroyed) {
      throw new Error('Animation target is destroyed');
    }
    const result: GameAnimation<KT, ScriptObjectType>[] = [];
    for (const anim of this.animations.values()) {
      if (anim.scheduled) {
        result.push(anim.animation);
      }
    }
    return result;
  };

  public destroy(reason: string) {
    for (const anim of this.animations.values()) {
      anim.onFinish.destroy(reason, this.manager.scheduler);
      anim.onReady.destroy(reason, this.manager.scheduler);
      this.manager.modifyAnimationSet(anim, false, true);
    }
    this.animations.clear();
    this.manager.groups.delete(this.id);
    this.destroyed = true;
  }
}

export class ScriptAnimationManager<
  ScriptObjectType,
  KT extends KeyframeType,
  AnimationType extends AnimationBinding<KT, any, any, any, any, any>,
> {
  public idCounter: number = 1;
  public animations = new Map<
    number,
    ScriptAnimationWrapper<ScriptObjectType, KT, AnimationType>
  >();
  public groups = new Map<
    number,
    ScriptAnimationTarget<ScriptObjectType, KT, AnimationType>
  >();
  public currentTick: number = 0;

  public dirtyAnimations = new Set<number>();

  constructor(
    public binding: AnimationType,
    public schedule: <EventType extends { tick: number }>(
      dispatcher: ScriptDispatcher<EventType>,
      ev: EventType,
    ) => void,
    public scheduler: ScriptScheduler,
    public perf: ScriptPerfCounter,
    public parserAPI: ScriptParserAPI,
    public config: ScriptConfig,
  ) {}

  public preTick(nextTick: number) {
    const prevTick = this.currentTick;
    this.currentTick = nextTick;

    // schedule animation events
    for (const anim of this.animations.values()) {
      const data = anim.data;

      // handle start animation event
      const startTick = data.startTick;
      if (startTick < nextTick && !anim.readyFired) {
        anim.readyFired = true;
        this.schedule(
          anim.onReady,
          new GameAnimationEvent(
            Math.max(startTick, prevTick),
            anim.group.target,
            anim.animation,
            false,
          ),
        );
      }

      // handle end animation event
      const endTick = animEndTick(data) + data.endTicks;
      if (endTick < nextTick) {
        this.schedule(
          anim.onFinish,
          new GameAnimationEvent(
            Math.max(prevTick, endTick),
            anim.group.target,
            anim.animation,
            false,
          ),
        );
        this.modifyAnimationSet(anim, false, false);
      }
    }
  }

  public postTick(changes: AnimationType['syncSchema']['identity']) {
    this.perf.animationsLive += this.animations.size;

    // clear changes
    this.binding.syncSchema.assign(changes, this.binding.syncSchema.identity);

    // check if changes
    if (this.dirtyAnimations.size === 0) {
      return;
    }

    // copy changes into patch
    for (const id of this.dirtyAnimations.values()) {
      const anim = this.animations.get(id);
      if (anim) {
        changes.upserts.push(this.binding.schema.clone(anim.data));
      } else {
        changes.removes.push(id);
      }
    }

    // clear dirty set
    this.dirtyAnimations.clear();

    // sort arrays
    changes.removes.sort(compareNum);
    changes.upserts.sort(compareId);
  }

  public createAnimationGroup(id: number, target: ScriptObjectType) {
    const wrapper = new ScriptAnimationTarget(id, this, target);
    this.groups.set(id, wrapper);
    return wrapper;
  }

  public modifyAnimationSet(
    animation: ScriptAnimationWrapper<ScriptObjectType, KT, AnimationType>,
    active: boolean,
    cancelEvent: boolean,
  ) {
    if (active) {
      // schedule potential ready event
      animation.readyFired = false;
      this.dirtyAnimations.add(animation.data.id);

      // if animation is already scheduled, then skip
      if (animation.scheduled) {
        return;
      }

      this.perf.animationsCreated++;

      // add to ready set
      animation.scheduled = true;
      this.animations.set(animation.data.id, animation);
      animation.group.animations.add(animation);

      this.binding.accumFlags(animation.data, animation.group.flags, 1);
    } else {
      // if animation is not scheduled, delete
      if (!animation.scheduled) {
        return;
      }

      this.perf.animationsDestroyed++;

      this.binding.accumFlags(animation.data, animation.group.flags, -1);

      // remove animation from working set and deschedule
      animation.scheduled = false;
      this.animations.delete(animation.data.id);
      animation.group.animations.delete(animation);

      // flag it as dirty
      this.dirtyAnimations.add(animation.data.id);

      // notify cancel
      if (cancelEvent) {
        this.schedule(
          animation.onFinish,
          new GameAnimationEvent<KT, ScriptObjectType>(
            this.currentTick,
            animation.group.target,
            animation.animation,
            true,
          ),
        );
      }
    }
  }

  public getAnimations = () => {
    return <GameAnimation<KT, ScriptObjectType>[]>[];
  };
}

export class ScriptParserAPI implements KeyframeScriptParserAPI {
  constructor(public resource: ScriptResourceSync) {}

  public meshIdToFile = (meshId: number) => {
    return this.resource.getMeshFileName(meshId);
  };

  public fileToMeshId = (file: string) => {
    return this.resource.getMeshId(file);
  };

  public entityToId = (entity: GameEntity) => {
    const wrapper = WRAPPER_INDEX.get(entity);
    if (wrapper) {
      return wrapper.id;
    }
    return 0;
  };

  public idToEntity = (id: number) => {
    const wrapper = ENTITY_INDEX.get(id);
    if (wrapper) {
      return wrapper.entity;
    }
    return null;
  };

  public hashToPath = (hash: string) => {
    return this.resource.resolveHash(hash);
  };

  public pathToHash = (path: string, type: GameAssetType) => {
    return this.resource.resolveAsset(path, type);
  };

  public positionToRigidBodyPosition = (
    targetId: number,
    x: number,
    y: number,
    z: number,
  ) => {
    const wrapper = ENTITY_INDEX.get(targetId);
    if (!wrapper) {
      return { x, y, z };
    }

    const { entity } = wrapper;

    if (entity.isPlayer) {
      return { x, y, z };
    }

    const offset = this.resource.getRigidBodyOffset(entity.mesh);
    if (offset[0] === 0 && offset[1] === 0 && offset[2] === 0) {
      return { x, y, z };
    }

    const { px, py, pz } = wrapper.applyTransform(
      offset[0],
      offset[1],
      offset[2],
    );

    return {
      x: px + x,
      y: py + y,
      z: pz + z,
    };
  };

  public rigidBodyPositionToPosition = (
    targetId: number,
    x: number,
    y: number,
    z: number,
  ) => {
    const wrapper = ENTITY_INDEX.get(targetId);
    if (!wrapper) {
      return { x, y, z };
    }
    const { entity } = wrapper;

    if (entity.isPlayer) {
      return { x, y, z };
    }

    const offset = this.resource.getRigidBodyOffset(entity.mesh);
    if (offset[0] === 0 && offset[1] === 0 && offset[2] === 0) {
      return { x, y, z };
    }

    const { px, py, pz } = wrapper.applyTransform(
      -offset[0],
      -offset[1],
      -offset[2],
    );

    return {
      x: px + x,
      y: py + y,
      z: pz + z,
    };
  };
}
