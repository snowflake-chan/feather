import {
  GameMotionClipConfig,
  GameMotionConfig,
  GameMotionEvent,
  GameMotionHandler,
} from '@box/schema/api/js/api';
import { deepClone } from '@box/mudb/schema/json';
import { ScriptScheduler } from '@box/utils/script/script-scheduler';
import { ScriptDispatcher } from '@box/schema/script/dispatcher';
import { MS_PER_TICK } from '@box/schema/clock/clock-schema';
import { ScriptMeshMotion, ScriptResourceSync } from './resource';
import { coerceNum, coerceObject, coerceString } from './coerce';

const coerceMotionConfigInfo = coerceObject<GameMotionConfig>({
  name: coerceString,
  iterations: coerceNum,
});

const coerceMotionClipConfigInfo = coerceObject<GameMotionClipConfig>({
  motions: (_x: GameMotionConfig[]) => {
    return _x.map((_xMotionConfig) => {
      return coerceMotionConfigInfo(_xMotionConfig, {
        name: '',
        iterations: 1,
      });
    });
  },
  iterations: coerceNum,
});

type BaseTarget = { mesh: string };

interface MotionPlayback {
  motionId: string;
  cycleCount: number;
}

interface Playback {
  motions: MotionPlayback[];
  startTick: number;
  cycleCount: number;
  totalTicks: number;
}

export class ScriptMotionWrapper<ScriptObjectType extends BaseTarget> {
  public motionHandler: GameMotionHandler<ScriptObjectType>;
  public onFinish = new ScriptDispatcher<GameMotionEvent<ScriptObjectType>>();

  constructor(
    public group: ScriptMotionTarget<ScriptObjectType>,
    public data: Playback,
  ) {
    this.motionHandler = new GameMotionHandler<ScriptObjectType>(
      group.target,
      this.play,
      this.cancel,
      this.onFinish.channel,
      this.onFinish.future,
    );
  }

  private _checkTarget() {
    if (this.group.destroyed) {
      throw new Error('Motion target is destroyed');
    }
  }

  public play = () => {
    this._checkTarget();
    this.group.manager.sendCancelEvent(this.group.targetMotion);
    this.data.startTick = this.group.getStartTick();
    this.group.targetMotion = this;
  };

  public cancel = () => {
    this._checkTarget();
    this.group.manager.sendCancelEvent(this.group.targetMotion);
    this.group.targetMotion = undefined;
  };
}

export class ScriptMotionTarget<ScriptObjectType extends BaseTarget> {
  public destroyed: boolean = false;

  public targetMotion?: ScriptMotionWrapper<ScriptObjectType>;

  public defaultMotionId: string = '';

  public defaultStartTick: number = 0;

  public paused = false;

  public pausedTick: number = 0;

  public pausedSnapshot?: {
    defaultMotionId: string;
    defaultStartTick: number;
    targetMotion?: {
      data: Playback;
    };
  };

  constructor(
    public id: number,
    public manager: ScriptMotionManager<ScriptObjectType>,
    public target: ScriptObjectType,
  ) {}

  public loadByName(config: unknown) {
    if (this.destroyed) {
      throw new Error('Motion target is destroyed');
    }
    const data = this.parseConfig(config);
    const motion = new ScriptMotionWrapper<ScriptObjectType>(this, data);
    return motion.motionHandler;
  }

  /**
   * config会解析 string | GameMotionConfig[] | GameMotionClipConfig 三种输入类型
   * 返回 Playback 类型数据
   * @param config
   * @returns Playback
   */
  private parseConfig(config: unknown): Playback {
    if (typeof config === 'string') {
      const motionName = coerceString(config, '');
      const scriptMotion = this.getScriptMotionByName(motionName);
      return {
        motions: [
          {
            motionId: scriptMotion.id,
            cycleCount: 1,
          },
        ],
        cycleCount: 1,
        startTick: this.getStartTick(),
        totalTicks: this.durationToTicks(scriptMotion.duration),
      };
    }

    if (Array.isArray(config)) {
      const data: Playback = {
        motions: [],
        cycleCount: 1,
        startTick: this.getStartTick(),
        totalTicks: 0,
      };
      this.parseMotionConfigs(data, config);
      return data;
    }

    const motionClip = coerceMotionClipConfigInfo(config, {
      motions: [],
      iterations: 1,
    });
    const data: Playback = {
      motions: [],
      cycleCount:
        motionClip.iterations === Infinity
          ? -1
          : Math.max(motionClip.iterations, 0),
      startTick: this.getStartTick(),
      totalTicks: 0,
    };
    this.parseMotionConfigs(data, motionClip.motions);
    data.totalTicks = data.totalTicks * Math.max(motionClip.iterations, 0);
    return data;
  }

  private parseMotionConfigs(out: Playback, config: GameMotionConfig[]) {
    config.forEach((motionConfig) => {
      const motion = coerceMotionConfigInfo(motionConfig, {
        name: '',
        iterations: 1,
      });
      const scriptMotion = this.getScriptMotionByName(motion.name);
      out.motions.push({
        motionId: scriptMotion.id,
        cycleCount:
          motion.iterations === Infinity ? -1 : Math.max(motion.iterations, 0),
      });
      out.totalTicks +=
        this.durationToTicks(scriptMotion.duration) *
        Math.max(motion.iterations, 0);
    });
  }

  private durationToTicks(duration: number) {
    return (duration * 1000) / MS_PER_TICK;
  }

  public pause() {
    if (this.paused) {
      return;
    }
    this.paused = true;
    this.pausedTick = this.manager.currentTick;
    this.pausedSnapshot = {
      defaultMotionId: this.defaultMotionId,
      defaultStartTick: this.defaultStartTick,
      targetMotion: this.targetMotion
        ? {
            data: deepClone(this.targetMotion.data),
          }
        : undefined,
    };
  }

  public resume() {
    if (!this.paused) {
      return;
    }
    const currTick = this.manager.currentTick;
    const dt = currTick - this.pausedTick;
    this.defaultStartTick += dt;
    if (this.targetMotion && this.targetMotion.data.motions.length) {
      this.targetMotion.data.startTick += dt;
    }
    this.paused = false;
    this.pausedSnapshot = undefined;
  }

  public setDefaultMotionByName(motionName: unknown) {
    if (motionName === undefined) {
      this.defaultMotionId = '';
    } else {
      const name = coerceString(motionName, '');
      this.defaultMotionId = this.getScriptMotionByName(name).id;
    }
    this.defaultStartTick = this.getStartTick();
  }

  public getStartTick() {
    if (this.paused) {
      return this.pausedTick;
    }
    return this.manager.currentTick;
  }

  private getScriptMotionByName(name: string): ScriptMeshMotion {
    const motions = this.manager.resources.getMeshMotionList(this.target.mesh);
    const meshMotion = motions.find((m) => m.name === name);
    if (!meshMotion) {
      throw new Error(`Cannot find motion name ${name}`);
    }
    return meshMotion;
  }

  public destroy(reason: string) {
    if (this.targetMotion) {
      this.manager.sendCancelEvent(this.targetMotion);
      this.targetMotion.onFinish.destroy(reason, this.manager.scheduler);
      this.targetMotion = undefined;
    }
    this.manager.groups.delete(this.id);
    this.destroyed = true;
  }
}

export class ScriptMotionManager<ScriptObjectType extends BaseTarget> {
  public currentTick: number = 0;
  public groups = new Map<number, ScriptMotionTarget<ScriptObjectType>>();

  constructor(
    public resources: ScriptResourceSync,
    public schedule: <EventType extends { tick: number }>(
      dispatcher: ScriptDispatcher<EventType>,
      ev: EventType,
    ) => void,
    public scheduler: ScriptScheduler,
  ) {}

  public preTick(nextTick: number) {
    this.currentTick = nextTick;

    for (const group of this.groups.values()) {
      if (!group.targetMotion || group.paused) {
        continue;
      }
      const data = group.targetMotion.data;
      if (data.totalTicks === Infinity) {
        continue;
      }
      const startTick = data.startTick;
      const dt = nextTick - startTick;
      if (dt > data.totalTicks) {
        this.schedule(
          group.targetMotion.onFinish,
          new GameMotionEvent<ScriptObjectType>(
            nextTick,
            group.target,
            group.targetMotion.motionHandler,
            false,
          ),
        );
        group.targetMotion = undefined;
      }
    }
  }

  public sendCancelEvent(targetMotion?: ScriptMotionWrapper<ScriptObjectType>) {
    if (!targetMotion) {
      return;
    }
    this.schedule(
      targetMotion.onFinish,
      new GameMotionEvent<ScriptObjectType>(
        this.currentTick,
        targetMotion.group.target,
        targetMotion.motionHandler,
        true,
      ),
    );
  }

  public createMotionGroup(id: number, target: ScriptObjectType) {
    const wrapper = new ScriptMotionTarget(id, this, target);
    this.groups.set(id, wrapper);
    return wrapper;
  }
}
