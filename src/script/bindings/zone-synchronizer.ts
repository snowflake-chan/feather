import {
  GameZone,
  GameTriggerEvent,
  GameZoneConfig,
  GameEntity,
} from '@box/schema/api/js/api';
import { NumSetSchema, ScriptEntityWrapper } from './entity-synchronizer';
import { ScriptDispatcher } from '@box/schema/script/dispatcher';
import {
  coerceObject,
  coerceBounds,
  coerceString,
  coerceNum,
  coerceBool,
  coerceVec3,
  coerceRGB,
  coerceRGBA,
} from './coerce';
import { ParsedSelector } from './selectors';
import {
  ScriptPhysicsSelector,
  ScriptPhysicsSelectorManager,
} from './physics-selector';
import { MuBoolean, MuSchema, MuSortedArray, MuStruct } from '@box/mudb/schema';
import { compareId, TaggedId } from '@box/utils/id';
import {
  PhysicsZoneBinding,
  EnvironmentZoneBinding,
  ZONE_INDEX,
} from './zone-bindings';
import {
  PhysicsZone,
  ZoneSelectorGroupSetSchema,
} from '@box/schema/zone/zone-schema';
import { ScriptSynchronizer, ScriptSyncPatch } from './synchronizer';
import { ScriptResourceSync } from './resource';
import { sortedArrayDelete } from '@box/utils/sorted-array-remove';
import { synchronizeComponent } from './entity-update';
import { MAX_ZONES, ServerEnvironmentZone } from '../../zone/zone-server-state';
import { GameVector3 } from '@box/schema/api/js/math';
import { ScriptPerfCounter } from '../script-protocol';
import { ScriptScheduler } from '@box/utils/script/script-scheduler';

export const ScriptZoneUpdateSchema = new MuStruct({
  // physics zones
  physicsZones: new MuSortedArray(PhysicsZoneBinding, Infinity, compareId),
  deletedPhysicsZones: NumSetSchema,

  // environment zones
  environmentZones: new MuSortedArray(
    EnvironmentZoneBinding,
    Infinity,
    compareId,
  ),
  deletedEnvironmentZones: NumSetSchema,

  // selector index
  selectorsChanged: new MuBoolean(false),
  zoneSelectors: ZoneSelectorGroupSetSchema,
});
export type ScriptZoneUpdate = typeof ScriptZoneUpdateSchema.identity;

export const coerceZone = coerceObject<GameZoneConfig>({
  bounds: coerceBounds,
  selector: coerceString,

  massScale: coerceNum,
  force: coerceVec3,

  fogEnabled: coerceBool,
  fogColor: coerceRGB,
  fogStartDistance: coerceNum,
  fogHeightOffset: coerceNum,
  fogHeightFalloff: coerceNum,
  fogDensity: coerceNum,
  fogMax: coerceNum,

  snowEnabled: coerceBool,
  snowDensity: coerceNum,
  snowSizeLo: coerceNum,
  snowSizeHi: coerceNum,
  snowFallSpeed: coerceNum,
  snowSpinSpeed: coerceNum,
  snowColor: coerceRGBA,
  snowTexture: coerceString,

  rainEnabled: coerceBool,
  rainDensity: coerceNum,
  rainDirection: coerceVec3,
  rainSpeed: coerceNum,
  rainSizeLo: coerceNum,
  rainSizeHi: coerceNum,
  rainInterference: coerceNum,
  rainColor: coerceRGBA,

  skyEnabled: coerceBool,
  skyMode: (x, y) => {
    if (x === 'manual' || x === 'natural') {
      return x;
    }
    return y;
  },
  skySunPhase: coerceNum,
  skySunFrequency: coerceNum,
  skyLunarPhase: coerceNum,
  skySunDirection: coerceVec3,
  skySunLight: coerceRGB,
  skyLeftLight: coerceRGB,
  skyRightLight: coerceRGB,
  skyBottomLight: coerceRGB,
  skyTopLight: coerceRGB,
  skyFrontLight: coerceRGB,
  skyBackLight: coerceRGB,
});

export class ScriptZoneWrapper {
  public zone: GameZone;

  // If forces are active, then we need a collision selector
  public physicsSelector: ScriptPhysicsSelector | null = null;

  public currentSelectorString: string = '*';
  public currentSelectorTest: ParsedSelector = new ParsedSelector('*');

  public activeEntities = new Set<ScriptEntityWrapper>();

  public onEnter = new ScriptDispatcher<GameTriggerEvent>(false);
  public onLeave = new ScriptDispatcher<GameTriggerEvent>(false);

  public entities = () => {
    const result: GameEntity[] = [];
    for (const e of this.activeEntities) {
      result.push(e.entity);
    }
    return result;
  };

  public prevPhysicsSelectorState = false;

  public needsPhysicsSelector() {
    if (
      this.zone.fogEnabled ||
      this.zone.rainEnabled ||
      this.zone.skyEnabled ||
      this.zone.snowEnabled
    ) {
      return true;
    }
    const f = this.zone.force;
    if (f instanceof GameVector3) {
      return !!(f.x || f.y || f.z);
    } else if (Array.isArray(f)) {
      return !!(f[0] || f[1] || f[2]);
    }
    return false;
  }

  constructor(public id: number, system: ScriptZoneSystem) {
    this.zone = new GameZone(
      this.entities,
      this.onEnter.channel,
      this.onEnter.future,
      this.onLeave.channel,
      this.onLeave.future,
      () => system.removeZone(this.zone),
    );
  }

  public testEntity(wrapper: ScriptEntityWrapper) {
    if (!wrapper.entity.collides) {
      return false;
    }
    if (!this.currentSelectorTest.testEntity(wrapper)) {
      return false;
    }
    const bounds = this.zone.bounds;
    const ebounds = wrapper.entity.bounds;
    const epos = wrapper.entity.position;
    const lo = bounds.lo;
    const hi = bounds.hi;
    if (
      epos.x < lo.x - ebounds.x ||
      epos.y < lo.y - ebounds.y ||
      epos.z < lo.z - ebounds.z ||
      epos.x > hi.x + ebounds.x ||
      epos.y > hi.y + ebounds.y ||
      epos.z > hi.z + ebounds.z
    ) {
      return false;
    }
    return true;
  }
}

export class ScriptZoneSystem {
  public zoneCounter: number = 0;

  public zones: ScriptZoneWrapper[] = [];

  // zone replicas
  public physicsZones: PhysicsZone[] = [];
  public environmentZones: ServerEnvironmentZone[] = [];

  private _tick: number = 0;

  public rebuildPhysicsSelectorIndex() {
    for (let i = 0; i < this.zones.length; ++i) {
      const z = this.zones[i];
      if (z.needsPhysicsSelector()) {
        z.prevPhysicsSelectorState = true;
        this.physicsSelectors.setZoneSelector(z, z.currentSelectorString);
      } else {
        z.prevPhysicsSelectorState = false;
        z.physicsSelector = null;
      }
    }
  }

  constructor(
    public resources: ScriptResourceSync,
    public schedule: (
      dispatcher: ScriptDispatcher<GameTriggerEvent>,
      event: GameTriggerEvent,
    ) => void,
    public scheduler: ScriptScheduler,
    public physicsSelectors: ScriptPhysicsSelectorManager,
    public perf: ScriptPerfCounter,
  ) {}

  public listZones = () => this.zones.map((t) => t.zone);
  public addZone = (config: Partial<GameZoneConfig>) => {
    if (this.zones.length > MAX_ZONES) {
      throw new Error('Zone quota exceeded');
    }

    this.perf.zonesCreated++;
    const result = new ScriptZoneWrapper(++this.zoneCounter, this);
    this.zones.push(result);
    ZONE_INDEX.set(result.zone, result);
    coerceZone(config, result.zone);
    result.currentSelectorTest = new ParsedSelector(result.zone.selector);
    result.zone.selector = result.currentSelectorString =
      result.currentSelectorTest.toNormalizedSelector();
    if (result.needsPhysicsSelector()) {
      result.prevPhysicsSelectorState = true;
      this.physicsSelectors.setZoneSelector(
        result,
        result.currentSelectorString,
      );
    } else {
      result.prevPhysicsSelectorState = false;
      result.physicsSelector = null;
    }
    return result.zone;
  };
  public removeZone = (zone: GameZone) => {
    const wrapper = ZONE_INDEX.get(zone);
    if (!wrapper) {
      return;
    }

    this.perf.zonesDestroyed++;
    ZONE_INDEX.delete(zone);
    const idx = this.zones.indexOf(wrapper);
    if (idx >= 0) {
      this.zones.splice(idx, 1);
    }

    for (const e of wrapper.activeEntities) {
      this.schedule(
        wrapper.onLeave,
        new GameTriggerEvent(this._tick, e.entity),
      );
    }

    wrapper.activeEntities.clear();
    wrapper.onEnter.destroy('removed zone', this.scheduler);
    wrapper.onLeave.destroy('removed zone', this.scheduler);
  };

  public pollZones(tick: number, entities: ScriptEntityWrapper[]) {
    this._tick = tick;
    if (this.zones.length === 0) {
      return;
    }
    for (let i = 0; i < this.zones.length; ++i) {
      const t = this.zones[i];
      coerceZone(t.zone, t.zone);

      let stateChanged = false;
      if (t.currentSelectorString !== t.zone.selector) {
        const parsed = (t.currentSelectorTest = new ParsedSelector(
          t.currentSelectorString,
        ));
        t.currentSelectorString = parsed.toNormalizedSelector();
        t.zone.selector = t.currentSelectorString;
        stateChanged = true;
      }

      const curPhysics = t.needsPhysicsSelector();
      if (curPhysics && (!t.prevPhysicsSelectorState || stateChanged)) {
        this.physicsSelectors.setZoneSelector(t, t.currentSelectorString);
      } else if (!curPhysics && t.prevPhysicsSelectorState) {
        this.physicsSelectors.setZoneSelector(t, '');
      }
      t.prevPhysicsSelectorState = curPhysics;

      for (const e of t.activeEntities) {
        if (!t.testEntity(e)) {
          t.activeEntities.delete(e);
          this.schedule(t.onLeave, new GameTriggerEvent(tick, e.entity));
        }
      }
    }
    for (let i = 0; i < entities.length; ++i) {
      const e = entities[i];
      for (let j = 0; j < this.zones.length; ++j) {
        const t = this.zones[j];
        if (t.activeEntities.has(e)) {
          continue;
        }
        if (t.testEntity(e)) {
          t.activeEntities.add(e);
          this.schedule(t.onEnter, new GameTriggerEvent(tick, e.entity));
        }
      }
    }
  }

  // copy-pasted from entity synchronizer with some trivial modifications... :(
  private _postTickComponentSparse<
    Component extends TaggedId,
    Schema extends MuSchema<Component>,
  >(
    synchronizer: ScriptSynchronizer<GameZone, Schema>,
    component: Component[],
    patch: ScriptSyncPatch[],
    remove: number[],
  ) {
    if (!synchronizer.hasComponent) {
      return;
    }
    const zones = this.zones;
    const resources = this.resources;
    let eptr = 0;
    let cptr = 0;
    while (eptr < zones.length && cptr < component.length) {
      const e = zones[eptr];
      const c = component[cptr];
      if (e.id < c.id) {
        if (synchronizer.hasComponent(e.zone, resources)) {
          const delta =
            synchronizer.postTick(
              e.zone,
              synchronizer.engineSchema.identity,
              resources,
            ) || synchronizer.clone(synchronizer.identity);
          delta.id = e.id;
          patch.push(delta);
        }
        eptr++;
      } else if (c.id < e.id) {
        remove.push(e.id);
        cptr++;
      } else {
        if (synchronizer.hasComponent(e.zone, resources)) {
          const delta = synchronizer.postTick(e.zone, c, resources);
          if (delta) {
            delta.id = e.id;
            patch.push(delta);
          }
        } else {
          remove.push(e.id);
        }
        eptr++;
        cptr++;
      }
    }
    while (eptr < zones.length) {
      const e = zones[eptr++];
      if (synchronizer.hasComponent(e.zone, resources)) {
        const delta =
          synchronizer.postTick(
            e.zone,
            synchronizer.engineSchema.identity,
            resources,
          ) || synchronizer.clone(synchronizer.identity);
        delta.id = e.id;
        patch.push(delta);
      }
    }

    // apply patch and continue
    sortedArrayDelete(synchronizer.engineSchema, component, remove);
    synchronizeComponent(synchronizer, component, patch, {});
  }

  public postTick(update: ScriptZoneUpdate) {
    this.perf.zonesLive = this.zones.length;

    // update components
    this._postTickComponentSparse(
      PhysicsZoneBinding,
      this.physicsZones,
      update.physicsZones,
      update.deletedPhysicsZones,
    );
    this._postTickComponentSparse(
      EnvironmentZoneBinding,
      this.environmentZones,
      update.environmentZones,
      update.deletedEnvironmentZones,
    );

    // update index (if required)
    if (this.physicsSelectors.indexDirty) {
      update.selectorsChanged = true;
      ZoneSelectorGroupSetSchema.assign(
        update.zoneSelectors,
        this.physicsSelectors.zoneSelectors,
      );
    } else {
      update.selectorsChanged = false;
      ZoneSelectorGroupSetSchema.assign(
        update.zoneSelectors,
        ZoneSelectorGroupSetSchema.identity,
      );
    }
  }
}
