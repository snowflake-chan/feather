// 无 codegen 的 mudb schema 替身（PoC 用）
//
// 保留与 mudb 一致的对外接口：
//   identity / muData / json / alloc / free / equal / clone / assign
//   diff / patch / toJSON / fromJSON / stats / pool
// 但 diff/patch 不是二进制实现，而是留给后续 JSON 传输改造（这里先做成空实现，
// 只用于测量「构造 + 加载」的内存成本，不参与真实收发）。
'use strict';

const TYPED_ARRAYS = {
  float32: Float32Array,
  float64: Float64Array,
  int8: Int8Array,
  int16: Int16Array,
  int32: Int32Array,
  uint8: Uint8Array,
  uint16: Uint16Array,
  uint32: Uint32Array,
};

function deepClone(v) {
  if (v === null || typeof v !== 'object') return v;
  if (v instanceof Uint8Array) return new Uint8Array(v);
  if (v instanceof Float32Array) return new Float32Array(v);
  if (v instanceof Float64Array) return new Float64Array(v);
  if (v instanceof Date) return new Date(v.getTime());
  if (Array.isArray(v)) {
    const a = new Array(v.length);
    for (let i = 0; i < v.length; i++) a[i] = deepClone(v[i]);
    return a;
  }
  const o = {};
  for (const k in v) o[k] = deepClone(v[k]);
  return o;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }
  if (ArrayBuffer.isView(a) || ArrayBuffer.isView(b)) {
    if (a.constructor !== b.constructor || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!deepEqual(a[k], b[k])) return false;
  return true;
}

function attachMethods(o) {  o.pool = [];
  o.alloc = () => deepClone(o.identity);
  o.free = () => {};
  o.equal = (a, b) => deepEqual(a, b);
  o.clone = (v) => deepClone(v);
  o.assign = (dst, src) => {
    if (Array.isArray(dst) && Array.isArray(src)) {
      dst.length = 0;
      for (const x of src) dst.push(deepClone(x));
      return dst;
    }
    for (const k in src) dst[k] = deepClone(src[k]);
    return dst;
  };
  // 统计用：不写流、不返回 patch
  o.diff = () => true;
  o.patch = (base) => deepClone(base);
  o.toJSON = (v) => deepClone(v);
  o.fromJSON = (v) => deepClone(v);
  o.stats = () => ({ allocCount: 0, freeCount: 0 });
  return o;
}

class StubPrimitive {
  constructor(muType, identity) {
    this.muType = muType;
    this.identity = identity;
    this.muData = null;
    this.json = { type: muType, identity };
    attachMethods(this);
  }
}

class StubStruct {
  constructor(spec) {
    this.muType = 'struct';
    this._props = Object.keys(spec).sort();
    this.muData = {};
    this.json = { type: 'struct', subTypes: {} };
    this.identity = {};
    for (const p of this._props) {
      this.muData[p] = spec[p];
      this.json.subTypes[p] = spec[p].json;
      this.identity[p] = deepClone(spec[p].identity);
    }
    attachMethods(this);
  }
}

class StubArray {
  constructor(schema, capacity, identity) {
    this.muType = 'array';
    this.muData = schema;
    this.capacity = capacity;
    this.json = { type: 'array', valueType: schema.json };
    this.identity = identity ? deepClone(identity) : [];
    attachMethods(this);
  }
}

class StubSortedArray extends StubArray {
  constructor(schema, capacity, compare, identity) {
    super(schema, capacity, identity);
    this.muType = 'sorted-array';
    this.compare = compare || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    this.identity.sort(this.compare);
  }
}

class StubDictionary {
  constructor(schema, capacity, identity) {
    this.muType = 'dictionary';
    this.muData = schema;
    this.capacity = capacity;
    this.json = { type: 'dictionary', valueType: schema.json };
    this.identity = {};
    if (identity) for (const k in identity) this.identity[k] = deepClone(identity[k]);
    attachMethods(this);
  }
}

class StubUnion {
  constructor(spec, identityType) {
    this.muType = 'union';
    this.muData = spec;
    this._types = Object.keys(spec).sort();
    this.json = { type: 'union', subTypes: {} };
    for (const k of this._types) this.json.subTypes[k] = spec[k].json;
    if (identityType !== undefined) {
      this.identity = { type: identityType, value: deepClone(spec[identityType].identity) };
    } else {
      this.identity = { type: this._types[0], value: deepClone(spec[this._types[0]].identity) };
    }
    attachMethods(this);
  }
}

class StubOption {
  constructor(schema, identity, identityIsUndefined = false) {
    this.muType = 'option';
    this.muData = schema;
    this.json = {
      type: 'option',
      valueType: schema.json,
      identityIsUndefined: !!identityIsUndefined,
    };
    if (identityIsUndefined) this.identity = undefined;
    else this.identity = identity !== undefined ? deepClone(identity) : deepClone(schema.identity);
    attachMethods(this);
  }
}

class StubVector {
  constructor(schema, dimension) {
    this.muType = 'vector';
    this.muData = schema;
    this.dimension = dimension;
    const T = TYPED_ARRAYS[schema.muType] || Float32Array;
    this.TypedArray = T;
    this.identity = new T(dimension);
    for (let i = 0; i < dimension; ++i) this.identity[i] = schema.identity;
    this.json = { type: 'vector', valueType: schema.json, dimension };
    attachMethods(this);
  }
}

class StubBytes extends StubPrimitive {
  constructor(identity) {
    super('bytes', identity ? new Uint8Array(identity) : new Uint8Array(1));
  }
}

class StubDate extends StubPrimitive {
  constructor(identity) {
    super('date', new Date(identity ? identity.getTime() : 0));
  }
}

class StubJSON extends StubPrimitive {
  constructor(identity) {
    super('json', deepClone(identity) || {});
  }
}

class StubQuantizedFloat extends StubPrimitive {
  constructor(precision, identity) {
    super('quantized-float', identity || 0);
    this.precision = precision;
    this.invPrecision = 1 / precision;
  }
}

const primitive = (type) =>
  class extends StubPrimitive {
    constructor(identity) {
      super(type, type === 'boolean' ? !!identity : identity === undefined ? 0 : identity);
    }
  };

const files = {
  struct: { MuStruct: StubStruct },
  array: { MuArray: StubArray },
  'sorted-array': { MuSortedArray: StubSortedArray },
  dictionary: { MuDictionary: StubDictionary },
  union: { MuUnion: StubUnion },
  option: { MuOption: StubOption },
  vector: { MuVector: StubVector },
  bytes: { MuBytes: StubBytes },
  date: { MuDate: StubDate },
  json: { MuJSON: StubJSON, deepClone },
  'quantized-float': { MuQuantizedFloat: StubQuantizedFloat },
  boolean: { MuBoolean: primitive('boolean') },
  int8: { MuInt8: primitive('int8') },
  int16: { MuInt16: primitive('int16') },
  int32: { MuInt32: primitive('int32') },
  uint8: { MuUint8: primitive('uint8') },
  uint16: { MuUint16: primitive('uint16') },
  uint32: { MuUint32: primitive('uint32') },
  float32: { MuFloat32: primitive('float32') },
  float64: { MuFloat64: primitive('float64') },
  varint: { MuVarint: primitive('varint') },
  rvarint: { MuRelativeVarint: primitive('rvarint') },
  utf8: { MuUTF8: primitive('utf8') },
  ascii: { MuASCII: primitive('ascii') },
  'fixed-ascii': { MuFixedASCII: primitive('fixed-ascii') },
  void: { MuVoid: primitive('void') },
};

module.exports.__files = files;
module.exports.__all = Object.assign({}, ...Object.values(files));
