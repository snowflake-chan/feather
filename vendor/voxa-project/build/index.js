'use strict';

var schema$1 = require('@box/mesher/schema');
var mesher = require('@box/mesher');

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getAugmentedNamespace(n) {
  if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var schema = {};

var _void = {};

var hasRequired_void;

function require_void () {
	if (hasRequired_void) return _void;
	hasRequired_void = 1;
	Object.defineProperty(_void, "__esModule", { value: true });
	_void.MuVoid = void 0;
	class MuVoid {
	    constructor() {
	        this.identity = undefined;
	        this.muType = 'void';
	        this.json = {
	            type: 'void',
	        };
	    }
	    alloc() { }
	    free(_) { }
	    equal(a, b) { return true; }
	    clone(_) { }
	    assign(d, s) { }
	    diff(b, t, out) { return false; }
	    patch(b, inp) { }
	    toJSON(_) { return null; }
	    fromJSON(_) { return; }
	}
	_void.MuVoid = MuVoid;
	
	return _void;
}

var boolean = {};

var hasRequiredBoolean;

function requireBoolean () {
	if (hasRequiredBoolean) return boolean;
	hasRequiredBoolean = 1;
	Object.defineProperty(boolean, "__esModule", { value: true });
	boolean.MuBoolean = void 0;
	class MuBoolean {
	    constructor(identity) {
	        this.muType = 'boolean';
	        this.identity = !!identity;
	        this.json = {
	            type: 'boolean',
	            identity: this.identity,
	        };
	    }
	    alloc() { return this.identity; }
	    free(bool) { }
	    equal(a, b) { return a === b; }
	    clone(bool) { return bool; }
	    assign(dst, src) { return src; }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(1);
	            out.writeUint8(target ? 1 : 0);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        const result = inp.readUint8();
	        if (result > 1) {
	            throw new Error(`invalid value for boolean`);
	        }
	        return !!result;
	    }
	    toJSON(bool) { return bool; }
	    fromJSON(x) {
	        if (typeof x === 'boolean') {
	            return x;
	        }
	        return this.identity;
	    }
	}
	boolean.MuBoolean = MuBoolean;
	
	return boolean;
}

var ascii = {};

var _string = {};

var hasRequired_string;

function require_string () {
	if (hasRequired_string) return _string;
	hasRequired_string = 1;
	Object.defineProperty(_string, "__esModule", { value: true });
	_string.MuString = void 0;
	class MuString {
	    constructor(identity, type) {
	        this.identity = identity;
	        this.muType = type;
	        this.json = {
	            type,
	            identity,
	        };
	    }
	    alloc() { return this.identity; }
	    free(str) { }
	    equal(a, b) { return a === b; }
	    clone(str) { return str; }
	    assign(dst, src) { return src; }
	    toJSON(str) { return str; }
	    fromJSON(x) {
	        if (typeof x === 'string') {
	            return x;
	        }
	        return this.identity;
	    }
	}
	_string.MuString = MuString;
	
	return _string;
}

var hasRequiredAscii;

function requireAscii () {
	if (hasRequiredAscii) return ascii;
	hasRequiredAscii = 1;
	Object.defineProperty(ascii, "__esModule", { value: true });
	ascii.MuASCII = void 0;
	const _string_1 = require_string();
	class MuASCII extends _string_1.MuString {
	    constructor(identity) {
	        super(identity || '', 'ascii');
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(5 + target.length);
	            out.writeVarint(target.length);
	            out.writeASCII(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        return inp.readASCII(inp.readVarint());
	    }
	}
	ascii.MuASCII = MuASCII;
	
	return ascii;
}

var fixedAscii = {};

var hasRequiredFixedAscii;

function requireFixedAscii () {
	if (hasRequiredFixedAscii) return fixedAscii;
	hasRequiredFixedAscii = 1;
	Object.defineProperty(fixedAscii, "__esModule", { value: true });
	fixedAscii.MuFixedASCII = void 0;
	const _string_1 = require_string();
	class MuFixedASCII extends _string_1.MuString {
	    constructor(lengthOrIdentity) {
	        const identity = typeof lengthOrIdentity === 'number' ?
	            new Array(lengthOrIdentity + 1).join(' ') :
	            lengthOrIdentity;
	        super(identity, 'fixed-ascii');
	        this.length = identity.length;
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(this.length);
	            out.writeASCII(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        return inp.readASCII(this.length);
	    }
	}
	fixedAscii.MuFixedASCII = MuFixedASCII;
	
	return fixedAscii;
}

var utf8 = {};

var hasRequiredUtf8;

function requireUtf8 () {
	if (hasRequiredUtf8) return utf8;
	hasRequiredUtf8 = 1;
	Object.defineProperty(utf8, "__esModule", { value: true });
	utf8.MuUTF8 = void 0;
	const _string_1 = require_string();
	class MuUTF8 extends _string_1.MuString {
	    constructor(identity) {
	        super(identity || '', 'utf8');
	    }
	    diff(base, target, stream) {
	        if (base !== target) {
	            stream.writeString(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, stream) {
	        return stream.readString();
	    }
	}
	utf8.MuUTF8 = MuUTF8;
	
	return utf8;
}

var float32 = {};

var _number = {};

var hasRequired_number;

function require_number () {
	if (hasRequired_number) return _number;
	hasRequired_number = 1;
	(function (exports$1) {
		Object.defineProperty(exports$1, "__esModule", { value: true });
		exports$1.MuNumber = exports$1.ranges = void 0;
		function tuple(...args) {
		    return args;
		}
		exports$1.ranges = {
		    float32: tuple(-34028234663852886e22, 3.4028234663852886e+38),
		    float64: tuple(-17976931348623157e292, 1.7976931348623157e+308),
		    int8: tuple(-128, 0x7f),
		    int16: tuple(-32768, 0x7fff),
		    int32: tuple(-2147483648, 0x7fffffff),
		    uint8: tuple(0, 0xff),
		    uint16: tuple(0, 0xffff),
		    uint32: tuple(0, 0xffffffff),
		    varint: tuple(0, 0xffffffff),
		    rvarint: tuple(0, 0xffffffff),
		};
		class MuNumber {
		    constructor(identity_, type) {
		        const identity = identity_ === identity_ ? identity_ || 0 : NaN;
		        const range = exports$1.ranges[type];
		        if (identity !== Infinity && identity !== -Infinity && identity === identity) {
		            if (identity < range[0] || identity > range[1]) {
		                throw new RangeError(`${identity} is out of range of ${type}`);
		            }
		        }
		        else if (type !== 'float32' && type !== 'float64') {
		            throw new RangeError(`${identity} is out of range of ${type}`);
		        }
		        this.identity = identity;
		        this.muType = type;
		        this.json = {
		            type,
		            identity,
		        };
		    }
		    alloc() { return this.identity; }
		    free(num) { }
		    equal(a, b) { return a === b; }
		    clone(num) { return num; }
		    assign(dst, src) { return src; }
		    toJSON(num) { return num; }
		    fromJSON(x) {
		        if (typeof x === 'number') {
		            return x;
		        }
		        return this.identity;
		    }
		}
		exports$1.MuNumber = MuNumber;
		
	} (_number));
	return _number;
}

var hasRequiredFloat32;

function requireFloat32 () {
	if (hasRequiredFloat32) return float32;
	hasRequiredFloat32 = 1;
	Object.defineProperty(float32, "__esModule", { value: true });
	float32.MuFloat32 = void 0;
	const _number_1 = require_number();
	class MuFloat32 extends _number_1.MuNumber {
	    constructor(identity) {
	        super(identity, 'float32');
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(4);
	            out.writeFloat32(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        return inp.readFloat32();
	    }
	}
	float32.MuFloat32 = MuFloat32;
	
	return float32;
}

var float64 = {};

var hasRequiredFloat64;

function requireFloat64 () {
	if (hasRequiredFloat64) return float64;
	hasRequiredFloat64 = 1;
	Object.defineProperty(float64, "__esModule", { value: true });
	float64.MuFloat64 = void 0;
	const _number_1 = require_number();
	class MuFloat64 extends _number_1.MuNumber {
	    constructor(identity) {
	        super(identity, 'float64');
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(8);
	            out.writeFloat64(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        return inp.readFloat64();
	    }
	}
	float64.MuFloat64 = MuFloat64;
	
	return float64;
}

var int8 = {};

var hasRequiredInt8;

function requireInt8 () {
	if (hasRequiredInt8) return int8;
	hasRequiredInt8 = 1;
	Object.defineProperty(int8, "__esModule", { value: true });
	int8.MuInt8 = void 0;
	const _number_1 = require_number();
	class MuInt8 extends _number_1.MuNumber {
	    constructor(identity) {
	        super(identity, 'int8');
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(1);
	            out.writeInt8(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        return inp.readInt8();
	    }
	}
	int8.MuInt8 = MuInt8;
	
	return int8;
}

var int16 = {};

var hasRequiredInt16;

function requireInt16 () {
	if (hasRequiredInt16) return int16;
	hasRequiredInt16 = 1;
	Object.defineProperty(int16, "__esModule", { value: true });
	int16.MuInt16 = void 0;
	const _number_1 = require_number();
	class MuInt16 extends _number_1.MuNumber {
	    constructor(identity) {
	        super(identity, 'int16');
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(2);
	            out.writeInt16(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        return inp.readInt16();
	    }
	}
	int16.MuInt16 = MuInt16;
	
	return int16;
}

var int32 = {};

var hasRequiredInt32;

function requireInt32 () {
	if (hasRequiredInt32) return int32;
	hasRequiredInt32 = 1;
	Object.defineProperty(int32, "__esModule", { value: true });
	int32.MuInt32 = void 0;
	const _number_1 = require_number();
	class MuInt32 extends _number_1.MuNumber {
	    constructor(identity) {
	        super(identity, 'int32');
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(4);
	            out.writeInt32(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        return inp.readInt32();
	    }
	}
	int32.MuInt32 = MuInt32;
	
	return int32;
}

var uint8 = {};

var hasRequiredUint8;

function requireUint8 () {
	if (hasRequiredUint8) return uint8;
	hasRequiredUint8 = 1;
	Object.defineProperty(uint8, "__esModule", { value: true });
	uint8.MuUint8 = void 0;
	const _number_1 = require_number();
	class MuUint8 extends _number_1.MuNumber {
	    constructor(identity) {
	        super(identity, 'uint8');
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(1);
	            out.writeUint8(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        return inp.readUint8();
	    }
	}
	uint8.MuUint8 = MuUint8;
	
	return uint8;
}

var uint16 = {};

var hasRequiredUint16;

function requireUint16 () {
	if (hasRequiredUint16) return uint16;
	hasRequiredUint16 = 1;
	Object.defineProperty(uint16, "__esModule", { value: true });
	uint16.MuUint16 = void 0;
	const _number_1 = require_number();
	class MuUint16 extends _number_1.MuNumber {
	    constructor(identity) {
	        super(identity, 'uint16');
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(2);
	            out.writeUint16(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        return inp.readUint16();
	    }
	}
	uint16.MuUint16 = MuUint16;
	
	return uint16;
}

var uint32 = {};

var hasRequiredUint32;

function requireUint32 () {
	if (hasRequiredUint32) return uint32;
	hasRequiredUint32 = 1;
	Object.defineProperty(uint32, "__esModule", { value: true });
	uint32.MuUint32 = void 0;
	const _number_1 = require_number();
	class MuUint32 extends _number_1.MuNumber {
	    constructor(identity) {
	        super(identity, 'uint32');
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(4);
	            out.writeUint32(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        return inp.readUint32();
	    }
	}
	uint32.MuUint32 = MuUint32;
	
	return uint32;
}

var varint = {};

var hasRequiredVarint;

function requireVarint () {
	if (hasRequiredVarint) return varint;
	hasRequiredVarint = 1;
	Object.defineProperty(varint, "__esModule", { value: true });
	varint.MuVarint = void 0;
	const _number_1 = require_number();
	class MuVarint extends _number_1.MuNumber {
	    constructor(identity) {
	        super(identity, 'varint');
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(5);
	            out.writeVarint(target);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        return inp.readVarint();
	    }
	}
	varint.MuVarint = MuVarint;
	
	return varint;
}

var rvarint = {};

var hasRequiredRvarint;

function requireRvarint () {
	if (hasRequiredRvarint) return rvarint;
	hasRequiredRvarint = 1;
	Object.defineProperty(rvarint, "__esModule", { value: true });
	rvarint.MuRelativeVarint = void 0;
	const _number_1 = require_number();
	const SCHROEPPEL2 = 0xAAAAAAAA;
	class MuRelativeVarint extends _number_1.MuNumber {
	    constructor(identity) {
	        super(identity, 'rvarint');
	    }
	    diff(base, target, out) {
	        if (base !== target) {
	            out.grow(5);
	            out.writeVarint((SCHROEPPEL2 + (target - base)) ^ SCHROEPPEL2);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        const delta = (SCHROEPPEL2 ^ inp.readVarint()) - SCHROEPPEL2 >> 0;
	        return base + delta;
	    }
	}
	rvarint.MuRelativeVarint = MuRelativeVarint;
	
	return rvarint;
}

var quantizedFloat = {};

var hasRequiredQuantizedFloat;

function requireQuantizedFloat () {
	if (hasRequiredQuantizedFloat) return quantizedFloat;
	hasRequiredQuantizedFloat = 1;
	Object.defineProperty(quantizedFloat, "__esModule", { value: true });
	quantizedFloat.MuQuantizedFloat = void 0;
	const SCHROEPPEL2 = 0xAAAAAAAA;
	function readSchroeppel(stream) {
	    const x = stream.readVarint();
	    return ((SCHROEPPEL2 ^ x) - SCHROEPPEL2) >> 0;
	}
	class MuQuantizedFloat {
	    constructor(precision, identity) {
	        this.precision = precision;
	        this.invPrecision = 1;
	        this.identity = 0;
	        this.muData = {
	            type: 'quantized-float',
	            precision: 0,
	            identity: 0,
	        };
	        this.muType = 'quantized-float';
	        this.invPrecision = 1 / this.precision;
	        if (identity) {
	            this.identity = this.precision * ((this.invPrecision * identity) >> 0);
	        }
	        this.json = this.muData = {
	            type: 'quantized-float',
	            precision: this.precision,
	            identity: this.identity,
	        };
	    }
	    assign(x, y) {
	        return ((this.invPrecision * y) >> 0) * this.precision;
	    }
	    clone(y) {
	        return ((this.invPrecision * y) >> 0) * this.precision;
	    }
	    alloc() {
	        return this.identity;
	    }
	    free() { }
	    toJSON(x) {
	        return this.precision * ((this.invPrecision * x) >> 0);
	    }
	    fromJSON(x) {
	        if (typeof x === 'number') {
	            return this.clone(x);
	        }
	        return this.identity;
	    }
	    equal(x, y) {
	        const sf = this.invPrecision;
	        return ((sf * x) >> 0) === ((sf * y) >> 0);
	    }
	    diff(base, target, stream) {
	        const sf = this.invPrecision;
	        const b = (sf * base) >> 0;
	        const t = (sf * target) >> 0;
	        if (b === t) {
	            return false;
	        }
	        stream.grow(5);
	        stream.writeVarint((SCHROEPPEL2 + (t - b) ^ SCHROEPPEL2) >>> 0);
	        return true;
	    }
	    patch(base, stream) {
	        const b = (this.invPrecision * base) >> 0;
	        const d = readSchroeppel(stream);
	        return (b + d) * this.precision;
	    }
	}
	quantizedFloat.MuQuantizedFloat = MuQuantizedFloat;
	
	return quantizedFloat;
}

var array = {};

var isPrimitive = {};

var hasRequiredIsPrimitive;

function requireIsPrimitive () {
	if (hasRequiredIsPrimitive) return isPrimitive;
	hasRequiredIsPrimitive = 1;
	Object.defineProperty(isPrimitive, "__esModule", { value: true });
	isPrimitive.isMuPrimitiveType = isMuPrimitiveType;
	const muPrimitiveTypes = [
	    'ascii',
	    'boolean',
	    'fixed-ascii',
	    'float32',
	    'float64',
	    'int8',
	    'int16',
	    'int32',
	    'uint8',
	    'uint16',
	    'uint32',
	    'utf8',
	    'void',
	];
	function isMuPrimitiveType(muType) {
	    return muPrimitiveTypes.indexOf(muType) > -1;
	}
	
	return isPrimitive;
}

var hasRequiredArray;

function requireArray () {
	if (hasRequiredArray) return array;
	hasRequiredArray = 1;
	Object.defineProperty(array, "__esModule", { value: true });
	array.MuArray = void 0;
	const is_primitive_1 = requireIsPrimitive();
	function assignPrimitive(dst, src) {
	    const N = src.length;
	    const M = dst.length;
	    const L = Math.min(M, N);
	    for (let i = 0; i < L; ++i) {
	        dst[i] = src[i];
	    }
	    for (let i = M; i < N; ++i) {
	        dst.push(src[i]);
	    }
	    dst.length = N;
	    return dst;
	}
	function clonePrimitive(src) {
	    this.allocCount += 1;
	    return src.slice();
	}
	function equalPrimitive(a, b) {
	    const N = a.length;
	    const M = b.length;
	    if (N !== M) {
	        return false;
	    }
	    for (let i = 0; i < N; ++i) {
	        if (a[i] !== b[i]) {
	            return false;
	        }
	    }
	    return true;
	}
	function toJSONPrimitive(a) {
	    return a.slice();
	}
	function assignGeneric(schema) {
	    return function (dst, src) {
	        const N = src.length;
	        const M = dst.length;
	        const L = Math.min(M, N);
	        for (let i = 0; i < L; ++i) {
	            dst[i] = schema.assign(dst[i], src[i]);
	        }
	        for (let i = M; i < N; ++i) {
	            dst.push(schema.clone(src[i]));
	        }
	        for (let i = N; i < M; ++i) {
	            schema.free(dst[i]);
	        }
	        dst.length = N;
	        return dst;
	    };
	}
	function cloneGeneric(schema) {
	    return function (src) {
	        this.allocCount += 1;
	        const result = src.slice();
	        for (let i = 0; i < result.length; ++i) {
	            result[i] = schema.clone(result[i]);
	        }
	        return result;
	    };
	}
	function freeGeneric(schema) {
	    return function (src) {
	        this.freeCount += 1;
	        for (let i = 0; i < src.length; ++i) {
	            schema.free(src[i]);
	        }
	        src.length = 0;
	    };
	}
	function equalGeneric(schema) {
	    return function (a, b) {
	        const N = a.length;
	        const M = b.length;
	        if (N !== M) {
	            return false;
	        }
	        for (let i = 0; i < N; ++i) {
	            if (!schema.equal(a[i], b[i])) {
	                return false;
	            }
	        }
	        return true;
	    };
	}
	function toJSONGeneric(schema) {
	    return function (arr) {
	        const result = new Array(arr.length);
	        for (let i = 0; i < arr.length; ++i) {
	            result[i] = schema.toJSON(arr[i]);
	        }
	        return result;
	    };
	}
	class MuArray {
	    stats() {
	        return {
	            allocCount: this.allocCount,
	            freeCount: this.freeCount,
	            poolSize: 0,
	        };
	    }
	    constructor(schema, capacity, identity) {
	        this.muType = 'array';
	        this.allocCount = 0;
	        this.freeCount = 0;
	        this.muData = schema;
	        this.capacity = capacity;
	        if (identity) {
	            const copy = this.identity = identity.slice();
	            for (let i = 0; i < copy.length; ++i) {
	                copy[i] = schema.clone(copy[i]);
	            }
	        }
	        else {
	            this.identity = [];
	        }
	        this.json = {
	            type: 'array',
	            valueType: schema.json,
	            identity: JSON.stringify(this.identity),
	        };
	        if ((0, is_primitive_1.isMuPrimitiveType)(schema.muType)) {
	            this.assign = assignPrimitive;
	            this.clone = clonePrimitive;
	            this.free = function (x) {
	                this.freeCount += 1;
	                x.length = 0;
	            };
	            this.equal = equalPrimitive;
	            this.toJSON = toJSONPrimitive;
	        }
	        else {
	            this.assign = assignGeneric(schema);
	            this.clone = cloneGeneric(schema);
	            this.free = freeGeneric(schema);
	            this.equal = equalGeneric(schema);
	            this.toJSON = toJSONGeneric(schema);
	        }
	    }
	    alloc() {
	        this.allocCount += 1;
	        return [];
	    }
	    diff(base, target, out) {
	        const tLeng = target.length;
	        const numTrackers = Math.ceil(tLeng / 8);
	        out.grow(4 + numTrackers);
	        const head = out.offset;
	        out.writeVarint(tLeng);
	        let trackerOffset = out.offset;
	        out.offset += numTrackers;
	        let tracker = 0;
	        let numPatches = 0;
	        const bLeng = base.length;
	        const schema = this.muData;
	        for (let i = 0; i < Math.min(bLeng, tLeng); ++i) {
	            if (schema.diff(base[i], target[i], out)) {
	                tracker |= 1 << (i & 7);
	                ++numPatches;
	            }
	            if ((i & 7) === 7) {
	                out.writeUint8At(trackerOffset++, tracker);
	                tracker = 0;
	            }
	        }
	        for (let i = bLeng; i < tLeng; ++i) {
	            if (schema.diff(schema.identity, target[i], out)) {
	                tracker |= 1 << (i & 7);
	                ++numPatches;
	            }
	            if ((i & 7) === 7) {
	                out.writeUint8At(trackerOffset++, tracker);
	                tracker = 0;
	            }
	        }
	        if (tLeng & 7) {
	            out.writeUint8At(trackerOffset, tracker);
	        }
	        if (numPatches > 0 || bLeng !== tLeng) {
	            return true;
	        }
	        out.offset = head;
	        return false;
	    }
	    patch(base, inp) {
	        const tLeng = inp.readVarint();
	        if (tLeng > this.capacity) {
	            throw new RangeError(`target length ${tLeng} exceeds capacity ${this.capacity}`);
	        }
	        const bLeng = base.length;
	        const L = Math.min(bLeng, tLeng);
	        const numTrackers = Math.ceil(tLeng / 8);
	        let trackerOffset = inp.offset;
	        inp.offset += numTrackers;
	        this.allocCount += 1;
	        const result = base.slice();
	        const schema = this.muData;
	        result.length = L;
	        let tracker = 0;
	        for (let i = 0; i < L; ++i) {
	            const mod8 = i & 7;
	            if (!mod8) {
	                tracker = inp.readUint8At(trackerOffset++);
	            }
	            if ((1 << mod8) & tracker) {
	                result[i] = schema.patch(base[i], inp);
	            }
	            else {
	                result[i] = schema.clone(base[i]);
	            }
	        }
	        for (let i = bLeng; i < tLeng; ++i) {
	            const mod8 = i & 7;
	            if (!mod8) {
	                tracker = inp.readUint8At(trackerOffset++);
	            }
	            if ((1 << mod8) & tracker) {
	                result.push(schema.patch(schema.identity, inp));
	            }
	            else {
	                result.push(schema.clone(schema.identity));
	            }
	        }
	        return result;
	    }
	    fromJSON(x) {
	        if (Array.isArray(x)) {
	            const arr = new Array(x.length);
	            const schema = this.muData;
	            for (let i = 0; i < x.length; ++i) {
	                arr[i] = schema.fromJSON(x[i]);
	            }
	            this.allocCount += 1;
	            return arr;
	        }
	        return this.clone(this.identity);
	    }
	}
	array.MuArray = MuArray;
	
	return array;
}

var option = {};

var hasRequiredOption;

function requireOption () {
	if (hasRequiredOption) return option;
	hasRequiredOption = 1;
	Object.defineProperty(option, "__esModule", { value: true });
	option.MuOption = void 0;
	var TypeDiff;
	(function (TypeDiff) {
	    TypeDiff[TypeDiff["BECAME_UNDEFINED"] = 0] = "BECAME_UNDEFINED";
	    TypeDiff[TypeDiff["BECAME_IDENTITY"] = 1] = "BECAME_IDENTITY";
	    TypeDiff[TypeDiff["BECAME_DEFINED"] = 2] = "BECAME_DEFINED";
	    TypeDiff[TypeDiff["STAYED_DEFINED"] = 3] = "STAYED_DEFINED";
	})(TypeDiff || (TypeDiff = {}));
	class MuOption {
	    constructor(schema, identity, identityIsUndefined = false) {
	        this.muType = 'option';
	        this.muData = schema;
	        if (identityIsUndefined) {
	            this.identity = undefined;
	        }
	        else {
	            this.identity = identity !== undefined ? schema.clone(identity) : schema.clone(schema.identity);
	        }
	        this.json = {
	            type: 'option',
	            valueType: schema.json,
	            identity: JSON.stringify(this.identity),
	        };
	    }
	    alloc() {
	        return this.muData.alloc();
	    }
	    free(val) {
	        if (val === undefined) {
	            return;
	        }
	        this.muData.free(val);
	    }
	    equal(a, b) {
	        if (a === undefined && b === undefined) {
	            return true;
	        }
	        if (a !== undefined && b === undefined) {
	            return false;
	        }
	        if (a === undefined && b !== undefined) {
	            return false;
	        }
	        return this.muData.equal(a, b);
	    }
	    clone(val) {
	        if (val === undefined) {
	            return undefined;
	        }
	        return this.muData.clone(val);
	    }
	    assign(dst, src) {
	        if (dst !== undefined && src !== undefined) {
	            return this.muData.assign(dst, src);
	        }
	        return src;
	    }
	    diff(base, target, out) {
	        if (base === undefined && target === undefined) {
	            return false;
	        }
	        if (base === undefined && target !== undefined) {
	            out.grow(1);
	            if (this.muData.equal(this.muData.identity, target)) {
	                out.writeUint8(TypeDiff.BECAME_IDENTITY);
	                return true;
	            }
	            out.writeUint8(TypeDiff.BECAME_DEFINED);
	            this.muData.diff(this.muData.identity, target, out);
	            return true;
	        }
	        if (base !== undefined && target === undefined) {
	            out.grow(1);
	            out.writeUint8(TypeDiff.BECAME_UNDEFINED);
	            return true;
	        }
	        if (this.muData.equal(base, target)) {
	            return false;
	        }
	        out.grow(1);
	        out.writeUint8(TypeDiff.STAYED_DEFINED);
	        this.muData.diff(base, target, out);
	        return true;
	    }
	    patch(base, inp) {
	        const typeDiff = inp.readUint8();
	        if (TypeDiff[typeDiff] === undefined) {
	            throw new Error('Panic in muOption, invalid TypeDiff');
	        }
	        if (typeDiff == TypeDiff.BECAME_UNDEFINED) {
	            return undefined;
	        }
	        if (typeDiff == TypeDiff.BECAME_DEFINED) {
	            return this.muData.patch(this.muData.identity, inp);
	        }
	        if (typeDiff === TypeDiff.BECAME_IDENTITY) {
	            return this.muData.clone(this.muData.identity);
	        }
	        if (typeDiff !== TypeDiff.STAYED_DEFINED || base === undefined) {
	            throw new Error('Panic in muOption, invariants broken');
	        }
	        return this.muData.patch(base, inp);
	    }
	    toJSON(val) {
	        if (val === undefined) {
	            return undefined;
	        }
	        return this.muData.toJSON(val);
	    }
	    fromJSON(json) {
	        if (json === undefined) {
	            return undefined;
	        }
	        return this.muData.fromJSON(json);
	    }
	}
	option.MuOption = MuOption;
	
	return option;
}

var sortedArray = {};

var hasRequiredSortedArray;

function requireSortedArray () {
	if (hasRequiredSortedArray) return sortedArray;
	hasRequiredSortedArray = 1;
	Object.defineProperty(sortedArray, "__esModule", { value: true });
	sortedArray.MuSortedArray = void 0;
	const array_1 = requireArray();
	function defaultCompare(a, b) {
	    if (a < b) {
	        return -1;
	    }
	    else if (a > b) {
	        return 1;
	    }
	    else {
	        return 0;
	    }
	}
	var SortedOp;
	(function (SortedOp) {
	    SortedOp[SortedOp["NONE"] = -1] = "NONE";
	    SortedOp[SortedOp["SKIP"] = 0] = "SKIP";
	    SortedOp[SortedOp["PATCH"] = 1] = "PATCH";
	    SortedOp[SortedOp["INSERT"] = 2] = "INSERT";
	    SortedOp[SortedOp["INSERT_IDENTITY"] = 3] = "INSERT_IDENTITY";
	    SortedOp[SortedOp["COPY"] = 4] = "COPY";
	})(SortedOp || (SortedOp = {}));
	class MuSortedArray {
	    stats() {
	        return this._arraySchema.stats();
	    }
	    constructor(schema, capacity, compare, identity) {
	        this.muType = 'sorted-array';
	        this.muData = schema;
	        this.capacity = capacity;
	        this.compare = compare || defaultCompare;
	        const arraySchema = this._arraySchema = new array_1.MuArray(schema, capacity, identity);
	        this.identity = arraySchema.identity.sort(this.compare);
	        this.json = {
	            type: 'sorted-array',
	            valueType: schema.json,
	            identity: JSON.stringify(this.identity),
	        };
	        this.alloc = arraySchema.alloc;
	        this.free = arraySchema.free;
	        this.equal = arraySchema.equal;
	        this.clone = arraySchema.clone;
	        this.assign = arraySchema.assign;
	        this.toJSON = arraySchema.toJSON;
	        this.fromJSON = arraySchema.fromJSON;
	    }
	    diff(base, target, out) {
	        if (base.length === 0 && target.length === 0) {
	            return false;
	        }
	        const schema = this.muData;
	        const compare = this.compare;
	        out.grow(8);
	        const head = out.offset;
	        let opPtr = head;
	        let opCount = 0;
	        let opCode = SortedOp.NONE;
	        out.offset += 4;
	        let numOps = 0;
	        function emitOp() {
	            if (opCount > 0) {
	                out.writeUint32At(opPtr, (opCount << 3) | opCode);
	                numOps++;
	            }
	            out.grow(4);
	            opPtr = out.offset;
	            out.offset += 4;
	        }
	        let basePtr = 0;
	        let targetPtr = 0;
	        while (basePtr < base.length && targetPtr < target.length) {
	            const baseItem = base[basePtr];
	            const targetItem = target[targetPtr];
	            const cmp = compare(baseItem, targetItem);
	            if (cmp < 0) {
	                if (opCode !== SortedOp.SKIP) {
	                    emitOp();
	                    opCount = 1;
	                    opCode = SortedOp.SKIP;
	                }
	                else {
	                    opCount++;
	                }
	                basePtr++;
	            }
	            else if (0 < cmp) {
	                if (opCode === SortedOp.INSERT) {
	                    if (schema.diff(schema.identity, targetItem, out)) {
	                        opCount++;
	                    }
	                    else {
	                        emitOp();
	                        opCode = SortedOp.INSERT_IDENTITY;
	                        opCount = 1;
	                    }
	                }
	                else if (opCode === SortedOp.INSERT_IDENTITY) {
	                    const prevOffset = out.offset;
	                    out.grow(4);
	                    out.offset += 4;
	                    if (schema.diff(schema.identity, targetItem, out)) {
	                        emitOp();
	                        out.offset -= 4;
	                        opPtr = prevOffset;
	                        opCode = SortedOp.INSERT;
	                        opCount = 1;
	                    }
	                    else {
	                        out.offset -= 4;
	                        opCount += 1;
	                    }
	                }
	                else {
	                    emitOp();
	                    opCount = 1;
	                    if (schema.diff(schema.identity, targetItem, out)) {
	                        opCode = SortedOp.INSERT;
	                    }
	                    else {
	                        opCode = SortedOp.INSERT_IDENTITY;
	                    }
	                }
	                targetPtr++;
	            }
	            else {
	                if (opCode === SortedOp.PATCH) {
	                    if (schema.diff(baseItem, targetItem, out)) {
	                        opCount++;
	                    }
	                    else {
	                        emitOp();
	                        opCode = SortedOp.COPY;
	                        opCount = 1;
	                    }
	                }
	                else if (opCode === SortedOp.COPY) {
	                    const prevOffset = out.offset;
	                    out.grow(4);
	                    out.offset += 4;
	                    if (schema.diff(baseItem, targetItem, out)) {
	                        emitOp();
	                        out.offset -= 4;
	                        opPtr = prevOffset;
	                        opCode = SortedOp.PATCH;
	                        opCount = 1;
	                    }
	                    else {
	                        out.offset -= 4;
	                        opCount += 1;
	                    }
	                }
	                else {
	                    emitOp();
	                    opCount = 1;
	                    if (schema.diff(baseItem, targetItem, out)) {
	                        opCode = SortedOp.PATCH;
	                    }
	                    else {
	                        opCode = SortedOp.COPY;
	                    }
	                }
	                basePtr++;
	                targetPtr++;
	            }
	        }
	        if (basePtr < base.length) {
	            if (opCode !== SortedOp.SKIP) {
	                emitOp();
	                opCount = base.length - basePtr;
	                opCode = SortedOp.SKIP;
	            }
	            else {
	                opCount += base.length - basePtr;
	            }
	            basePtr++;
	        }
	        while (targetPtr < target.length) {
	            const targetItem = target[targetPtr];
	            if (opCode === SortedOp.INSERT) {
	                if (schema.diff(schema.identity, targetItem, out)) {
	                    opCount++;
	                }
	                else {
	                    emitOp();
	                    opCode = SortedOp.INSERT_IDENTITY;
	                    opCount = 1;
	                }
	            }
	            else if (opCode === SortedOp.INSERT_IDENTITY) {
	                const prevOffset = out.offset;
	                out.grow(4);
	                out.offset += 4;
	                if (schema.diff(schema.identity, targetItem, out)) {
	                    emitOp();
	                    out.offset -= 4;
	                    opPtr = prevOffset;
	                    opCode = SortedOp.INSERT;
	                    opCount = 1;
	                }
	                else {
	                    out.offset -= 4;
	                    opCount += 1;
	                }
	            }
	            else {
	                emitOp();
	                opCount = 1;
	                if (schema.diff(schema.identity, targetItem, out)) {
	                    opCode = SortedOp.INSERT;
	                }
	                else {
	                    opCode = SortedOp.INSERT_IDENTITY;
	                }
	            }
	            targetPtr++;
	        }
	        if (numOps === 0 && opCode === SortedOp.COPY && opCount === base.length) {
	            out.offset = head;
	            return false;
	        }
	        if (opCode !== SortedOp.SKIP) {
	            emitOp();
	        }
	        out.offset -= 4;
	        out.writeUint32At(head, numOps);
	        return true;
	    }
	    patch(base, inp) {
	        this._arraySchema.allocCount += 1;
	        const schema = this.muData;
	        const result = this.alloc();
	        const numOps = inp.readUint32();
	        let ptr = 0;
	        let tLength = 0;
	        for (let i = 0; i < numOps; ++i) {
	            const code = inp.readUint32();
	            const count = code >> 3;
	            tLength += count;
	            if (tLength > this.capacity) {
	                throw new RangeError(`target length exceeds capacity ${this.capacity}`);
	            }
	            const op = code & 0x7;
	            switch (op) {
	                case SortedOp.INSERT_IDENTITY:
	                    for (let j = 0; j < count; ++j) {
	                        result.push(schema.clone(schema.identity));
	                    }
	                    break;
	                case SortedOp.INSERT:
	                    for (let j = 0; j < count; ++j) {
	                        result.push(schema.patch(schema.identity, inp));
	                    }
	                    break;
	                case SortedOp.PATCH:
	                    for (let j = 0; j < count; ++j) {
	                        result.push(schema.patch(base[ptr++], inp));
	                    }
	                    break;
	                case SortedOp.COPY:
	                    for (let j = 0; j < count; ++j) {
	                        result.push(schema.clone(base[ptr++]));
	                    }
	                    break;
	                case SortedOp.SKIP:
	                    ptr += count;
	                    break;
	            }
	        }
	        return result;
	    }
	}
	sortedArray.MuSortedArray = MuSortedArray;
	
	return sortedArray;
}

var struct = {};

var hasRequiredStruct;

function requireStruct () {
	if (hasRequiredStruct) return struct;
	hasRequiredStruct = 1;
	Object.defineProperty(struct, "__esModule", { value: true });
	struct.MuStruct = void 0;
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
	const muType2ReadMethod = {
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
	const muType2WriteMethod = {
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
	const muPrimitiveTypes = Object.keys(muPrimitiveSize);
	class MuStruct {
	    constructor(spec) {
	        this.muType = 'struct';
	        const props = Object.keys(spec).sort((a, b) => {
	            const ai = muPrimitiveTypes.indexOf(spec[a].muType);
	            const bi = muPrimitiveTypes.indexOf(spec[b].muType);
	            return (bi - ai) || (a < b ? -1 : (b < a) ? 1 : 0);
	        });
	        const types = props.map((prop) => spec[prop]);
	        const json = {
	            type: 'struct',
	            subTypes: {},
	        };
	        props.forEach((prop) => {
	            json.subTypes[prop] = spec[prop].json;
	        });
	        const params = [];
	        const args = [];
	        let tokenCounter = 0;
	        function token() {
	            return '_v' + (++tokenCounter);
	        }
	        function inject(arg) {
	            for (let i = 0; i < args.length; ++i) {
	                if (args[i] === arg) {
	                    return params[i];
	                }
	            }
	            const param = token();
	            params.push(param);
	            args.push(arg);
	            return param;
	        }
	        const propRefs = props.map(inject);
	        const typeRefs = types.map(inject);
	        function block() {
	            const vars = [];
	            const body = [];
	            return {
	                vars,
	                body,
	                toString() {
	                    const localVars = (vars.length > 0) ? `var ${vars.join()};` : '';
	                    return localVars + body.join('');
	                },
	                def(value) {
	                    const tok = token();
	                    vars.push(tok);
	                    if (value != undefined) {
	                        body.push(`${tok}=${value};`);
	                    }
	                    return tok;
	                },
	                append(...code) {
	                    body.push.apply(body, code);
	                },
	            };
	        }
	        const prolog = block();
	        const epilog = block();
	        function func(name, params_) {
	            const b = block();
	            const baseToString = b.toString;
	            b.toString = function () {
	                return `function ${name}(${params_.join()}){${baseToString()}}`;
	            };
	            return b;
	        }
	        const methods = {
	            alloc: func('alloc', []),
	            free: func('free', ['s']),
	            equal: func('equal', ['a', 'b']),
	            clone: func('clone', ['s']),
	            assign: func('assign', ['d', 's']),
	            diff: func('diff', ['b', 't', 's']),
	            patch: func('patch', ['b', 's']),
	            toJSON: func('toJSON', ['s']),
	            fromJSON: func('fromJSON', ['j']),
	            stats: func('stats', []),
	        };
	        const allocCountRef = prolog.def('-1');
	        const freeCountRef = prolog.def('0');
	        const poolRef = prolog.def('[]');
	        prolog.append('function MuStruct(){');
	        propRefs.forEach((pr, i) => {
	            const type = types[i];
	            switch (type.muType) {
	                case 'boolean':
	                case 'int8':
	                case 'int16':
	                case 'int32':
	                case 'uint8':
	                case 'uint16':
	                case 'uint32':
	                case 'varint':
	                case 'rvarint':
	                    prolog.append(`this[${pr}]=${type.identity};`);
	                    break;
	                case 'float32':
	                case 'float64':
	                case 'quantized-float':
	                    prolog.append(`this[${pr}]=0.5;this[${pr}]=${type.identity};`);
	                    break;
	                case 'ascii':
	                case 'fixed-ascii':
	                case 'utf8':
	                    prolog.append(`this[${pr}]=${inject(type.identity)};`);
	                    break;
	                default:
	                    prolog.append(`this[${pr}]=null;`);
	            }
	        });
	        prolog.append(`}function _alloc(){++${allocCountRef};if(${poolRef}.length>0){return ${poolRef}.pop()}return new MuStruct()}`);
	        const identityRef = prolog.def('_alloc()');
	        propRefs.forEach((pr, i) => {
	            const type = types[i];
	            switch (type.muType) {
	                case 'ascii':
	                case 'fixed-ascii':
	                case 'utf8':
	                case 'boolean':
	                case 'float32':
	                case 'float64':
	                case 'int8':
	                case 'int16':
	                case 'int32':
	                case 'uint8':
	                case 'uint16':
	                case 'uint32':
	                case 'varint':
	                case 'rvarint':
	                case 'quantized-float':
	                    break;
	                default:
	                    prolog.append(`${identityRef}[${pr}]=${typeRefs[i]}.clone(${inject(type.identity)});`);
	                    break;
	            }
	        });
	        methods.alloc.append(`var s=_alloc();`);
	        propRefs.forEach((pr, i) => {
	            const type = types[i];
	            switch (type.muType) {
	                case 'ascii':
	                case 'fixed-ascii':
	                case 'utf8':
	                case 'boolean':
	                case 'float32':
	                case 'float64':
	                case 'int8':
	                case 'int16':
	                case 'int32':
	                case 'uint8':
	                case 'uint16':
	                case 'uint32':
	                case 'varint':
	                case 'rvarint':
	                case 'quantized-float':
	                    break;
	                default:
	                    methods.alloc.append(`s[${pr}]=${typeRefs[i]}.alloc();`);
	                    break;
	            }
	        });
	        methods.alloc.append(`return s;`);
	        methods.free.append(`${poolRef}.push(s);`);
	        propRefs.forEach((pr, i) => {
	            const type = types[i];
	            switch (type.muType) {
	                case 'ascii':
	                case 'fixed-ascii':
	                case 'utf8':
	                case 'boolean':
	                case 'float32':
	                case 'float64':
	                case 'int8':
	                case 'int16':
	                case 'int32':
	                case 'uint8':
	                case 'uint16':
	                case 'uint32':
	                case 'varint':
	                case 'rvarint':
	                case 'quantized-float':
	                    break;
	                default:
	                    methods.free.append(`${typeRefs[i]}.free(s[${pr}]);`);
	                    break;
	            }
	        });
	        methods.free.append(`++${freeCountRef};`);
	        propRefs.forEach((pr, i) => {
	            const type = types[i];
	            switch (type.muType) {
	                case 'ascii':
	                case 'fixed-ascii':
	                case 'utf8':
	                case 'boolean':
	                case 'float32':
	                case 'float64':
	                case 'int8':
	                case 'int16':
	                case 'int32':
	                case 'uint8':
	                case 'uint16':
	                case 'uint32':
	                case 'varint':
	                case 'rvarint':
	                    methods.equal.append(`if(a[${pr}]!==b[${pr}]){return false}`);
	                    break;
	                case 'quantized-float':
	                    methods.equal.append(`if(((${type.invPrecision}*a[${pr}])>>0)!==((${type.invPrecision}*b[${pr}])>>0)){return false}`);
	                    break;
	                default:
	                    methods.equal.append(`if(!${typeRefs[i]}.equal(a[${pr}],b[${pr}])){return false}`);
	            }
	        });
	        methods.equal.append(`return true;`);
	        methods.clone.append(`var c=_alloc();`);
	        propRefs.forEach((pr, i) => {
	            const type = types[i];
	            switch (type.muType) {
	                case 'ascii':
	                case 'fixed-ascii':
	                case 'utf8':
	                case 'boolean':
	                case 'float32':
	                case 'float64':
	                case 'int8':
	                case 'int16':
	                case 'int32':
	                case 'uint8':
	                case 'uint16':
	                case 'uint32':
	                case 'varint':
	                case 'rvarint':
	                    methods.clone.append(`c[${pr}]=s[${pr}];`);
	                    break;
	                case 'quantized-float':
	                    methods.clone.append(`c[${pr}]=((${type.invPrecision}*s[${pr}])>>0)*${type.precision};`);
	                    break;
	                default:
	                    methods.clone.append(`c[${pr}]=${typeRefs[i]}.clone(s[${pr}]);`);
	                    break;
	            }
	        });
	        methods.clone.append('return c;');
	        propRefs.forEach((pr, i) => {
	            const type = types[i];
	            switch (type.muType) {
	                case 'ascii':
	                case 'fixed-ascii':
	                case 'utf8':
	                case 'boolean':
	                case 'float32':
	                case 'float64':
	                case 'int8':
	                case 'int16':
	                case 'int32':
	                case 'uint8':
	                case 'uint16':
	                case 'uint32':
	                case 'varint':
	                case 'rvarint':
	                    methods.assign.append(`d[${pr}]=s[${pr}];`);
	                    break;
	                case 'quantized-float':
	                    methods.assign.append(`d[${pr}]=((${type.invPrecision}*s[${pr}])>>0)*${type.precision};`);
	                    break;
	                default:
	                    methods.assign.append(`d[${pr}]=${typeRefs[i]}.assign(d[${pr}],s[${pr}]);`);
	            }
	        });
	        methods.assign.append('return d;');
	        const numProps = props.length;
	        const trackerBytes = Math.ceil(numProps / 8);
	        let baseSize = trackerBytes;
	        for (let i = 0; i < types.length; ++i) {
	            const muType = types[i].muType;
	            if (muType in muPrimitiveSize) {
	                baseSize += muPrimitiveSize[muType];
	            }
	        }
	        methods.diff.append(`var head=s.offset;var tr=0;var np=0;s.grow(${baseSize});s.offset+=${trackerBytes};`);
	        propRefs.forEach((pr, i) => {
	            const muType = types[i].muType;
	            switch (muType) {
	                case 'boolean':
	                    methods.diff.append(`if(b[${pr}]!==t[${pr}]){++np;tr|=${1 << (i & 7)}}`);
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
	                    methods.diff.append(`if(b[${pr}]!==t[${pr}]){s.${muType2WriteMethod[muType]}(t[${pr}]);++np;tr|=${1 << (i & 7)}}`);
	                    break;
	                case 'rvarint':
	                    methods.diff.append(`if(b[${pr}]!==t[${pr}]){s.writeVarint(0xAAAAAAAA+(t[${pr}]-b[${pr}])^0xAAAAAAAA);++np;tr|=${1 << (i & 7)}}`);
	                    break;
	                case 'ascii':
	                    methods.diff.append(`if(b[${pr}]!==t[${pr}]){s.grow(5+t[${pr}].length);s.writeVarint(t[${pr}].length);s.writeASCII(t[${pr}]);++np;tr|=${1 << (i & 7)}}`);
	                    break;
	                case 'quantized-float':
	                    const br = methods.diff.def(`(${types[i].invPrecision}*b[${pr}])>>0`);
	                    const tr = methods.diff.def(`(${types[i].invPrecision}*t[${pr}])>>0`);
	                    methods.diff.append(`if(${br}!==${tr}){s.writeVarint((0xAAAAAAAA+(${tr}-${br})^0xAAAAAAAA)>>>0);++np;tr|=${1 << (i & 7)};}`);
	                    break;
	                default:
	                    methods.diff.append(`if(${typeRefs[i]}.diff(b[${pr}],t[${pr}],s)){++np;tr|=${1 << (i & 7)}}`);
	            }
	            if ((i & 7) === 7) {
	                methods.diff.append(`s.writeUint8At(head+${i >> 3},tr);tr=0;`);
	            }
	        });
	        if (numProps & 7) {
	            methods.diff.append(`s.writeUint8At(head+${trackerBytes - 1},tr);`);
	        }
	        methods.diff.append(`if(np){return true}else{s.offset=head;return false}`);
	        methods.patch.append(`var t=_alloc(b);var head=s.offset;var tr=0;s.offset+=${trackerBytes};`);
	        propRefs.forEach((pr, i) => {
	            if (!(i & 7)) {
	                methods.patch.append(`tr=s.readUint8At(head+${i >> 3});`);
	            }
	            const type = types[i];
	            const muType = type.muType;
	            methods.patch.append(`;t[${pr}]=(tr&${1 << (i & 7)})?`);
	            switch (muType) {
	                case 'boolean':
	                    methods.patch.append(`!b[${pr}]:b[${pr}];`);
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
	                    methods.patch.append(`s.${muType2ReadMethod[muType]}():b[${pr}];`);
	                    break;
	                case 'rvarint':
	                    methods.patch.append(`b[${pr}]+((0xAAAAAAAA^s.readVarint())-0xAAAAAAAA>>0):b[${pr}];`);
	                    break;
	                case 'ascii':
	                    methods.patch.append(`s.readASCII(s.readVarint()):b[${pr}];`);
	                    break;
	                case 'quantized-float':
	                    methods.patch.append(`(((${type.invPrecision}*b[${pr}])>>0)+(((0xAAAAAAAA^s.readVarint())-0xAAAAAAAA)>>0))*${type.precision}:b[${pr}];`);
	                    break;
	                default:
	                    methods.patch.append(`${typeRefs[i]}.patch(b[${pr}],s):${typeRefs[i]}.clone(b[${pr}]);`);
	            }
	        });
	        methods.patch.append(`return t;`);
	        methods.toJSON.append(`var j={};`);
	        propRefs.forEach((pr, i) => {
	            methods.toJSON.append(`j[${pr}]=${typeRefs[i]}.toJSON(s[${pr}]);`);
	        });
	        methods.toJSON.append(`return j;`);
	        methods.fromJSON.append(`var s=_alloc();`);
	        methods.fromJSON.append(`if(Object.prototype.toString.call(j)==='[object Object]'){`);
	        propRefs.forEach((pr, i) => {
	            methods.fromJSON.append(`s[${pr}]=${typeRefs[i]}.fromJSON(j[${pr}]);`);
	        });
	        methods.fromJSON.append(`}`);
	        methods.fromJSON.append(`return s;`);
	        methods.stats.append(`return {allocCount:${allocCountRef},freeCount:${freeCountRef},poolSize:${poolRef}.length};`);
	        const muDataRef = prolog.def('{}');
	        propRefs.forEach((pr, i) => {
	            prolog.append(`${muDataRef}[${pr}]=${typeRefs[i]};`);
	        });
	        epilog.append(`return {identity:${identityRef},muData:${muDataRef},pool:${poolRef},`);
	        Object.keys(methods).forEach((name) => {
	            prolog.append(methods[name].toString());
	            epilog.append(`${name}:${name},`);
	        });
	        epilog.append('}');
	        prolog.append(epilog.toString());
	        params.push(prolog.toString());
	        const proc = Function.apply(null, params);
	        const compiled = proc.apply(null, args);
	        this.json = json;
	        this.muData = compiled.muData;
	        this.identity = compiled.identity;
	        this.pool = compiled.pool;
	        this.alloc = compiled.alloc;
	        this.free = compiled.free;
	        this.equal = compiled.equal;
	        this.clone = compiled.clone;
	        this.assign = compiled.assign;
	        this.diff = compiled.diff;
	        this.patch = compiled.patch;
	        this.toJSON = compiled.toJSON;
	        this.fromJSON = compiled.fromJSON;
	        this.stats = compiled.stats;
	    }
	}
	struct.MuStruct = MuStruct;
	
	return struct;
}

var union = {};

var hasRequiredUnion;

function requireUnion () {
	if (hasRequiredUnion) return union;
	hasRequiredUnion = 1;
	Object.defineProperty(union, "__esModule", { value: true });
	union.MuUnion = void 0;
	class MuUnion {
	    constructor(schemaSpec, identityType) {
	        this.muType = 'union';
	        this.muData = schemaSpec;
	        this._types = Object.keys(schemaSpec).sort();
	        if (identityType) {
	            this.identity = {
	                type: identityType,
	                data: schemaSpec[identityType].identity,
	            };
	        }
	        else {
	            this.identity = {
	                type: '',
	                data: void 0,
	            };
	        }
	        const result = {};
	        Object.keys(schemaSpec).forEach((subtype) => {
	            result[subtype] = schemaSpec[subtype].json;
	        });
	        this.json = {
	            type: 'union',
	            identity: this.identity.type,
	            data: result,
	        };
	    }
	    alloc() {
	        const type = this.identity.type;
	        return {
	            type,
	            data: type ? this.muData[type].clone(this.identity.data) : void 0,
	        };
	    }
	    free(union) {
	        const schema = this.muData[union.type];
	        if (schema) {
	            schema.free(union.data);
	        }
	    }
	    equal(a, b) {
	        if (a.type !== b.type) {
	            return false;
	        }
	        if (a.type === '') {
	            return true;
	        }
	        return this.muData[a.type].equal(a.data, b.data);
	    }
	    clone(union) {
	        const type = union.type;
	        return {
	            type,
	            data: type ? this.muData[type].clone(union.data) : void 0,
	        };
	    }
	    assign(dst, src) {
	        const dType = dst.type;
	        const sType = src.type;
	        const schema = this.muData;
	        dst.type = src.type;
	        if (dst.type !== dType) {
	            schema[dType] && schema[dType].free(dst.data);
	            if (sType) {
	                schema[sType] && (dst.data = schema[sType].clone(src.data));
	            }
	            else {
	                dst.data = void 0;
	            }
	            return dst;
	        }
	        if (schema[dType]) {
	            dst.data = schema[dType].assign(dst.data, src.data);
	        }
	        return dst;
	    }
	    diff(base, target, out) {
	        out.grow(8);
	        const head = out.offset;
	        ++out.offset;
	        let opcode = 0;
	        const schema = this.muData[target.type];
	        if (base.type === target.type) {
	            if (schema.diff(base.data, target.data, out)) {
	                opcode = 1;
	            }
	        }
	        else {
	            out.writeUint8(this._types.indexOf(target.type));
	            if (schema.diff(schema.identity, target.data, out)) {
	                opcode = 2;
	            }
	            else {
	                opcode = 4;
	            }
	        }
	        if (opcode) {
	            out.writeUint8At(head, opcode);
	            return true;
	        }
	        out.offset = head;
	        return false;
	    }
	    patch(base, inp) {
	        const result = this.clone(base);
	        const opcode = inp.readUint8();
	        if (opcode === 1) {
	            result.data = this.muData[result.type].patch(result.data, inp);
	        }
	        else {
	            result.type = this._types[inp.readUint8()];
	            const schema = this.muData[result.type];
	            if (opcode === 2) {
	                result.data = schema.patch(schema.identity, inp);
	            }
	            else if (opcode === 4) {
	                result.data = schema.clone(schema.identity);
	            }
	            else {
	                throw new Error(`invalid opcode ${opcode}`);
	            }
	        }
	        return result;
	    }
	    toJSON(union) {
	        return {
	            type: union.type,
	            data: this.muData[union.type].toJSON(union.data),
	        };
	    }
	    fromJSON(x) {
	        if (typeof x === 'object' && x) {
	            const type = x.type;
	            if (typeof type === 'string' && type in this.muData) {
	                return {
	                    type,
	                    data: this.muData[type].fromJSON(x.data),
	                };
	            }
	        }
	        return this.clone(this.identity);
	    }
	}
	union.MuUnion = MuUnion;
	
	return union;
}

var bytes = {};

var hasRequiredBytes;

function requireBytes () {
	if (hasRequiredBytes) return bytes;
	hasRequiredBytes = 1;
	Object.defineProperty(bytes, "__esModule", { value: true });
	bytes.MuBytes = void 0;
	class MuBytes {
	    constructor(identity) {
	        this.muType = 'bytes';
	        this.pool = {};
	        if (identity) {
	            this.identity = identity.slice();
	        }
	        else {
	            this.identity = new Uint8Array(1);
	        }
	        this.json = {
	            type: 'bytes',
	            identity: `[${(Array.prototype.slice.call(this.identity).join())}]`,
	        };
	    }
	    _allocBytes(length) {
	        return (this.pool[length] && this.pool[length].pop()) || new Uint8Array(length);
	    }
	    alloc() {
	        return this._allocBytes(this.identity.length);
	    }
	    free(bytes) {
	        const length = bytes.length;
	        if (!this.pool[length]) {
	            this.pool[length] = [];
	        }
	        this.pool[length].push(bytes);
	    }
	    equal(a, b) {
	        if (a.length !== b.length) {
	            return false;
	        }
	        for (let i = a.length - 1; i >= 0; --i) {
	            if (a[i] !== b[i]) {
	                return false;
	            }
	        }
	        return true;
	    }
	    clone(bytes) {
	        const copy = this._allocBytes(bytes.length);
	        copy.set(bytes);
	        return copy;
	    }
	    assign(dst, src) {
	        if (dst.length !== src.length) {
	            throw new Error('dst and src are of different lengths');
	        }
	        dst.set(src);
	        return dst;
	    }
	    diff(base, target, out) {
	        const length = target.length;
	        out.grow(5 + length);
	        out.writeVarint(length);
	        out.buffer.uint8.set(target, out.offset);
	        out.offset += length;
	        return true;
	    }
	    patch(base, inp) {
	        const length = inp.readVarint();
	        const target = this._allocBytes(length);
	        const bytes = inp.buffer.uint8.subarray(inp.offset, inp.offset += length);
	        target.set(bytes);
	        return target;
	    }
	    toJSON(bytes) {
	        const arr = new Array(bytes.length);
	        for (let i = 0; i < arr.length; ++i) {
	            arr[i] = bytes[i];
	        }
	        return arr;
	    }
	    fromJSON(x) {
	        if (Array.isArray(x)) {
	            const bytes = this._allocBytes(x.length);
	            bytes.set(x);
	            return bytes;
	        }
	        return this.clone(this.identity);
	    }
	}
	bytes.MuBytes = MuBytes;
	
	return bytes;
}

var dictionary = {};

var hasRequiredDictionary;

function requireDictionary () {
	if (hasRequiredDictionary) return dictionary;
	hasRequiredDictionary = 1;
	Object.defineProperty(dictionary, "__esModule", { value: true });
	dictionary.MuDictionary = void 0;
	const is_primitive_1 = requireIsPrimitive();
	function assignPrimitive(dst, src) {
	    const dKeys = Object.keys(dst);
	    const sKeys = Object.keys(src);
	    for (let i = 0; i < dKeys.length; ++i) {
	        const k = dKeys[i];
	        if (!(k in src)) {
	            delete dst[k];
	        }
	    }
	    for (let i = 0; i < sKeys.length; ++i) {
	        const k = sKeys[i];
	        dst[k] = src[k];
	    }
	    return dst;
	}
	function assignGeneric(schema) {
	    return (dst, src) => {
	        const dKeys = Object.keys(dst);
	        const sKeys = Object.keys(src);
	        for (let i = 0; i < dKeys.length; ++i) {
	            const k = dKeys[i];
	            if (!(k in src)) {
	                schema.free(dst[k]);
	                delete dst[k];
	            }
	        }
	        for (let i = 0; i < sKeys.length; ++i) {
	            const k = sKeys[i];
	            if (k in dst) {
	                dst[k] = schema.assign(dst[k], src[k]);
	            }
	            else {
	                dst[k] = schema.clone(src[k]);
	            }
	        }
	        return dst;
	    };
	}
	class MuDictionary {
	    stats() {
	        return {
	            allocCount: this.allocCount,
	            freeCount: this.freeCount,
	            poolSize: 0,
	        };
	    }
	    constructor(schema, capacity, identity) {
	        this.muType = 'dictionary';
	        this._isPrimitive = false;
	        this.allocCount = 0;
	        this.freeCount = 0;
	        this.muData = schema;
	        this.capacity = capacity;
	        this.identity = {};
	        if (identity) {
	            const keys = Object.keys(identity);
	            for (let i = 0; i < keys.length; ++i) {
	                const k = keys[i];
	                this.identity[k] = schema.clone(identity[k]);
	            }
	        }
	        this.json = {
	            type: 'dictionary',
	            valueType: schema.json,
	            identity: JSON.stringify(this.identity),
	        };
	        this._isPrimitive = (0, is_primitive_1.isMuPrimitiveType)(schema.muType);
	        if (this._isPrimitive) {
	            this.assign = assignPrimitive;
	        }
	        else {
	            this.assign = assignGeneric(schema);
	        }
	    }
	    alloc() {
	        this.allocCount += 1;
	        return {};
	    }
	    free(dict) {
	        this.freeCount += 1;
	        if (!this._isPrimitive) {
	            const props = Object.keys(dict);
	            const schema = this.muData;
	            for (let i = 0; i < props.length; ++i) {
	                schema.free(dict[props[i]]);
	            }
	        }
	    }
	    equal(a, b) {
	        const aKeys = Object.keys(a);
	        const bKeys = Object.keys(b);
	        if (aKeys.length !== bKeys.length) {
	            return false;
	        }
	        for (let i = aKeys.length - 1; i >= 0; --i) {
	            if (!(aKeys[i] in b)) {
	                return false;
	            }
	        }
	        const schema = this.muData;
	        for (let i = 0; i < aKeys.length; ++i) {
	            const k = aKeys[i];
	            if (!schema.equal(a[k], b[k])) {
	                return false;
	            }
	        }
	        return true;
	    }
	    clone(dict) {
	        this.allocCount += 1;
	        if (this._isPrimitive) {
	            return Object.assign({}, dict);
	        }
	        else {
	            const copy = {};
	            const keys = Object.keys(dict);
	            const schema = this.muData;
	            for (let i = 0; i < keys.length; ++i) {
	                const k = keys[i];
	                copy[k] = schema.clone(dict[k]);
	            }
	            return copy;
	        }
	    }
	    diff(base, target, out) {
	        let numDel = 0;
	        let numPatch = 0;
	        let numAdd = 0;
	        out.grow(12);
	        const head = out.offset;
	        out.offset += 12;
	        const bKeys = Object.keys(base).sort();
	        out.grow(5 * bKeys.length);
	        for (let i = 0; i < bKeys.length; ++i) {
	            if (!(bKeys[i] in target)) {
	                ++numDel;
	                out.writeVarint(i);
	            }
	        }
	        const tKeys = Object.keys(target);
	        const schema = this.muData;
	        const newKeys = [];
	        for (let i = 0; i < tKeys.length; ++i) {
	            const key = tKeys[i];
	            if (key in base) {
	                const prefix = out.offset;
	                out.grow(5);
	                out.writeVarint(bKeys.indexOf(key));
	                if (schema.diff(base[key], target[key], out)) {
	                    ++numPatch;
	                }
	                else {
	                    out.offset = prefix;
	                }
	            }
	            else {
	                newKeys.push(key);
	            }
	        }
	        numAdd = newKeys.length;
	        const numTrackers = Math.ceil(numAdd / 8);
	        out.grow(numTrackers);
	        let trackerOffset = out.offset;
	        out.offset += numTrackers;
	        let tracker = 0;
	        for (let i = 0; i < numAdd; ++i) {
	            const key = newKeys[i];
	            out.writeString(key);
	            if (schema.diff(schema.identity, target[key], out)) {
	                tracker |= 1 << (i & 7);
	            }
	            if ((i & 7) === 7) {
	                out.writeUint8At(trackerOffset++, tracker);
	                tracker = 0;
	            }
	        }
	        if (numAdd & 7) {
	            out.writeUint8At(trackerOffset, tracker);
	        }
	        if (numDel > 0 || numPatch > 0 || numAdd > 0) {
	            out.writeUint32At(head, numDel);
	            out.writeUint32At(head + 4, numPatch);
	            out.writeUint32At(head + 8, numAdd);
	            return true;
	        }
	        out.offset = head;
	        return false;
	    }
	    patch(base, inp) {
	        const numDel = inp.readUint32();
	        const numPatch = inp.readUint32();
	        const numAdd = inp.readUint32();
	        const bKeys = Object.keys(base).sort();
	        const numTargetProps = bKeys.length - numDel + numAdd;
	        if (numTargetProps > this.capacity) {
	            throw new Error(`number of target props ${numTargetProps} exceeds capacity ${this.capacity}`);
	        }
	        const result = {};
	        const schema = this.muData;
	        const keysToDel = {};
	        for (let i = 0; i < numDel; ++i) {
	            keysToDel[bKeys[inp.readVarint()]] = true;
	        }
	        for (let i = 0; i < bKeys.length; ++i) {
	            const key = bKeys[i];
	            if (!keysToDel[key]) {
	                result[key] = schema.clone(base[key]);
	            }
	        }
	        for (let i = 0; i < numPatch; ++i) {
	            const idx = inp.readVarint();
	            const key = bKeys[idx];
	            if (!key) {
	                throw new Error(`invalid index of key`);
	            }
	            result[key] = schema.patch(base[key], inp);
	        }
	        const numFullTrackers = numAdd / 8 | 0;
	        const numTrackers = Math.ceil(numAdd / 8);
	        let trackerOffset = inp.offset;
	        inp.offset += numTrackers;
	        for (let i = 0; i < numFullTrackers; ++i) {
	            const tracker = inp.readUint8At(trackerOffset++);
	            for (let j = 0; j < 8; ++j) {
	                result[inp.readString()] = tracker & (1 << j) ?
	                    schema.patch(schema.identity, inp) :
	                    schema.clone(schema.identity);
	            }
	        }
	        if (numAdd & 7) {
	            const tracker = inp.readUint8At(trackerOffset);
	            for (let i = 0; i < (numAdd & 7); ++i) {
	                result[inp.readString()] = tracker & (1 << i) ?
	                    schema.patch(schema.identity, inp) :
	                    schema.clone(schema.identity);
	            }
	        }
	        this.allocCount += 1;
	        return result;
	    }
	    toJSON(dict) {
	        const json = {};
	        const keys = Object.keys(dict);
	        const schema = this.muData;
	        for (let i = 0; i < keys.length; ++i) {
	            const k = keys[i];
	            json[k] = schema.toJSON(dict[k]);
	        }
	        return json;
	    }
	    fromJSON(x) {
	        this.allocCount += 1;
	        if (Object.prototype.toString.call(x) === '[object Object]') {
	            const dict = {};
	            const keys = Object.keys(x);
	            const schema = this.muData;
	            for (let i = 0; i < keys.length; ++i) {
	                const k = keys[i];
	                dict[k] = schema.fromJSON(x[k]);
	            }
	            return dict;
	        }
	        return this.clone(this.identity);
	    }
	}
	dictionary.MuDictionary = MuDictionary;
	
	return dictionary;
}

var vector = {};

var hasRequiredVector;

function requireVector () {
	if (hasRequiredVector) return vector;
	hasRequiredVector = 1;
	Object.defineProperty(vector, "__esModule", { value: true });
	vector.MuVector = void 0;
	const muTypeToTypedArray = {
	    float32: Float32Array,
	    float64: Float64Array,
	    int8: Int8Array,
	    int16: Int16Array,
	    int32: Int32Array,
	    uint8: Uint8Array,
	    uint16: Uint16Array,
	    uint32: Uint32Array,
	};
	class MuVector {
	    stats() {
	        return {
	            allocCount: this.allocCount,
	            freeCount: this.freeCount,
	            poolSize: this.pool.length,
	        };
	    }
	    constructor(schema, dimension) {
	        this.muType = 'vector';
	        this.allocCount = 0;
	        this.freeCount = 0;
	        this.pool = [];
	        this.muData = schema;
	        this.dimension = dimension;
	        this.TypedArray = muTypeToTypedArray[schema.muType];
	        this.identity = new this.TypedArray(dimension);
	        for (let i = 0; i < dimension; ++i) {
	            this.identity[i] = schema.identity;
	        }
	        this.json = {
	            type: 'vector',
	            valueType: schema.json,
	            dimension,
	        };
	        this.__b = new this.TypedArray(dimension);
	        this.__t = new this.TypedArray(dimension);
	        this._b = new Uint8Array(this.__b.buffer);
	        this._t = new Uint8Array(this.__t.buffer);
	    }
	    alloc() {
	        this.allocCount++;
	        return this.pool.pop() || new this.TypedArray(this.dimension);
	    }
	    free(vec) {
	        this.freeCount++;
	        this.pool.push(vec);
	    }
	    equal(a, b) {
	        if (!(a instanceof this.TypedArray) || !(b instanceof this.TypedArray)) {
	            return false;
	        }
	        if (a.length !== b.length) {
	            return false;
	        }
	        for (let i = a.length - 1; i >= 0; --i) {
	            if (a[i] !== b[i]) {
	                return false;
	            }
	        }
	        return true;
	    }
	    clone(vec) {
	        const copy = this.alloc();
	        copy.set(vec);
	        return copy;
	    }
	    assign(dst, src) {
	        dst.set(src);
	        return dst;
	    }
	    diff(base, target, out) {
	        this.__b.set(base);
	        this.__t.set(target);
	        const byteLength = this.identity.byteLength;
	        out.grow(Math.ceil(byteLength * 9 / 8));
	        const head = out.offset;
	        let trackerOffset = head;
	        out.offset += Math.ceil(byteLength / 8);
	        let tracker = 0;
	        let numPatches = 0;
	        for (let i = 0; i < byteLength; ++i) {
	            if (this._b[i] !== this._t[i]) {
	                out.writeUint8(this._t[i]);
	                tracker |= 1 << (i & 7);
	                ++numPatches;
	            }
	            if ((i & 7) === 7) {
	                out.writeUint8At(trackerOffset++, tracker);
	                tracker = 0;
	            }
	        }
	        if (numPatches === 0) {
	            out.offset = head;
	            return false;
	        }
	        if (byteLength & 7) {
	            out.writeUint8At(trackerOffset, tracker);
	        }
	        return true;
	    }
	    patch(base, inp) {
	        const head = inp.offset;
	        const numTrackerBits = this.dimension * this.identity.BYTES_PER_ELEMENT;
	        const numTrackerFullBytes = Math.floor(numTrackerBits / 8);
	        const numTrackerBytes = Math.ceil(numTrackerBits / 8);
	        inp.offset = head + numTrackerBytes;
	        this.__b.set(base);
	        for (let i = 0; i < numTrackerFullBytes; ++i) {
	            const start = i * 8;
	            const tracker = inp.readUint8At(head + i);
	            for (let j = 0; j < 8; ++j) {
	                if (tracker & (1 << j)) {
	                    this._b[start + j] = inp.readUint8();
	                }
	            }
	        }
	        if (numTrackerBits & 7) {
	            const start = numTrackerFullBytes * 8;
	            const tracker = inp.readUint8At(head + numTrackerFullBytes);
	            const partialBits = numTrackerBits & 7;
	            for (let j = 0; j < partialBits; ++j) {
	                if (tracker & (1 << j)) {
	                    this._b[start + j] = inp.readUint8();
	                }
	            }
	        }
	        return this.clone(this.__b);
	    }
	    toJSON(vec) {
	        const arr = new Array(vec.length);
	        for (let i = 0; i < arr.length; ++i) {
	            arr[i] = vec[i];
	        }
	        return arr;
	    }
	    fromJSON(x) {
	        if (Array.isArray(x)) {
	            const vec = this.alloc();
	            for (let i = 0; i < vec.length; ++i) {
	                vec[i] = this.muData.fromJSON(x[i]);
	            }
	            return vec;
	        }
	        return this.clone(this.identity);
	    }
	}
	vector.MuVector = MuVector;
	
	return vector;
}

var date = {};

var hasRequiredDate;

function requireDate () {
	if (hasRequiredDate) return date;
	hasRequiredDate = 1;
	Object.defineProperty(date, "__esModule", { value: true });
	date.MuDate = void 0;
	class MuDate {
	    constructor(identity) {
	        this.muType = 'date';
	        this.identity = new Date(0);
	        if (identity) {
	            this.identity.setTime(identity.getTime());
	        }
	        this.json = {
	            type: 'date',
	            identity: this.identity.toISOString(),
	        };
	    }
	    alloc() {
	        return new Date();
	    }
	    free(date) {
	    }
	    equal(a, b) {
	        return a.getTime() === b.getTime();
	    }
	    clone(date_) {
	        const date = this.alloc();
	        date.setTime(date_.getTime());
	        return date;
	    }
	    assign(dst, src) {
	        dst.setTime(src.getTime());
	        return dst;
	    }
	    diff(base, target, out) {
	        const bt = base.getTime();
	        const tt = target.getTime();
	        if (bt !== tt) {
	            out.grow(10);
	            out.writeVarint(tt % 0x10000000);
	            out.writeVarint(tt / 0x10000000 | 0);
	            return true;
	        }
	        return false;
	    }
	    patch(base, inp) {
	        const date = this.alloc();
	        const lo = inp.readVarint();
	        const hi = inp.readVarint();
	        date.setTime(lo + 0x10000000 * hi);
	        return date;
	    }
	    toJSON(date) {
	        return date.toISOString();
	    }
	    fromJSON(x) {
	        if (typeof x === 'string') {
	            return new Date(x);
	        }
	        return this.clone(this.identity);
	    }
	}
	date.MuDate = MuDate;
	
	return date;
}

var json = {};

var hasRequiredJson;

function requireJson () {
	if (hasRequiredJson) return json;
	hasRequiredJson = 1;
	(function (exports$1) {
		Object.defineProperty(exports$1, "__esModule", { value: true });
		exports$1.MuJSON = exports$1.deepClone = exports$1.deepEqual = void 0;
		function equal(a, b) {
		    if (a === b) {
		        return true;
		    }
		    if (a && b && typeof a === 'object' && typeof b === 'object') {
		        const aIsArr = Array.isArray(a);
		        const bIsArr = Array.isArray(b);
		        if (aIsArr !== bIsArr) {
		            return false;
		        }
		        if (aIsArr) {
		            const leng = a.length;
		            if (leng !== b.length) {
		                return false;
		            }
		            for (let i = leng - 1; i >= 0; --i) {
		                if (!equal(a[i], b[i])) {
		                    return false;
		                }
		            }
		            return true;
		        }
		        const keys = Object.keys(a);
		        if (keys.length !== Object.keys(b).length) {
		            return false;
		        }
		        for (let i = 0; i < keys.length; ++i) {
		            const key = keys[i];
		            if (!b.hasOwnProperty(key) || !equal(a[key], b[key])) {
		                return false;
		            }
		        }
		        return true;
		    }
		    return a !== a && b !== b;
		}
		function clone(x) {
		    if (typeof x !== 'object' || x === null) {
		        return x;
		    }
		    const copy = Array.isArray(x) ? [] : {};
		    if (Array.isArray(copy)) {
		        copy.length = x.length;
		        for (let i = 0; i < x.length; ++i) {
		            copy[i] = clone(x[i]);
		        }
		    }
		    else {
		        const keys = Object.keys(x);
		        for (let i = 0; i < keys.length; ++i) {
		            const key = keys[i];
		            copy[key] = clone(x[key]);
		        }
		    }
		    return copy;
		}
		exports$1.deepEqual = equal;
		exports$1.deepClone = clone;
		class MuJSON {
		    constructor(identity) {
		        this.muType = 'json';
		        this.identity = identity && clone(identity);
		        this.identity = this.identity || {};
		        this.json = {
		            type: 'json',
		            identity: this.identity,
		        };
		    }
		    alloc() { return {}; }
		    free() { }
		    equal(a, b) {
		        return (0, exports$1.deepEqual)(a, b);
		    }
		    clone(obj) {
		        return (0, exports$1.deepClone)(obj);
		    }
		    assign(dst, src) {
		        if (Array.isArray(dst) && Array.isArray(src)) {
		            dst.length = src.length;
		            for (let i = 0; i < dst.length; ++i) {
		                dst[i] = (0, exports$1.deepClone)(src[i]);
		            }
		            return dst;
		        }
		        const dKeys = Object.keys(dst);
		        for (let i = 0; i < dKeys.length; ++i) {
		            const key = dKeys[i];
		            if (!(key in src)) {
		                delete dst[key];
		            }
		        }
		        const sKeys = Object.keys(src);
		        for (let i = 0; i < sKeys.length; ++i) {
		            const key = sKeys[i];
		            dst[key] = (0, exports$1.deepClone)(src[key]);
		        }
		        return dst;
		    }
		    diff(base, target, out) {
		        const str = JSON.stringify(target);
		        out.writeString(str);
		        return true;
		    }
		    patch(base, inp) {
		        return JSON.parse(inp.readString());
		    }
		    toJSON(obj) { return obj; }
		    fromJSON(x) {
		        if (typeof x === 'object' && x) {
		            return x;
		        }
		        return this.clone(this.identity);
		    }
		}
		exports$1.MuJSON = MuJSON;
		
	} (json));
	return json;
}

var hasRequiredSchema;

function requireSchema () {
	if (hasRequiredSchema) return schema;
	hasRequiredSchema = 1;
	(function (exports$1) {
		Object.defineProperty(exports$1, "__esModule", { value: true });
		exports$1.MuJSON = exports$1.MuDate = exports$1.MuDictionary = exports$1.MuVector = exports$1.MuBytes = exports$1.MuUnion = exports$1.MuStruct = exports$1.MuSortedArray = exports$1.MuOption = exports$1.MuArray = exports$1.MuQuantizedFloat = exports$1.MuRelativeVarint = exports$1.MuVarint = exports$1.MuUint32 = exports$1.MuUint16 = exports$1.MuUint8 = exports$1.MuInt32 = exports$1.MuInt16 = exports$1.MuInt8 = exports$1.MuFloat64 = exports$1.MuFloat32 = exports$1.MuUTF8 = exports$1.MuFixedASCII = exports$1.MuASCII = exports$1.MuBoolean = exports$1.MuVoid = void 0;
		const void_1 = require_void();
		Object.defineProperty(exports$1, "MuVoid", { enumerable: true, get: function () { return void_1.MuVoid; } });
		const boolean_1 = requireBoolean();
		Object.defineProperty(exports$1, "MuBoolean", { enumerable: true, get: function () { return boolean_1.MuBoolean; } });
		const ascii_1 = requireAscii();
		Object.defineProperty(exports$1, "MuASCII", { enumerable: true, get: function () { return ascii_1.MuASCII; } });
		const fixed_ascii_1 = requireFixedAscii();
		Object.defineProperty(exports$1, "MuFixedASCII", { enumerable: true, get: function () { return fixed_ascii_1.MuFixedASCII; } });
		const utf8_1 = requireUtf8();
		Object.defineProperty(exports$1, "MuUTF8", { enumerable: true, get: function () { return utf8_1.MuUTF8; } });
		const float32_1 = requireFloat32();
		Object.defineProperty(exports$1, "MuFloat32", { enumerable: true, get: function () { return float32_1.MuFloat32; } });
		const float64_1 = requireFloat64();
		Object.defineProperty(exports$1, "MuFloat64", { enumerable: true, get: function () { return float64_1.MuFloat64; } });
		const int8_1 = requireInt8();
		Object.defineProperty(exports$1, "MuInt8", { enumerable: true, get: function () { return int8_1.MuInt8; } });
		const int16_1 = requireInt16();
		Object.defineProperty(exports$1, "MuInt16", { enumerable: true, get: function () { return int16_1.MuInt16; } });
		const int32_1 = requireInt32();
		Object.defineProperty(exports$1, "MuInt32", { enumerable: true, get: function () { return int32_1.MuInt32; } });
		const uint8_1 = requireUint8();
		Object.defineProperty(exports$1, "MuUint8", { enumerable: true, get: function () { return uint8_1.MuUint8; } });
		const uint16_1 = requireUint16();
		Object.defineProperty(exports$1, "MuUint16", { enumerable: true, get: function () { return uint16_1.MuUint16; } });
		const uint32_1 = requireUint32();
		Object.defineProperty(exports$1, "MuUint32", { enumerable: true, get: function () { return uint32_1.MuUint32; } });
		const varint_1 = requireVarint();
		Object.defineProperty(exports$1, "MuVarint", { enumerable: true, get: function () { return varint_1.MuVarint; } });
		const rvarint_1 = requireRvarint();
		Object.defineProperty(exports$1, "MuRelativeVarint", { enumerable: true, get: function () { return rvarint_1.MuRelativeVarint; } });
		const quantized_float_1 = requireQuantizedFloat();
		Object.defineProperty(exports$1, "MuQuantizedFloat", { enumerable: true, get: function () { return quantized_float_1.MuQuantizedFloat; } });
		const array_1 = requireArray();
		Object.defineProperty(exports$1, "MuArray", { enumerable: true, get: function () { return array_1.MuArray; } });
		const option_1 = requireOption();
		Object.defineProperty(exports$1, "MuOption", { enumerable: true, get: function () { return option_1.MuOption; } });
		const sorted_array_1 = requireSortedArray();
		Object.defineProperty(exports$1, "MuSortedArray", { enumerable: true, get: function () { return sorted_array_1.MuSortedArray; } });
		const struct_1 = requireStruct();
		Object.defineProperty(exports$1, "MuStruct", { enumerable: true, get: function () { return struct_1.MuStruct; } });
		const union_1 = requireUnion();
		Object.defineProperty(exports$1, "MuUnion", { enumerable: true, get: function () { return union_1.MuUnion; } });
		const bytes_1 = requireBytes();
		Object.defineProperty(exports$1, "MuBytes", { enumerable: true, get: function () { return bytes_1.MuBytes; } });
		const dictionary_1 = requireDictionary();
		Object.defineProperty(exports$1, "MuDictionary", { enumerable: true, get: function () { return dictionary_1.MuDictionary; } });
		const vector_1 = requireVector();
		Object.defineProperty(exports$1, "MuVector", { enumerable: true, get: function () { return vector_1.MuVector; } });
		const date_1 = requireDate();
		Object.defineProperty(exports$1, "MuDate", { enumerable: true, get: function () { return date_1.MuDate; } });
		const json_1 = requireJson();
		Object.defineProperty(exports$1, "MuJSON", { enumerable: true, get: function () { return json_1.MuJSON; } });
		
	} (schema));
	return schema;
}

var schemaExports = requireSchema();

const Vec3Schema = new schemaExports.MuVector(new schemaExports.MuFloat32(), 3);
const Vec4Schema = new schemaExports.MuVector(new schemaExports.MuFloat32(), 4);
const Uint8Vec3Schema = new schemaExports.MuVector(new schemaExports.MuUint8(), 3);
const Uint16Vec3Schema = new schemaExports.MuVector(new schemaExports.MuUint16(), 3);
const Mat4Schema = new schemaExports.MuVector(new schemaExports.MuFloat32(), 16);
const Mat3Schema = new schemaExports.MuVector(new schemaExports.MuFloat32(), 9);
const TimeAccessorSchema = new schemaExports.MuArray(new schemaExports.MuFloat32(), Infinity);
const RotationAccessorSchema = new schemaExports.MuArray(Vec4Schema, Infinity);
const TranslationAccessorSchema = new schemaExports.MuArray(Vec3Schema, Infinity);
const AlphaAccessorSchema = new schemaExports.MuArray(new schemaExports.MuFloat32(), Infinity);
exports.ProjectNodeType = void 0;
(function (ProjectNodeType) {
  ProjectNodeType[ProjectNodeType["Root"] = 0] = "Root";
  ProjectNodeType[ProjectNodeType["SkinPart"] = 1] = "SkinPart";
  ProjectNodeType[ProjectNodeType["Group"] = 2] = "Group";
  ProjectNodeType[ProjectNodeType["Bone"] = 3] = "Bone";
})(exports.ProjectNodeType || (exports.ProjectNodeType = {}));
exports.VoxelDimension = void 0;
(function (VoxelDimension) {
  VoxelDimension[VoxelDimension["YZ"] = 0] = "YZ";
  VoxelDimension[VoxelDimension["XZ"] = 1] = "XZ";
  VoxelDimension[VoxelDimension["XY"] = 2] = "XY";
  VoxelDimension[VoxelDimension["XYZ"] = 3] = "XYZ";
})(exports.VoxelDimension || (exports.VoxelDimension = {}));
exports.HitBoxMode = void 0;
(function (HitBoxMode) {
  HitBoxMode[HitBoxMode["Default"] = 0] = "Default";
  HitBoxMode[HitBoxMode["Custom"] = 1] = "Custom";
})(exports.HitBoxMode || (exports.HitBoxMode = {}));
exports.ChannelNodePath = void 0;
(function (ChannelNodePath) {
  ChannelNodePath["Rotation"] = "rotation";
  ChannelNodePath["Translation"] = "translation";
  ChannelNodePath["Alpha"] = "alpha";
  ChannelNodePath["Scale"] = "scale";
})(exports.ChannelNodePath || (exports.ChannelNodePath = {}));
exports.ProjectInterpolationType = void 0;
(function (ProjectInterpolationType) {
  ProjectInterpolationType["Step"] = "STEP";
  ProjectInterpolationType["Linear"] = "LINEAR";
  ProjectInterpolationType["EaseInSine"] = "EASE_IN_SINE";
  ProjectInterpolationType["EaseOutSine"] = "EASE_OUT_SINE";
  ProjectInterpolationType["EaseInOutSine"] = "EASE_IN_OUT_SINE";
})(exports.ProjectInterpolationType || (exports.ProjectInterpolationType = {}));
function calcEasing(type, weight) {
  switch (type) {
    case exports.ProjectInterpolationType.EaseInSine:
      return 1 - Math.cos(weight * Math.PI / 2);
    case exports.ProjectInterpolationType.EaseOutSine:
      return Math.sin(weight * Math.PI / 2);
    case exports.ProjectInterpolationType.EaseInOutSine:
      return -(Math.cos(Math.PI * weight) - 1) / 2;
    case exports.ProjectInterpolationType.Step:
      return weight === 1 ? 1 : 0;
    case exports.ProjectInterpolationType.Linear:
      return weight;
    default:
      return weight;
  }
}
function lerp$5(a, b, weight) {
  return (1 - weight) * a + weight * b;
}
const OutputSchema = new schemaExports.MuUnion({
  rotation: RotationAccessorSchema,
  translation: TranslationAccessorSchema,
  alpha: AlphaAccessorSchema,
  scale: TranslationAccessorSchema
});
const SamplerSchema = new schemaExports.MuStruct({
  input: TimeAccessorSchema,
  output: OutputSchema,
  interpolation: new schemaExports.MuASCII(exports.ProjectInterpolationType.Linear)
});

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, [])).next());
    });
}

var stream = {};

var codec = {};

var hasRequiredCodec;

function requireCodec () {
	if (hasRequiredCodec) return codec;
	hasRequiredCodec = 1;
	Object.defineProperty(codec, "__esModule", { value: true });
	codec.encode = encode;
	codec.decode = decode;
	function utf8ToBytes(str) {
	    let codePoint;
	    const strLength = str.length;
	    let leadSurrogate;
	    const bytes = [];
	    for (let i = 0; i < strLength; ++i) {
	        codePoint = str.charCodeAt(i);
	        if (codePoint > 0xD7FF && codePoint < 0xE000) {
	            if (!leadSurrogate) {
	                if (codePoint > 0xDBFF) {
	                    bytes.push(0xEF, 0xBF, 0xBD);
	                    continue;
	                }
	                else if (i + 1 === strLength) {
	                    bytes.push(0xEF, 0xBF, 0xBD);
	                    continue;
	                }
	                leadSurrogate = codePoint;
	                continue;
	            }
	            if (codePoint < 0xDC00) {
	                bytes.push(0xEF, 0xBF, 0xBD);
	                leadSurrogate = codePoint;
	                continue;
	            }
	            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
	        }
	        else if (leadSurrogate) {
	            bytes.push(0xEF, 0xBF, 0xBD);
	        }
	        leadSurrogate = undefined;
	        if (codePoint < 0x80) {
	            bytes.push(codePoint);
	        }
	        else if (codePoint < 0x800) {
	            bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
	        }
	        else if (codePoint < 0x10000) {
	            bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
	        }
	        else if (codePoint < 0x110000) {
	            bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
	        }
	        else {
	            throw new Error('mudb/stream: invalid code point');
	        }
	    }
	    return bytes;
	}
	function encode(str) {
	    return new Uint8Array(utf8ToBytes(str));
	}
	function decodeCodePointsArray(codePoints) {
	    const MAX_ARGUMENTS_LENGTH = 0x1000;
	    const len = codePoints.length;
	    if (len <= MAX_ARGUMENTS_LENGTH) {
	        return String.fromCharCode.apply(String, codePoints);
	    }
	    let res = '';
	    let i = 0;
	    while (i < len) {
	        res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
	    }
	    return res;
	}
	function decode(bytes) {
	    const { byteLength } = bytes;
	    const res = [];
	    let i = 0;
	    while (i < byteLength) {
	        const firstByte = bytes[i];
	        let codePoint;
	        let bytesPerSequence = (firstByte > 0xEF) ? 4
	            : (firstByte > 0xDF) ? 3
	                : (firstByte > 0xBF) ? 2
	                    : 1;
	        if (i + bytesPerSequence <= byteLength) {
	            let secondByte;
	            let thirdByte;
	            let fourthByte;
	            let tempCodePoint;
	            switch (bytesPerSequence) {
	                case 1:
	                    if (firstByte < 0x80) {
	                        codePoint = firstByte;
	                    }
	                    break;
	                case 2:
	                    secondByte = bytes[i + 1];
	                    if ((secondByte & 0xC0) === 0x80) {
	                        tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
	                        if (tempCodePoint > 0x7F) {
	                            codePoint = tempCodePoint;
	                        }
	                    }
	                    break;
	                case 3:
	                    secondByte = bytes[i + 1];
	                    thirdByte = bytes[i + 2];
	                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
	                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	                            codePoint = tempCodePoint;
	                        }
	                    }
	                    break;
	                case 4:
	                    secondByte = bytes[i + 1];
	                    thirdByte = bytes[i + 2];
	                    fourthByte = bytes[i + 3];
	                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
	                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	                            codePoint = tempCodePoint;
	                        }
	                    }
	            }
	        }
	        if (codePoint == undefined) {
	            codePoint = 0xFFFD;
	            bytesPerSequence = 1;
	        }
	        else if (codePoint > 0xFFFF) {
	            codePoint -= 0x10000;
	            res.push(codePoint >>> 10 & 0x3FF | 0xD800);
	            codePoint = 0xDC00 | codePoint & 0x3FF;
	        }
	        res.push(codePoint);
	        i += bytesPerSequence;
	    }
	    return decodeCodePointsArray(res);
	}
	
	return codec;
}

var hasRequiredStream;

function requireStream () {
	if (hasRequiredStream) return stream;
	hasRequiredStream = 1;
	(function (exports$1) {
		Object.defineProperty(exports$1, "__esModule", { value: true });
		exports$1.MuReadStream = exports$1.MuWriteStream = exports$1.MuBuffer = exports$1.decodeUTF8 = exports$1.encodeUTF8 = void 0;
		exports$1.allocBuffer = allocBuffer;
		exports$1.freeBuffer = freeBuffer;
		const root = (typeof self == 'object' && self['Object'] == Object && self)
		    || (typeof commonjsGlobal == 'object' && commonjsGlobal['Object'] == Object && commonjsGlobal);
		if (typeof root === 'object' && 'TextEncoder' in root) {
		    const encoder = new TextEncoder();
		    exports$1.encodeUTF8 = (str) => encoder.encode(str);
		    const decoder = new TextDecoder();
		    exports$1.decodeUTF8 = (bytes) => decoder.decode(bytes);
		}
		else {
		    const codec = requireCodec();
		    exports$1.encodeUTF8 = codec.encode;
		    exports$1.decodeUTF8 = codec.decode;
		}
		function ceilLog2(v_) {
		    let v = v_ - 1;
		    let r = (v > 0xFFFF) ? 1 << 4 : 0;
		    v >>>= r;
		    let shift = (v > 0xFF) ? 1 << 3 : 0;
		    v >>>= shift;
		    r |= shift;
		    shift = (v > 0xF) ? 1 << 2 : 0;
		    v >>>= shift;
		    r |= shift;
		    shift = (v > 0x3) ? 1 << 1 : 0;
		    v >>>= shift;
		    r |= shift;
		    return (r | (v >> 1)) + 1;
		}
		class MuBuffer {
		    constructor(buffer) {
		        this.buffer = buffer;
		        this.dataView = new DataView(buffer);
		        this.uint8 = new Uint8Array(buffer);
		    }
		}
		exports$1.MuBuffer = MuBuffer;
		const bufferPool = new Array(31);
		for (let i = 0; i < 31; ++i) {
		    bufferPool[i] = [];
		}
		function allocBuffer(size) {
		    if (size > 0x40000000 || size < 0) {
		        throw new RangeError(`size out of range: ${size}`);
		    }
		    size = Math.max(2, size | 0);
		    const b = ceilLog2(size);
		    return bufferPool[b].pop() || new MuBuffer(new ArrayBuffer(1 << b));
		}
		function freeBuffer(buffer) {
		    if (buffer.uint8.length > 0) {
		        bufferPool[ceilLog2(buffer.uint8.length)].push(buffer);
		    }
		}
		const LITTLE_ENDIAN = true;
		class MuWriteStream {
		    constructor(capacity) {
		        this.buffer = allocBuffer(capacity);
		        this.offset = 0;
		    }
		    bytes() {
		        return this.buffer.uint8.subarray(0, this.offset);
		    }
		    destroy() {
		        freeBuffer(this.buffer);
		    }
		    grow(bytes) {
		        const newSize = this.offset + bytes;
		        const uint8 = this.buffer.uint8;
		        if (uint8.length < newSize) {
		            const buffer = allocBuffer(newSize);
		            buffer.uint8.set(uint8);
		            freeBuffer(this.buffer);
		            this.buffer = buffer;
		        }
		    }
		    writeInt8(x) {
		        this.buffer.dataView.setInt8(this.offset, x);
		        this.offset += 1;
		    }
		    writeInt16(x) {
		        this.buffer.dataView.setInt16(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 2;
		    }
		    writeInt32(x) {
		        this.buffer.dataView.setInt32(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 4;
		    }
		    writeUint8(x) {
		        this.buffer.dataView.setUint8(this.offset, x);
		        this.offset += 1;
		    }
		    writeUint16(x) {
		        this.buffer.dataView.setUint16(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 2;
		    }
		    writeUint32(x) {
		        this.buffer.dataView.setUint32(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 4;
		    }
		    writeFloat32(x) {
		        this.buffer.dataView.setFloat32(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 4;
		    }
		    writeFloat64(x) {
		        this.buffer.dataView.setFloat64(this.offset, x, LITTLE_ENDIAN);
		        this.offset += 8;
		    }
		    writeVarint(x) {
		        const x_ = x >>> 0;
		        const bytes = this.buffer.uint8;
		        let offset = this.offset;
		        if (x_ < 0x80) {
		            bytes[offset++] = x_;
		        }
		        else if (x_ < 0x4000) {
		            bytes[offset++] = x_ & 0x7f | 0x80;
		            bytes[offset++] = x_ >>> 7;
		        }
		        else if (x_ < 0x200000) {
		            bytes[offset++] = x_ & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 7 & 0x7f | 0x80;
		            bytes[offset++] = x_ >>> 14;
		        }
		        else if (x_ < 0x10000000) {
		            bytes[offset++] = x_ & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 7 & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 14 & 0x7f | 0x80;
		            bytes[offset++] = x_ >>> 21;
		        }
		        else {
		            bytes[offset++] = x_ & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 7 & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 14 & 0x7f | 0x80;
		            bytes[offset++] = x_ >> 21 & 0x7f | 0x80;
		            bytes[offset++] = x_ >>> 28;
		        }
		        this.offset = offset;
		    }
		    writeASCII(str) {
		        const bytes = this.buffer.uint8;
		        let ptr = this.offset;
		        for (let i = 0; i < str.length; ++i) {
		            bytes[ptr++] = str.charCodeAt(i);
		        }
		        this.offset = ptr;
		    }
		    writeString(str) {
		        const bytes = (0, exports$1.encodeUTF8)(str);
		        this.grow(5 + bytes.length);
		        this.writeVarint(bytes.length);
		        this.buffer.uint8.set(bytes, this.offset);
		        this.offset += bytes.length;
		    }
		    writeUint8At(offset, x) {
		        this.buffer.dataView.setUint8(offset, x);
		    }
		    writeUint32At(offset, x) {
		        this.buffer.dataView.setUint32(offset, x, LITTLE_ENDIAN);
		    }
		}
		exports$1.MuWriteStream = MuWriteStream;
		class MuReadStream {
		    constructor(data) {
		        this.buffer = new MuBuffer(data.buffer);
		        this.offset = data.byteOffset;
		        this.length = data.byteLength + data.byteOffset;
		    }
		    bytes() {
		        return this.buffer.uint8.subarray(this.offset, this.length);
		    }
		    checkBounds() {
		        if (this.offset > this.length) {
		            throw new Error('out of bounds');
		        }
		    }
		    readInt8() {
		        const offset = this.offset;
		        this.offset += 1;
		        this.checkBounds();
		        return this.buffer.dataView.getInt8(offset);
		    }
		    readInt16() {
		        const offset = this.offset;
		        this.offset += 2;
		        this.checkBounds();
		        return this.buffer.dataView.getInt16(offset, LITTLE_ENDIAN);
		    }
		    readInt32() {
		        const offset = this.offset;
		        this.offset += 4;
		        this.checkBounds();
		        return this.buffer.dataView.getInt32(offset, LITTLE_ENDIAN);
		    }
		    readUint8() {
		        const offset = this.offset;
		        this.offset += 1;
		        this.checkBounds();
		        return this.buffer.dataView.getUint8(offset);
		    }
		    readUint16() {
		        const offset = this.offset;
		        this.offset += 2;
		        this.checkBounds();
		        return this.buffer.dataView.getUint16(offset, LITTLE_ENDIAN);
		    }
		    readUint32() {
		        const offset = this.offset;
		        this.offset += 4;
		        this.checkBounds();
		        return this.buffer.dataView.getUint32(offset, LITTLE_ENDIAN);
		    }
		    readFloat32() {
		        const offset = this.offset;
		        this.offset += 4;
		        this.checkBounds();
		        return this.buffer.dataView.getFloat32(offset, LITTLE_ENDIAN);
		    }
		    readFloat64() {
		        const offset = this.offset;
		        this.offset += 8;
		        this.checkBounds();
		        return this.buffer.dataView.getFloat64(offset, LITTLE_ENDIAN);
		    }
		    readVarint() {
		        const bytes = this.buffer.uint8;
		        let offset = this.offset;
		        const x0 = bytes[offset++];
		        if (x0 < 0x80) {
		            this.offset = offset;
		            this.checkBounds();
		            return x0;
		        }
		        const x1 = bytes[offset++];
		        if (x1 < 0x80) {
		            this.offset = offset;
		            this.checkBounds();
		            return (x0 & 0x7f) |
		                (x1 << 7);
		        }
		        const x2 = bytes[offset++];
		        if (x2 < 0x80) {
		            this.offset = offset;
		            this.checkBounds();
		            return (x0 & 0x7f) |
		                ((x1 & 0x7f) << 7) |
		                (x2 << 14);
		        }
		        const x3 = bytes[offset++];
		        if (x3 < 0x80) {
		            this.offset = offset;
		            this.checkBounds();
		            return (x0 & 0x7f) |
		                ((x1 & 0x7f) << 7) |
		                ((x2 & 0x7f) << 14) |
		                (x3 << 21);
		        }
		        const x4 = bytes[offset++];
		        this.offset = offset;
		        this.checkBounds();
		        return (x0 & 0x7f) +
		            ((x1 & 0x7f) << 7) +
		            ((x2 & 0x7f) << 14) +
		            ((x3 & 0x7f) << 21) +
		            (x4 * (1 << 28));
		    }
		    readASCII(length) {
		        const head = this.offset;
		        this.offset += length;
		        this.checkBounds();
		        let str = '';
		        for (let i = head; i < this.offset; ++i) {
		            str += String.fromCharCode(this.buffer.uint8[i]);
		        }
		        return str;
		    }
		    readString() {
		        const byteLength = this.readVarint();
		        const head = this.offset;
		        this.offset += byteLength;
		        this.checkBounds();
		        const bytes = this.buffer.uint8.subarray(head, this.offset);
		        return (0, exports$1.decodeUTF8)(bytes);
		    }
		    readUint8At(offset) {
		        return this.buffer.dataView.getUint8(offset);
		    }
		}
		exports$1.MuReadStream = MuReadStream;
		
	} (stream));
	return stream;
}

var streamExports = requireStream();

const MeshSchema = new schemaExports.MuArray(new schemaExports.MuUint8(), Infinity);
const ModelDataV1Schema = new schemaExports.MuStruct({
  bounds: Vec3Schema,
  meshes: new schemaExports.MuDictionary(MeshSchema, Infinity)
});

var schemaV1$2 = /*#__PURE__*/Object.freeze({
__proto__: null,
MeshSchema: MeshSchema,
ModelDataV1Schema: ModelDataV1Schema
});

const ModelNodeSchema$2 = new schemaExports.MuStruct({
  mesh: new schemaExports.MuInt32(-1),
  rotation: Vec4Schema,
  translation: Vec3Schema,
  children: new schemaExports.MuArray(new schemaExports.MuVarint(), Infinity),
  alpha: new schemaExports.MuFloat32(1)
});
const ModelNodesSchema$2 = new schemaExports.MuArray(ModelNodeSchema$2, Infinity);
const ModelDataV2Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(2),
  bounds: Vec3Schema,
  nodes: ModelNodesSchema$2,
  meshes: new schemaExports.MuArray(MeshSchema, Infinity)
});

var schemaV2$2 = /*#__PURE__*/Object.freeze({
__proto__: null,
MeshSchema: MeshSchema,
ModelDataV2Schema: ModelDataV2Schema,
ModelNodeSchema: ModelNodeSchema$2,
ModelNodesSchema: ModelNodesSchema$2
});

const ModelDataV3Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(3),
  bounds: Vec3Schema,
  nodes: ModelNodesSchema$2,
  texture: schema$1.MeshTextureSchema,
  meshes: new schemaExports.MuArray(schema$1.MeshDataSchema, Infinity)
});

var schemaV3$2 = /*#__PURE__*/Object.freeze({
__proto__: null,
MeshDataSchema: schema$1.MeshDataSchema,
MeshTextureSchema: schema$1.MeshTextureSchema,
ModelDataV3Schema: ModelDataV3Schema,
ModelNodeSchema: ModelNodeSchema$2,
ModelNodesSchema: ModelNodesSchema$2
});

const ModelDataV4Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(4),
  nodes: ModelNodesSchema$2,
  texture: schema$1.MeshTextureSchema,
  meshes: new schemaExports.MuArray(schema$1.MeshDataSchema, Infinity)
});

var schemaV4$1 = /*#__PURE__*/Object.freeze({
__proto__: null,
MeshDataSchema: schema$1.MeshDataSchema,
MeshTextureSchema: schema$1.MeshTextureSchema,
ModelDataV4Schema: ModelDataV4Schema,
ModelNodeSchema: ModelNodeSchema$2,
ModelNodesSchema: ModelNodesSchema$2
});

const ChannelSchema$2 = new schemaExports.MuStruct({
  sampler: new schemaExports.MuVarint(),
  target: new schemaExports.MuStruct({
    node: new schemaExports.MuVarint(),
    path: new schemaExports.MuASCII()
  })
});
const AnimationSchema$2 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  name: new schemaExports.MuUTF8(),
  channels: new schemaExports.MuArray(ChannelSchema$2, Infinity),
  samplers: new schemaExports.MuArray(SamplerSchema, Infinity)
});
const ModelDataV5Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(5),
  nodes: ModelNodesSchema$2,
  texture: schema$1.MeshTextureSchema,
  meshes: new schemaExports.MuArray(schema$1.MeshDataSchema, Infinity),
  animations: new schemaExports.MuArray(AnimationSchema$2, Infinity)
});

var schemaV5$1 = /*#__PURE__*/Object.freeze({
__proto__: null,
AnimationSchema: AnimationSchema$2,
ChannelSchema: ChannelSchema$2,
MeshDataSchema: schema$1.MeshDataSchema,
MeshTextureSchema: schema$1.MeshTextureSchema,
ModelDataV5Schema: ModelDataV5Schema,
ModelNodeSchema: ModelNodeSchema$2,
ModelNodesSchema: ModelNodesSchema$2
});

const ChannelSchema$1 = new schemaExports.MuStruct({
  sampler: new schemaExports.MuVarint(),
  target: new schemaExports.MuStruct({
    node: new schemaExports.MuVarint(),
    path: new schemaExports.MuASCII()
  })
});
const AnimationSchema$1 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  name: new schemaExports.MuUTF8(),
  channels: new schemaExports.MuArray(ChannelSchema$1, Infinity),
  samplers: new schemaExports.MuArray(SamplerSchema, Infinity)
});
const ModelNodeSchema$1 = new schemaExports.MuStruct({
  mesh: new schemaExports.MuInt32(-1),
  rotation: Vec4Schema,
  translation: Vec3Schema,
  scale: Vec3Schema,
  children: new schemaExports.MuArray(new schemaExports.MuVarint(), Infinity),
  alpha: new schemaExports.MuFloat32(1)
});
const ModelNodesSchema$1 = new schemaExports.MuArray(ModelNodeSchema$1, Infinity);
const ModelDataV6Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(6),
  nodes: ModelNodesSchema$1,
  texture: schema$1.MeshTextureSchema,
  meshes: new schemaExports.MuArray(schema$1.MeshDataSchema, Infinity),
  animations: new schemaExports.MuArray(AnimationSchema$1, Infinity)
});

var schemaV6$1 = /*#__PURE__*/Object.freeze({
__proto__: null,
AnimationSchema: AnimationSchema$1,
ChannelSchema: ChannelSchema$1,
MeshDataSchema: schema$1.MeshDataSchema,
MeshTextureSchema: schema$1.MeshTextureSchema,
ModelDataV6Schema: ModelDataV6Schema,
ModelNodeSchema: ModelNodeSchema$1,
ModelNodesSchema: ModelNodesSchema$1
});

const ChannelSchema = new schemaExports.MuStruct({
  sampler: new schemaExports.MuVarint(),
  target: new schemaExports.MuStruct({
    node: new schemaExports.MuVarint(),
    path: new schemaExports.MuASCII()
  })
});
const AnimationSchema = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  name: new schemaExports.MuUTF8(),
  channels: new schemaExports.MuArray(ChannelSchema, Infinity),
  samplers: new schemaExports.MuArray(SamplerSchema, Infinity)
});
const ModelNodeSchema = new schemaExports.MuStruct({
  mesh: new schemaExports.MuInt32(-1),
  rotation: Vec4Schema,
  translation: Vec3Schema,
  scale: Vec3Schema,
  parentScaleMat3: Mat3Schema,
  children: new schemaExports.MuArray(new schemaExports.MuVarint(), Infinity),
  alpha: new schemaExports.MuFloat32(1)
});
const ModelNodesSchema = new schemaExports.MuArray(ModelNodeSchema, Infinity);
const ModelDataV7Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(7),
  nodes: ModelNodesSchema,
  texture: schema$1.MeshTextureSchema,
  meshes: new schemaExports.MuArray(schema$1.MeshDataSchema, Infinity),
  animations: new schemaExports.MuArray(AnimationSchema, Infinity)
});

var schemaV7$1 = /*#__PURE__*/Object.freeze({
__proto__: null,
AnimationSchema: AnimationSchema,
ChannelSchema: ChannelSchema,
MeshDataSchema: schema$1.MeshDataSchema,
MeshTextureSchema: schema$1.MeshTextureSchema,
ModelDataV7Schema: ModelDataV7Schema,
ModelNodeSchema: ModelNodeSchema,
ModelNodesSchema: ModelNodesSchema
});

const VOXA_MODEL_VERSION = 7;
const MODEL_SCHEMA = {
  1: ModelDataV1Schema,
  2: ModelDataV2Schema,
  3: ModelDataV3Schema,
  4: ModelDataV4Schema,
  5: ModelDataV5Schema,
  6: ModelDataV6Schema,
  7: ModelDataV7Schema
};

const MAX_MATERIAL_COUNT = 256;
const RGB_TABLE = new Array(MAX_MATERIAL_COUNT);
const PBR_TABLE = new Array(MAX_MATERIAL_COUNT);
for (let i = 0; i < MAX_MATERIAL_COUNT; ++i) {
  RGB_TABLE[i] = PBR_TABLE[i] = 0;
}
const FACE_VERTS = 4;
const VERT_SIZE = 3;
const PTR_STEP = FACE_VERTS * VERT_SIZE;
const SLICE_INFO = [];
function endianByteShift(x) {
  return x * 8 >>> 0;
}
const S0 = endianByteShift(0);
const S1 = endianByteShift(1);
const S2 = endianByteShift(2);
const S3 = endianByteShift(3);
function packWord(b0, b1, b2, b3) {
  return (b0 << S0 >>> 0 | b1 << S1 >>> 0 | b2 << S2 >>> 0 | b3 << S3 >>> 0) >>> 0;
}
const AO_TABLE = [0 << S3 >>> 0, 153 << S3 >>> 0, 204 << S3 >>> 0, 255 << S3 >>> 0];
function fastMeshDecoder(inp) {
  const flag = inp.readInt32();
  if (flag !== -11) {
    return null;
  }
  const surfaceCount = inp.readVarint();
  const materialCount = inp.readVarint();
  const sliceInfoCount = inp.readVarint();
  for (let i = 0; i < materialCount; i++) {
    const mIdx = inp.readUint8();
    const r = inp.readUint8();
    const g = inp.readUint8();
    const b = inp.readUint8();
    const metalness = inp.readUint8();
    const smoothness = inp.readUint8();
    const emissive = inp.readUint8();
    RGB_TABLE[mIdx] = packWord(r, g, b, 0);
    PBR_TABLE[mIdx] = packWord(metalness, smoothness, emissive, mIdx);
  }
  SLICE_INFO.length = 0;
  for (let count = 0; count < sliceInfoCount;) {
    const normalCode = inp.readUint8();
    const normalCodeCount = inp.readVarint();
    count += 2;
    for (let j = 0; j < normalCodeCount; j++) {
      const z = inp.readUint8();
      const zCount = inp.readVarint();
      count += 2;
      SLICE_INFO.push(normalCode, z, zCount);
    }
  }
  const meshSize = surfaceCount * FACE_VERTS * VERT_SIZE;
  const buffer = new Uint32Array(meshSize);
  let ptr = 0;
  for (let i = 0; i < SLICE_INFO.length; i += 3) {
    const normalCode = SLICE_INFO[i];
    const z = SLICE_INFO[i + 1];
    const count = SLICE_INFO[i + 2];
    const flip = !(normalCode & 1);
    const d = normalCode >> 1;
    const u = (d + 2) % 3;
    const v = (d + 1) % 3;
    const ds = endianByteShift(d);
    const us = endianByteShift(u);
    const vs = endianByteShift(v);
    const zs = z << ds >>> 0;
    const ns = normalCode << S3 >>> 0;
    for (let j = 0; j < count; ++j) {
      const loX = inp.readUint8() << us >>> 0;
      const loY = inp.readUint8() << vs >>> 0;
      const hiX = inp.readUint8() << us >>> 0;
      const hiY = inp.readUint8() << vs >>> 0;
      const mIdx = inp.readUint8();
      const packedAO = inp.readUint8();
      const rgb = (RGB_TABLE[mIdx] | ns) >>> 0;
      const pbr = PBR_TABLE[mIdx];
      buffer[ptr + 1] = rgb;
      buffer[ptr + 2] = pbr;
      buffer[ptr + 4] = rgb;
      buffer[ptr + 5] = pbr;
      buffer[ptr + 7] = rgb;
      buffer[ptr + 8] = pbr;
      buffer[ptr + 10] = rgb;
      buffer[ptr + 11] = pbr;
      const a00 = AO_TABLE[packedAO & 3];
      const a10 = AO_TABLE[packedAO >> 2 & 3];
      const a11 = AO_TABLE[packedAO >> 4 & 3];
      const a01 = AO_TABLE[packedAO >> 6];
      const v00 = (loX | loY | zs | a00) >>> 0;
      const v01 = (loX | hiY | zs | a01) >>> 0;
      const v10 = (hiX | loY | zs | a10) >>> 0;
      const v11 = (hiX | hiY | zs | a11) >>> 0;
      const q = a00 + a11;
      const r = a10 + a01;
      const flipAO = (q - r || Math.max(a00, a11) - Math.max(a10, a01)) < 0;
      const notA = flipAO - 1 >>> 0;
      const c0 = notA & v00 | ~notA & v01;
      const c1 = notA & v11 | ~notA & v10;
      const d0 = v00 ^ v01 ^ c0;
      const d1 = v11 ^ v10 ^ c1;
      const F = flip ^ flipAO;
      buffer[ptr] = c0;
      buffer[ptr + (3 << F)] = d0;
      buffer[ptr + (3 << (1 ^ F))] = d1;
      buffer[ptr + 9] = c1;
      ptr += PTR_STEP;
    }
  }
  return new Uint8Array(buffer.buffer);
}

const migrateV1$2 = data => __awaiter(void 0, void 0, void 0, function* () {
  const firstId = Object.keys(data.meshes)[0];
  const rootNode = ModelNodeSchema$2.clone(ModelNodeSchema$2.identity);
  rootNode.children = [1];
  rootNode.rotation[3] = 1;
  const firstNode = ModelNodeSchema$2.clone(ModelNodeSchema$2.identity);
  firstNode.mesh = 0;
  firstNode.rotation[3] = 1;
  const bounds = Vec3Schema.clone(data.bounds);
  const meshes = [];
  if (!Vec3Schema.equal(data.bounds, Vec3Schema.fromJSON([0, 0, 0]))) {
    bounds[0]++;
    bounds[1]++;
    bounds[2]++;
    const mesh = data.meshes[firstId];
    const decodedMesh = fastMeshDecoder(new streamExports.MuReadStream(new Uint8Array(mesh)));
    if (decodedMesh) {
      const lo = [Infinity, Infinity, Infinity];
      for (let i = 0; i < decodedMesh.length; i += 12) {
        const x = decodedMesh[i];
        const y = decodedMesh[i + 1];
        const z = decodedMesh[i + 2];
        lo[0] = Math.min(x, lo[0]);
        lo[1] = Math.min(y, lo[1]);
        lo[2] = Math.min(z, lo[2]);
      }
      firstNode.translation[0] = -lo[0];
      firstNode.translation[1] = -lo[1];
      firstNode.translation[2] = -lo[2];
    }
    meshes.push(mesh);
  }
  return {
    version: 2,
    bounds,
    nodes: [rootNode, firstNode],
    meshes
  };
});

/**
 * 把bytes还原回CompactModel
 * 参照原来的 ModelMeshSchema.patch
 * @returns
 */
function bytesToCompactModel(bytes) {
  const inp = new streamExports.MuReadStream(bytes);
  const flag = inp.readInt32();
  if (flag !== -11) {
    return;
  }
  const surfaceCount = inp.readVarint();
  const dataLen = surfaceCount * 6;
  const data = new Uint8Array(dataLen);
  const materialCount = inp.readVarint();
  const sliceInfoCount = inp.readVarint();
  const sliceInfo = [];
  const material = {};
  for (let i = 0; i < materialCount; i++) {
    const mIdx = inp.readUint8();
    const r = inp.readUint8();
    const g = inp.readUint8();
    const b = inp.readUint8();
    const metalness = inp.readUint8();
    const smoothness = inp.readUint8();
    const emissive = inp.readUint8();
    material[mIdx] = {
      rgb: [r, g, b],
      pbr: [metalness, smoothness, emissive]
    };
  }
  for (let i = 0; i < sliceInfoCount / 2; i++) {
    sliceInfo.push(inp.readUint8());
    sliceInfo.push(inp.readVarint());
  }
  for (let i = 0; i < dataLen; i++) {
    data[i] = inp.readUint8();
  }
  return {
    data,
    sliceInfo,
    material,
    surfaceCount
  };
}

var voxel = {};

/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
var RANDOM = Math.random;
/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Float32ArrayConstructor | ArrayConstructor} type Array type, such as Float32Array or Array
 */

function setMatrixArrayType(type) {
  ARRAY_TYPE = type;
}
var degree = Math.PI / 180;
/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
 */

function toRadian(a) {
  return a * degree;
}
/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */

function equals$9(a, b) {
  return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
}
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};

var common = /*#__PURE__*/Object.freeze({
__proto__: null,
get ARRAY_TYPE () { return ARRAY_TYPE; },
EPSILON: EPSILON,
RANDOM: RANDOM,
equals: equals$9,
setMatrixArrayType: setMatrixArrayType,
toRadian: toRadian
});

/**
 * 2x2 Matrix
 * @module mat2
 */

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */

function create$8() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
  }

  out[0] = 1;
  out[3] = 1;
  return out;
}
/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */

function clone$8(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function copy$8(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */

function identity$5(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
/**
 * Create a new mat2 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out A new 2x2 matrix
 */

function fromValues$8(m00, m01, m10, m11) {
  var out = new ARRAY_TYPE(4);
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}
/**
 * Set the components of a mat2 to the given values
 *
 * @param {mat2} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out
 */

function set$8(out, m00, m01, m10, m11) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}
/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function transpose$2(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache
  // some values
  if (out === a) {
    var a1 = a[1];
    out[1] = a[2];
    out[2] = a1;
  } else {
    out[0] = a[0];
    out[1] = a[2];
    out[2] = a[1];
    out[3] = a[3];
  }

  return out;
}
/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function invert$5(out, a) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3]; // Calculate the determinant

  var det = a0 * a3 - a2 * a1;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = a3 * det;
  out[1] = -a1 * det;
  out[2] = -a2 * det;
  out[3] = a0 * det;
  return out;
}
/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function adjoint$2(out, a) {
  // Caching this value is nessecary if out == a
  var a0 = a[0];
  out[0] = a[3];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a0;
  return out;
}
/**
 * Calculates the determinant of a mat2
 *
 * @param {ReadonlyMat2} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant$3(a) {
  return a[0] * a[3] - a[2] * a[1];
}
/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */

function multiply$8(out, a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  return out;
}
/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */

function rotate$4(out, a, rad) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  return out;
}
/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to rotate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/

function scale$8(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.rotate(dest, dest, rad);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */

function fromRotation$4(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.scale(dest, dest, vec);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat2} out
 */

function fromScaling$3(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  return out;
}
/**
 * Returns a string representation of a mat2
 *
 * @param {ReadonlyMat2} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str$8(a) {
  return "mat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
/**
 * Returns Frobenius norm of a mat2
 *
 * @param {ReadonlyMat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob$3(a) {
  return Math.hypot(a[0], a[1], a[2], a[3]);
}
/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {ReadonlyMat2} L the lower triangular matrix
 * @param {ReadonlyMat2} D the diagonal matrix
 * @param {ReadonlyMat2} U the upper triangular matrix
 * @param {ReadonlyMat2} a the input matrix to factorize
 */

function LDU(L, D, U, a) {
  L[2] = a[2] / a[0];
  U[0] = a[0];
  U[1] = a[1];
  U[3] = a[3] - L[2] * U[1];
  return [L, D, U];
}
/**
 * Adds two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */

function add$8(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */

function subtract$6(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat2} a The first matrix.
 * @param {ReadonlyMat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals$8(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat2} a The first matrix.
 * @param {ReadonlyMat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals$8(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2} out
 */

function multiplyScalar$3(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
/**
 * Adds two mat2's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2} out the receiving vector
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2} out
 */

function multiplyScalarAndAdd$3(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}
/**
 * Alias for {@link mat2.multiply}
 * @function
 */

var mul$8 = multiply$8;
/**
 * Alias for {@link mat2.subtract}
 * @function
 */

var sub$6 = subtract$6;

var mat2 = /*#__PURE__*/Object.freeze({
__proto__: null,
LDU: LDU,
add: add$8,
adjoint: adjoint$2,
clone: clone$8,
copy: copy$8,
create: create$8,
determinant: determinant$3,
equals: equals$8,
exactEquals: exactEquals$8,
frob: frob$3,
fromRotation: fromRotation$4,
fromScaling: fromScaling$3,
fromValues: fromValues$8,
identity: identity$5,
invert: invert$5,
mul: mul$8,
multiply: multiply$8,
multiplyScalar: multiplyScalar$3,
multiplyScalarAndAdd: multiplyScalarAndAdd$3,
rotate: rotate$4,
scale: scale$8,
set: set$8,
str: str$8,
sub: sub$6,
subtract: subtract$6,
transpose: transpose$2
});

/**
 * 2x3 Matrix
 * @module mat2d
 * @description
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, b,
 *  c, d,
 *  tx, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, b, 0,
 *  c, d, 0,
 *  tx, ty, 1]
 * </pre>
 * The last column is ignored so the array is shorter and operations are faster.
 */

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */

function create$7() {
  var out = new ARRAY_TYPE(6);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[4] = 0;
    out[5] = 0;
  }

  out[0] = 1;
  out[3] = 1;
  return out;
}
/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {ReadonlyMat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */

function clone$7(a) {
  var out = new ARRAY_TYPE(6);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}
/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {mat2d} out
 */

function copy$7(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}
/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */

function identity$4(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Create a new mat2d with the given values
 *
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} A new mat2d
 */

function fromValues$7(a, b, c, d, tx, ty) {
  var out = new ARRAY_TYPE(6);
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}
/**
 * Set the components of a mat2d to the given values
 *
 * @param {mat2d} out the receiving matrix
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} out
 */

function set$7(out, a, b, c, d, tx, ty) {
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}
/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {mat2d} out
 */

function invert$4(out, a) {
  var aa = a[0],
      ab = a[1],
      ac = a[2],
      ad = a[3];
  var atx = a[4],
      aty = a[5];
  var det = aa * ad - ab * ac;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = ad * det;
  out[1] = -ab * det;
  out[2] = -ac * det;
  out[3] = aa * det;
  out[4] = (ac * aty - ad * atx) * det;
  out[5] = (ab * atx - aa * aty) * det;
  return out;
}
/**
 * Calculates the determinant of a mat2d
 *
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant$2(a) {
  return a[0] * a[3] - a[1] * a[2];
}
/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */

function multiply$7(out, a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  out[4] = a0 * b4 + a2 * b5 + a4;
  out[5] = a1 * b4 + a3 * b5 + a5;
  return out;
}
/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */

function rotate$3(out, a, rad) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  out[4] = a4;
  out[5] = a5;
  return out;
}
/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to translate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/

function scale$7(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  out[4] = a4;
  out[5] = a5;
  return out;
}
/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to translate
 * @param {ReadonlyVec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/

function translate$3(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0;
  out[1] = a1;
  out[2] = a2;
  out[3] = a3;
  out[4] = a0 * v0 + a2 * v1 + a4;
  out[5] = a1 * v0 + a3 * v1 + a5;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.rotate(dest, dest, rad);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */

function fromRotation$3(out, rad) {
  var s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.scale(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat2d} out
 */

function fromScaling$2(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.translate(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {ReadonlyVec2} v Translation vector
 * @returns {mat2d} out
 */

function fromTranslation$3(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = v[0];
  out[5] = v[1];
  return out;
}
/**
 * Returns a string representation of a mat2d
 *
 * @param {ReadonlyMat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str$7(a) {
  return "mat2d(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ")";
}
/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {ReadonlyMat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob$2(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], 1);
}
/**
 * Adds two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */

function add$7(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */

function subtract$5(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2d} out
 */

function multiplyScalar$2(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  return out;
}
/**
 * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2d} out the receiving vector
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2d} out
 */

function multiplyScalarAndAdd$2(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat2d} a The first matrix.
 * @param {ReadonlyMat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals$7(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat2d} a The first matrix.
 * @param {ReadonlyMat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals$7(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5));
}
/**
 * Alias for {@link mat2d.multiply}
 * @function
 */

var mul$7 = multiply$7;
/**
 * Alias for {@link mat2d.subtract}
 * @function
 */

var sub$5 = subtract$5;

var mat2d = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$7,
clone: clone$7,
copy: copy$7,
create: create$7,
determinant: determinant$2,
equals: equals$7,
exactEquals: exactEquals$7,
frob: frob$2,
fromRotation: fromRotation$3,
fromScaling: fromScaling$2,
fromTranslation: fromTranslation$3,
fromValues: fromValues$7,
identity: identity$4,
invert: invert$4,
mul: mul$7,
multiply: multiply$7,
multiplyScalar: multiplyScalar$2,
multiplyScalarAndAdd: multiplyScalarAndAdd$2,
rotate: rotate$3,
scale: scale$7,
set: set$7,
str: str$7,
sub: sub$5,
subtract: subtract$5,
translate: translate$3
});

/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */

function create$6() {
  var out = new ARRAY_TYPE(9);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }

  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}
/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {ReadonlyMat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */

function fromMat4$1(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[4];
  out[4] = a[5];
  out[5] = a[6];
  out[6] = a[8];
  out[7] = a[9];
  out[8] = a[10];
  return out;
}
/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */

function clone$6(a) {
  var out = new ARRAY_TYPE(9);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function copy$6(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Create a new mat3 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} A new mat3
 */

function fromValues$6(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  var out = new ARRAY_TYPE(9);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} out
 */

function set$6(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */

function identity$3(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function transpose$1(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a12 = a[5];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a01;
    out[5] = a[7];
    out[6] = a02;
    out[7] = a12;
  } else {
    out[0] = a[0];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a[1];
    out[4] = a[4];
    out[5] = a[7];
    out[6] = a[2];
    out[7] = a[5];
    out[8] = a[8];
  }

  return out;
}
/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function invert$3(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  var b01 = a22 * a11 - a12 * a21;
  var b11 = -a22 * a10 + a12 * a20;
  var b21 = a21 * a10 - a11 * a20; // Calculate the determinant

  var det = a00 * b01 + a01 * b11 + a02 * b21;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
  return out;
}
/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function adjoint$1(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  out[0] = a11 * a22 - a12 * a21;
  out[1] = a02 * a21 - a01 * a22;
  out[2] = a01 * a12 - a02 * a11;
  out[3] = a12 * a20 - a10 * a22;
  out[4] = a00 * a22 - a02 * a20;
  out[5] = a02 * a10 - a00 * a12;
  out[6] = a10 * a21 - a11 * a20;
  out[7] = a01 * a20 - a00 * a21;
  out[8] = a00 * a11 - a01 * a10;
  return out;
}
/**
 * Calculates the determinant of a mat3
 *
 * @param {ReadonlyMat3} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant$1(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
}
/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */

function multiply$6(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  var b00 = b[0],
      b01 = b[1],
      b02 = b[2];
  var b10 = b[3],
      b11 = b[4],
      b12 = b[5];
  var b20 = b[6],
      b21 = b[7],
      b22 = b[8];
  out[0] = b00 * a00 + b01 * a10 + b02 * a20;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22;
  out[3] = b10 * a00 + b11 * a10 + b12 * a20;
  out[4] = b10 * a01 + b11 * a11 + b12 * a21;
  out[5] = b10 * a02 + b11 * a12 + b12 * a22;
  out[6] = b20 * a00 + b21 * a10 + b22 * a20;
  out[7] = b20 * a01 + b21 * a11 + b22 * a21;
  out[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return out;
}
/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to translate
 * @param {ReadonlyVec2} v vector to translate by
 * @returns {mat3} out
 */

function translate$2(out, a, v) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      x = v[0],
      y = v[1];
  out[0] = a00;
  out[1] = a01;
  out[2] = a02;
  out[3] = a10;
  out[4] = a11;
  out[5] = a12;
  out[6] = x * a00 + y * a10 + a20;
  out[7] = x * a01 + y * a11 + a21;
  out[8] = x * a02 + y * a12 + a22;
  return out;
}
/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */

function rotate$2(out, a, rad) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;
  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;
  out[6] = a20;
  out[7] = a21;
  out[8] = a22;
  return out;
}
/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to rotate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/

function scale$6(out, a, v) {
  var x = v[0],
      y = v[1];
  out[0] = x * a[0];
  out[1] = x * a[1];
  out[2] = x * a[2];
  out[3] = y * a[3];
  out[4] = y * a[4];
  out[5] = y * a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyVec2} v Translation vector
 * @returns {mat3} out
 */

function fromTranslation$2(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = v[0];
  out[7] = v[1];
  out[8] = 1;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */

function fromRotation$2(out, rad) {
  var s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = -s;
  out[4] = c;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat3} out
 */

function fromScaling$1(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = v[1];
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to copy
 * @returns {mat3} out
 **/

function fromMat2d(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = 0;
  out[3] = a[2];
  out[4] = a[3];
  out[5] = 0;
  out[6] = a[4];
  out[7] = a[5];
  out[8] = 1;
  return out;
}
/**
 * Calculates a 3x3 matrix from the given quaternion
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat3} out
 */

function fromQuat$1(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;
  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;
  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;
  return out;
}
/**
 * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyMat4} a Mat4 to derive the normal matrix from
 *
 * @returns {mat3} out
 */

function normalFromMat4(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  return out;
}
/**
 * Generates a 2D projection matrix with the given bounds
 *
 * @param {mat3} out mat3 frustum matrix will be written into
 * @param {number} width Width of your gl context
 * @param {number} height Height of gl context
 * @returns {mat3} out
 */

function projection(out, width, height) {
  out[0] = 2 / width;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = -2 / height;
  out[5] = 0;
  out[6] = -1;
  out[7] = 1;
  out[8] = 1;
  return out;
}
/**
 * Returns a string representation of a mat3
 *
 * @param {ReadonlyMat3} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str$6(a) {
  return "mat3(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ")";
}
/**
 * Returns Frobenius norm of a mat3
 *
 * @param {ReadonlyMat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob$1(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
}
/**
 * Adds two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */

function add$6(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */

function subtract$4(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat3} out
 */

function multiplyScalar$1(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  return out;
}
/**
 * Adds two mat3's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat3} out the receiving vector
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat3} out
 */

function multiplyScalarAndAdd$1(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat3} a The first matrix.
 * @param {ReadonlyMat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals$6(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat3} a The first matrix.
 * @param {ReadonlyMat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals$6(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7],
      a8 = a[8];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7],
      b8 = b[8];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8));
}
/**
 * Alias for {@link mat3.multiply}
 * @function
 */

var mul$6 = multiply$6;
/**
 * Alias for {@link mat3.subtract}
 * @function
 */

var sub$4 = subtract$4;

var mat3 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$6,
adjoint: adjoint$1,
clone: clone$6,
copy: copy$6,
create: create$6,
determinant: determinant$1,
equals: equals$6,
exactEquals: exactEquals$6,
frob: frob$1,
fromMat2d: fromMat2d,
fromMat4: fromMat4$1,
fromQuat: fromQuat$1,
fromRotation: fromRotation$2,
fromScaling: fromScaling$1,
fromTranslation: fromTranslation$2,
fromValues: fromValues$6,
identity: identity$3,
invert: invert$3,
mul: mul$6,
multiply: multiply$6,
multiplyScalar: multiplyScalar$1,
multiplyScalarAndAdd: multiplyScalarAndAdd$1,
normalFromMat4: normalFromMat4,
projection: projection,
rotate: rotate$2,
scale: scale$6,
set: set$6,
str: str$6,
sub: sub$4,
subtract: subtract$4,
translate: translate$2,
transpose: transpose$1
});

/**
 * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
 * @module mat4
 */

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */

function create$5() {
  var out = new ARRAY_TYPE(16);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }

  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */

function clone$5(a) {
  var out = new ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function copy$5(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */

function fromValues$5(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} out
 */

function set$5(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */

function identity$2(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a12 = a[6],
        a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }

  return out;
}
/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function invert$2(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function adjoint(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
  out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
  out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
  out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
  out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
  out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
  out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
  out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
  out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
  out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
  out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
  out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
  out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
  out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
  out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
  out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
  return out;
}
/**
 * Calculates the determinant of a mat4
 *
 * @param {ReadonlyMat4} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function multiply$5(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15]; // Cache only the current line of the second matrix

  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {mat4} out
 */

function translate$1(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}
/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {ReadonlyVec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/

function scale$5(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */

function rotate$1(out, a, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;

  if (len < EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11]; // Construct the elements of the rotation matrix

  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  return out;
}
/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateX$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateY$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateZ$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyVec3} v Translation vector
 * @returns {mat4} out
 */

function fromTranslation$1(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyVec3} v Scaling vector
 * @returns {mat4} out
 */

function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */

function fromRotation$1(out, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;

  if (len < EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c; // Perform rotation-specific matrix multiplication

  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @returns {mat4} out
 */

function fromRotationTranslation$1(out, q, v) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a new mat4 from a dual quat.
 *
 * @param {mat4} out Matrix
 * @param {ReadonlyQuat2} a Dual Quaternion
 * @returns {mat4} mat4 receiving operation result
 */

function fromQuat2(out, a) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw; //Only scale if it makes sense

  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }

  fromRotationTranslation$1(out, a, translation);
  return out;
}
/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */

function getTranslation$1(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */

function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */

function getRotation(out, mat) {
  var scaling = new ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;

  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }

  return out;
}
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @param {ReadonlyVec3} s Scaling vector
 * @returns {mat4} out
 */

function fromRotationTranslationScale(out, q, v, s) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     mat4.translate(dest, origin);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *     mat4.translate(dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @param {ReadonlyVec3} s Scaling vector
 * @param {ReadonlyVec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */

function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */

function fromQuat(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */

function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
/**
 * Generates a perspective projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */

function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }

  return out;
}
/**
 * Alias for {@link mat4.perspectiveNO}
 * @function
 */

var perspective = perspectiveNO;
/**
 * Generates a perspective projection matrix suitable for WebGPU with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */

function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }

  return out;
}
/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180.0);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0);
  var xScale = 2.0 / (leftTan + rightTan);
  var yScale = 2.0 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  out[4] = 0.0;
  out[5] = yScale;
  out[6] = 0.0;
  out[7] = 0.0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1;
  out[12] = 0.0;
  out[13] = 0.0;
  out[14] = far * near / (near - far);
  out[15] = 0.0;
  return out;
}
/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
/**
 * Alias for {@link mat4.orthoNO}
 * @function
 */

var ortho = orthoNO;
/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis.
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */

function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];

  if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
    return identity$2(out);
  }

  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);

  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.hypot(y0, y1, y2);

  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }

  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
/**
 * Generates a matrix that makes something look at something else.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */

function targetTo(out, eye, target, up) {
  var eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2],
      upx = up[0],
      upy = up[1],
      upz = up[2];
  var z0 = eyex - target[0],
      z1 = eyey - target[1],
      z2 = eyez - target[2];
  var len = z0 * z0 + z1 * z1 + z2 * z2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }

  var x0 = upy * z2 - upz * z1,
      x1 = upz * z0 - upx * z2,
      x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
/**
 * Returns a string representation of a mat4
 *
 * @param {ReadonlyMat4} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str$5(a) {
  return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
}
/**
 * Returns Frobenius norm of a mat4
 *
 * @param {ReadonlyMat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
}
/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function add$5(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function subtract$3(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */

function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
/**
 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat4} out the receiving vector
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat4} out
 */

function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  out[9] = a[9] + b[9] * scale;
  out[10] = a[10] + b[10] * scale;
  out[11] = a[11] + b[11] * scale;
  out[12] = a[12] + b[12] * scale;
  out[13] = a[13] + b[13] * scale;
  out[14] = a[14] + b[14] * scale;
  out[15] = a[15] + b[15] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat4} a The first matrix.
 * @param {ReadonlyMat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals$5(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat4} a The first matrix.
 * @param {ReadonlyMat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals$5(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7];
  var a8 = a[8],
      a9 = a[9],
      a10 = a[10],
      a11 = a[11];
  var a12 = a[12],
      a13 = a[13],
      a14 = a[14],
      a15 = a[15];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  var b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7];
  var b8 = b[8],
      b9 = b[9],
      b10 = b[10],
      b11 = b[11];
  var b12 = b[12],
      b13 = b[13],
      b14 = b[14],
      b15 = b[15];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15));
}
/**
 * Alias for {@link mat4.multiply}
 * @function
 */

var mul$5 = multiply$5;
/**
 * Alias for {@link mat4.subtract}
 * @function
 */

var sub$3 = subtract$3;

var mat4 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$5,
adjoint: adjoint,
clone: clone$5,
copy: copy$5,
create: create$5,
determinant: determinant,
equals: equals$5,
exactEquals: exactEquals$5,
frob: frob,
fromQuat: fromQuat,
fromQuat2: fromQuat2,
fromRotation: fromRotation$1,
fromRotationTranslation: fromRotationTranslation$1,
fromRotationTranslationScale: fromRotationTranslationScale,
fromRotationTranslationScaleOrigin: fromRotationTranslationScaleOrigin,
fromScaling: fromScaling,
fromTranslation: fromTranslation$1,
fromValues: fromValues$5,
fromXRotation: fromXRotation,
fromYRotation: fromYRotation,
fromZRotation: fromZRotation,
frustum: frustum,
getRotation: getRotation,
getScaling: getScaling,
getTranslation: getTranslation$1,
identity: identity$2,
invert: invert$2,
lookAt: lookAt,
mul: mul$5,
multiply: multiply$5,
multiplyScalar: multiplyScalar,
multiplyScalarAndAdd: multiplyScalarAndAdd,
ortho: ortho,
orthoNO: orthoNO,
orthoZO: orthoZO,
perspective: perspective,
perspectiveFromFieldOfView: perspectiveFromFieldOfView,
perspectiveNO: perspectiveNO,
perspectiveZO: perspectiveZO,
rotate: rotate$1,
rotateX: rotateX$3,
rotateY: rotateY$3,
rotateZ: rotateZ$3,
scale: scale$5,
set: set$5,
str: str$5,
sub: sub$3,
subtract: subtract$3,
targetTo: targetTo,
translate: translate$1,
transpose: transpose
});

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */

function create$4() {
  var out = new ARRAY_TYPE(3);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {ReadonlyVec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */

function clone$4(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
/**
 * Calculates the length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate length of
 * @returns {Number} length of a
 */

function length$4(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */

function fromValues$4(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the source vector
 * @returns {vec3} out
 */

function copy$4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */

function set$4(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function add$4(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function subtract$2(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function multiply$4(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function divide$2(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to ceil
 * @returns {vec3} out
 */

function ceil$2(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}
/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to floor
 * @returns {vec3} out
 */

function floor$2(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}
/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function min$2(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function max$2(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}
/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to round
 * @returns {vec3} out
 */

function round$2(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out;
}
/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */

function scale$4(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */

function scaleAndAdd$2(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} distance between a and b
 */

function distance$2(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.hypot(x, y, z);
}
/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} squared distance between a and b
 */

function squaredDistance$2(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}
/**
 * Calculates the squared length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength$4(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}
/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to negate
 * @returns {vec3} out
 */

function negate$2(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to invert
 * @returns {vec3} out
 */

function inverse$2(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  return out;
}
/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to normalize
 * @returns {vec3} out
 */

function normalize$4(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
/**
 * Calculates the dot product of two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot$4(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function cross$2(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2];
  var bx = b[0],
      by = b[1],
      bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */

function lerp$4(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
/**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {ReadonlyVec3} c the third operand
 * @param {ReadonlyVec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */

function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
/**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {ReadonlyVec3} c the third operand
 * @param {ReadonlyVec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */

function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */

function random$3(out, scale) {
  scale = scale || 1.0;
  var r = RANDOM() * 2.0 * Math.PI;
  var z = RANDOM() * 2.0 - 1.0;
  var zScale = Math.sqrt(1.0 - z * z) * scale;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale;
  return out;
}
/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec3} out
 */

function transformMat4$2(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat3} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */

function transformMat3$1(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
/**
 * Transforms the vec3 with a quat
 * Can also be used for dual quaternions. (Multiply it with the real part)
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyQuat} q quaternion to transform with
 * @returns {vec3} out
 */

function transformQuat$1(out, a, q) {
  // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3];
  var x = a[0],
      y = a[1],
      z = a[2]; // var qvec = [qx, qy, qz];
  // var uv = vec3.cross([], qvec, a);

  var uvx = qy * z - qz * y,
      uvy = qz * x - qx * z,
      uvz = qx * y - qy * x; // var uuv = vec3.cross([], qvec, uv);

  var uuvx = qy * uvz - qz * uvy,
      uuvy = qz * uvx - qx * uvz,
      uuvz = qx * uvy - qy * uvx; // vec3.scale(uv, uv, 2 * w);

  var w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2; // vec3.scale(uuv, uuv, 2);

  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2; // return vec3.add(out, a, vec3.add(out, uv, uuv));

  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateX$2(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateY$2(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateZ$2(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2]; //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Get the angle between two 3D vectors
 * @param {ReadonlyVec3} a The first operand
 * @param {ReadonlyVec3} b The second operand
 * @returns {Number} The angle in radians
 */

function angle$1(a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      bx = b[0],
      by = b[1],
      bz = b[2],
      mag1 = Math.sqrt(ax * ax + ay * ay + az * az),
      mag2 = Math.sqrt(bx * bx + by * by + bz * bz),
      mag = mag1 * mag2,
      cosine = mag && dot$4(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
/**
 * Set the components of a vec3 to zero
 *
 * @param {vec3} out the receiving vector
 * @returns {vec3} out
 */

function zero$2(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  out[2] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec3} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str$4(a) {
  return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec3} a The first vector.
 * @param {ReadonlyVec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function exactEquals$4(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec3} a The first vector.
 * @param {ReadonlyVec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function equals$4(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2));
}
/**
 * Alias for {@link vec3.subtract}
 * @function
 */

var sub$2 = subtract$2;
/**
 * Alias for {@link vec3.multiply}
 * @function
 */

var mul$4 = multiply$4;
/**
 * Alias for {@link vec3.divide}
 * @function
 */

var div$2 = divide$2;
/**
 * Alias for {@link vec3.distance}
 * @function
 */

var dist$2 = distance$2;
/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */

var sqrDist$2 = squaredDistance$2;
/**
 * Alias for {@link vec3.length}
 * @function
 */

var len$4 = length$4;
/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */

var sqrLen$4 = squaredLength$4;
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$2 = function () {
  var vec = create$4();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
}();

var vec3 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$4,
angle: angle$1,
bezier: bezier,
ceil: ceil$2,
clone: clone$4,
copy: copy$4,
create: create$4,
cross: cross$2,
dist: dist$2,
distance: distance$2,
div: div$2,
divide: divide$2,
dot: dot$4,
equals: equals$4,
exactEquals: exactEquals$4,
floor: floor$2,
forEach: forEach$2,
fromValues: fromValues$4,
hermite: hermite,
inverse: inverse$2,
len: len$4,
length: length$4,
lerp: lerp$4,
max: max$2,
min: min$2,
mul: mul$4,
multiply: multiply$4,
negate: negate$2,
normalize: normalize$4,
random: random$3,
rotateX: rotateX$2,
rotateY: rotateY$2,
rotateZ: rotateZ$2,
round: round$2,
scale: scale$4,
scaleAndAdd: scaleAndAdd$2,
set: set$4,
sqrDist: sqrDist$2,
sqrLen: sqrLen$4,
squaredDistance: squaredDistance$2,
squaredLength: squaredLength$4,
str: str$4,
sub: sub$2,
subtract: subtract$2,
transformMat3: transformMat3$1,
transformMat4: transformMat4$2,
transformQuat: transformQuat$1,
zero: zero$2
});

/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */

function create$3() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }

  return out;
}
/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {ReadonlyVec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */

function clone$3(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */

function fromValues$3(x, y, z, w) {
  var out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the source vector
 * @returns {vec4} out
 */

function copy$3(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */

function set$3(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function add$3(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function subtract$1(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}
/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function multiply$3(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  out[3] = a[3] * b[3];
  return out;
}
/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function divide$1(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  out[3] = a[3] / b[3];
  return out;
}
/**
 * Math.ceil the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to ceil
 * @returns {vec4} out
 */

function ceil$1(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  out[3] = Math.ceil(a[3]);
  return out;
}
/**
 * Math.floor the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to floor
 * @returns {vec4} out
 */

function floor$1(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  out[3] = Math.floor(a[3]);
  return out;
}
/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function min$1(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  out[3] = Math.min(a[3], b[3]);
  return out;
}
/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function max$1(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  out[3] = Math.max(a[3], b[3]);
  return out;
}
/**
 * Math.round the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to round
 * @returns {vec4} out
 */

function round$1(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  out[3] = Math.round(a[3]);
  return out;
}
/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */

function scale$3(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */

function scaleAndAdd$1(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} distance between a and b
 */

function distance$1(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return Math.hypot(x, y, z, w);
}
/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} squared distance between a and b
 */

function squaredDistance$1(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return x * x + y * y + z * z + w * w;
}
/**
 * Calculates the length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate length of
 * @returns {Number} length of a
 */

function length$3(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.hypot(x, y, z, w);
}
/**
 * Calculates the squared length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength$3(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}
/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to negate
 * @returns {vec4} out
 */

function negate$1(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = -a[3];
  return out;
}
/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to invert
 * @returns {vec4} out
 */

function inverse$1(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  out[3] = 1.0 / a[3];
  return out;
}
/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to normalize
 * @returns {vec4} out
 */

function normalize$3(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
/**
 * Calculates the dot product of two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot$3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
/**
 * Returns the cross-product of three vectors in a 4-dimensional space
 *
 * @param {ReadonlyVec4} result the receiving vector
 * @param {ReadonlyVec4} U the first vector
 * @param {ReadonlyVec4} V the second vector
 * @param {ReadonlyVec4} W the third vector
 * @returns {vec4} result
 */

function cross$1(out, u, v, w) {
  var A = v[0] * w[1] - v[1] * w[0],
      B = v[0] * w[2] - v[2] * w[0],
      C = v[0] * w[3] - v[3] * w[0],
      D = v[1] * w[2] - v[2] * w[1],
      E = v[1] * w[3] - v[3] * w[1],
      F = v[2] * w[3] - v[3] * w[2];
  var G = u[0];
  var H = u[1];
  var I = u[2];
  var J = u[3];
  out[0] = H * F - I * E + J * D;
  out[1] = -(G * F) + I * C - J * B;
  out[2] = G * E - H * C + J * A;
  out[3] = -(G * D) + H * B - I * A;
  return out;
}
/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec4} out
 */

function lerp$3(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */

function random$2(out, scale) {
  scale = scale || 1.0; // Marsaglia, George. Choosing a Point from the Surface of a
  // Sphere. Ann. Math. Statist. 43 (1972), no. 2, 645--646.
  // http://projecteuclid.org/euclid.aoms/1177692644;

  var v1, v2, v3, v4;
  var s1, s2;

  do {
    v1 = RANDOM() * 2 - 1;
    v2 = RANDOM() * 2 - 1;
    s1 = v1 * v1 + v2 * v2;
  } while (s1 >= 1);

  do {
    v3 = RANDOM() * 2 - 1;
    v4 = RANDOM() * 2 - 1;
    s2 = v3 * v3 + v4 * v4;
  } while (s2 >= 1);

  var d = Math.sqrt((1 - s1) / s2);
  out[0] = scale * v1;
  out[1] = scale * v2;
  out[2] = scale * v3 * d;
  out[3] = scale * v4 * d;
  return out;
}
/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec4} out
 */

function transformMat4$1(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
  return out;
}
/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyQuat} q quaternion to transform with
 * @returns {vec4} out
 */

function transformQuat(out, a, q) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3]; // calculate quat * vec

  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z; // calculate result * inverse quat

  out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  out[3] = a[3];
  return out;
}
/**
 * Set the components of a vec4 to zero
 *
 * @param {vec4} out the receiving vector
 * @returns {vec4} out
 */

function zero$1(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec4} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str$3(a) {
  return "vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function exactEquals$3(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function equals$3(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}
/**
 * Alias for {@link vec4.subtract}
 * @function
 */

var sub$1 = subtract$1;
/**
 * Alias for {@link vec4.multiply}
 * @function
 */

var mul$3 = multiply$3;
/**
 * Alias for {@link vec4.divide}
 * @function
 */

var div$1 = divide$1;
/**
 * Alias for {@link vec4.distance}
 * @function
 */

var dist$1 = distance$1;
/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */

var sqrDist$1 = squaredDistance$1;
/**
 * Alias for {@link vec4.length}
 * @function
 */

var len$3 = length$3;
/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */

var sqrLen$3 = squaredLength$3;
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$1 = function () {
  var vec = create$3();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }

    return a;
  };
}();

var vec4 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$3,
ceil: ceil$1,
clone: clone$3,
copy: copy$3,
create: create$3,
cross: cross$1,
dist: dist$1,
distance: distance$1,
div: div$1,
divide: divide$1,
dot: dot$3,
equals: equals$3,
exactEquals: exactEquals$3,
floor: floor$1,
forEach: forEach$1,
fromValues: fromValues$3,
inverse: inverse$1,
len: len$3,
length: length$3,
lerp: lerp$3,
max: max$1,
min: min$1,
mul: mul$3,
multiply: multiply$3,
negate: negate$1,
normalize: normalize$3,
random: random$2,
round: round$1,
scale: scale$3,
scaleAndAdd: scaleAndAdd$1,
set: set$3,
sqrDist: sqrDist$1,
sqrLen: sqrLen$3,
squaredDistance: squaredDistance$1,
squaredLength: squaredLength$3,
str: str$3,
sub: sub$1,
subtract: subtract$1,
transformMat4: transformMat4$1,
transformQuat: transformQuat,
zero: zero$1
});

/**
 * Quaternion
 * @module quat
 */

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */

function create$2() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  out[3] = 1;
  return out;
}
/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */

function identity$1(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyVec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/

function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
/**
 * Gets the rotation axis and angle for a given
 *  quaternion. If a quaternion is created with
 *  setAxisAngle, this method will return the same
 *  values as providied in the original parameter list
 *  OR functionally equivalent values.
 * Example: The quaternion formed by axis [0, 0, 1] and
 *  angle -90 is the same as the quaternion formed by
 *  [0, 0, 1] and 270. This method favors the latter.
 * @param  {vec3} out_axis  Vector receiving the axis of rotation
 * @param  {ReadonlyQuat} q     Quaternion to be decomposed
 * @return {Number}     Angle, in radians, of the rotation
 */

function getAxisAngle(out_axis, q) {
  var rad = Math.acos(q[3]) * 2.0;
  var s = Math.sin(rad / 2.0);

  if (s > EPSILON) {
    out_axis[0] = q[0] / s;
    out_axis[1] = q[1] / s;
    out_axis[2] = q[2] / s;
  } else {
    // If s is zero, return any axis (no rotation - axis does not matter)
    out_axis[0] = 1;
    out_axis[1] = 0;
    out_axis[2] = 0;
  }

  return rad;
}
/**
 * Gets the angular distance between two unit quaternions
 *
 * @param  {ReadonlyQuat} a     Origin unit quaternion
 * @param  {ReadonlyQuat} b     Destination unit quaternion
 * @return {Number}     Angle, in radians, between the two quaternions
 */

function getAngle(a, b) {
  var dotproduct = dot$2(a, b);
  return Math.acos(2 * dotproduct * dotproduct - 1);
}
/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {quat} out
 */

function multiply$2(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateX$1(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateY$1(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var by = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateZ$1(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bz = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate W component of
 * @returns {quat} out
 */

function calculateW(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
  return out;
}
/**
 * Calculate the exponential of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @returns {quat} out
 */

function exp(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var et = Math.exp(w);
  var s = r > 0 ? et * Math.sin(r) / r : 0;
  out[0] = x * s;
  out[1] = y * s;
  out[2] = z * s;
  out[3] = et * Math.cos(r);
  return out;
}
/**
 * Calculate the natural logarithm of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @returns {quat} out
 */

function ln(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var t = r > 0 ? Math.atan2(r, w) / r : 0;
  out[0] = x * t;
  out[1] = y * t;
  out[2] = z * t;
  out[3] = 0.5 * Math.log(x * x + y * y + z * z + w * w);
  return out;
}
/**
 * Calculate the scalar power of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @param {Number} b amount to scale the quaternion by
 * @returns {quat} out
 */

function pow(out, a, b) {
  ln(out, a);
  scale$2(out, out, b);
  exp(out, out);
  return out;
}
/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

function slerp(out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  var omega, cosom, sinom, scale0, scale1; // calc cosine

  cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  } // calculate coefficients


  if (1.0 - cosom > EPSILON) {
    // standard case (slerp)
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  } // calculate final values


  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
/**
 * Generates a random unit quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */

function random$1(out) {
  // Implementation of http://planning.cs.uiuc.edu/node198.html
  // TODO: Calling random 3 times is probably not the fastest solution
  var u1 = RANDOM();
  var u2 = RANDOM();
  var u3 = RANDOM();
  var sqrt1MinusU1 = Math.sqrt(1 - u1);
  var sqrtU1 = Math.sqrt(u1);
  out[0] = sqrt1MinusU1 * Math.sin(2.0 * Math.PI * u2);
  out[1] = sqrt1MinusU1 * Math.cos(2.0 * Math.PI * u2);
  out[2] = sqrtU1 * Math.sin(2.0 * Math.PI * u3);
  out[3] = sqrtU1 * Math.cos(2.0 * Math.PI * u3);
  return out;
}
/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate inverse of
 * @returns {quat} out
 */

function invert$1(out, a) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot ? 1.0 / dot : 0; // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}
/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate conjugate of
 * @returns {quat} out
 */

function conjugate$1(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyMat3} m rotation matrix
 * @returns {quat} out
 * @function
 */

function fromMat3(out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w

    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)

    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }

  return out;
}
/**
 * Creates a quaternion from the given euler angle x, y, z.
 *
 * @param {quat} out the receiving quaternion
 * @param {x} Angle to rotate around X axis in degrees.
 * @param {y} Angle to rotate around Y axis in degrees.
 * @param {z} Angle to rotate around Z axis in degrees.
 * @returns {quat} out
 * @function
 */

function fromEuler(out, x, y, z) {
  var halfToRad = 0.5 * Math.PI / 180.0;
  x *= halfToRad;
  y *= halfToRad;
  z *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  out[0] = sx * cy * cz - cx * sy * sz;
  out[1] = cx * sy * cz + sx * cy * sz;
  out[2] = cx * cy * sz - sx * sy * cz;
  out[3] = cx * cy * cz + sx * sy * sz;
  return out;
}
/**
 * Returns a string representation of a quatenion
 *
 * @param {ReadonlyQuat} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str$2(a) {
  return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {ReadonlyQuat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */

var clone$2 = clone$3;
/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */

var fromValues$2 = fromValues$3;
/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the source quaternion
 * @returns {quat} out
 * @function
 */

var copy$2 = copy$3;
/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */

var set$2 = set$3;
/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {quat} out
 * @function
 */

var add$2 = add$3;
/**
 * Alias for {@link quat.multiply}
 * @function
 */

var mul$2 = multiply$2;
/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {ReadonlyQuat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */

var scale$2 = scale$3;
/**
 * Calculates the dot product of two quat's
 *
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */

var dot$2 = dot$3;
/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 * @function
 */

var lerp$2 = lerp$3;
/**
 * Calculates the length of a quat
 *
 * @param {ReadonlyQuat} a vector to calculate length of
 * @returns {Number} length of a
 */

var length$2 = length$3;
/**
 * Alias for {@link quat.length}
 * @function
 */

var len$2 = length$2;
/**
 * Calculates the squared length of a quat
 *
 * @param {ReadonlyQuat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */

var squaredLength$2 = squaredLength$3;
/**
 * Alias for {@link quat.squaredLength}
 * @function
 */

var sqrLen$2 = squaredLength$2;
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */

var normalize$2 = normalize$3;
/**
 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyQuat} a The first quaternion.
 * @param {ReadonlyQuat} b The second quaternion.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

var exactEquals$2 = exactEquals$3;
/**
 * Returns whether or not the quaternions have approximately the same elements in the same position.
 *
 * @param {ReadonlyQuat} a The first vector.
 * @param {ReadonlyQuat} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

var equals$2 = equals$3;
/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {ReadonlyVec3} a the initial vector
 * @param {ReadonlyVec3} b the destination vector
 * @returns {quat} out
 */

var rotationTo = function () {
  var tmpvec3 = create$4();
  var xUnitVec3 = fromValues$4(1, 0, 0);
  var yUnitVec3 = fromValues$4(0, 1, 0);
  return function (out, a, b) {
    var dot = dot$4(a, b);

    if (dot < -0.999999) {
      cross$2(tmpvec3, xUnitVec3, a);
      if (len$4(tmpvec3) < 0.000001) cross$2(tmpvec3, yUnitVec3, a);
      normalize$4(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross$2(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot;
      return normalize$2(out, out);
    }
  };
}();
/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {ReadonlyQuat} c the third operand
 * @param {ReadonlyQuat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

var sqlerp = function () {
  var temp1 = create$2();
  var temp2 = create$2();
  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {ReadonlyVec3} view  the vector representing the viewing direction
 * @param {ReadonlyVec3} right the vector representing the local "right" direction
 * @param {ReadonlyVec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */

var setAxes = function () {
  var matr = create$6();
  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize$2(out, fromMat3(out, matr));
  };
}();

var quat = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$2,
calculateW: calculateW,
clone: clone$2,
conjugate: conjugate$1,
copy: copy$2,
create: create$2,
dot: dot$2,
equals: equals$2,
exactEquals: exactEquals$2,
exp: exp,
fromEuler: fromEuler,
fromMat3: fromMat3,
fromValues: fromValues$2,
getAngle: getAngle,
getAxisAngle: getAxisAngle,
identity: identity$1,
invert: invert$1,
len: len$2,
length: length$2,
lerp: lerp$2,
ln: ln,
mul: mul$2,
multiply: multiply$2,
normalize: normalize$2,
pow: pow,
random: random$1,
rotateX: rotateX$1,
rotateY: rotateY$1,
rotateZ: rotateZ$1,
rotationTo: rotationTo,
scale: scale$2,
set: set$2,
setAxes: setAxes,
setAxisAngle: setAxisAngle,
slerp: slerp,
sqlerp: sqlerp,
sqrLen: sqrLen$2,
squaredLength: squaredLength$2,
str: str$2
});

/**
 * Dual Quaternion<br>
 * Format: [real, dual]<br>
 * Quaternion format: XYZW<br>
 * Make sure to have normalized dual quaternions, otherwise the functions may not work as intended.<br>
 * @module quat2
 */

/**
 * Creates a new identity dual quat
 *
 * @returns {quat2} a new dual quaternion [real -> rotation, dual -> translation]
 */

function create$1() {
  var dq = new ARRAY_TYPE(8);

  if (ARRAY_TYPE != Float32Array) {
    dq[0] = 0;
    dq[1] = 0;
    dq[2] = 0;
    dq[4] = 0;
    dq[5] = 0;
    dq[6] = 0;
    dq[7] = 0;
  }

  dq[3] = 1;
  return dq;
}
/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {ReadonlyQuat2} a dual quaternion to clone
 * @returns {quat2} new dual quaternion
 * @function
 */

function clone$1(a) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = a[0];
  dq[1] = a[1];
  dq[2] = a[2];
  dq[3] = a[3];
  dq[4] = a[4];
  dq[5] = a[5];
  dq[6] = a[6];
  dq[7] = a[7];
  return dq;
}
/**
 * Creates a new dual quat initialized with the given values
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} new dual quaternion
 * @function
 */

function fromValues$1(x1, y1, z1, w1, x2, y2, z2, w2) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  dq[4] = x2;
  dq[5] = y2;
  dq[6] = z2;
  dq[7] = w2;
  return dq;
}
/**
 * Creates a new dual quat from the given values (quat and translation)
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component (translation)
 * @param {Number} y2 Y component (translation)
 * @param {Number} z2 Z component (translation)
 * @returns {quat2} new dual quaternion
 * @function
 */

function fromRotationTranslationValues(x1, y1, z1, w1, x2, y2, z2) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  var ax = x2 * 0.5,
      ay = y2 * 0.5,
      az = z2 * 0.5;
  dq[4] = ax * w1 + ay * z1 - az * y1;
  dq[5] = ay * w1 + az * x1 - ax * z1;
  dq[6] = az * w1 + ax * y1 - ay * x1;
  dq[7] = -ax * x1 - ay * y1 - az * z1;
  return dq;
}
/**
 * Creates a dual quat from a quaternion and a translation
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyQuat} q a normalized quaternion
 * @param {ReadonlyVec3} t tranlation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */

function fromRotationTranslation(out, q, t) {
  var ax = t[0] * 0.5,
      ay = t[1] * 0.5,
      az = t[2] * 0.5,
      bx = q[0],
      by = q[1],
      bz = q[2],
      bw = q[3];
  out[0] = bx;
  out[1] = by;
  out[2] = bz;
  out[3] = bw;
  out[4] = ax * bw + ay * bz - az * by;
  out[5] = ay * bw + az * bx - ax * bz;
  out[6] = az * bw + ax * by - ay * bx;
  out[7] = -ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Creates a dual quat from a translation
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyVec3} t translation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */

function fromTranslation(out, t) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = t[0] * 0.5;
  out[5] = t[1] * 0.5;
  out[6] = t[2] * 0.5;
  out[7] = 0;
  return out;
}
/**
 * Creates a dual quat from a quaternion
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyQuat} q the quaternion
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */

function fromRotation(out, q) {
  out[0] = q[0];
  out[1] = q[1];
  out[2] = q[2];
  out[3] = q[3];
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
/**
 * Creates a new dual quat from a matrix (4x4)
 *
 * @param {quat2} out the dual quaternion
 * @param {ReadonlyMat4} a the matrix
 * @returns {quat2} dual quat receiving operation result
 * @function
 */

function fromMat4(out, a) {
  //TODO Optimize this
  var outer = create$2();
  getRotation(outer, a);
  var t = new ARRAY_TYPE(3);
  getTranslation$1(t, a);
  fromRotationTranslation(out, outer, t);
  return out;
}
/**
 * Copy the values from one dual quat to another
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the source dual quaternion
 * @returns {quat2} out
 * @function
 */

function copy$1(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  return out;
}
/**
 * Set a dual quat to the identity dual quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @returns {quat2} out
 */

function identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
/**
 * Set the components of a dual quat to the given values
 *
 * @param {quat2} out the receiving quaternion
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} out
 * @function
 */

function set$1(out, x1, y1, z1, w1, x2, y2, z2, w2) {
  out[0] = x1;
  out[1] = y1;
  out[2] = z1;
  out[3] = w1;
  out[4] = x2;
  out[5] = y2;
  out[6] = z2;
  out[7] = w2;
  return out;
}
/**
 * Gets the real part of a dual quat
 * @param  {quat} out real part
 * @param  {ReadonlyQuat2} a Dual Quaternion
 * @return {quat} real part
 */

var getReal = copy$2;
/**
 * Gets the dual part of a dual quat
 * @param  {quat} out dual part
 * @param  {ReadonlyQuat2} a Dual Quaternion
 * @return {quat} dual part
 */

function getDual(out, a) {
  out[0] = a[4];
  out[1] = a[5];
  out[2] = a[6];
  out[3] = a[7];
  return out;
}
/**
 * Set the real component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat} q a quaternion representing the real part
 * @returns {quat2} out
 * @function
 */

var setReal = copy$2;
/**
 * Set the dual component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat} q a quaternion representing the dual part
 * @returns {quat2} out
 * @function
 */

function setDual(out, q) {
  out[4] = q[0];
  out[5] = q[1];
  out[6] = q[2];
  out[7] = q[3];
  return out;
}
/**
 * Gets the translation of a normalized dual quat
 * @param  {vec3} out translation
 * @param  {ReadonlyQuat2} a Dual Quaternion to be decomposed
 * @return {vec3} translation
 */

function getTranslation(out, a) {
  var ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3];
  out[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
  out[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
  out[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  return out;
}
/**
 * Translates a dual quat by the given vector
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {quat2} out
 */

function translate(out, a, v) {
  var ax1 = a[0],
      ay1 = a[1],
      az1 = a[2],
      aw1 = a[3],
      bx1 = v[0] * 0.5,
      by1 = v[1] * 0.5,
      bz1 = v[2] * 0.5,
      ax2 = a[4],
      ay2 = a[5],
      az2 = a[6],
      aw2 = a[7];
  out[0] = ax1;
  out[1] = ay1;
  out[2] = az1;
  out[3] = aw1;
  out[4] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
  out[5] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
  out[6] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
  out[7] = -ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;
  return out;
}
/**
 * Rotates a dual quat around the X axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */

function rotateX(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateX$1(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat around the Y axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */

function rotateY(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateY$1(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat around the Z axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */

function rotateZ(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateZ$1(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat by a given quaternion (a * q)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {ReadonlyQuat} q quaternion to rotate by
 * @returns {quat2} out
 */

function rotateByQuatAppend(out, a, q) {
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  out[0] = ax * qw + aw * qx + ay * qz - az * qy;
  out[1] = ay * qw + aw * qy + az * qx - ax * qz;
  out[2] = az * qw + aw * qz + ax * qy - ay * qx;
  out[3] = aw * qw - ax * qx - ay * qy - az * qz;
  ax = a[4];
  ay = a[5];
  az = a[6];
  aw = a[7];
  out[4] = ax * qw + aw * qx + ay * qz - az * qy;
  out[5] = ay * qw + aw * qy + az * qx - ax * qz;
  out[6] = az * qw + aw * qz + ax * qy - ay * qx;
  out[7] = aw * qw - ax * qx - ay * qy - az * qz;
  return out;
}
/**
 * Rotates a dual quat by a given quaternion (q * a)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat} q quaternion to rotate by
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @returns {quat2} out
 */

function rotateByQuatPrepend(out, q, a) {
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      bx = a[0],
      by = a[1],
      bz = a[2],
      bw = a[3];
  out[0] = qx * bw + qw * bx + qy * bz - qz * by;
  out[1] = qy * bw + qw * by + qz * bx - qx * bz;
  out[2] = qz * bw + qw * bz + qx * by - qy * bx;
  out[3] = qw * bw - qx * bx - qy * by - qz * bz;
  bx = a[4];
  by = a[5];
  bz = a[6];
  bw = a[7];
  out[4] = qx * bw + qw * bx + qy * bz - qz * by;
  out[5] = qy * bw + qw * by + qz * bx - qx * bz;
  out[6] = qz * bw + qw * bz + qx * by - qy * bx;
  out[7] = qw * bw - qx * bx - qy * by - qz * bz;
  return out;
}
/**
 * Rotates a dual quat around a given axis. Does the normalisation automatically
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @param {Number} rad how far the rotation should be
 * @returns {quat2} out
 */

function rotateAroundAxis(out, a, axis, rad) {
  //Special case for rad = 0
  if (Math.abs(rad) < EPSILON) {
    return copy$1(out, a);
  }

  var axisLength = Math.hypot(axis[0], axis[1], axis[2]);
  rad = rad * 0.5;
  var s = Math.sin(rad);
  var bx = s * axis[0] / axisLength;
  var by = s * axis[1] / axisLength;
  var bz = s * axis[2] / axisLength;
  var bw = Math.cos(rad);
  var ax1 = a[0],
      ay1 = a[1],
      az1 = a[2],
      aw1 = a[3];
  out[0] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[1] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[2] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[3] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  var ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7];
  out[4] = ax * bw + aw * bx + ay * bz - az * by;
  out[5] = ay * bw + aw * by + az * bx - ax * bz;
  out[6] = az * bw + aw * bz + ax * by - ay * bx;
  out[7] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Adds two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {quat2} out
 * @function
 */

function add$1(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  return out;
}
/**
 * Multiplies two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {quat2} out
 */

function multiply$1(out, a, b) {
  var ax0 = a[0],
      ay0 = a[1],
      az0 = a[2],
      aw0 = a[3],
      bx1 = b[4],
      by1 = b[5],
      bz1 = b[6],
      bw1 = b[7],
      ax1 = a[4],
      ay1 = a[5],
      az1 = a[6],
      aw1 = a[7],
      bx0 = b[0],
      by0 = b[1],
      bz0 = b[2],
      bw0 = b[3];
  out[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
  out[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
  out[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
  out[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
  out[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
  out[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
  out[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
  out[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
  return out;
}
/**
 * Alias for {@link quat2.multiply}
 * @function
 */

var mul$1 = multiply$1;
/**
 * Scales a dual quat by a scalar number
 *
 * @param {quat2} out the receiving dual quat
 * @param {ReadonlyQuat2} a the dual quat to scale
 * @param {Number} b amount to scale the dual quat by
 * @returns {quat2} out
 * @function
 */

function scale$1(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  return out;
}
/**
 * Calculates the dot product of two dual quat's (The dot product of the real parts)
 *
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */

var dot$1 = dot$2;
/**
 * Performs a linear interpolation between two dual quats's
 * NOTE: The resulting dual quaternions won't always be normalized (The error is most noticeable when t = 0.5)
 *
 * @param {quat2} out the receiving dual quat
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat2} out
 */

function lerp$1(out, a, b, t) {
  var mt = 1 - t;
  if (dot$1(a, b) < 0) t = -t;
  out[0] = a[0] * mt + b[0] * t;
  out[1] = a[1] * mt + b[1] * t;
  out[2] = a[2] * mt + b[2] * t;
  out[3] = a[3] * mt + b[3] * t;
  out[4] = a[4] * mt + b[4] * t;
  out[5] = a[5] * mt + b[5] * t;
  out[6] = a[6] * mt + b[6] * t;
  out[7] = a[7] * mt + b[7] * t;
  return out;
}
/**
 * Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a dual quat to calculate inverse of
 * @returns {quat2} out
 */

function invert(out, a) {
  var sqlen = squaredLength$1(a);
  out[0] = -a[0] / sqlen;
  out[1] = -a[1] / sqlen;
  out[2] = -a[2] / sqlen;
  out[3] = a[3] / sqlen;
  out[4] = -a[4] / sqlen;
  out[5] = -a[5] / sqlen;
  out[6] = -a[6] / sqlen;
  out[7] = a[7] / sqlen;
  return out;
}
/**
 * Calculates the conjugate of a dual quat
 * If the dual quaternion is normalized, this function is faster than quat2.inverse and produces the same result.
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat2} a quat to calculate conjugate of
 * @returns {quat2} out
 */

function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  out[4] = -a[4];
  out[5] = -a[5];
  out[6] = -a[6];
  out[7] = a[7];
  return out;
}
/**
 * Calculates the length of a dual quat
 *
 * @param {ReadonlyQuat2} a dual quat to calculate length of
 * @returns {Number} length of a
 * @function
 */

var length$1 = length$2;
/**
 * Alias for {@link quat2.length}
 * @function
 */

var len$1 = length$1;
/**
 * Calculates the squared length of a dual quat
 *
 * @param {ReadonlyQuat2} a dual quat to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */

var squaredLength$1 = squaredLength$2;
/**
 * Alias for {@link quat2.squaredLength}
 * @function
 */

var sqrLen$1 = squaredLength$1;
/**
 * Normalize a dual quat
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a dual quaternion to normalize
 * @returns {quat2} out
 * @function
 */

function normalize$1(out, a) {
  var magnitude = squaredLength$1(a);

  if (magnitude > 0) {
    magnitude = Math.sqrt(magnitude);
    var a0 = a[0] / magnitude;
    var a1 = a[1] / magnitude;
    var a2 = a[2] / magnitude;
    var a3 = a[3] / magnitude;
    var b0 = a[4];
    var b1 = a[5];
    var b2 = a[6];
    var b3 = a[7];
    var a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = (b0 - a0 * a_dot_b) / magnitude;
    out[5] = (b1 - a1 * a_dot_b) / magnitude;
    out[6] = (b2 - a2 * a_dot_b) / magnitude;
    out[7] = (b3 - a3 * a_dot_b) / magnitude;
  }

  return out;
}
/**
 * Returns a string representation of a dual quatenion
 *
 * @param {ReadonlyQuat2} a dual quaternion to represent as a string
 * @returns {String} string representation of the dual quat
 */

function str$1(a) {
  return "quat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ")";
}
/**
 * Returns whether or not the dual quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyQuat2} a the first dual quaternion.
 * @param {ReadonlyQuat2} b the second dual quaternion.
 * @returns {Boolean} true if the dual quaternions are equal, false otherwise.
 */

function exactEquals$1(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7];
}
/**
 * Returns whether or not the dual quaternions have approximately the same elements in the same position.
 *
 * @param {ReadonlyQuat2} a the first dual quat.
 * @param {ReadonlyQuat2} b the second dual quat.
 * @returns {Boolean} true if the dual quats are equal, false otherwise.
 */

function equals$1(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7));
}

var quat2 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add$1,
clone: clone$1,
conjugate: conjugate,
copy: copy$1,
create: create$1,
dot: dot$1,
equals: equals$1,
exactEquals: exactEquals$1,
fromMat4: fromMat4,
fromRotation: fromRotation,
fromRotationTranslation: fromRotationTranslation,
fromRotationTranslationValues: fromRotationTranslationValues,
fromTranslation: fromTranslation,
fromValues: fromValues$1,
getDual: getDual,
getReal: getReal,
getTranslation: getTranslation,
identity: identity,
invert: invert,
len: len$1,
length: length$1,
lerp: lerp$1,
mul: mul$1,
multiply: multiply$1,
normalize: normalize$1,
rotateAroundAxis: rotateAroundAxis,
rotateByQuatAppend: rotateByQuatAppend,
rotateByQuatPrepend: rotateByQuatPrepend,
rotateX: rotateX,
rotateY: rotateY,
rotateZ: rotateZ,
scale: scale$1,
set: set$1,
setDual: setDual,
setReal: setReal,
sqrLen: sqrLen$1,
squaredLength: squaredLength$1,
str: str$1,
translate: translate
});

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */

function create() {
  var out = new ARRAY_TYPE(2);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }

  return out;
}
/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {ReadonlyVec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */

function clone(a) {
  var out = new ARRAY_TYPE(2);
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */

function fromValues(x, y) {
  var out = new ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the source vector
 * @returns {vec2} out
 */

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */

function set(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}
/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}
/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}
/**
 * Math.ceil the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to ceil
 * @returns {vec2} out
 */

function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  return out;
}
/**
 * Math.floor the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to floor
 * @returns {vec2} out
 */

function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  return out;
}
/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out;
}
/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out;
}
/**
 * Math.round the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to round
 * @returns {vec2} out
 */

function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  return out;
}
/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */

function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}
/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */

function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} distance between a and b
 */

function distance(a, b) {
  var x = b[0] - a[0],
      y = b[1] - a[1];
  return Math.hypot(x, y);
}
/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} squared distance between a and b
 */

function squaredDistance(a, b) {
  var x = b[0] - a[0],
      y = b[1] - a[1];
  return x * x + y * y;
}
/**
 * Calculates the length of a vec2
 *
 * @param {ReadonlyVec2} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0],
      y = a[1];
  return Math.hypot(x, y);
}
/**
 * Calculates the squared length of a vec2
 *
 * @param {ReadonlyVec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength(a) {
  var x = a[0],
      y = a[1];
  return x * x + y * y;
}
/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to negate
 * @returns {vec2} out
 */

function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to invert
 * @returns {vec2} out
 */

function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
}
/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to normalize
 * @returns {vec2} out
 */

function normalize(out, a) {
  var x = a[0],
      y = a[1];
  var len = x * x + y * y;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  return out;
}
/**
 * Calculates the dot product of two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec3} out
 */

function cross(out, a, b) {
  var z = a[0] * b[1] - a[1] * b[0];
  out[0] = out[1] = 0;
  out[2] = z;
  return out;
}
/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec2} out
 */

function lerp(out, a, b, t) {
  var ax = a[0],
      ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */

function random(out, scale) {
  scale = scale || 1.0;
  var r = RANDOM() * 2.0 * Math.PI;
  out[0] = Math.cos(r) * scale;
  out[1] = Math.sin(r) * scale;
  return out;
}
/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat2(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  return out;
}
/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2d} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat2d(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y + m[4];
  out[1] = m[1] * x + m[3] * y + m[5];
  return out;
}
/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat3} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat3(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}
/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat4(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}
/**
 * Rotate a 2D vector
 * @param {vec2} out The receiving vec2
 * @param {ReadonlyVec2} a The vec2 point to rotate
 * @param {ReadonlyVec2} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec2} out
 */

function rotate(out, a, b, rad) {
  //Translate point to the origin
  var p0 = a[0] - b[0],
      p1 = a[1] - b[1],
      sinC = Math.sin(rad),
      cosC = Math.cos(rad); //perform rotation and translate to correct position

  out[0] = p0 * cosC - p1 * sinC + b[0];
  out[1] = p0 * sinC + p1 * cosC + b[1];
  return out;
}
/**
 * Get the angle between two 2D vectors
 * @param {ReadonlyVec2} a The first operand
 * @param {ReadonlyVec2} b The second operand
 * @returns {Number} The angle in radians
 */

function angle(a, b) {
  var x1 = a[0],
      y1 = a[1],
      x2 = b[0],
      y2 = b[1],
      // mag is the product of the magnitudes of a and b
  mag = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2),
      // mag &&.. short circuits if mag == 0
  cosine = mag && (x1 * x2 + y1 * y2) / mag; // Math.min(Math.max(cosine, -1), 1) clamps the cosine between -1 and 1

  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
/**
 * Set the components of a vec2 to zero
 *
 * @param {vec2} out the receiving vector
 * @returns {vec2} out
 */

function zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec2} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str(a) {
  return "vec2(" + a[0] + ", " + a[1] + ")";
}
/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec2} a The first vector.
 * @param {ReadonlyVec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec2} a The first vector.
 * @param {ReadonlyVec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function equals(a, b) {
  var a0 = a[0],
      a1 = a[1];
  var b0 = b[0],
      b1 = b[1];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1));
}
/**
 * Alias for {@link vec2.length}
 * @function
 */

var len = length;
/**
 * Alias for {@link vec2.subtract}
 * @function
 */

var sub = subtract;
/**
 * Alias for {@link vec2.multiply}
 * @function
 */

var mul = multiply;
/**
 * Alias for {@link vec2.divide}
 * @function
 */

var div = divide;
/**
 * Alias for {@link vec2.distance}
 * @function
 */

var dist = distance;
/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */

var sqrDist = squaredDistance;
/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */

var sqrLen = squaredLength;
/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }

    return a;
  };
}();

var vec2 = /*#__PURE__*/Object.freeze({
__proto__: null,
add: add,
angle: angle,
ceil: ceil,
clone: clone,
copy: copy,
create: create,
cross: cross,
dist: dist,
distance: distance,
div: div,
divide: divide,
dot: dot,
equals: equals,
exactEquals: exactEquals,
floor: floor,
forEach: forEach,
fromValues: fromValues,
inverse: inverse,
len: len,
length: length,
lerp: lerp,
max: max,
min: min,
mul: mul,
multiply: multiply,
negate: negate,
normalize: normalize,
random: random,
rotate: rotate,
round: round,
scale: scale,
scaleAndAdd: scaleAndAdd,
set: set,
sqrDist: sqrDist,
sqrLen: sqrLen,
squaredDistance: squaredDistance,
squaredLength: squaredLength,
str: str,
sub: sub,
subtract: subtract,
transformMat2: transformMat2,
transformMat2d: transformMat2d,
transformMat3: transformMat3,
transformMat4: transformMat4,
zero: zero
});

var esm = /*#__PURE__*/Object.freeze({
__proto__: null,
glMatrix: common,
mat2: mat2,
mat2d: mat2d,
mat3: mat3,
mat4: mat4,
quat: quat,
quat2: quat2,
vec2: vec2,
vec3: vec3,
vec4: vec4
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(esm);

var helper = {};

var hasRequiredHelper;

function requireHelper () {
	if (hasRequiredHelper) return helper;
	hasRequiredHelper = 1;
	Object.defineProperty(helper, "__esModule", { value: true });
	helper.FaceModeSelectOption = helper.FaceModeColorOption = helper.CenterModeOption = helper.colorSelectOptions = helper.EditingMode = helper.Actions = helper.WorkAction = void 0;
	helper.generateCuboid = generateCuboid;
	helper.boundary = boundary;
	helper.surfaceScale = surfaceScale;
	helper.hex2rgb = hex2rgb;
	helper.absMod = absMod;
	helper.traverseVoxels = traverseVoxels;
	helper.inRange = inRange;
	helper.adjacentVoxels = adjacentVoxels;
	helper.drawVoxelSphere = drawVoxelSphere;
	helper.drawVoxelCircle = drawVoxelCircle;
	helper.drawVoxelSquare = drawVoxelSquare;
	helper.calcRadius = calcRadius;
	helper.calcHalfEdgeLen = calcHalfEdgeLen;
	helper.drawVoxelLine = drawVoxelLine;
	helper.cloneArray = cloneArray;
	helper.newBundle = newBundle;
	helper.fillSpace = fillSpace;
	helper.allocEmptyVoxels = allocEmptyVoxels;
	helper.getElementPos = getElementPos;
	helper.mergeVoxel = mergeVoxel;
	helper.surfaceByNormalAndPoint = surfaceByNormalAndPoint;
	const voxel_1 = requireVoxel();
	const gl_matrix_1 = require$$0;
	var WorkAction;
	(function (WorkAction) {
	    WorkAction[WorkAction["bakeAoData"] = 0] = "bakeAoData";
	    WorkAction[WorkAction["syncVoxel"] = 1] = "syncVoxel";
	    WorkAction[WorkAction["updateVoxel"] = 2] = "updateVoxel";
	    WorkAction[WorkAction["sendPoints"] = 3] = "sendPoints";
	    WorkAction[WorkAction["clearData"] = 4] = "clearData";
	    WorkAction[WorkAction["changeSize"] = 5] = "changeSize";
	})(WorkAction || (helper.WorkAction = WorkAction = {}));
	var Actions;
	(function (Actions) {
	    Actions[Actions["Attach"] = 0] = "Attach";
	    Actions[Actions["Erase"] = 1] = "Erase";
	    Actions[Actions["Paint"] = 2] = "Paint";
	    Actions[Actions["Select"] = 3] = "Select";
	    Actions[Actions["Translate"] = 4] = "Translate";
	    Actions[Actions["ColorSelect"] = 5] = "ColorSelect";
	    Actions[Actions["PickColor"] = 6] = "PickColor";
	    Actions[Actions["HollowOut"] = 7] = "HollowOut";
	    Actions[Actions["FillSameColorSpace"] = 8] = "FillSameColorSpace";
	    Actions[Actions["Extrude"] = 9] = "Extrude";
	})(Actions || (helper.Actions = Actions = {}));
	var EditingMode;
	(function (EditingMode) {
	    EditingMode[EditingMode["line"] = 0] = "line";
	    EditingMode[EditingMode["center"] = 1] = "center";
	    EditingMode[EditingMode["box"] = 2] = "box";
	    EditingMode[EditingMode["voxel"] = 3] = "voxel";
	    EditingMode[EditingMode["face"] = 4] = "face";
	    EditingMode[EditingMode["rect"] = 5] = "rect";
	})(EditingMode || (helper.EditingMode = EditingMode = {}));
	var colorSelectOptions;
	(function (colorSelectOptions) {
	    colorSelectOptions[colorSelectOptions["volume"] = 0] = "volume";
	    colorSelectOptions[colorSelectOptions["face"] = 1] = "face";
	    colorSelectOptions[colorSelectOptions["all"] = 2] = "all";
	})(colorSelectOptions || (helper.colorSelectOptions = colorSelectOptions = {}));
	var CenterModeOption;
	(function (CenterModeOption) {
	    CenterModeOption[CenterModeOption["square"] = 0] = "square";
	    CenterModeOption[CenterModeOption["circle"] = 1] = "circle";
	})(CenterModeOption || (helper.CenterModeOption = CenterModeOption = {}));
	var FaceModeColorOption;
	(function (FaceModeColorOption) {
	    FaceModeColorOption[FaceModeColorOption["voxelColor"] = 0] = "voxelColor";
	    FaceModeColorOption[FaceModeColorOption["currentColor"] = 1] = "currentColor";
	})(FaceModeColorOption || (helper.FaceModeColorOption = FaceModeColorOption = {}));
	var FaceModeSelectOption;
	(function (FaceModeSelectOption) {
	    FaceModeSelectOption[FaceModeSelectOption["geometry"] = 0] = "geometry";
	    FaceModeSelectOption[FaceModeSelectOption["colorGeometry"] = 1] = "colorGeometry";
	})(FaceModeSelectOption || (helper.FaceModeSelectOption = FaceModeSelectOption = {}));
	function generateCuboid(a, b, isVoxle, outerNormal, range) {
	    const { start, end } = boundary(a, b, [-Infinity, -Infinity, -Infinity], [Infinity, Infinity, Infinity]);
	    const positions = [];
	    const elements = [];
	    const normals = [];
	    const nSign = outerNormal ? -1 : 1;
	    if (isVoxle) {
	        for (let i = 0; i < 3; i++) {
	            if (range) {
	                end[i] = Math.min(end[i] + 1, range[i]);
	            }
	            else {
	                end[i] = end[i] + 1;
	            }
	        }
	    }
	    positions.push([start[0], start[1], start[2]]);
	    positions.push([start[0], start[1], end[2]]);
	    positions.push([end[0], start[1], end[2]]);
	    positions.push([end[0], start[1], start[2]]);
	    positions.push([start[0], end[1], start[2]]);
	    positions.push([end[0], end[1], start[2]]);
	    positions.push([end[0], end[1], end[2]]);
	    positions.push([start[0], end[1], end[2]]);
	    positions.push([end[0], start[1], start[2]]);
	    positions.push([end[0], start[1], end[2]]);
	    positions.push([end[0], end[1], end[2]]);
	    positions.push([end[0], end[1], start[2]]);
	    positions.push([start[0], start[1], start[2]]);
	    positions.push([start[0], end[1], start[2]]);
	    positions.push([start[0], end[1], end[2]]);
	    positions.push([start[0], start[1], end[2]]);
	    positions.push([start[0], start[1], start[2]]);
	    positions.push([end[0], start[1], start[2]]);
	    positions.push([end[0], end[1], start[2]]);
	    positions.push([start[0], end[1], start[2]]);
	    positions.push([start[0], start[1], end[2]]);
	    positions.push([start[0], end[1], end[2]]);
	    positions.push([end[0], end[1], end[2]]);
	    positions.push([end[0], start[1], end[2]]);
	    for (let i = 0; i < 4; i++) {
	        normals.push([0, 1 * nSign, 0]);
	    }
	    for (let i = 0; i < 4; i++) {
	        normals.push([0, -1 * nSign, 0]);
	    }
	    for (let i = 0; i < 4; i++) {
	        normals.push([-1 * nSign, 0, 0]);
	    }
	    for (let i = 0; i < 4; i++) {
	        normals.push([1 * nSign, 0, 0]);
	    }
	    for (let i = 0; i < 4; i++) {
	        normals.push([0, 0, 1 * nSign]);
	    }
	    for (let i = 0; i < 4; i++) {
	        normals.push([0, 0, -1 * nSign]);
	    }
	    const surfaceIndex = [0, 4, 8, 12, 16, 20];
	    for (let i = 0; i < surfaceIndex.length; i++) {
	        if (nSign == -1) {
	            elements.push([
	                surfaceIndex[i] + 2,
	                surfaceIndex[i] + 1,
	                surfaceIndex[i],
	            ]);
	            elements.push([
	                surfaceIndex[i],
	                surfaceIndex[i] + 3,
	                surfaceIndex[i] + 2,
	            ]);
	        }
	        else {
	            elements.push([
	                surfaceIndex[i],
	                surfaceIndex[i] + 1,
	                surfaceIndex[i] + 2,
	            ]);
	            elements.push([
	                surfaceIndex[i] + 2,
	                surfaceIndex[i] + 3,
	                surfaceIndex[i],
	            ]);
	        }
	    }
	    return {
	        lo: [start[0], start[1], start[2]],
	        hi: [end[0], end[1], end[2]],
	        positions,
	        elements,
	        normals,
	    };
	}
	function boundary(a, b, minima, maxima) {
	    const start = gl_matrix_1.vec3.create();
	    const end = gl_matrix_1.vec3.create();
	    gl_matrix_1.vec3.max(start, gl_matrix_1.vec3.min(start, a, b), minima);
	    gl_matrix_1.vec3.min(end, gl_matrix_1.vec3.max(end, a, b), maxima);
	    return {
	        start,
	        end,
	    };
	}
	function surfaceScale(normal, surface, scale) {
	    const min = Math.min;
	    const offset = [surface[0][0], surface[0][1], surface[0][2]];
	    for (let i = 1; i < surface.length; i++) {
	        offset[0] = min(offset[0], surface[i][0]);
	        offset[1] = min(offset[1], surface[i][1]);
	        offset[2] = min(offset[2], surface[i][2]);
	    }
	    const out = [];
	    for (let i = 0; i < surface.length; i++) {
	        const pos = [0, 0, 0];
	        if (normal[0] == 0) {
	            pos[0] = (surface[i][0] - offset[0]) * scale - scale / 2;
	        }
	        else if (normal[0] != 0) {
	            pos[0] = surface[0][0];
	        }
	        if (normal[1] == 0) {
	            pos[1] = (surface[i][1] - offset[1]) * scale - scale / 2;
	        }
	        else if (normal[1] != 0) {
	            pos[1] = surface[0][1];
	        }
	        if (normal[2] == 0) {
	            pos[2] = (surface[i][2] - offset[2]) * scale - scale / 2;
	        }
	        else if (normal[2] != 0) {
	            pos[2] = surface[0][2];
	        }
	        out.push(pos);
	    }
	    return out;
	}
	function hex2rgb(hex) {
	    if (hex[0] == '#') {
	        hex = hex.substr(1);
	    }
	    return [
	        parseInt(hex.substr(0, 2), 16),
	        parseInt(hex.substr(2, 2), 16),
	        parseInt(hex.substr(4, 2), 16),
	    ];
	}
	function absMod(n, mod) {
	    if (n < 0) {
	        n = Math.ceil(Math.abs(n / mod)) * mod + n;
	    }
	    else {
	        n %= mod;
	    }
	    return n;
	}
	function traverseVoxels(voxel, start, end, operation) {
	    const { data, stride: [sx, sy, sz], offset, } = voxel;
	    const l = end[0] - start[0] + 1;
	    const h = end[1] - start[1] + 1;
	    const stepi = sx;
	    const stepj = sy - sx * l;
	    const stepk = sz - sy * h;
	    let ptr = sx * start[0] + sy * start[1] + sz * start[2] + offset;
	    for (let k = start[2]; k <= end[2]; ++k) {
	        for (let j = start[1]; j <= end[1]; ++j) {
	            for (let i = start[0]; i <= end[0]; ++i) {
	                operation(i, j, k, data[ptr], ptr);
	                ptr += stepi;
	            }
	            ptr += stepj;
	        }
	        ptr += stepk;
	    }
	}
	function inRange(position, minimum, maximum) {
	    const [x, y, z] = position;
	    const [minX, minY, minZ] = minimum;
	    const [maxX, maxY, maxZ] = maximum;
	    return (x >= minX && y >= minY && z >= minZ && x <= maxX && y <= maxY && z <= maxZ);
	}
	function adjacentVoxels(src, out, currentPos, value, currentMaterial, axis, start, end, normal) {
	    const queue = [];
	    queue.push(currentPos);
	    const maximum = [src.shape[0] - 1, src.shape[1] - 1, src.shape[2] - 1];
	    while (queue.length) {
	        const [x, y, z] = queue.pop();
	        if (!inRange([x, y, z], [0, 0, 0], maximum)) {
	            continue;
	        }
	        if (normal &&
	            inRange([x + normal[0], y + normal[1], z + normal[2]], [0, 0, 0], maximum)) {
	            if (src.getVoxel(x + normal[0], y + normal[1], z + normal[2]) !== 0) {
	                continue;
	            }
	        }
	        if (value === -1) {
	            const index = out.index(x, y, z);
	            if (out.data[index] != 0) {
	                continue;
	            }
	            if (src.data[index] !== 0) {
	                out.data[index] = src.data[index];
	            }
	            else {
	                continue;
	            }
	        }
	        else if (value === 0) {
	            if (out.getVoxel(x, y, z) === currentMaterial) {
	                continue;
	            }
	            if (src.getVoxel(x, y, z) === 0) {
	                out.setVoxel(x, y, z, currentMaterial);
	                src.setVoxel(x, y, z, currentMaterial);
	            }
	            else {
	                continue;
	            }
	        }
	        else {
	            if (out.getVoxel(x, y, z) === value) {
	                continue;
	            }
	            if (src.getVoxel(x, y, z) === value) {
	                out.setVoxel(x, y, z, value);
	            }
	            else {
	                continue;
	            }
	        }
	        gl_matrix_1.vec3.min(start, start, [x, y, z]);
	        gl_matrix_1.vec3.max(end, end, [x, y, z]);
	        if (axis[0] != 0) {
	            queue.push([x + 1, y, z]);
	            queue.push([x - 1, y, z]);
	        }
	        if (axis[1] != 0) {
	            queue.push([x, y + 1, z]);
	            queue.push([x, y - 1, z]);
	        }
	        if (axis[2] != 0) {
	            queue.push([x, y, z + 1]);
	            queue.push([x, y, z - 1]);
	        }
	    }
	}
	function drawVoxelSphere(voxels, center, radius) {
	    for (let i = 0; i < radius; i++) {
	        for (let j = 0; j < radius; j++) {
	            for (let k = 0; k < radius; k++) {
	                if (i * i + j * j + k * k < radius * radius) {
	                    voxels.setVoxel(center[0] + i, center[1] + j, center[2] + k, 1);
	                    voxels.setVoxel(center[0] - i, center[1] + j, center[2] + k, 1);
	                    voxels.setVoxel(center[0] + i, center[1] - j, center[2] + k, 1);
	                    voxels.setVoxel(center[0] + i, center[1] + j, center[2] - k, 1);
	                    voxels.setVoxel(center[0] - i, center[1] - j, center[2] + k, 1);
	                    voxels.setVoxel(center[0] - i, center[1] - j, center[2] - k, 1);
	                    voxels.setVoxel(center[0] + i, center[1] - j, center[2] - k, 1);
	                    voxels.setVoxel(center[0] - i, center[1] + j, center[2] - k, 1);
	                }
	            }
	        }
	    }
	}
	function drawVoxelCircle(voxels, color, center, radius, N_axis, visitor) {
	    let a = 0;
	    let b = radius;
	    let p = 5 / 4 - radius;
	    if (typeof N_axis !== 'string') {
	        if (N_axis[0] != 0) {
	            N_axis = 'x';
	        }
	        else if (N_axis[1] != 0) {
	            N_axis = 'y';
	        }
	        else if (N_axis[2] != 0) {
	            N_axis = 'z';
	        }
	    }
	    while (a <= b) {
	        if (p < 0) {
	            p = p + 2 * a + 3;
	            a++;
	        }
	        else {
	            p = p + 2 * (a - b) + 5;
	            b--;
	            a++;
	        }
	        if (N_axis === 'z') {
	            for (let i = center[0] - a; i <= center[0] + a; i++) {
	                visitor(i, center[1] + b, center[2]);
	                visitor(i, center[1] - b, center[2]);
	            }
	            for (let i = center[0] - b; i <= center[0] + b; i++) {
	                visitor(i, center[1] + a, center[2]);
	                visitor(i, center[1] - a, center[2]);
	            }
	            for (let i = center[0] - radius; i <= center[0] + radius; i++) {
	                if (i != center[0]) {
	                    visitor(i, center[1], center[2]);
	                }
	            }
	        }
	        else if (N_axis === 'y') {
	            for (let i = center[2] - a; i <= center[2] + a; i++) {
	                visitor(center[0] + b, center[1], i);
	                visitor(center[0] - b, center[1], i);
	            }
	            for (let i = center[2] - b; i <= center[2] + b; i++) {
	                visitor(center[0] + a, center[1], i);
	                visitor(center[0] - a, center[1], i);
	            }
	            for (let i = center[2] - radius; i <= center[2] + radius; i++) {
	                if (i != center[2]) {
	                    visitor(center[0], center[1], i);
	                }
	            }
	        }
	        else if (N_axis === 'x') {
	            for (let i = center[2] - a; i <= center[2] + a; i++) {
	                visitor(center[0], center[1] + b, i);
	                visitor(center[0], center[1] - b, i);
	            }
	            for (let i = center[2] - b; i <= center[2] + b; i++) {
	                visitor(center[0], center[1] + a, i);
	                visitor(center[0], center[1] - a, i);
	            }
	            for (let i = center[2] - radius; i <= center[2] + radius; i++) {
	                if (i != center[2]) {
	                    visitor(center[0], center[1], i);
	                }
	            }
	        }
	    }
	}
	function drawVoxelSquare(voxels, color, center, halfEdgeLen, N_axis, force = false) {
	    if (typeof N_axis !== 'string') {
	        if (N_axis[0] != 0) {
	            N_axis = 'x';
	        }
	        else if (N_axis[1] != 0) {
	            N_axis = 'y';
	        }
	        else if (N_axis[2] != 0) {
	            N_axis = 'z';
	        }
	    }
	    if (N_axis === 'z') {
	        for (let i = center[0] - halfEdgeLen; i <= center[0] + halfEdgeLen; i++) {
	            for (let j = center[1] - halfEdgeLen; j <= center[1] + halfEdgeLen; j++) {
	                if (i != center[0] || j != center[1]) {
	                    const idx = voxels.index(i, j, center[2]);
	                    if (idx > -1) {
	                        voxels.data[idx] = force ? color : voxels.data[idx] || color;
	                    }
	                }
	            }
	        }
	    }
	    else if (N_axis === 'y') {
	        for (let i = center[0] - halfEdgeLen; i <= center[0] + halfEdgeLen; i++) {
	            for (let k = center[2] - halfEdgeLen; k <= center[2] + halfEdgeLen; k++) {
	                if (i != center[0] || k != center[2]) {
	                    const idx = voxels.index(i, center[1], k);
	                    if (idx > -1) {
	                        voxels.data[idx] = force ? color : voxels.data[idx] || color;
	                    }
	                }
	            }
	        }
	    }
	    else if (N_axis === 'x') {
	        for (let j = center[1] - halfEdgeLen; j <= center[1] + halfEdgeLen; j++) {
	            for (let k = center[2] - halfEdgeLen; k <= center[2] + halfEdgeLen; k++) {
	                if (j != center[1] || k != center[2]) {
	                    const idx = voxels.index(center[0], j, k);
	                    if (idx > -1) {
	                        voxels.data[idx] = force ? color : voxels.data[idx] || color;
	                    }
	                }
	            }
	        }
	    }
	}
	function calcRadius(N_axis, center, pos) {
	    if (N_axis[0] != 0) {
	        const _dy = pos[1] - center[1];
	        const _dz = pos[2] - center[2];
	        return Math.round(Math.pow(_dy * _dy + _dz * _dz, 0.5));
	    }
	    else if (N_axis[1] != 0) {
	        const _dx = pos[0] - center[0];
	        const _dz = pos[2] - center[2];
	        return Math.round(Math.pow(_dx * _dx + _dz * _dz, 0.5));
	    }
	    else if (N_axis[2] != 0) {
	        const _dx = pos[0] - center[0];
	        const _dy = pos[1] - center[1];
	        return Math.round(Math.pow(_dx * _dx + _dy * _dy, 0.5));
	    }
	    return 0;
	}
	function calcHalfEdgeLen(N_axis, center, pos) {
	    if (N_axis[0] != 0) {
	        const _dy = Math.abs(pos[1] - center[1]);
	        const _dz = Math.abs(pos[2] - center[2]);
	        return Math.max(_dy, _dz);
	    }
	    else if (N_axis[1] != 0) {
	        const _dx = Math.abs(pos[0] - center[0]);
	        const _dz = Math.abs(pos[2] - center[2]);
	        return Math.max(_dx, _dz);
	    }
	    else if (N_axis[2] != 0) {
	        const _dx = Math.abs(pos[0] - center[0]);
	        const _dy = Math.abs(pos[1] - center[1]);
	        return Math.max(_dx, _dy);
	    }
	    return 0;
	}
	function drawVoxelLine(startP, endP, visitor) {
	    const minX = Math.min(startP[0], endP[0]);
	    const minY = Math.min(startP[1], endP[1]);
	    const minZ = Math.min(startP[2], endP[2]);
	    const maxX = Math.max(startP[0], endP[0]);
	    const maxY = Math.max(startP[1], endP[1]);
	    const maxZ = Math.max(startP[2], endP[2]);
	    let dx = +(endP[0] - startP[0]);
	    let dy = +(endP[1] - startP[1]);
	    let dz = +(endP[2] - startP[2]);
	    const s = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
	    dx = dx / s;
	    dy = dy / s;
	    dz = dz / s;
	    const txDelta = Math.abs(1 / dx);
	    const tyDelta = Math.abs(1 / dy);
	    const tzDelta = Math.abs(1 / dz);
	    let txMax = txDelta < Infinity ? Math.abs(dx) + 1 : Infinity;
	    let tyMax = tyDelta < Infinity ? Math.abs(dy) + 1 : Infinity;
	    let tzMax = tzDelta < Infinity ? Math.abs(dz) + 1 : Infinity;
	    const stepx = dx < 0 ? -1 : dx > 0 ? 1 : 0;
	    const stepy = dy < 0 ? -1 : dy > 0 ? 1 : 0;
	    const stepz = dz < 0 ? -1 : dz > 0 ? 1 : 0;
	    let [x, y, z] = startP;
	    while (true) {
	        visitor(x, y, z);
	        if (x == endP[0] && y == endP[1] && z == endP[2]) {
	            return;
	        }
	        if (txMax < tyMax) {
	            if (txMax < tzMax) {
	                x = x + stepx;
	                if (x < minX || x > maxX) {
	                    return;
	                }
	                txMax = txMax + txDelta;
	            }
	            else {
	                z = z + stepz;
	                if (z < minZ || z > maxZ) {
	                    return;
	                }
	                tzMax = tzMax + tzDelta;
	            }
	        }
	        else {
	            if (tyMax < tzMax) {
	                y = y + stepy;
	                if (y < minY || y > maxY) {
	                    return;
	                }
	                tyMax = tyMax + tyDelta;
	            }
	            else {
	                z = z + stepz;
	                if (z < minZ || z > maxZ) {
	                    return;
	                }
	                tzMax = tzMax + tzDelta;
	            }
	        }
	    }
	}
	function cloneArray(x) {
	    const result = new Array(x.length);
	    for (let i = 0; i < x.length; ++i) {
	        result[i] = x[i].slice();
	    }
	    return result;
	}
	function getSubSpace(as, ae, bs, be) {
	    const max = Math.max;
	    const min = Math.min;
	    const intersectS = [max(as[0], bs[0]), max(as[1], bs[1]), max(as[2], bs[2])];
	    const intersectE = [min(ae[0], be[0]), min(ae[1], be[1]), min(ae[2], be[2])];
	    if (!(intersectS[0] < intersectE[0] &&
	        intersectS[1] < intersectE[1] &&
	        intersectS[2] < intersectE[2])) {
	        return { eliminate: [[as, ae]], addition: [[bs, be]] };
	    }
	    const eliminateSpace = [];
	    [
	        [as, [intersectE[0], ae[1], intersectS[2]]],
	        [
	            [intersectE[0] + 1, as[1], as[2]],
	            [ae[0], ae[1], intersectE[2]],
	        ],
	        [
	            [as[0], as[1], intersectS[2]],
	            [intersectS[0] - 1, ae[1], ae[2]],
	        ],
	        [[intersectS[0], as[1], intersectE[2]], ae],
	        [
	            [intersectS[0], as[1], intersectS[2]],
	            [intersectE[0], intersectS[1] - 1, intersectE[2]],
	        ],
	        [
	            [intersectS[0], intersectE[1] + 1, intersectS[2]],
	            [intersectE[0], ae[1], intersectE[2]],
	        ],
	    ].forEach((points) => {
	        for (let i = 0; i < points[0].length; i++) {
	            if (points[1][i] - points[0][i] < 0) {
	                return;
	            }
	        }
	        eliminateSpace.push(points);
	    });
	    const additionSpace = [];
	    [
	        [bs, [intersectE[0], be[1], intersectS[2]]],
	        [
	            [intersectE[0] + 1, bs[1], bs[2]],
	            [be[0], be[1], intersectE[2]],
	        ],
	        [
	            [bs[0], bs[1], intersectS[2]],
	            [intersectS[0] - 1, be[1], be[2]],
	        ],
	        [[intersectS[0], bs[1], intersectE[2]], be],
	        [
	            [intersectS[0], bs[1], intersectS[2]],
	            [intersectE[0], intersectS[1] - 1, intersectE[2]],
	        ],
	        [
	            [intersectS[0], intersectE[1] + 1, intersectS[2]],
	            [intersectE[0], be[1], intersectE[2]],
	        ],
	    ].forEach((points) => {
	        for (let i = 0; i < points[0].length; i++) {
	            if (points[1][i] - points[0][i] < 0) {
	                return;
	            }
	        }
	        additionSpace.push(points);
	    });
	    return { eliminate: eliminateSpace, addition: additionSpace };
	}
	function newBundle(voxel, prevStart, prevEnd, start, end, eliminateMaterial, newMaterial, condition) {
	    const currBound = boundary(start, end, [0, 0, 0], voxel.getDimension());
	    const [minX, minY, minZ] = currBound.start;
	    const [maxX, maxY, maxZ] = currBound.end;
	    if (prevStart && prevStart.length == 3) {
	        const prevBound = boundary(prevStart, prevEnd, [0, 0, 0], voxel.getDimension());
	        const [preMinX, preMinY, preMinZ] = prevBound.start;
	        const [preMaxX, preMaxY, preMaxZ] = prevBound.end;
	        const rst = getSubSpace([preMinX, preMinY, preMinZ], [preMaxX, preMaxY, preMaxZ], [minX, minY, minZ], [maxX, maxY, maxZ]);
	        rst.eliminate.forEach((pos) => {
	            fillSpace(voxel, pos[0], pos[1], eliminateMaterial);
	        });
	        rst.addition.forEach((pos) => {
	            fillSpace(voxel, pos[0], pos[1], newMaterial, condition);
	        });
	    }
	    else {
	        for (let i = minX; i <= maxX; i++) {
	            for (let j = minY; j <= maxY; j++) {
	                for (let k = minZ; k <= maxZ; k++) {
	                    if (typeof newMaterial == 'function') {
	                        voxel.setVoxel(i, j, k, newMaterial(i, j, k));
	                    }
	                    else {
	                        voxel.setVoxel(i, j, k, newMaterial);
	                    }
	                }
	            }
	        }
	    }
	    return voxel;
	}
	function fillSpace(voxel, start, end, material, condition) {
	    const getTextureId = typeof material === 'function' ? material : () => material;
	    const onCondition = typeof condition === 'function' ? condition : () => true;
	    traverseVoxels(voxel, start, end, (i, j, k) => {
	        if (!onCondition(i, j, k)) {
	            return;
	        }
	        voxel.setVoxel(i, j, k, getTextureId(i, j, k));
	    });
	}
	function allocEmptyVoxels(x, y, z) {
	    const voxels = (0, voxel_1.allocVoxels)(x, y, z);
	    for (let i = 0; i < voxels.data.length; i++) {
	        voxels.data[i] = 0;
	    }
	    return voxels;
	}
	function getElementPos(e) {
	    let x = 0;
	    let y = 0;
	    while (e != null) {
	        x += e.offsetLeft;
	        y += e.offsetTop;
	        e = e.offsetParent;
	    }
	    return {
	        x,
	        y,
	    };
	}
	function mergeVoxel(a, b, start, end, type = 1) {
	    const bound = boundary(start, end, [0, 0, 0], a.shape.map((v) => v - 1));
	    const [minX, minY, minZ] = bound.start;
	    const [maxX, maxY, maxZ] = bound.end;
	    for (let i = minX; i <= maxX; i++) {
	        for (let j = minY; j <= maxY; j++) {
	            for (let k = minZ; k <= maxZ; k++) {
	                if (type === 1) {
	                    if (a.getVoxel(i, j, k) == 0) {
	                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
	                    }
	                }
	                else if (type === 2) {
	                    a.setVoxel(i, j, k, b.getVoxel(i, j, k));
	                }
	                else if (type === 3) {
	                    if (b.getVoxel(i, j, k) != 0) {
	                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
	                    }
	                }
	                else if (type === 4) {
	                    if (b.getVoxel(i, j, k) != 0) {
	                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
	                        b.setVoxel(i, j, k, 0);
	                    }
	                }
	                else if (type === 5) {
	                    if (a.getVoxel(i, j, k) == 0) {
	                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
	                        b.setVoxel(i, j, k, 0);
	                    }
	                }
	            }
	        }
	    }
	    return function (c, s, e, t = 1) {
	        return mergeVoxel(a, c, s, e, t);
	    };
	}
	function surfaceByNormalAndPoint(p, q) {
	    const tris = [];
	    const A = q[0] - p[0];
	    const B = q[1] - p[1];
	    const C = q[2] - p[2];
	    const Cx = p[0];
	    const Cy = p[1];
	    const Cz = p[2];
	    const maxDN = Math.max(Math.abs(A), Math.abs(B), Math.abs(C));
	    let vertices;
	    const v = 2000;
	    if (maxDN === Math.abs(A)) {
	        if (A > 0) {
	            vertices = [
	                [v, v],
	                [-v, v],
	                [-v, -v],
	                [v, -v],
	            ];
	        }
	        else {
	            vertices = [
	                [v, v],
	                [v, -v],
	                [-v, -v],
	                [-v, v],
	            ];
	        }
	        for (let i = 0; i < vertices.length; i++) {
	            const y = vertices[i][0];
	            const z = vertices[i][1];
	            const x = Cx - (B * (y - Cy) + C * (z - Cz)) / A;
	            tris.push([x, y, z]);
	        }
	    }
	    else if (maxDN === Math.abs(B)) {
	        if (B > 0) {
	            vertices = [
	                [v, v],
	                [v, -v],
	                [-v, -v],
	                [-v, v],
	            ];
	        }
	        else {
	            vertices = [
	                [v, v],
	                [-v, v],
	                [-v, -v],
	                [v, -v],
	            ];
	        }
	        for (let i = 0; i < vertices.length; i++) {
	            const x = vertices[i][0];
	            const z = vertices[i][1];
	            const y = Cy - (A * (x - Cx) + C * (z - Cz)) / B;
	            tris.push([x, y, z]);
	        }
	    }
	    else {
	        if (C > 0) {
	            vertices = [
	                [v, v],
	                [-v, v],
	                [-v, -v],
	                [v, -v],
	            ];
	        }
	        else if (C < 0) {
	            vertices = [
	                [v, v],
	                [v, -v],
	                [-v, -v],
	                [-v, v],
	            ];
	        }
	        else {
	            throw new Error('C should not be zero');
	        }
	        for (let i = 0; i < vertices.length; i++) {
	            const x = vertices[i][0];
	            const y = vertices[i][1];
	            const z = Cz - (A * (x - Cx) + B * (y - Cy)) / C;
	            tris.push([x, y, z]);
	        }
	    }
	    return tris;
	}
	return helper;
}

var pool = {};

var twiddle = {};

/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */

var hasRequiredTwiddle;

function requireTwiddle () {
	if (hasRequiredTwiddle) return twiddle;
	hasRequiredTwiddle = 1;

	//Number of bits in an integer
	var INT_BITS = 32;

	//Constants
	twiddle.INT_BITS  = INT_BITS;
	twiddle.INT_MAX   =  0x7fffffff;
	twiddle.INT_MIN   = -1<<(INT_BITS-1);

	//Returns -1, 0, +1 depending on sign of x
	twiddle.sign = function(v) {
	  return (v > 0) - (v < 0);
	};

	//Computes absolute value of integer
	twiddle.abs = function(v) {
	  var mask = v >> (INT_BITS-1);
	  return (v ^ mask) - mask;
	};

	//Computes minimum of integers x and y
	twiddle.min = function(x, y) {
	  return y ^ ((x ^ y) & -(x < y));
	};

	//Computes maximum of integers x and y
	twiddle.max = function(x, y) {
	  return x ^ ((x ^ y) & -(x < y));
	};

	//Checks if a number is a power of two
	twiddle.isPow2 = function(v) {
	  return !(v & (v-1)) && (!!v);
	};

	//Computes log base 2 of v
	twiddle.log2 = function(v) {
	  var r, shift;
	  r =     (v > 0xFFFF) << 4; v >>>= r;
	  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
	  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
	  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
	  return r | (v >> 1);
	};

	//Computes log base 10 of v
	twiddle.log10 = function(v) {
	  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
	          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
	          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
	};

	//Counts number of bits
	twiddle.popCount = function(v) {
	  v = v - ((v >>> 1) & 0x55555555);
	  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
	  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
	};

	//Counts number of trailing zeros
	function countTrailingZeros(v) {
	  var c = 32;
	  v &= -v;
	  if (v) c--;
	  if (v & 0x0000FFFF) c -= 16;
	  if (v & 0x00FF00FF) c -= 8;
	  if (v & 0x0F0F0F0F) c -= 4;
	  if (v & 0x33333333) c -= 2;
	  if (v & 0x55555555) c -= 1;
	  return c;
	}
	twiddle.countTrailingZeros = countTrailingZeros;

	//Rounds to next power of 2
	twiddle.nextPow2 = function(v) {
	  v += v === 0;
	  --v;
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v + 1;
	};

	//Rounds down to previous power of 2
	twiddle.prevPow2 = function(v) {
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v - (v>>>1);
	};

	//Computes parity of word
	twiddle.parity = function(v) {
	  v ^= v >>> 16;
	  v ^= v >>> 8;
	  v ^= v >>> 4;
	  v &= 0xf;
	  return (0x6996 >>> v) & 1;
	};

	var REVERSE_TABLE = new Array(256);

	(function(tab) {
	  for(var i=0; i<256; ++i) {
	    var v = i, r = i, s = 7;
	    for (v >>>= 1; v; v >>>= 1) {
	      r <<= 1;
	      r |= v & 1;
	      --s;
	    }
	    tab[i] = (r << s) & 0xff;
	  }
	})(REVERSE_TABLE);

	//Reverse bits in a 32 bit word
	twiddle.reverse = function(v) {
	  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
	          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
	          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
	           REVERSE_TABLE[(v >>> 24) & 0xff];
	};

	//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
	twiddle.interleave2 = function(x, y) {
	  x &= 0xFFFF;
	  x = (x | (x << 8)) & 0x00FF00FF;
	  x = (x | (x << 4)) & 0x0F0F0F0F;
	  x = (x | (x << 2)) & 0x33333333;
	  x = (x | (x << 1)) & 0x55555555;

	  y &= 0xFFFF;
	  y = (y | (y << 8)) & 0x00FF00FF;
	  y = (y | (y << 4)) & 0x0F0F0F0F;
	  y = (y | (y << 2)) & 0x33333333;
	  y = (y | (y << 1)) & 0x55555555;

	  return x | (y << 1);
	};

	//Extracts the nth interleaved component
	twiddle.deinterleave2 = function(v, n) {
	  v = (v >>> n) & 0x55555555;
	  v = (v | (v >>> 1))  & 0x33333333;
	  v = (v | (v >>> 2))  & 0x0F0F0F0F;
	  v = (v | (v >>> 4))  & 0x00FF00FF;
	  v = (v | (v >>> 16)) & 0x000FFFF;
	  return (v << 16) >> 16;
	};


	//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
	twiddle.interleave3 = function(x, y, z) {
	  x &= 0x3FF;
	  x  = (x | (x<<16)) & 4278190335;
	  x  = (x | (x<<8))  & 251719695;
	  x  = (x | (x<<4))  & 3272356035;
	  x  = (x | (x<<2))  & 1227133513;

	  y &= 0x3FF;
	  y  = (y | (y<<16)) & 4278190335;
	  y  = (y | (y<<8))  & 251719695;
	  y  = (y | (y<<4))  & 3272356035;
	  y  = (y | (y<<2))  & 1227133513;
	  x |= (y << 1);
	  
	  z &= 0x3FF;
	  z  = (z | (z<<16)) & 4278190335;
	  z  = (z | (z<<8))  & 251719695;
	  z  = (z | (z<<4))  & 3272356035;
	  z  = (z | (z<<2))  & 1227133513;
	  
	  return x | (z << 2);
	};

	//Extracts nth interleaved component of a 3-tuple
	twiddle.deinterleave3 = function(v, n) {
	  v = (v >>> n)       & 1227133513;
	  v = (v | (v>>>2))   & 3272356035;
	  v = (v | (v>>>4))   & 251719695;
	  v = (v | (v>>>8))   & 4278190335;
	  v = (v | (v>>>16))  & 0x3FF;
	  return (v<<22)>>22;
	};

	//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
	twiddle.nextCombination = function(v) {
	  var t = v | (v - 1);
	  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
	};
	return twiddle;
}

var hasRequiredPool;

function requirePool () {
	if (hasRequiredPool) return pool;
	hasRequiredPool = 1;
	Object.defineProperty(pool, "__esModule", { value: true });
	pool.alloc = alloc;
	pool.free = free;
	pool.cloneU8 = cloneU8;
	pool.clearMemoryPool = clearMemoryPool;
	const bit_twiddle_1 = requireTwiddle();
	const pool$1 = new Array(32);
	for (let i = 0; i < 32; ++i) {
	    pool$1[i] = [];
	}
	function alloc(size) {
	    const sz = (0, bit_twiddle_1.nextPow2)(size);
	    const bin = pool$1[(0, bit_twiddle_1.log2)(sz)];
	    const mem = bin.pop();
	    if (mem) {
	        return mem;
	    }
	    else {
	        return new Uint8Array(sz).buffer;
	    }
	}
	function free(buffer) {
	    pool$1[(0, bit_twiddle_1.log2)(buffer.byteLength)].push(buffer);
	}
	function cloneU8(data) {
	    const sz = (0, bit_twiddle_1.nextPow2)(data.length);
	    const bin = pool$1[(0, bit_twiddle_1.log2)(sz)];
	    const mem = bin.pop();
	    if (mem) {
	        const result = new Uint8Array(mem);
	        result.set(data);
	        return result;
	    }
	    else {
	        return new Uint8Array(data);
	    }
	}
	function clearMemoryPool() {
	    for (let i = 0; i < pool$1.length; ++i) {
	        pool$1[i].length = 0;
	    }
	}
	return pool;
}

var rleCompress = {};

var hasRequiredRleCompress;

function requireRleCompress () {
	if (hasRequiredRleCompress) return rleCompress;
	hasRequiredRleCompress = 1;
	Object.defineProperty(rleCompress, "__esModule", { value: true });
	rleCompress.compress = compress;
	rleCompress.decompress = decompress;
	rleCompress.sectionDecompress = sectionDecompress;
	rleCompress.old_decompress = old_decompress;
	function writeRun(out, runLength, block) {
	    if (runLength) {
	        out.grow(10);
	        out.writeVarint(runLength - 1);
	        out.writeVarint(block);
	    }
	}
	function compress(voxels, out) {
	    const { data, shape: [nx, ny, nz], stride: [sx, sy, sz], offset, } = voxels;
	    let prevBlock = -1;
	    let runLength = 0;
	    let ptr = offset;
	    const stepi = sx;
	    const stepj = sy - sx * nx;
	    const stepk = sz - sy * ny;
	    for (let k = 0; k < nz; ++k) {
	        for (let j = 0; j < ny; ++j) {
	            for (let i = 0; i < nx; ++i) {
	                const b = data[ptr];
	                if (b !== prevBlock) {
	                    writeRun(out, runLength, prevBlock);
	                    runLength = 0;
	                    prevBlock = b;
	                }
	                runLength += 1;
	                ptr += stepi;
	            }
	            ptr += stepj;
	        }
	        ptr += stepk;
	    }
	    writeRun(out, runLength, prevBlock);
	    return true;
	}
	function fastDecompress(inp, data, count) {
	    for (let ptr = 0; ptr < count;) {
	        const length = inp.readVarint() + 1;
	        const block = inp.readVarint();
	        for (let i = 0; i < length; ++i) {
	            data[ptr++] = block;
	        }
	    }
	    return true;
	}
	function decompress(inp, voxels) {
	    const { data, shape: [nx, ny, nz], stride: [sx, sy, sz], offset, } = voxels;
	    let curBlock = -1;
	    let curLength = 0;
	    if (sx === 1 && sy === nx && sz === nx * ny && offset === 0) {
	        return fastDecompress(inp, data, nx * ny * nz);
	    }
	    let ptr = offset;
	    const stepi = sx;
	    const stepj = sy - sx * nx;
	    const stepk = sz - sy * ny;
	    for (let k = 0; k < nz; ++k) {
	        for (let j = 0; j < ny; ++j) {
	            for (let i = 0; i < nx; ++i) {
	                if (curLength <= 0) {
	                    curLength = inp.readVarint() + 1;
	                    curBlock = inp.readVarint();
	                }
	                data[ptr] = curBlock;
	                curLength -= 1;
	                ptr += stepi;
	            }
	            ptr += stepj;
	        }
	        ptr += stepk;
	    }
	    return curLength === 0;
	}
	function sectionDecompress(rle, voxels, start, end) {
	    const { data, stride: [sx, sy, sz], offset, } = voxels;
	    const rleLength = rle.length;
	    let curBlock = -1;
	    let curLength = 0;
	    let rlePtr = 0;
	    const l = end[0] - start[0] + 1;
	    const h = end[1] - start[1] + 1;
	    const stepi = sx;
	    const stepj = sy - sx * l;
	    const stepk = sz - sy * h;
	    let ptr = sx * start[0] + sy * start[1] + sz * start[2] + offset;
	    for (let k = start[2]; k <= end[2]; k++) {
	        for (let j = start[1]; j <= end[1]; j++) {
	            for (let i = start[0]; i <= end[0]; i++) {
	                if (curLength <= 0) {
	                    if (rlePtr >= rleLength) {
	                        return false;
	                    }
	                    const runPrefix = rle[rlePtr++];
	                    if (runPrefix < 255) {
	                        curLength = runPrefix;
	                    }
	                    else {
	                        if (rlePtr + 1 >= rleLength) {
	                            return false;
	                        }
	                        curLength = (rle[rlePtr] << 8) + rle[rlePtr + 1];
	                        rlePtr += 2;
	                    }
	                    if (rlePtr >= rleLength) {
	                        return false;
	                    }
	                    const blockPrefix = rle[rlePtr++];
	                    if (blockPrefix < 255) {
	                        curBlock = blockPrefix;
	                    }
	                    else {
	                        if (rlePtr + 1 >= rleLength) {
	                            return false;
	                        }
	                        curBlock = (rle[rlePtr] << 8) + rle[rlePtr + 1];
	                        rlePtr += 2;
	                    }
	                }
	                data[ptr] = curBlock;
	                curLength -= 1;
	                ptr += stepi;
	            }
	            ptr += stepj;
	        }
	        ptr += stepk;
	    }
	    return rlePtr === rle.length && curLength === 0;
	}
	function old_decompress(rle, voxels) {
	    return sectionDecompress(rle, voxels, [0, 0, 0], voxels.shape.map((v) => v - 1));
	}
	return rleCompress;
}

var hasRequiredVoxel;

function requireVoxel () {
	if (hasRequiredVoxel) return voxel;
	hasRequiredVoxel = 1;
	Object.defineProperty(voxel, "__esModule", { value: true });
	voxel.VoxelView = void 0;
	voxel.getBoxBoundary = getBoxBoundary;
	voxel.allocVoxels = allocVoxels;
	voxel.freeVoxels = freeVoxels;
	voxel.cloneVoxels = cloneVoxels;
	voxel.storeVoxels = storeVoxels;
	voxel.restoreVoxels = restoreVoxels;
	voxel.flipVoxels = flipVoxels;
	voxel.isEmptyVoxels = isEmptyVoxels;
	const gl_matrix_1 = require$$0;
	const helper_1 = requireHelper();
	const pool_1 = requirePool();
	const rle_compress_1 = requireRleCompress();
	const TEMP_UINT16ARRAY = new Uint16Array();
	class VoxelView {
	    constructor(data, shape, stride, offset, dataStart, dataEnd, dataStride) {
	        this.getVoxelByPtr = (ptr) => {
	            if (!this.dataStart || !this.dataEnd || !this.dataStride) {
	                return this.data[ptr];
	            }
	            const z = Math.floor(ptr / this.stride[2]);
	            const y = Math.floor((ptr % this.stride[2]) / this.stride[1]);
	            const x = ptr % this.stride[1];
	            if (!this.contains(x, y, z, this.dataStart, this.dataEnd)) {
	                return 0;
	            }
	            return this.data[this.dataStride[0] * (x - this.dataStart[0]) +
	                this.dataStride[1] * (y - this.dataStart[1]) +
	                this.dataStride[2] * (z - this.dataStart[2])];
	        };
	        this.setVoxelByPtr = (ptr, b) => {
	            if (!this.dataStart || !this.dataEnd || !this.dataStride) {
	                return (this.data[ptr] = b);
	            }
	            const z = Math.floor(ptr / this.stride[2]);
	            const y = Math.floor((ptr % this.stride[2]) / this.stride[1]);
	            const x = ptr % this.stride[1];
	            if (!this.contains(x, y, z, this.dataStart, this.dataEnd)) {
	                return 0;
	            }
	            return (this.data[this.dataStride[0] * (x - this.dataStart[0]) +
	                this.dataStride[1] * (y - this.dataStart[1]) +
	                this.dataStride[2] * (z - this.dataStart[2])] = b);
	        };
	        this.data = data;
	        this.shape = shape;
	        this.stride = stride;
	        this.offset = offset | 0;
	        this.dataStart = dataStart;
	        this.dataEnd = dataEnd;
	        this.dataStride = dataStride;
	    }
	    getVoxel(x, y, z) {
	        return this.getVoxelByPtr(this.index(x, y, z));
	    }
	    getVoxels() {
	        const voxels = [];
	        (0, helper_1.traverseVoxels)(this, [0, 0, 0], this.shape.map((v) => v - 1), (i, j, k, d) => {
	            if (d != 0) {
	                voxels.push([i, j, k]);
	            }
	        });
	        return voxels;
	    }
	    getDimension() {
	        return gl_matrix_1.vec3.add(gl_matrix_1.vec3.clone(this.shape), this.shape, [-1, -1, -1]);
	    }
	    index(x, y, z) {
	        return (this.stride[0] * x + this.stride[1] * y + this.stride[2] * z + this.offset);
	    }
	    contains(x, y, z, start, end) {
	        return (x >= start[0] &&
	            x < end[0] &&
	            y >= start[1] &&
	            y < end[1] &&
	            z >= start[2] &&
	            z < end[2]);
	    }
	    setVoxel(x, y, z, b) {
	        return this.setVoxelByPtr(this.index(x, y, z), b);
	    }
	    setVoxelRotate(x, y, z, rotate) {
	        const b = this.getVoxel(x, y, z) | (rotate << 14);
	        return (this.data[this.stride[0] * x + this.stride[1] * y + this.stride[2] * z + this.offset] = b);
	    }
	    slice(lo, hi) {
	        return new VoxelView(this.data, [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]], this.stride, this.offset +
	            this.stride[0] * lo[0] +
	            this.stride[1] * lo[1] +
	            this.stride[2] * lo[2], this.dataStart, this.dataEnd, this.dataStride);
	    }
	    transpose(px, py, pz) {
	        return new VoxelView(this.data, [this.shape[px], this.shape[py], this.shape[pz]], [this.stride[px], this.stride[py], this.stride[pz]], this.offset);
	    }
	    step(sx, sy, sz) {
	        return new VoxelView(this.data, [
	            Math.floor(this.shape[0] / sx),
	            Math.floor(this.shape[1] / sy),
	            Math.floor(this.shape[2] / sz),
	        ], [this.stride[0] * sx, this.stride[1] * sy, this.stride[2] * sz], this.offset);
	    }
	    copy(other) {
	        const [nx_, ny_, nz_] = this.shape;
	        const [mx_, my_, mz_] = other.shape;
	        const nx = Math.min(nx_, mx_);
	        const ny = Math.min(ny_, my_);
	        const nz = Math.min(nz_, mz_);
	        const tdata = this.data;
	        const [tx, ty, tz] = this.stride;
	        let tptr = this.offset;
	        const dtdi = tx;
	        const dtdj = ty - nx * tx;
	        const dtdk = tz - ny * ty;
	        const sdata = other.data;
	        const [sx, sy, sz] = other.stride;
	        let sptr = other.offset;
	        const dsdi = sx;
	        const dsdj = sy - nx * sx;
	        const dsdk = sz - ny * sy;
	        for (let k = 0; k < nz; ++k) {
	            for (let j = 0; j < ny; ++j) {
	                for (let i = 0; i < nx; ++i) {
	                    tdata[tptr] = sdata[sptr];
	                    tptr += dtdi;
	                    sptr += dsdi;
	                }
	                tptr += dtdj;
	                sptr += dsdj;
	            }
	            tptr += dtdk;
	            sptr += dsdk;
	        }
	    }
	    fill(b) {
	        const [nx, ny, nz] = this.shape;
	        const tdata = this.data;
	        const [tx, ty, tz] = this.stride;
	        let tptr = this.offset;
	        const dtdi = tx;
	        const dtdj = ty - nx * tx;
	        const dtdk = tz - ny * ty;
	        for (let k = 0; k < nz; ++k) {
	            for (let j = 0; j < ny; ++j) {
	                for (let i = 0; i < nx; ++i) {
	                    tdata[tptr] = b;
	                    tptr += dtdi;
	                }
	                tptr += dtdj;
	            }
	            tptr += dtdk;
	        }
	    }
	    equals(other) {
	        if (this.shape[0] !== other.shape[0] ||
	            this.shape[1] !== other.shape[1] ||
	            this.shape[2] !== other.shape[2]) {
	            return false;
	        }
	        const [nx, ny, nz] = this.shape;
	        const tdata = this.data;
	        const [tx, ty, tz] = this.stride;
	        let tptr = this.offset;
	        const dtdi = tx;
	        const dtdj = ty - nx * tx;
	        const dtdk = tz - ny * ty;
	        const sdata = other.data;
	        const [sx, sy, sz] = other.stride;
	        let sptr = other.offset;
	        const dsdi = sx;
	        const dsdj = sy - nx * sx;
	        const dsdk = sz - ny * sy;
	        for (let k = 0; k < nz; ++k) {
	            for (let j = 0; j < ny; ++j) {
	                for (let i = 0; i < nx; ++i) {
	                    if (tdata[tptr] !== sdata[sptr]) {
	                        return false;
	                    }
	                    tptr += dtdi;
	                    sptr += dsdi;
	                }
	                tptr += dtdj;
	                sptr += dsdj;
	            }
	            tptr += dtdk;
	            sptr += dsdk;
	        }
	        return true;
	    }
	    clear() {
	        for (let i = 0; i < this.data.length; i++) {
	            this.data[i] = 0;
	        }
	    }
	    destroy() {
	        this.data = TEMP_UINT16ARRAY;
	    }
	    getStartPosition() {
	        let idx = this.data.findIndex((data) => data !== 0);
	        if (idx < 0) {
	            return undefined;
	        }
	        const [strideX, strideY, strideZ] = this.stride;
	        let x = 0;
	        let y = 0;
	        let z = 0;
	        z = Math.floor(idx / strideZ);
	        idx -= z * strideZ;
	        y = Math.floor(idx / strideY);
	        idx -= y * strideY;
	        x = Math.floor(idx / strideX);
	        return [x, y, z];
	    }
	}
	voxel.VoxelView = VoxelView;
	function getBoxBoundary(voxels) {
	    const start = [Infinity, Infinity, Infinity];
	    const end = [-Infinity, -Infinity, -Infinity];
	    (0, helper_1.traverseVoxels)(voxels, [0, 0, 0], voxels.getDimension(), (i, j, k, d) => {
	        if (d) {
	            gl_matrix_1.vec3.min(start, start, [i, j, k]);
	            gl_matrix_1.vec3.max(end, end, [i, j, k]);
	        }
	    });
	    return {
	        start,
	        end,
	    };
	}
	function allocVoxels(nx, ny, nz, dataStart, dataEnd) {
	    let size = nx * ny * nz;
	    let dataStride = undefined;
	    if (dataStart && dataEnd) {
	        const dnx = dataEnd[0] - dataStart[0];
	        const dny = dataEnd[1] - dataStart[1];
	        const dnz = dataEnd[2] - dataStart[2];
	        size = dnx * dny * dnz;
	        dataStride = [1, dnx, dnx * dny];
	    }
	    return new VoxelView(new Uint16Array((0, pool_1.alloc)(size * 2)), [nx, ny, nz], [1, nx, nx * ny], 0, dataStart, dataEnd, dataStride);
	}
	function freeVoxels(voxels) {
	    (0, pool_1.free)(voxels.data.buffer);
	}
	function cloneVoxels(voxels) {
	    const result = allocVoxels(voxels.shape[0], voxels.shape[1], voxels.shape[2]);
	    result.copy(voxels);
	    return result;
	}
	function storeVoxels(voxels, ws, isEmpty) {
	    const [nx, ny, nz] = voxels.shape;
	    ws.writeInt32(nx);
	    ws.writeInt32(ny);
	    ws.writeInt32(nz);
	    if (isEmpty) {
	        return;
	    }
	    (0, rle_compress_1.compress)(voxels, ws);
	}
	function restoreVoxels(rs) {
	    const nx = rs.readInt32();
	    const ny = rs.readInt32();
	    const nz = rs.readInt32();
	    const isEmpty = rs.buffer.buffer.byteLength <= rs.offset;
	    let voxels;
	    if (isEmpty) {
	        voxels = (0, helper_1.allocEmptyVoxels)(nx, ny, nz);
	    }
	    else {
	        voxels = allocVoxels(nx, ny, nz);
	        (0, rle_compress_1.decompress)(rs, voxels);
	    }
	    return {
	        voxels,
	        isEmpty,
	    };
	}
	function flipVoxels(voxels, axis, boundary) {
	    const flipBoundary = boundary || getBoxBoundary(voxels);
	    switch (axis) {
	        case 'X':
	            flipX(voxels, flipBoundary);
	            break;
	        case 'Y':
	            flipY(voxels, flipBoundary);
	            break;
	        case 'Z':
	            flipZ(voxels, flipBoundary);
	    }
	}
	function flipX(voxels, boundary) {
	    const { start, end } = boundary;
	    const spanX = start[0] + end[0];
	    (0, helper_1.traverseVoxels)(voxels, start, [Math.floor(spanX / 2), end[1], end[2]], (i, j, k, d) => {
	        const flipped = voxels.getVoxel(spanX - i, j, k);
	        voxels.setVoxel(i, j, k, flipped);
	        voxels.setVoxel(spanX - i, j, k, d);
	    });
	}
	function flipY(voxels, boundary) {
	    const { start, end } = boundary;
	    const spanY = start[1] + end[1];
	    (0, helper_1.traverseVoxels)(voxels, start, [end[0], Math.floor(spanY / 2), end[2]], (i, j, k, d) => {
	        const flipped = voxels.getVoxel(i, spanY - j, k);
	        voxels.setVoxel(i, j, k, flipped);
	        voxels.setVoxel(i, spanY - j, k, d);
	    });
	}
	function flipZ(voxels, boundary) {
	    const { start, end } = boundary;
	    const spanZ = start[2] + end[2];
	    (0, helper_1.traverseVoxels)(voxels, start, [end[0], end[1], Math.floor(spanZ / 2)], (i, j, k, d) => {
	        const flipped = voxels.getVoxel(i, j, spanZ - k);
	        voxels.setVoxel(i, j, k, flipped);
	        voxels.setVoxel(i, j, spanZ - k, d);
	    });
	}
	function isEmptyVoxels(voxelView) {
	    return voxelView.data.some((v) => v !== 0);
	}
	return voxel;
}

var voxelExports = requireVoxel();

const migrateV2$2 = data => __awaiter(void 0, void 0, void 0, function* () {
  const v3 = ModelDataV3Schema.clone(ModelDataV3Schema.identity);
  v3.bounds = data.bounds;
  v3.nodes = data.nodes;
  if (!data.meshes.length) {
    return v3;
  }
  const palette = [];
  const emissivePalette = [];
  const voxelViews = [];
  data.meshes.forEach((mesh, index) => parseMesh({
    palette,
    emissivePalette,
    voxelViews
  }, mesh, index));
  for (let i = 0; i < palette.length; i++) {
    if (palette[i]) {
      continue;
    }
    palette[i] = [0, 0, 0];
  }
  for (let i = 0; i < emissivePalette.length; i++) {
    if (emissivePalette[i]) {
      continue;
    }
    emissivePalette[i] = 0;
  }
  const {
    meshes,
    texture
  } = yield mesher.voxelsToMeshes(voxelViews, palette, emissivePalette);
  v3.texture = texture;
  v3.meshes = meshes;
  return v3;
});
function parseMesh(out, mesh, meshIndex) {
  const {
    palette,
    emissivePalette,
    voxelViews
  } = out;
  const compactModel = bytesToCompactModel(new Uint8Array(mesh));
  if (!compactModel) {
    voxelViews[meshIndex] = getEmptyVoxelView();
    return;
  }
  for (const index in compactModel.material) {
    const {
      rgb,
      pbr
    } = compactModel.material[index];
    const [r, g, b] = rgb;
    palette[index] = [r, g, b];
    emissivePalette[index] = pbr[2];
  }
  const voxelView = compactModelToVoxelView(compactModel);
  voxelViews[meshIndex] = voxelView || getEmptyVoxelView();
}
function compactModelToVoxelView(compactModel) {
  let quadPtr = 0;
  let slicePtr = 0;
  const begin = [0, 0, 0];
  const end = [0, 0, 0];
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  const rects = [];
  while (slicePtr < compactModel.sliceInfo.length) {
    const normalCode = compactModel.sliceInfo[slicePtr++];
    const normalCodeCount = compactModel.sliceInfo[slicePtr++];
    for (let j = 0; j < normalCodeCount; j++) {
      const z = compactModel.sliceInfo[slicePtr++];
      const zCount = compactModel.sliceInfo[slicePtr++];
      for (let k = 0; k < zCount; k++, quadPtr++) {
        const x0 = compactModel.data[quadPtr * 6];
        const y0 = compactModel.data[quadPtr * 6 + 1];
        const x1 = compactModel.data[quadPtr * 6 + 2];
        const y1 = compactModel.data[quadPtr * 6 + 3];
        const idx = compactModel.data[quadPtr * 6 + 4];
        let u;
        let v;
        let d;
        if (normalCode === 0 || normalCode === 1) {
          u = 2;
          v = 1;
          d = 0;
        } else if (normalCode === 2 || normalCode === 3) {
          u = 0;
          v = 2;
          d = 1;
        } else if (normalCode === 4 || normalCode === 5) {
          u = 1;
          v = 0;
          d = 2;
        } else {
          return;
        }
        begin[u] = x0;
        begin[v] = y0;
        begin[d] = z - (normalCode & 1);
        end[u] = x1 - 1;
        end[v] = y1 - 1;
        end[d] = z - (normalCode & 1);
        rects.push(...begin, ...end, idx);
        maxX = Math.max(maxX, end[0]);
        maxY = Math.max(maxY, end[1]);
        maxZ = Math.max(maxZ, end[2]);
      }
    }
  }
  const shape = [maxX + 1, maxY + 1, maxZ + 1];
  const [nx, ny, nz] = shape;
  const stride = [1, nx, nx * ny];
  const voxel = new Uint16Array(nx * ny * nz);
  for (let i = 0; i < rects.length; i += 7) {
    for (let x = rects[i + 0]; x <= rects[i + 3]; x++) {
      for (let y = rects[i + 1]; y <= rects[i + 4]; y++) {
        for (let zz = rects[i + 2]; zz <= rects[i + 5]; zz++) {
          const ptr = x * stride[0] + y * stride[1] + zz * stride[2];
          voxel[ptr] = rects[i + 6];
        }
      }
    }
  }
  return new voxelExports.VoxelView(voxel, shape, stride, 0);
}
function getEmptyVoxelView() {
  return new voxelExports.VoxelView(new Uint16Array(), [0, 0, 0], [0, 0, 0], 0);
}

const migrateV3$1 = data => __awaiter(void 0, void 0, void 0, function* () {
  const v4 = ModelDataV4Schema.clone(ModelDataV4Schema.identity);
  v4.meshes = data.meshes;
  v4.nodes = data.nodes;
  v4.texture = data.texture;
  return v4;
});

const migrateV4$1 = data => __awaiter(void 0, void 0, void 0, function* () {
  const v5 = ModelDataV5Schema.clone(ModelDataV5Schema.identity);
  v5.meshes = data.meshes;
  v5.nodes = data.nodes;
  v5.texture = data.texture;
  return v5;
});

const IDENTITY_SCALE$2 = Vec3Schema.fromJSON([1, 1, 1]);
const migrateV5$1 = data => __awaiter(void 0, void 0, void 0, function* () {
  const v6 = ModelDataV6Schema.clone(ModelDataV6Schema.identity);
  const {
      version
    } = data,
    others = __rest(data, ["version"]);
  Object.assign(v6, others);
  v6.nodes.forEach(node => {
    node.scale = Vec3Schema.clone(IDENTITY_SCALE$2);
  });
  return v6;
});

const IDENTITY_SCALE_MAT3$2 = Mat3Schema.fromJSON([1, 0, 0, 0, 1, 0, 0, 0, 1]);
const migrateV6$1 = data => __awaiter(void 0, void 0, void 0, function* () {
  const v7 = ModelDataV7Schema.clone(ModelDataV7Schema.identity);
  const {
      version
    } = data,
    others = __rest(data, ["version"]);
  Object.assign(v7, others);
  v7.nodes.forEach(node => {
    node.parentScaleMat3 = Mat3Schema.clone(IDENTITY_SCALE_MAT3$2);
  });
  return v7;
});

function migrate$2(bytes) {
  return __awaiter(this, void 0, void 0, function* () {
    const data = modelBytesToSchema(bytes);
    if (!data) {
      return;
    }
    const {
      version,
      schema
    } = data;
    if (version > VOXA_MODEL_VERSION) {
      console.error(`version: ${version} is higher than current version: ${VOXA_MODEL_VERSION}`);
      return;
    }
    let modelData = schema;
    const migrations = {
      1: migrateV1$2,
      2: migrateV2$2,
      3: migrateV3$1,
      4: migrateV4$1,
      5: migrateV5$1,
      6: migrateV6$1
    };
    while (getVersion(modelData) < VOXA_MODEL_VERSION) {
      modelData = yield migrations[getVersion(modelData)](modelData);
    }
    if (!isLatest$2(modelData)) {
      console.error(`Failed to migrate model to latest version`);
      return;
    }
    return modelData;
  });
}
const getVersion = data => {
  return data.version || 1;
};
const isLatest$2 = data => {
  return getVersion(data) === VOXA_MODEL_VERSION;
};
function modelBytesToSchema(bytes) {
  try {
    const json = JSON.parse(Buffer.from(bytes).toString());
    if (json.meshes) {
      return {
        version: 1,
        schema: MODEL_SCHEMA[1].fromJSON(json)
      };
    }
  } catch (e) {}
  const stream = new streamExports.MuReadStream(bytes);
  const version = stream.readVarint();
  if (!isValidModelVersion(version)) {
    console.error(`version: ${version} is invalid`);
    return;
  }
  const schema = MODEL_SCHEMA[version];
  return {
    version,
    schema: schema.patch(schema.identity, stream)
  };
}
function isValidModelVersion(version) {
  return version > 0 && version <= VOXA_MODEL_VERSION;
}
function modelSchemaToBytes(value) {
  const ws = new streamExports.MuWriteStream(0);
  const num = value['version'] || 1;
  ws.grow(5);
  ws.writeVarint(num);
  const schema = MODEL_SCHEMA[num];
  schema.diff(schema.identity, value, ws);
  const bytes = ws.bytes();
  ws.destroy();
  return bytes;
}

function getModelMetaData(hash, bytes) {
  const metaData = getMetaDataByBytes(bytes);
  if (metaData) {
    return metaData;
  }
  const data = modelBytesToSchema(bytes);
  if (!data || !hasBounds(data.schema)) {
    return;
  }
  let [x, y, z] = data.schema.bounds;
  if (data.version === 1) {
    x++;
    y++;
    z++;
  }
  return {
    version: data.version,
    bounds: [x, y, z],
    dataHash: hash
  };
}
function hasBounds(data) {
  return !!data.bounds;
}
function getMetaDataByBytes(bytes) {
  try {
    const json = JSON.parse(Buffer.from(bytes).toString());
    if (json.version && json.bounds && json.dataHash) {
      return json;
    }
  } catch (e) {}
}

const NodeSchema$5 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  type: new schemaExports.MuVarint(exports.ProjectNodeType.Root),
  name: new schemaExports.MuUTF8(),
  voxelId: new schemaExports.MuASCII(),
  parentId: new schemaExports.MuASCII(),
  childrenIds: new schemaExports.MuArray(new schemaExports.MuASCII(), Infinity),
  pivot: Vec3Schema,
  position: Vec3Schema,
  quaternion: Vec4Schema
});
const NodesSchema$5 = new schemaExports.MuDictionary(NodeSchema$5, Infinity);
const VoxelSchema$2 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  encodedView: new schemaExports.MuArray(new schemaExports.MuVarint(), Infinity),
  localPalette: new schemaExports.MuArray(new schemaExports.MuInt32(), Infinity)
});
const VoxelsSchema$2 = new schemaExports.MuDictionary(VoxelSchema$2, Infinity);
const RGBSchema = new schemaExports.MuStruct({
  r: new schemaExports.MuUint8(),
  g: new schemaExports.MuUint8(),
  b: new schemaExports.MuUint8()
});
const PaletteItemsSchema$1 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  color: RGBSchema,
  hsv: Uint16Vec3Schema,
  material: new schemaExports.MuStruct({
    emissive: new schemaExports.MuFloat32()
  })
});
const PaletteGroupSchema$1 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  name: new schemaExports.MuUTF8(),
  colorIndices: new schemaExports.MuArray(new schemaExports.MuVarint(), Infinity)
});
const PaletteDataSchema$1 = new schemaExports.MuStruct({
  items: new schemaExports.MuArray(PaletteItemsSchema$1, Infinity),
  groups: new schemaExports.MuDictionary(PaletteGroupSchema$1, Infinity),
  groupList: new schemaExports.MuArray(new schemaExports.MuASCII(), Infinity)
});
const ProjectDataV1Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(1),
  nodes: NodesSchema$5,
  voxels: VoxelsSchema$2,
  palette: PaletteDataSchema$1
});

var schemaV1$1 = /*#__PURE__*/Object.freeze({
__proto__: null,
NodeSchema: NodeSchema$5,
NodesSchema: NodesSchema$5,
PaletteDataSchema: PaletteDataSchema$1,
PaletteGroupSchema: PaletteGroupSchema$1,
PaletteItemsSchema: PaletteItemsSchema$1,
ProjectDataV1Schema: ProjectDataV1Schema,
RGBSchema: RGBSchema,
VoxelSchema: VoxelSchema$2,
VoxelsSchema: VoxelsSchema$2
});

const NodeSchema$4 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  type: new schemaExports.MuVarint(exports.ProjectNodeType.Root),
  name: new schemaExports.MuUTF8(),
  voxelId: new schemaExports.MuASCII(),
  parentId: new schemaExports.MuASCII(),
  childrenIds: new schemaExports.MuArray(new schemaExports.MuASCII(), Infinity),
  alpha: new schemaExports.MuFloat32(1),
  pivot: Vec3Schema,
  position: Vec3Schema,
  quaternion: Vec4Schema,
  euler: Vec3Schema,
  flip: Uint8Vec3Schema
});
const NodesSchema$4 = new schemaExports.MuDictionary(NodeSchema$4, Infinity);
const VoxelSchema$1 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  encodedView: new schemaExports.MuArray(new schemaExports.MuVarint(), Infinity)
});
const VoxelsSchema$1 = new schemaExports.MuDictionary(VoxelSchema$1, Infinity);
const PaletteItemSchema = new schemaExports.MuStruct({
  id: new schemaExports.MuVarint(),
  rgb: Uint8Vec3Schema,
  hsv: Uint16Vec3Schema,
  material: new schemaExports.MuStruct({
    emissive: new schemaExports.MuFloat32()
  })
});
const PaletteItemsSchema = new schemaExports.MuArray(PaletteItemSchema, Infinity);
const PaletteGroupSchema = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  name: new schemaExports.MuUTF8(),
  itemIds: new schemaExports.MuArray(new schemaExports.MuUint16(), Infinity)
});
const PaletteGroupsSchema = new schemaExports.MuDictionary(PaletteGroupSchema, Infinity);
const PaletteDataSchema = new schemaExports.MuStruct({
  items: PaletteItemsSchema,
  groups: PaletteGroupsSchema,
  groupList: new schemaExports.MuArray(new schemaExports.MuASCII(), Infinity)
});
const ProjectDataV2Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(2),
  nodes: NodesSchema$4,
  voxels: VoxelsSchema$1,
  palette: PaletteDataSchema
});

var schemaV2$1 = /*#__PURE__*/Object.freeze({
__proto__: null,
NodeSchema: NodeSchema$4,
NodesSchema: NodesSchema$4,
PaletteDataSchema: PaletteDataSchema,
PaletteGroupSchema: PaletteGroupSchema,
PaletteGroupsSchema: PaletteGroupsSchema,
PaletteItemSchema: PaletteItemSchema,
PaletteItemsSchema: PaletteItemsSchema,
ProjectDataV2Schema: ProjectDataV2Schema,
VoxelSchema: VoxelSchema$1,
VoxelsSchema: VoxelsSchema$1
});

const NodeSchema$3 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  type: new schemaExports.MuVarint(exports.ProjectNodeType.Root),
  name: new schemaExports.MuUTF8(),
  voxelId: new schemaExports.MuASCII(),
  parentId: new schemaExports.MuASCII(),
  childrenIds: new schemaExports.MuArray(new schemaExports.MuASCII(), Infinity),
  alpha: new schemaExports.MuFloat32(1),
  pivot: Vec3Schema,
  position: Vec3Schema,
  quaternion: Vec4Schema,
  euler: Vec3Schema,
  flip: Uint8Vec3Schema
});
const NodesSchema$3 = new schemaExports.MuDictionary(NodeSchema$3, Infinity);
const ProjectChannelSchema = new schemaExports.MuStruct({
  target: new schemaExports.MuStruct({
    nodeId: new schemaExports.MuASCII(),
    path: new schemaExports.MuASCII()
  }),
  sampler: SamplerSchema
});
const ProjectAnimationSchema$2 = new schemaExports.MuStruct({
  name: new schemaExports.MuUTF8(),
  channels: new schemaExports.MuArray(ProjectChannelSchema, Infinity)
});
const ProjectDataV3Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(3),
  nodes: NodesSchema$3,
  voxels: VoxelsSchema$1,
  palette: PaletteDataSchema,
  animations: new schemaExports.MuArray(ProjectAnimationSchema$2, Infinity)
});

var schemaV3$1 = /*#__PURE__*/Object.freeze({
__proto__: null,
get ChannelNodePath () { return exports.ChannelNodePath; },
NodeSchema: NodeSchema$3,
NodesSchema: NodesSchema$3,
OutputSchema: OutputSchema,
PaletteDataSchema: PaletteDataSchema,
PaletteGroupSchema: PaletteGroupSchema,
PaletteGroupsSchema: PaletteGroupsSchema,
PaletteItemSchema: PaletteItemSchema,
PaletteItemsSchema: PaletteItemsSchema,
ProjectAnimationSchema: ProjectAnimationSchema$2,
ProjectChannelSchema: ProjectChannelSchema,
ProjectDataV3Schema: ProjectDataV3Schema,
get ProjectInterpolationType () { return exports.ProjectInterpolationType; },
SamplerSchema: SamplerSchema,
TimeAccessorSchema: TimeAccessorSchema,
VoxelSchema: VoxelSchema$1,
VoxelsSchema: VoxelsSchema$1
});

const ProjectDataV4Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(4),
  nodes: NodesSchema$3,
  voxels: VoxelsSchema$1,
  palette: PaletteDataSchema,
  animations: new schemaExports.MuArray(ProjectAnimationSchema$2, Infinity)
});

var schemaV4 = /*#__PURE__*/Object.freeze({
__proto__: null,
NodeSchema: NodeSchema$3,
NodesSchema: NodesSchema$3,
PaletteDataSchema: PaletteDataSchema,
PaletteGroupSchema: PaletteGroupSchema,
PaletteGroupsSchema: PaletteGroupsSchema,
PaletteItemSchema: PaletteItemSchema,
PaletteItemsSchema: PaletteItemsSchema,
ProjectAnimationSchema: ProjectAnimationSchema$2,
ProjectChannelSchema: ProjectChannelSchema,
ProjectDataV4Schema: ProjectDataV4Schema,
get ProjectInterpolationType () { return exports.ProjectInterpolationType; },
VoxelSchema: VoxelSchema$1,
VoxelsSchema: VoxelsSchema$1
});

const NodeSchema$2 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  type: new schemaExports.MuVarint(exports.ProjectNodeType.Root),
  name: new schemaExports.MuUTF8(),
  voxelId: new schemaExports.MuASCII(),
  parentId: new schemaExports.MuASCII(),
  childrenIds: new schemaExports.MuArray(new schemaExports.MuASCII(), Infinity),
  skinId: new schemaExports.MuASCII(),
  boneId: new schemaExports.MuASCII(),
  alpha: new schemaExports.MuFloat32(1),
  pivot: Vec3Schema,
  position: Vec3Schema,
  quaternion: Vec4Schema,
  euler: Vec3Schema,
  flip: Uint8Vec3Schema
});
const NodesSchema$2 = new schemaExports.MuDictionary(NodeSchema$2, Infinity);
const KeyframeOffsetSchema$1 = new schemaExports.MuStruct({
  translation: new schemaExports.MuOption(Vec3Schema),
  rotation: new schemaExports.MuOption(Vec4Schema),
  alpha: new schemaExports.MuOption(new schemaExports.MuFloat32(1))
});
const KeyframeSchema$1 = new schemaExports.MuStruct({
  time: new schemaExports.MuASCII(),
  interpolation: new schemaExports.MuASCII(exports.ProjectInterpolationType.Linear),
  offset: KeyframeOffsetSchema$1
});
const KeyframeListSchema$1 = new schemaExports.MuArray(KeyframeSchema$1, Infinity);
const MotionNodeSchema$1 = new schemaExports.MuStruct({
  nodeId: new schemaExports.MuASCII(),
  keyframeList: KeyframeListSchema$1
});
const MotionNodesSchema$1 = new schemaExports.MuDictionary(MotionNodeSchema$1, Infinity);
const ProjectAnimationSchema$1 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  name: new schemaExports.MuUTF8(),
  nodes: MotionNodesSchema$1
});
const ProjectDataV5Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(5),
  nodes: NodesSchema$2,
  voxels: VoxelsSchema$1,
  palette: PaletteDataSchema,
  animations: new schemaExports.MuArray(ProjectAnimationSchema$1, Infinity)
});

var schemaV5 = /*#__PURE__*/Object.freeze({
__proto__: null,
KeyframeListSchema: KeyframeListSchema$1,
KeyframeOffsetSchema: KeyframeOffsetSchema$1,
KeyframeSchema: KeyframeSchema$1,
MotionNodeSchema: MotionNodeSchema$1,
MotionNodesSchema: MotionNodesSchema$1,
NodeSchema: NodeSchema$2,
NodesSchema: NodesSchema$2,
PaletteDataSchema: PaletteDataSchema,
PaletteGroupSchema: PaletteGroupSchema,
PaletteGroupsSchema: PaletteGroupsSchema,
PaletteItemSchema: PaletteItemSchema,
PaletteItemsSchema: PaletteItemsSchema,
ProjectAnimationSchema: ProjectAnimationSchema$1,
ProjectDataV5Schema: ProjectDataV5Schema,
get ProjectInterpolationType () { return exports.ProjectInterpolationType; },
VoxelSchema: VoxelSchema$1,
VoxelsSchema: VoxelsSchema$1
});

const NodeSchema$1 = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  type: new schemaExports.MuVarint(exports.ProjectNodeType.Root),
  name: new schemaExports.MuUTF8(),
  voxelId: new schemaExports.MuASCII(),
  parentId: new schemaExports.MuASCII(),
  childrenIds: new schemaExports.MuArray(new schemaExports.MuASCII(), Infinity),
  skinId: new schemaExports.MuASCII(),
  boneId: new schemaExports.MuASCII(),
  alpha: new schemaExports.MuFloat32(1),
  pivot: Vec3Schema,
  position: Vec3Schema,
  quaternion: Vec4Schema,
  euler: Vec3Schema,
  flip: Uint8Vec3Schema,
  scale: Vec3Schema
});
const NodesSchema$1 = new schemaExports.MuDictionary(NodeSchema$1, Infinity);
const KeyframeOffsetSchema = new schemaExports.MuStruct({
  translation: new schemaExports.MuOption(Vec3Schema),
  rotation: new schemaExports.MuOption(Vec4Schema),
  scale: new schemaExports.MuOption(Vec3Schema),
  alpha: new schemaExports.MuOption(new schemaExports.MuFloat32(1))
});
const KeyframeSchema = new schemaExports.MuStruct({
  time: new schemaExports.MuASCII(),
  interpolation: new schemaExports.MuASCII(exports.ProjectInterpolationType.Linear),
  offset: KeyframeOffsetSchema
});
const KeyframeListSchema = new schemaExports.MuArray(KeyframeSchema, Infinity);
const MotionNodeSchema = new schemaExports.MuStruct({
  nodeId: new schemaExports.MuASCII(),
  keyframeList: KeyframeListSchema
});
const MotionNodesSchema = new schemaExports.MuDictionary(MotionNodeSchema, Infinity);
const ProjectAnimationSchema = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  name: new schemaExports.MuUTF8(),
  nodes: MotionNodesSchema
});
const ProjectDataV6Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(6),
  nodes: NodesSchema$1,
  voxels: VoxelsSchema$1,
  palette: PaletteDataSchema,
  animations: new schemaExports.MuArray(ProjectAnimationSchema, Infinity)
});

var schemaV6 = /*#__PURE__*/Object.freeze({
__proto__: null,
KeyframeListSchema: KeyframeListSchema,
KeyframeOffsetSchema: KeyframeOffsetSchema,
KeyframeSchema: KeyframeSchema,
MotionNodeSchema: MotionNodeSchema,
MotionNodesSchema: MotionNodesSchema,
NodeSchema: NodeSchema$1,
NodesSchema: NodesSchema$1,
PaletteDataSchema: PaletteDataSchema,
PaletteGroupSchema: PaletteGroupSchema,
PaletteGroupsSchema: PaletteGroupsSchema,
PaletteItemSchema: PaletteItemSchema,
PaletteItemsSchema: PaletteItemsSchema,
ProjectAnimationSchema: ProjectAnimationSchema,
ProjectDataV6Schema: ProjectDataV6Schema,
get ProjectInterpolationType () { return exports.ProjectInterpolationType; },
VoxelSchema: VoxelSchema$1,
VoxelsSchema: VoxelsSchema$1
});

const NodeSchema = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  type: new schemaExports.MuVarint(exports.ProjectNodeType.Root),
  name: new schemaExports.MuUTF8(),
  voxelId: new schemaExports.MuASCII(),
  parentId: new schemaExports.MuASCII(),
  childrenIds: new schemaExports.MuArray(new schemaExports.MuASCII(), Infinity),
  skinId: new schemaExports.MuASCII(),
  boneId: new schemaExports.MuASCII(),
  alpha: new schemaExports.MuFloat32(1),
  pivot: Vec3Schema,
  position: Vec3Schema,
  quaternion: Vec4Schema,
  euler: Vec3Schema,
  flip: Uint8Vec3Schema,
  scale: Vec3Schema,
  parentScaleMat3: Mat3Schema
});
const NodesSchema = new schemaExports.MuDictionary(NodeSchema, Infinity);
const ProjectDataV7Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(7),
  nodes: NodesSchema,
  voxels: VoxelsSchema$1,
  palette: PaletteDataSchema,
  animations: new schemaExports.MuArray(ProjectAnimationSchema, Infinity)
});

var schemaV7 = /*#__PURE__*/Object.freeze({
__proto__: null,
KeyframeListSchema: KeyframeListSchema,
KeyframeOffsetSchema: KeyframeOffsetSchema,
KeyframeSchema: KeyframeSchema,
MotionNodeSchema: MotionNodeSchema,
MotionNodesSchema: MotionNodesSchema,
NodeSchema: NodeSchema,
NodesSchema: NodesSchema,
PaletteDataSchema: PaletteDataSchema,
PaletteGroupSchema: PaletteGroupSchema,
PaletteGroupsSchema: PaletteGroupsSchema,
PaletteItemSchema: PaletteItemSchema,
PaletteItemsSchema: PaletteItemsSchema,
ProjectAnimationSchema: ProjectAnimationSchema,
ProjectDataV7Schema: ProjectDataV7Schema,
get ProjectInterpolationType () { return exports.ProjectInterpolationType; },
VoxelSchema: VoxelSchema$1,
VoxelsSchema: VoxelsSchema$1
});

const VoxelSchema = new schemaExports.MuStruct({
  id: new schemaExports.MuASCII(),
  dimension: new schemaExports.MuVarint(exports.VoxelDimension.XYZ),
  encodedView: new schemaExports.MuArray(new schemaExports.MuVarint(), Infinity)
});
const VoxelsSchema = new schemaExports.MuDictionary(VoxelSchema, Infinity);
const ProjectDataV8Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(8),
  nodes: NodesSchema,
  voxels: VoxelsSchema,
  palette: PaletteDataSchema,
  animations: new schemaExports.MuArray(ProjectAnimationSchema, Infinity)
});

var schemaV8 = /*#__PURE__*/Object.freeze({
__proto__: null,
KeyframeListSchema: KeyframeListSchema,
KeyframeOffsetSchema: KeyframeOffsetSchema,
KeyframeSchema: KeyframeSchema,
MotionNodeSchema: MotionNodeSchema,
MotionNodesSchema: MotionNodesSchema,
NodeSchema: NodeSchema,
NodesSchema: NodesSchema,
PaletteDataSchema: PaletteDataSchema,
PaletteGroupSchema: PaletteGroupSchema,
PaletteGroupsSchema: PaletteGroupsSchema,
PaletteItemSchema: PaletteItemSchema,
PaletteItemsSchema: PaletteItemsSchema,
ProjectAnimationSchema: ProjectAnimationSchema,
ProjectDataV8Schema: ProjectDataV8Schema,
get ProjectInterpolationType () { return exports.ProjectInterpolationType; },
VoxelSchema: VoxelSchema,
VoxelsSchema: VoxelsSchema
});

const HitBoxDataSchema = new schemaExports.MuStruct({
  position: Vec3Schema,
  size: Vec3Schema
});
const HitBoxSchema = new schemaExports.MuStruct({
  mode: new schemaExports.MuVarint(exports.HitBoxMode.Default),
  customBox: new schemaExports.MuOption(HitBoxDataSchema, undefined, true)
});
const ProjectDataV9Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(9),
  nodes: NodesSchema,
  voxels: VoxelsSchema,
  palette: PaletteDataSchema,
  animations: new schemaExports.MuArray(ProjectAnimationSchema, Infinity),
  hitBox: HitBoxSchema
});

var schemaV9 = /*#__PURE__*/Object.freeze({
__proto__: null,
HitBoxDataSchema: HitBoxDataSchema,
HitBoxSchema: HitBoxSchema,
KeyframeListSchema: KeyframeListSchema,
KeyframeOffsetSchema: KeyframeOffsetSchema,
KeyframeSchema: KeyframeSchema,
MotionNodeSchema: MotionNodeSchema,
MotionNodesSchema: MotionNodesSchema,
NodeSchema: NodeSchema,
NodesSchema: NodesSchema,
PaletteDataSchema: PaletteDataSchema,
PaletteGroupSchema: PaletteGroupSchema,
PaletteGroupsSchema: PaletteGroupsSchema,
PaletteItemSchema: PaletteItemSchema,
PaletteItemsSchema: PaletteItemsSchema,
ProjectAnimationSchema: ProjectAnimationSchema,
ProjectDataV9Schema: ProjectDataV9Schema,
get ProjectInterpolationType () { return exports.ProjectInterpolationType; },
VoxelSchema: VoxelSchema,
VoxelsSchema: VoxelsSchema
});

const ModelPivotSchema = Vec3Schema;
const ProjectDataV10Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(10),
  nodes: NodesSchema,
  voxels: VoxelsSchema,
  palette: PaletteDataSchema,
  animations: new schemaExports.MuArray(ProjectAnimationSchema, Infinity),
  hitBox: HitBoxSchema,
  modelPivot: new schemaExports.MuOption(ModelPivotSchema, undefined, true)
});

var schemaV10 = /*#__PURE__*/Object.freeze({
__proto__: null,
HitBoxDataSchema: HitBoxDataSchema,
HitBoxSchema: HitBoxSchema,
KeyframeListSchema: KeyframeListSchema,
KeyframeOffsetSchema: KeyframeOffsetSchema,
KeyframeSchema: KeyframeSchema,
ModelPivotSchema: ModelPivotSchema,
MotionNodeSchema: MotionNodeSchema,
MotionNodesSchema: MotionNodesSchema,
NodeSchema: NodeSchema,
NodesSchema: NodesSchema,
PaletteDataSchema: PaletteDataSchema,
PaletteGroupSchema: PaletteGroupSchema,
PaletteGroupsSchema: PaletteGroupsSchema,
PaletteItemSchema: PaletteItemSchema,
PaletteItemsSchema: PaletteItemsSchema,
ProjectAnimationSchema: ProjectAnimationSchema,
ProjectDataV10Schema: ProjectDataV10Schema,
get ProjectInterpolationType () { return exports.ProjectInterpolationType; },
VoxelSchema: VoxelSchema,
VoxelsSchema: VoxelsSchema
});

const VOXA_PROJECT_VERSION = 10;
const PROJECT_SCHEMA = {
  1: ProjectDataV1Schema,
  2: ProjectDataV2Schema,
  3: ProjectDataV3Schema,
  4: ProjectDataV4Schema,
  5: ProjectDataV5Schema,
  6: ProjectDataV6Schema,
  7: ProjectDataV7Schema,
  8: ProjectDataV8Schema,
  9: ProjectDataV9Schema,
  10: ProjectDataV10Schema
};

const ROOT_ID$1 = 'ROOT';
const SKIN_PART_NAME = 'Object';
const EMPTY_PALETTE_ITEM = -1;
const migrateV1$1 = data => {
  const {
    voxels,
    nodes
  } = data;
  const newNodes = migrateV1Nodes(nodes);
  const newPalette = migrateV1Palette(data);
  const newVoxels = migrateV1Voxels(voxels);
  return {
    nodes: newNodes,
    voxels: newVoxels,
    palette: newPalette,
    version: 2
  };
};
function migrateV1Nodes(data) {
  return Object.values(data).reduce((prev, curr) => {
    prev[curr.id] = Object.assign(Object.assign({}, curr), {
      name: curr.id === ROOT_ID$1 ? curr.name : SKIN_PART_NAME,
      alpha: 1,
      euler: Vec3Schema.clone(Vec3Schema.identity),
      flip: Uint8Vec3Schema.clone(Uint8Vec3Schema.identity)
    });
    return prev;
  }, {});
}
function migrateV1Palette(data) {
  const {
    palette,
    nodes,
    voxels
  } = data;
  const {
    groups,
    items,
    groupList
  } = palette;
  const rootNode = nodes[ROOT_ID$1];
  const childId = rootNode.childrenIds ? rootNode.childrenIds[0] : undefined;
  if (!childId) {
    throw new Error('Cannot find first node id.');
  }
  const node = nodes[childId];
  if (node.type !== exports.ProjectNodeType.SkinPart || !node.voxelId || !voxels[node.voxelId]) {
    throw new Error('No valid voxels');
  }
  const voxel = voxels[node.voxelId];
  const {
    localPalette
  } = voxel;
  const newItems = [];
  const originalIdLookup = {};
  localPalette.forEach((prevId, idx) => {
    if (prevId === EMPTY_PALETTE_ITEM) {
      return;
    }
    const _a = items[prevId],
      {
        id,
        color
      } = _a,
      others = __rest(_a, ["id", "color"]);
    const {
      r,
      g,
      b
    } = color;
    const newId = idx + 1;
    const rgb = Uint8Vec3Schema.alloc();
    rgb[0] = r;
    rgb[1] = g;
    rgb[2] = b;
    newItems.push(Object.assign({
      id: newId,
      rgb
    }, others));
    originalIdLookup[id] = newId;
  });
  const newGroups = Object.values(groups).reduce((prev, curr) => {
    const newItemIds = [];
    curr.colorIndices.forEach(idx => {
      const {
        id
      } = items[idx];
      if (originalIdLookup[id] !== undefined) {
        newItemIds.push(originalIdLookup[id]);
      }
    });
    prev[curr.id] = {
      id: curr.id,
      name: curr.name,
      itemIds: newItemIds
    };
    return prev;
  }, {});
  return {
    items: newItems,
    groups: newGroups,
    groupList
  };
}
function migrateV1Voxels(voxels) {
  return Object.values(voxels).reduce((prev, cur) => {
    const {
      id,
      encodedView
    } = cur;
    prev[id] = {
      id,
      encodedView
    };
    return prev;
  }, {});
}

const ROOT_ID = 'ROOT';
const ROOT_BONE_ID = 'ROOT_BONE';
const ROOT_SKIN_ID = 'ROOT_SKIN';
const ROOT_NAME = 'Root';
const migrateV2$1 = data => {
  const {
    nodes,
    voxels,
    palette
  } = data;
  const newNodes = migrateV2Nodes(nodes);
  return {
    nodes: newNodes,
    voxels: voxels,
    palette: palette,
    animations: [],
    version: 3
  };
};
function migrateV2Nodes(data) {
  const newData = Object.values(data).reduce((prev, curr) => {
    const id = curr.type === exports.ProjectNodeType.Root ? ROOT_ID : curr.id;
    prev[id] = Object.assign(Object.assign({}, curr), {
      id: id
    });
    return prev;
  }, {});
  const root = newData[ROOT_ID];
  const rootSkin = NodeSchema$3.clone(NodeSchema$3.identity);
  rootSkin.id = ROOT_SKIN_ID;
  rootSkin.name = ROOT_NAME;
  rootSkin.type = exports.ProjectNodeType.Group;
  rootSkin.parentId = ROOT_ID;
  rootSkin.childrenIds = [...root.childrenIds];
  newData[rootSkin.id] = rootSkin;
  const rootBone = NodeSchema$3.clone(NodeSchema$3.identity);
  rootBone.id = ROOT_BONE_ID;
  rootBone.name = ROOT_NAME;
  rootBone.type = exports.ProjectNodeType.Bone;
  rootBone.parentId = ROOT_ID;
  rootBone.childrenIds = [];
  newData[rootBone.id] = rootBone;
  root.childrenIds = [rootBone.id, rootSkin.id];
  return newData;
}

const migrateV3 = data => {
  const {
    nodes,
    voxels,
    palette,
    animations
  } = data;
  const newNodes = migrateV3Nodes(nodes);
  return {
    nodes: newNodes,
    voxels,
    palette,
    animations,
    version: 4
  };
};
function migrateV3Nodes(data) {
  data[ROOT_SKIN_ID].childrenIds.forEach(childId => {
    const child = data[childId];
    if (!child) {
      return;
    }
    child.parentId = ROOT_SKIN_ID;
  });
  return data;
}

const migrateV4 = data => {
  const v5 = ProjectDataV5Schema.clone(ProjectDataV5Schema.identity);
  const {
    nodes,
    voxels,
    palette
  } = data;
  v5.nodes = migrateV4Nodes(nodes);
  v5.voxels = voxels;
  v5.palette = palette;
  v5.animations = [];
  return v5;
};
function migrateV4Nodes(data) {
  return Object.values(data).reduce((prev, curr) => {
    prev[curr.id] = Object.assign(Object.assign({}, curr), {
      skinId: '',
      boneId: ''
    });
    return prev;
  }, {});
}

const IDENTITY_SCALE$1 = Vec3Schema.fromJSON([1, 1, 1]);
const migrateV5 = data => {
  const v6 = ProjectDataV6Schema.clone(ProjectDataV6Schema.identity);
  const {
      version
    } = data,
    others = __rest(data, ["version"]);
  Object.assign(v6, others);
  Object.keys(v6.nodes).forEach(id => {
    const node = v6.nodes[id];
    node.scale = Vec3Schema.clone(IDENTITY_SCALE$1);
  });
  return v6;
};

const IDENTITY_SCALE_MAT3$1 = Mat3Schema.fromJSON([1, 0, 0, 0, 1, 0, 0, 0, 1]);
const migrateV6 = data => {
  const v7 = ProjectDataV7Schema.clone(ProjectDataV7Schema.identity);
  const {
      version
    } = data,
    others = __rest(data, ["version"]);
  Object.assign(v7, others);
  Object.keys(v7.nodes).forEach(id => {
    const node = v7.nodes[id];
    node.parentScaleMat3 = Mat3Schema.clone(IDENTITY_SCALE_MAT3$1);
  });
  return v7;
};

const migrateV7 = data => {
  const v8 = ProjectDataV8Schema.clone(ProjectDataV8Schema.identity);
  const {
      version
    } = data,
    others = __rest(data, ["version"]);
  Object.assign(v8, others);
  Object.keys(v8.voxels).forEach(id => {
    const voxel = v8.voxels[id];
    voxel.dimension = exports.VoxelDimension.XYZ;
  });
  return v8;
};

const migrateV8 = data => {
  const v9 = ProjectDataV9Schema.clone(ProjectDataV9Schema.identity);
  const {
      version
    } = data,
    others = __rest(data, ["version"]);
  Object.assign(v9, others);
  return v9;
};

const migrateV9 = data => {
  const v10 = ProjectDataV10Schema.clone(ProjectDataV10Schema.identity);
  const {
      version
    } = data,
    others = __rest(data, ["version"]);
  Object.assign(v10, others);
  return v10;
};

function migrate$1(bytes) {
  const data = projectBytesToSchema(bytes);
  if (!data) {
    return;
  }
  const {
    version,
    schema
  } = data;
  if (version > VOXA_PROJECT_VERSION) {
    console.error(`version: ${version} is higher than current version: ${VOXA_PROJECT_VERSION}`);
    return;
  }
  let projectData = schema;
  const migrations = {
    1: migrateV1$1,
    2: migrateV2$1,
    3: migrateV3,
    4: migrateV4,
    5: migrateV5,
    6: migrateV6,
    7: migrateV7,
    8: migrateV8,
    9: migrateV9
  };
  while (projectData.version < VOXA_PROJECT_VERSION) {
    try {
      projectData = migrations[projectData.version](projectData);
    } catch (err) {
      console.error('Migration error', err);
      return;
    }
  }
  if (!isLatest$1(projectData)) {
    console.error(`Failed to migrate project to latest version`);
    return;
  }
  return projectData;
}
function isLatest$1(data) {
  return data.version === VOXA_PROJECT_VERSION;
}
function projectBytesToSchema(bytes) {
  try {
    const json = JSON.parse(Buffer.from(bytes).toString());
    if (json.version) {
      return {
        version: 1,
        schema: PROJECT_SCHEMA[1].fromJSON(json)
      };
    }
  } catch (e) {}
  const stream = new streamExports.MuReadStream(bytes);
  const version = stream.readVarint();
  if (!isValidProjectVersion(version)) {
    console.error(`version: ${version} is invalid`);
    return;
  }
  const schema = PROJECT_SCHEMA[version];
  return {
    version,
    schema: schema.patch(schema.identity, stream)
  };
}
function isValidProjectVersion(version) {
  return version > 0 && version <= VOXA_PROJECT_VERSION;
}
function projectSchemaToBytes(value) {
  const ws = new streamExports.MuWriteStream(0);
  const version = value.version;
  ws.grow(5);
  ws.writeVarint(version);
  const schema = PROJECT_SCHEMA[version];
  schema.diff(schema.identity, value, ws);
  const bytes = ws.bytes();
  ws.destroy();
  return bytes;
}

const BodyPartDataV1Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(1),
  partId: new schemaExports.MuUint8(0),
  bindMat: Mat4Schema,
  bounds: Vec3Schema,
  nodes: ModelNodesSchema$2,
  texture: schema$1.MeshTextureSchema,
  meshes: new schemaExports.MuArray(schema$1.MeshDataSchema, Infinity)
});

var schemaV1 = /*#__PURE__*/Object.freeze({
__proto__: null,
BodyPartDataV1Schema: BodyPartDataV1Schema
});

const BodyPartDataV2Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(2),
  partId: new schemaExports.MuUint8(0),
  bindMat: Mat4Schema,
  bounds: Vec3Schema,
  nodes: ModelNodesSchema$1,
  texture: schema$1.MeshTextureSchema,
  meshes: new schemaExports.MuArray(schema$1.MeshDataSchema, Infinity)
});

var schemaV2 = /*#__PURE__*/Object.freeze({
__proto__: null,
BodyPartDataV2Schema: BodyPartDataV2Schema
});

const BodyPartDataV3Schema = new schemaExports.MuStruct({
  version: new schemaExports.MuVarint(3),
  partId: new schemaExports.MuUint8(0),
  bindMat: Mat4Schema,
  bounds: Vec3Schema,
  nodes: ModelNodesSchema,
  texture: schema$1.MeshTextureSchema,
  meshes: new schemaExports.MuArray(schema$1.MeshDataSchema, Infinity)
});

var schemaV3 = /*#__PURE__*/Object.freeze({
__proto__: null,
BodyPartDataV3Schema: BodyPartDataV3Schema
});

const VOXA_SKIN_VERSION = 3;
const BODY_PART_SCHEMA = {
  1: BodyPartDataV1Schema,
  2: BodyPartDataV2Schema,
  3: BodyPartDataV3Schema
};

const IDENTITY_SCALE = Vec3Schema.fromJSON([1, 1, 1]);
const migrateV1 = data => {
  const v2 = BodyPartDataV2Schema.alloc();
  const {
      version
    } = data,
    others = __rest(data, ["version"]);
  Object.assign(v2, others);
  v2.nodes.forEach(node => {
    node.scale = Vec3Schema.clone(IDENTITY_SCALE);
  });
  v2.version = 2;
  return v2;
};

const IDENTITY_SCALE_MAT3 = Mat3Schema.fromJSON([1, 0, 0, 0, 1, 0, 0, 0, 1]);
const migrateV2 = data => {
  const v3 = BodyPartDataV3Schema.clone(BodyPartDataV3Schema.identity);
  const {
      version
    } = data,
    others = __rest(data, ["version"]);
  Object.assign(v3, others);
  v3.nodes.forEach(node => {
    node.parentScaleMat3 = Mat3Schema.clone(IDENTITY_SCALE_MAT3);
  });
  return v3;
};

function migrate(bytes) {
  const data = bodyPartBytesToSchema(bytes);
  if (!data) {
    return;
  }
  const {
    version,
    schema
  } = data;
  if (version > VOXA_SKIN_VERSION) {
    console.error(`version: ${version} is higher than current version: ${VOXA_SKIN_VERSION}`);
    return;
  }
  let bodyData = schema;
  const migrations = {
    1: migrateV1,
    2: migrateV2
  };
  while (bodyData.version < VOXA_SKIN_VERSION) {
    bodyData = migrations[bodyData.version](bodyData);
  }
  if (!isLatest(bodyData)) {
    console.error(`Failed to migrate model to latest version`);
    return;
  }
  return bodyData;
}
const isLatest = data => {
  return data.version === VOXA_SKIN_VERSION;
};
function bodyPartBytesToSchema(bytes) {
  const stream = new streamExports.MuReadStream(bytes);
  const version = stream.readVarint();
  if (!isValidBodyVersion(version)) {
    console.error(`version: ${version} is invalid`);
    return;
  }
  const schema = BODY_PART_SCHEMA[version];
  return {
    version,
    schema: schema.patch(schema.identity, stream)
  };
}
function isValidBodyVersion(version) {
  return version > 0 && version <= VOXA_SKIN_VERSION;
}
function bodyPartSchemaToBytes(value) {
  const ws = new streamExports.MuWriteStream(0);
  const version = value.version;
  ws.grow(5);
  ws.writeVarint(version);
  const schema = BODY_PART_SCHEMA[version];
  schema.diff(schema.identity, value, ws);
  const bytes = ws.bytes();
  ws.destroy();
  return bytes;
}

function getSkinMetaData(bytes) {
  try {
    return JSON.parse(Buffer.from(bytes).toString());
  } catch (e) {}
}

exports.AlphaAccessorSchema = AlphaAccessorSchema;
exports.Mat3Schema = Mat3Schema;
exports.Mat4Schema = Mat4Schema;
exports.OutputSchema = OutputSchema;
exports.RotationAccessorSchema = RotationAccessorSchema;
exports.SamplerSchema = SamplerSchema;
exports.TimeAccessorSchema = TimeAccessorSchema;
exports.TranslationAccessorSchema = TranslationAccessorSchema;
exports.Uint16Vec3Schema = Uint16Vec3Schema;
exports.Uint8Vec3Schema = Uint8Vec3Schema;
exports.VOXA_MODEL_VERSION = VOXA_MODEL_VERSION;
exports.VOXA_SKIN_VERSION = VOXA_SKIN_VERSION;
exports.Vec3Schema = Vec3Schema;
exports.Vec4Schema = Vec4Schema;
exports.bodyPartBytesToSchema = bodyPartBytesToSchema;
exports.bodyPartSchemaToBytes = bodyPartSchemaToBytes;
exports.calcEasing = calcEasing;
exports.getModelMetaData = getModelMetaData;
exports.getModelVersion = getVersion;
exports.getSkinMetaData = getSkinMetaData;
exports.isLatestModel = isLatest$2;
exports.isLatestSkin = isLatest;
exports.lerp = lerp$5;
exports.migrateModel = migrate$2;
exports.migrateProject = migrate$1;
exports.migrateSkin = migrate;
exports.modelBytesToSchema = modelBytesToSchema;
exports.modelSchemaToBytes = modelSchemaToBytes;
exports.modelV1 = schemaV1$2;
exports.modelV2 = schemaV2$2;
exports.modelV3 = schemaV3$2;
exports.modelV4 = schemaV4$1;
exports.modelV5 = schemaV5$1;
exports.modelV6 = schemaV6$1;
exports.modelV7 = schemaV7$1;
exports.projectBytesToSchema = projectBytesToSchema;
exports.projectSchemaToBytes = projectSchemaToBytes;
exports.projectV1 = schemaV1$1;
exports.projectV10 = schemaV10;
exports.projectV2 = schemaV2$1;
exports.projectV3 = schemaV3$1;
exports.projectV4 = schemaV4;
exports.projectV5 = schemaV5;
exports.projectV6 = schemaV6;
exports.projectV7 = schemaV7;
exports.projectV8 = schemaV8;
exports.projectV9 = schemaV9;
exports.skinV1 = schemaV1;
exports.skinV2 = schemaV2;
exports.skinV3 = schemaV3;
