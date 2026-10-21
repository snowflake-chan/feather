import { vec2, vec3 } from 'gl-matrix';
import type * as I from '@box/script-api';
import { UICoord2, UICoord2RDA } from '@box/schema/project/ui-rda/defs';

export class Coord2 {
  public readonly offset: Vec2;
  public readonly scale: Vec2;
  public readonly copy: (val: Coord2) => void;
  constructor(coord: UICoord2) {
    this.offset = new Vec2(coord.offset);
    this.scale = new Vec2(coord.ratio);

    this.copy = (val: Coord2) => {
      UICoord2RDA.stateSchema.assign(coord, {
        offset: [val.offset.x, val.offset.y],
        ratio: [val.scale.x, val.scale.y],
      });
    };
  }

  static create(val?: Coord2) {
    const v = UICoord2RDA.stateSchema.alloc();
    const newCoord = new Coord2(v);

    if (val) {
      newCoord.copy(val);
    } else {
      vec2.zero(v.offset);
      vec2.zero(v.ratio);
    }

    return newCoord;
  }
}

export class Vec2 {
  public x!: number;
  public y!: number;
  public readonly copy: (val: Vec2) => void;
  constructor(val: vec2) {
    Object.defineProperties(this, {
      x: {
        get() {
          return val[0];
        },
        set(x: number) {
          val[0] = x;
        },
      },
      y: {
        get() {
          return val[1];
        },
        set(y: number) {
          val[1] = y;
        },
      },
    });

    this.copy = (val: Vec2) => {
      this.x = val.x;
      this.y = val.y;
    };
  }

  static create(val?: Vec2) {
    const v = new Vec2(vec2.create());

    if (val) {
      v.copy(val);
    }

    return v;
  }
}

export class Vec3 implements I.Vec3 {
  public x!: number;
  public y!: number;
  public z!: number;
  public r!: number;
  public g!: number;
  public b!: number;
  public readonly copy: (val: Vec3) => void;
  constructor(val: vec3) {
    Object.defineProperties(this, {
      x: {
        get() {
          return val[0];
        },
        set(x: number) {
          val[0] = x;
        },
      },
      y: {
        get() {
          return val[1];
        },
        set(y: number) {
          val[1] = y;
        },
      },
      z: {
        get() {
          return val[2];
        },
        set(z: number) {
          val[2] = z;
        },
      },
      r: {
        get() {
          return val[0];
        },
        set(r: number) {
          val[0] = r;
        },
      },
      g: {
        get() {
          return val[1];
        },
        set(g: number) {
          val[1] = g;
        },
      },
      b: {
        get() {
          return val[2];
        },
        set(b: number) {
          val[2] = b;
        },
      },
    });

    this.copy = (newVal: Vec3) => {
      val[0] = typeof newVal.x !== 'undefined' ? newVal.x : newVal.r;
      val[1] = typeof newVal.y !== 'undefined' ? newVal.y : newVal.g;
      val[2] = typeof newVal.z !== 'undefined' ? newVal.z : newVal.b;
    };
  }

  static create(val?: Vec3) {
    const v = new Vec3(vec3.create());

    if (val) {
      v.copy(val);
    }

    return v;
  }
}
