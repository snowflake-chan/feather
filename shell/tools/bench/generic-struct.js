// MuStruct 的「无 codegen」实现：通用解释器，逐字段循环
//
// 目标：与 mudb 原生 MuStruct 的二进制线格式逐字节一致，
// 这样引擎侧不需要任何改动，也不需要改成 JSON 传输。
//
// 方法挂在原型上（原生实现是每个实例 12 个闭包）。
'use strict';

// 与 mudb/schema/struct.js 完全一致的排序依据
const muPrimitiveSize = {
  boolean: 0,
  uint8: 1,
  uint16: 2,
  uint32: 4,
  int8: 1,
  int16: 2,
  int32: 4,
  float32: 4,
  float64: 8,
  varint: 5,
  rvarint: 5,
  'quantized-float': 5,
};
const muPrimitiveTypes = Object.keys(muPrimitiveSize);

const writeMethod = {
  boolean: 'writeUint8',
  float32: 'writeFloat32',
  float64: 'writeFloat64',
  int8: 'writeInt8',
  int16: 'writeInt16',
  int32: 'writeInt32',
  uint8: 'writeUint8',
  uint16: 'writeUint16',
  uint32: 'writeUint32',
  utf8: 'writeString',
  varint: 'writeVarint',
};
const readMethod = {
  boolean: 'readUint8',
  float32: 'readFloat32',
  float64: 'readFloat64',
  int8: 'readInt8',
  int16: 'readInt16',
  int32: 'readInt32',
  uint8: 'readUint8',
  uint16: 'readUint16',
  uint32: 'readUint32',
  utf8: 'readString',
  varint: 'readVarint',
};

function isInlinePrimitive(muType) {
  return (
    muType === 'ascii' ||
    muType === 'fixed-ascii' ||
    muType === 'utf8' ||
    muType === 'boolean' ||
    muType === 'float32' ||
    muType === 'float64' ||
    muType === 'int8' ||
    muType === 'int16' ||
    muType === 'int32' ||
    muType === 'uint8' ||
    muType === 'uint16' ||
    muType === 'uint32' ||
    muType === 'varint' ||
    muType === 'rvarint' ||
    muType === 'quantized-float'
  );
}

class MuStruct {
  constructor(spec) {
    this.muType = 'struct';

    const props = (this._props = Object.keys(spec).sort((a, b) => {
      const ai = muPrimitiveTypes.indexOf(spec[a].muType);
      const bi = muPrimitiveTypes.indexOf(spec[b].muType);
      return bi - ai || (a < b ? -1 : b < a ? 1 : 0);
    }));
    const types = (this._types = props.map((p) => spec[p]));

    const muData = (this.muData = {});
    const json = (this.json = { type: 'struct', subTypes: {} });
    const identity = (this.identity = {});
    let baseSize = (this._trackerBytes = Math.ceil(props.length / 8));

    for (let i = 0; i < props.length; ++i) {
      const p = props[i];
      const t = types[i];
      muData[p] = t;
      json.subTypes[p] = t.json;
      const mt = t.muType;
      if (mt in muPrimitiveSize) baseSize += muPrimitiveSize[mt];
      switch (mt) {
        case 'boolean':
        case 'int8':
        case 'int16':
        case 'int32':
        case 'uint8':
        case 'uint16':
        case 'uint32':
        case 'varint':
        case 'rvarint':
        case 'float32':
        case 'float64':
        case 'quantized-float':
          identity[p] = t.identity;
          break;
        case 'ascii':
        case 'fixed-ascii':
        case 'utf8':
          identity[p] = t.identity;
          break;
        default:
          identity[p] = t.clone(t.identity);
      }
    }
    this._baseSize = baseSize;
    this.pool = [];
    this.allocCount = 0;
    this.freeCount = 0;
  }

  // 与原生 _alloc 一致：优先复用池
  _alloc() {
    ++this.allocCount;
    return this.pool.length > 0 ? this.pool.pop() : this._new();
  }

  _new() {
    // 按固定顺序赋值，保持 hidden class 稳定
    const s = {};
    const props = this._props;
    const types = this._types;
    for (let i = 0; i < props.length; ++i) {
      const t = types[i];
      const mt = t.muType;
      switch (mt) {
        case 'boolean':
        case 'int8':
        case 'int16':
        case 'int32':
        case 'uint8':
        case 'uint16':
        case 'uint32':
        case 'varint':
        case 'rvarint':
        case 'float32':
        case 'float64':
        case 'quantized-float':
        case 'ascii':
        case 'fixed-ascii':
        case 'utf8':
          s[props[i]] = t.identity;
          break;
        default:
          s[props[i]] = null;
      }
    }
    return s;
  }

  alloc() {
    const s = this._alloc();
    const props = this._props;
    const types = this._types;
    for (let i = 0; i < props.length; ++i) {
      const t = types[i];
      if (!isInlinePrimitive(t.muType)) s[props[i]] = t.alloc();
    }
    return s;
  }

  free(s) {
    const props = this._props;
    const types = this._types;
    for (let i = 0; i < props.length; ++i) {
      const t = types[i];
      if (!isInlinePrimitive(t.muType)) t.free(s[props[i]]);
    }
    this.pool.push(s);
    ++this.freeCount;
  }

  equal(a, b) {
    const props = this._props;
    const types = this._types;
    for (let i = 0; i < props.length; ++i) {
      const p = props[i];
      const t = types[i];
      switch (t.muType) {
        case 'boolean':
        case 'int8':
        case 'int16':
        case 'int32':
        case 'uint8':
        case 'uint16':
        case 'uint32':
        case 'float32':
        case 'float64':
        case 'varint':
        case 'rvarint':
        case 'utf8':
        case 'ascii':
        case 'fixed-ascii':
          if (a[p] !== b[p]) return false;
          break;
        case 'quantized-float':
          if (((t.invPrecision * a[p]) >> 0) !== ((t.invPrecision * b[p]) >> 0)) return false;
          break;
        default:
          if (!t.equal(a[p], b[p])) return false;
      }
    }
    return true;
  }

  clone(s) {
    const c = this._alloc();
    const props = this._props;
    const types = this._types;
    for (let i = 0; i < props.length; ++i) {
      const p = props[i];
      const t = types[i];
      switch (t.muType) {
        case 'boolean':
        case 'int8':
        case 'int16':
        case 'int32':
        case 'uint8':
        case 'uint16':
        case 'uint32':
        case 'float32':
        case 'float64':
        case 'varint':
        case 'rvarint':
        case 'utf8':
        case 'ascii':
        case 'fixed-ascii':
          c[p] = s[p];
          break;
        case 'quantized-float':
          c[p] = (((t.invPrecision * s[p]) >> 0) * t.precision);
          break;
        default:
          c[p] = t.clone(s[p]);
      }
    }
    return c;
  }

  assign(d, s) {
    const props = this._props;
    const types = this._types;
    for (let i = 0; i < props.length; ++i) {
      const p = props[i];
      const t = types[i];
      switch (t.muType) {
        case 'boolean':
        case 'int8':
        case 'int16':
        case 'int32':
        case 'uint8':
        case 'uint16':
        case 'uint32':
        case 'float32':
        case 'float64':
        case 'varint':
        case 'rvarint':
        case 'utf8':
        case 'ascii':
        case 'fixed-ascii':
          d[p] = s[p];
          break;
        case 'quantized-float':
          d[p] = (((t.invPrecision * s[p]) >> 0) * t.precision);
          break;
        default:
          d[p] = t.assign(d[p], s[p]);
      }
    }
    return d;
  }

  diff(b, t, s) {
    const props = this._props;
    const types = this._types;
    const trackerBytes = this._trackerBytes;
    const head = s.offset;
    s.grow(this._baseSize);
    s.offset += trackerBytes;
    let np = 0;
    let tr = 0;
    for (let i = 0; i < props.length; ++i) {
      const p = props[i];
      const type = types[i];
      switch (type.muType) {
        case 'boolean':
          if (b[p] !== t[p]) {
            ++np;
            tr |= 1 << (i & 7);
          }
          break;
        case 'float32':
        case 'float64':
        case 'int8':
        case 'int16':
        case 'int32':
        case 'uint8':
        case 'uint16':
        case 'uint32':
        case 'varint':
        case 'utf8':
          if (b[p] !== t[p]) {
            s[writeMethod[type.muType]](t[p]);
            ++np;
            tr |= 1 << (i & 7);
          }
          break;
        case 'rvarint':
          if (b[p] !== t[p]) {
            s.writeVarint((0xaaaaaaaa + (t[p] - b[p])) ^ 0xaaaaaaaa);
            ++np;
            tr |= 1 << (i & 7);
          }
          break;
        case 'ascii':
          if (b[p] !== t[p]) {
            s.grow(5 + t[p].length);
            s.writeVarint(t[p].length);
            s.writeASCII(t[p]);
            ++np;
            tr |= 1 << (i & 7);
          }
          break;
        case 'quantized-float': {
          const br = (type.invPrecision * b[p]) >> 0;
          const trv = (type.invPrecision * t[p]) >> 0;
          if (br !== trv) {
            s.writeVarint(((0xaaaaaaaa + (trv - br)) ^ 0xaaaaaaaa) >>> 0);
            ++np;
            tr |= 1 << (i & 7);
          }
          break;
        }
        default:
          if (type.diff(b[p], t[p], s)) {
            ++np;
            tr |= 1 << (i & 7);
          }
      }
      if ((i & 7) === 7) {
        s.writeUint8At(head + (i >> 3), tr);
        tr = 0;
      }
    }
    if (props.length & 7) {
      s.writeUint8At(head + trackerBytes - 1, tr);
    }
    if (np) return true;
    s.offset = head;
    return false;
  }

  patch(b, s) {
    const t = this._alloc();
    const props = this._props;
    const types = this._types;
    const head = s.offset;
    s.offset += this._trackerBytes;
    let tr = 0;
    for (let i = 0; i < props.length; ++i) {
      if (!(i & 7)) tr = s.readUint8At(head + (i >> 3));
      const p = props[i];
      const type = types[i];
      const changed = tr & (1 << (i & 7));
      switch (type.muType) {
        case 'boolean':
          t[p] = changed ? !b[p] : b[p];
          break;
        case 'float32':
        case 'float64':
        case 'int8':
        case 'int16':
        case 'int32':
        case 'uint8':
        case 'uint16':
        case 'uint32':
        case 'utf8':
        case 'varint':
          t[p] = changed ? s[readMethod[type.muType]]() : b[p];
          break;
        case 'rvarint':
          t[p] = changed ? b[p] + (((0xaaaaaaaa ^ s.readVarint()) - 0xaaaaaaaa) >> 0) : b[p];
          break;
        case 'ascii':
          t[p] = changed ? s.readASCII(s.readVarint()) : b[p];
          break;
        case 'quantized-float':
          t[p] = changed
            ? (((type.invPrecision * b[p]) >> 0) + (((0xaaaaaaaa ^ s.readVarint()) - 0xaaaaaaaa) >> 0)) * type.precision
            : b[p];
          break;
        default:
          t[p] = changed ? type.patch(b[p], s) : type.clone(b[p]);
      }
    }
    return t;
  }

  toJSON(s) {
    const j = {};
    const props = this._props;
    const types = this._types;
    for (let i = 0; i < props.length; ++i) j[props[i]] = types[i].toJSON(s[props[i]]);
    return j;
  }

  fromJSON(j) {
    const s = this._alloc();
    const props = this._props;
    const types = this._types;
    if (Object.prototype.toString.call(j) === '[object Object]') {
      for (let i = 0; i < props.length; ++i) s[props[i]] = types[i].fromJSON(j[props[i]]);
    }
    return s;
  }

  stats() {
    return { allocCount: this.allocCount, freeCount: this.freeCount, poolSize: this.pool.length };
  }
}

module.exports = { MuStruct };
