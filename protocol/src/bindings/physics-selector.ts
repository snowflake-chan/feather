import {
  CollisionFilter,
  CollisionFilterSchema,
  CollisionGroupSchema,
} from '@box/schema/physics/collision-filter';
import {
  ZoneSelectorGroup,
  ZoneSelectorGroupSchema,
} from '@box/schema/zone/zone-schema';
import { ScriptEntityWrapper } from './entity-synchronizer';
import { ParsedSelector } from './selectors';
import { ScriptZoneWrapper } from './zone-synchronizer';

export class ScriptPhysicsSelector {
  public rules: ScriptPhysicsSelector[] = [];
  public zones: number = 0;
  public groups: number[] = [];

  public zoneGroup = ZoneSelectorGroupSchema.clone(
    ZoneSelectorGroupSchema.identity,
  );

  constructor(
    public id: number,
    public selector: string,
    public test: ParsedSelector,
  ) {}
}

export class ScriptPhysicsSelectorGroup {
  constructor(public id: number, public selectors: ScriptPhysicsSelector[]) {}
}

export class ScriptPhysicsSelectorManager {
  public dirty = true;
  public indexDirty = true;

  public selectors: ScriptPhysicsSelector[] = [];
  public selectorIndex = new Map<string, ScriptPhysicsSelector>();

  public groups: ScriptPhysicsSelectorGroup[] = [];
  public groupIndex = new Map<string, ScriptPhysicsSelectorGroup>();

  public zoneSelectors: ZoneSelectorGroup[] = [];

  public filter: CollisionFilter = CollisionFilterSchema.clone(
    CollisionFilterSchema.identity,
  );

  private _createSelector(test: ParsedSelector, selector: string) {
    const result = new ScriptPhysicsSelector(
      this.selectors.length,
      selector,
      test,
    );
    this.selectors.push(result);
    this.selectorIndex.set(selector, result);
    return result;
  }

  private _removeZoneSelector(zone: ScriptZoneWrapper) {
    if (!zone.physicsSelector) {
      return;
    }
    const selectorRef = zone.physicsSelector;
    if (--selectorRef.zones <= 0) {
      this.dirty = true;
    }
    zone.physicsSelector = null;
  }

  public setZoneSelector = (zone: ScriptZoneWrapper, selectorSrc: string) => {
    if (!selectorSrc) {
      this._removeZoneSelector(zone);
    } else {
      const selector = new ParsedSelector(selectorSrc);
      const expr = selector.toNormalizedSelector();
      const selectorRef =
        this.selectorIndex.get(expr) || this._createSelector(selector, expr);
      if (zone.physicsSelector !== selectorRef) {
        if (selectorRef.zones++ <= 0) {
          this.dirty = true;
        }
        this._removeZoneSelector(zone);
        zone.physicsSelector = selectorRef;
      }
    }
  };

  public addFilter(selectorA: string, selectorB: string) {
    let a = new ParsedSelector(selectorA);
    let an = a.toNormalizedSelector();
    let b = new ParsedSelector(selectorB);
    let bn = b.toNormalizedSelector();

    // swap so selectors are normalized
    if (bn < an) {
      const t = a;
      a = b;
      b = t;

      const tn = an;
      an = bn;
      bn = tn;
    }

    // get selectors
    const aSelector = this.selectorIndex.get(an) || this._createSelector(a, an);
    const bSelector = this.selectorIndex.get(bn) || this._createSelector(b, bn);

    // update ref count
    if (aSelector.rules.indexOf(bSelector) < 0) {
      aSelector.rules.push(bSelector);
      if (aSelector !== bSelector) {
        bSelector.rules.push(aSelector);
      }
      this.dirty = true;
    }
  }

  public removeFilter(selectorA: string, selectorB: string) {
    let an = new ParsedSelector(selectorA).toNormalizedSelector();
    let bn = new ParsedSelector(selectorB).toNormalizedSelector();
    if (bn < an) {
      const t = an;
      an = bn;
      bn = t;
    }

    const aSelector = this.selectorIndex.get(an);
    if (!aSelector) {
      return;
    }
    const bSelector = this.selectorIndex.get(bn);
    if (!bSelector) {
      return;
    }

    const aidx = aSelector.rules.indexOf(bSelector);
    if (aidx < 0) {
      return;
    }
    aSelector.rules.splice(aidx, 1);

    if (aSelector !== bSelector) {
      const bidx = bSelector.rules.indexOf(aSelector);
      if (bidx < 0) {
        return;
      }
      bSelector.rules.splice(bidx, 1);
    }

    this.dirty = true;
  }

  public list() {
    const result: string[][] = [];
    for (let i = 0; i < this.selectors.length; ++i) {
      const a = this.selectors[i];
      for (let j = 0; j < a.rules.length; ++j) {
        const b = a.rules[j];
        if (a.id <= b.id) {
          result.push([a.selector, b.selector]);
        }
      }
    }
    return result;
  }

  public clear() {
    // technically leaks, but not a big deal
    if (this.selectors.length > 0) {
      this.selectors.length = 0;
      this.selectorIndex.clear();
      this.groups.length = 0;
      this.groupIndex.clear();
      this.dirty = true;
    }
  }

  private _getGroup(selectors: ScriptPhysicsSelector[]) {
    let uuid: string = '';
    for (let i = 0; i < selectors.length; ++i) {
      uuid += selectors[i].id + ',';
    }
    let group = this.groupIndex.get(uuid);
    if (!group) {
      const id = this.groups.length;
      group = new ScriptPhysicsSelectorGroup(id, selectors);
      this.groups.push(group);
      this.groupIndex.set(uuid, group);

      const zoneBin = id >>> 5;
      const zoneBit = 1 << (id & 31);

      // propagate group to all selectors
      for (let i = 0; i < selectors.length; ++i) {
        const s = selectors[i];
        const adj = s.rules;
        for (let j = 0; j < adj.length; ++j) {
          adj[j].groups.push(id);
        }

        // set group bit in all zone selector groups
        if (s.zones > 0) {
          const zg = s.zoneGroup;
          while (zg.groupBits.length <= zoneBin) {
            zg.groupBits.push(0);
          }
          zg.groupBits[zoneBin] |= zoneBit;
        }
      }

      // combine collision selectors into one rule
      // (need 2 passes to handle cycles)
      const filter: { [group: number]: boolean } = {};
      const sortedGroups: number[] = [];
      for (let i = 0; i < selectors.length; ++i) {
        const selectorGroups = selectors[i].groups;
        for (let j = 0; j < selectorGroups.length; ++j) {
          const g = selectorGroups[j];
          if (!filter[g]) {
            filter[g] = true;
            sortedGroups.push(g);
          }
        }
      }
      sortedGroups.push(id + 1);
      sortedGroups.sort((a, b) => a - b);

      // run length encode the groups
      const rleGroups = CollisionGroupSchema.alloc();
      rleGroups.length = 0;
      this.filter.push(rleGroups);

      rleGroups.push(sortedGroups[0]);
      for (let i = 1; i < sortedGroups.length; ++i) {
        const x = sortedGroups[i];
        const y = sortedGroups[i - 1] + 1;
        if (x <= y) {
          continue;
        }
        rleGroups.push(y, x);
      }

      // remove sentinel value
      if (rleGroups[rleGroups.length - 1] === id + 1) {
        rleGroups.pop();
      }

      this.indexDirty = true;
    }
    return group;
  }

  private _updateEntityGroup(entity: ScriptEntityWrapper) {
    if (!entity.entity.collides) {
      entity.collisionGroup = null;
      return;
    }

    const selectors: ScriptPhysicsSelector[] = [];
    for (let i = 0; i < this.selectors.length; ++i) {
      const selector = this.selectors[i];
      if (selector.test.testEntity(entity)) {
        selectors.push(selector);
      }
    }
    entity.collisionGroup = this._getGroup(selectors);
  }

  public update(entities: ScriptEntityWrapper[]) {
    if (!this.dirty) {
      return;
    }

    // first compact selector index
    let ptr = 0;
    this.zoneSelectors.length = 0;
    for (let i = 0; i < this.selectors.length; ++i) {
      const s = this.selectors[i];
      if (s.rules.length <= 0 && s.zones <= 0) {
        this.selectorIndex.delete(s.selector);
      } else {
        s.id = i;
        s.groups.length = 0;
        this.selectors[ptr++] = s;

        if (s.zones > 0) {
          const zg = s.zoneGroup;
          zg.id = s.id;
          zg.groupBits.length = 0;
          this.zoneSelectors.push(zg);
        }
      }
    }
    this.selectors.length = ptr;

    // next reset all groups
    this.groups.length = 0;
    this.groupIndex.clear();

    // clear filter
    CollisionFilterSchema.assign(this.filter, CollisionFilterSchema.identity);

    // ensure that group 0 = default player group
    this._getGroup(this.selectors.filter((s) => s.test.matchPlayer));

    // next assign all bodies to a group
    for (let i = 0; i < entities.length; ++i) {
      this._updateEntityGroup(entities[i]);
    }

    // clear dirty flag
    this.dirty = false;

    // notify that index needs to be resync'd
    this.indexDirty = true;
  }

  public notifyDirty() {
    this.dirty = true;
  }
}
