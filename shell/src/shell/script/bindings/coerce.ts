// Used to implement JS-style fuzzy type semantics.  Performs type coercions to the engine types like vectors, etc.
import {
  GameVector3,
  GameQuaternion,
  GameRGBAColor,
  GameBounds3,
  GameRGBColor,
} from '@box/schema/api/js/math';
import {
  GameEntity,
  GameSoundEffect,
  GameSoundEffectConfig,
} from '@box/schema/api/js/api';

export function coerceNum(_x: any, y: number) {
  const x = +_x;
  if (typeof x === 'number' && !isNaN(x)) {
    return +x;
  }
  return y;
}

export function coerceVec3(x: any, y: GameVector3) {
  if (
    typeof x === 'object' &&
    typeof x.x === 'number' &&
    typeof x.y === 'number' &&
    typeof x.z === 'number'
  ) {
    y.x = coerceNum(x.x, y.x);
    y.y = coerceNum(x.y, y.y);
    y.z = coerceNum(x.z, y.z);
  } else if (Array.isArray(x) && x.length === 3) {
    y.x = coerceNum(x[0], y.x);
    y.y = coerceNum(x[1], y.y);
    y.z = coerceNum(x[2], y.z);
  }
  return y;
}

export function coerceBounds(x: any, y: GameBounds3) {
  if (typeof x === 'object') {
    coerceVec3(x.lo, y.lo);
    coerceVec3(x.hi, y.hi);
  } else if (Array.isArray(x)) {
    coerceVec3(x[0], y.lo);
    coerceVec3(x[1], y.hi);
  }
  return y;
}

export function coerceQuat(x: any, y: GameQuaternion) {
  if (
    typeof x === 'object' &&
    typeof x.w === 'number' &&
    typeof x.x === 'number' &&
    typeof x.y === 'number' &&
    typeof x.z === 'number'
  ) {
    y.w = coerceNum(x.w, y.w);
    y.x = coerceNum(x.x, y.x);
    y.y = coerceNum(x.y, y.y);
    y.z = coerceNum(x.z, y.z);
  } else if (Array.isArray(x) && x.length === 4) {
    y.w = coerceNum(x[0], y.w);
    y.x = coerceNum(x[1], y.x);
    y.y = coerceNum(x[2], y.y);
    y.z = coerceNum(x[3], y.z);
  }
  return y;
}

export function coerceRGBA(x: any, y: GameRGBAColor) {
  if (
    typeof x === 'object' &&
    typeof x.r === 'number' &&
    typeof x.g === 'number' &&
    typeof x.b === 'number' &&
    typeof x.a === 'number'
  ) {
    y.r = coerceNum(x.r, y.r);
    y.g = coerceNum(x.g, y.g);
    y.b = coerceNum(x.b, y.b);
    y.a = coerceNum(x.a, y.a);
  } else if (Array.isArray(x) && x.length === 4) {
    y.r = coerceNum(x[0], y.r);
    y.g = coerceNum(x[1], y.g);
    y.b = coerceNum(x[2], y.b);
    y.a = coerceNum(x[3], y.a);
  } else if (typeof x === 'number') {
    y.r = (x & 0xff) / 0xff;
    y.g = (x & 0xff00) / 0xff00;
    y.b = (x & 0xff0000) / 0xff0000;
    y.a = (x & 0xff000000) / 0xff000000;
  } else if (typeof x === 'string') {
    // TODO: convert color strings here, maybe support chinese names too
  }
  return y;
}

export function coerceRGB(x: any, y: GameRGBColor) {
  if (
    typeof x === 'object' &&
    typeof x.r === 'number' &&
    typeof x.g === 'number' &&
    typeof x.b === 'number'
  ) {
    y.r = coerceNum(x.r, y.r);
    y.g = coerceNum(x.g, y.g);
    y.b = coerceNum(x.b, y.b);
  } else if (Array.isArray(x) && x.length === 3) {
    y.r = coerceNum(x[0], y.r);
    y.g = coerceNum(x[1], y.g);
    y.b = coerceNum(x[2], y.b);
  } else if (typeof x === 'number') {
    y.r = (x & 0xff) / 0xff;
    y.g = (x & 0xff00) / 0xff00;
    y.b = (x & 0xff0000) / 0xff0000;
  } else if (typeof x === 'string') {
    // TODO: convert color strings here, maybe support chinese names too
  }
  return y;
}

export function coerceBool(x: any, y: boolean) {
  if (typeof x === 'undefined') {
    return y;
  }
  return !!x;
}

export function coerceString(x: any, y: string) {
  if (typeof x === 'string') {
    return x;
  }
  const r = '' + x;
  if (r) {
    return r;
  }
  return y;
}

export function coerceSizeSpline(x: any, y: number[]) {
  if (Array.isArray(x)) {
    if (x.length >= y.length) {
      for (let i = 0; i < y.length; ++i) {
        y[i] = coerceNum(x[i], y[i]);
      }
    } else if (x.length < y.length) {
      for (let i = 0; i < x.length; ++i) {
        y[i] = coerceNum(x[i], y[i]);
      }
    }
  } else {
    for (let i = 0; i < y.length; ++i) {
      y[i] = coerceNum(x, y[i]);
    }
  }
  return y;
}

export function coerceColorSpline(x: any, y: GameRGBColor[]) {
  if (Array.isArray(x)) {
    if (x.length >= y.length) {
      for (let i = 0; i < y.length; ++i) {
        y[i] = coerceRGB(x[i], y[i]);
      }
    } else if (x.length < y.length) {
      for (let i = 0; i < x.length; ++i) {
        y[i] = coerceRGB(x[i], y[i]);
      }
    }
  } else {
    for (let i = 0; i < y.length; ++i) {
      y[i] = coerceRGB(x, y[i]);
    }
  }
  return y;
}

export function coerceObject<T>(check: {
  [prop in keyof T]: (x: T[prop], def: T[prop]) => T[prop];
}) {
  const props = Object.keys(check);
  return (_spec: any, object: T) => {
    let spec = _spec;
    if (typeof _spec === 'string') {
      try {
        spec = JSON.parse(_spec);
      } catch (e) {}
    }
    if (typeof spec === 'object') {
      for (let i = 0; i < props.length; ++i) {
        const prop = props[i];
        if (prop in spec) {
          object[prop] = check[prop](spec[prop], object[prop]);
        }
      }
    }
    return object;
  };
}

export function coerceEntityRef(x: any, y: GameEntity | null) {
  if (x instanceof GameEntity) {
    return x;
  }
  return y;
}

export function coerceTags(x: any) {
  let result: string[] = [];
  if (typeof x === 'function') {
    x = x();
  }
  if (typeof x === 'string') {
    result = [x];
  } else if (Array.isArray(x)) {
    result = x.slice();
    let ptr = 0;
    for (let i = 0; i < result.length; ++i) {
      const item = result[i];
      if (typeof item === 'string') {
        result[ptr++] = item;
      }
    }
    result.length = ptr;
  }
  return result;
}

const coereceSample = coerceObject({
  sample: coerceString,
  radius: coerceNum,
  pitch: coerceNum,
  pitchRange: coerceNum,
  gain: coerceNum,
  gainRange: coerceNum,
});

export function coerceSound(x: any, y: GameSoundEffectConfig) {
  if (typeof x === 'string') {
    y.sample = x;
  } else if (typeof x === 'object') {
    coereceSample(x, y);
  }
  return y;
}
