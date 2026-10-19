"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ID_MIN = exports.ID_MAX = exports.IdSetSchema = exports.IdSchema = void 0;
exports.initialIds = initialIds;
exports.allocIds = allocIds;
exports.compareId = compareId;
exports.compareTaggedId = compareTaggedId;
exports.searchId = searchId;
const ascii_1 = require("../schema/ascii");
const sorted_array_1 = require("../schema/sorted-array");
exports.IdSchema = new ascii_1.MuASCII();
exports.IdSetSchema = new sorted_array_1.MuSortedArray(exports.IdSchema, Infinity, compareId);
exports.ID_MAX = String.fromCharCode(128);
exports.ID_MIN = '';
const BASE_COUNT = 10;
function log2(v_) {
    let r = 0;
    let shift = 0;
    let v = v_;
    r = (v > 0xFFFF) ? (1 << 4) : 0;
    v >>>= r;
    shift = (v > 0xFF) ? (1 << 3) : 0;
    v >>>= shift;
    r |= shift;
    shift = (v > 0xF) ? (1 << 2) : 0;
    v >>>= shift;
    r |= shift;
    shift = (v > 0x3) ? (1 << 1) : 0;
    v >>>= shift;
    r |= shift;
    return r | (v >> 1);
}
function getStep(range, count) {
    const step = Math.floor(range / count);
    for (let i = 28; i >= 0; --i) {
        const nstep = (step >> i) << i;
        if (nstep) {
            return nstep;
        }
    }
    return step;
}
function initialIds(count) {
    const step = getStep(1 << 27, count);
    const result = [];
    result.length = 0;
    for (let i = 0, id = step; i < count; ++i, id += step) {
        const x0 = id >> 21;
        const x1 = (id >> 14) & 0x7f;
        const x2 = (id >> 7) & 0x7f;
        const x3 = id & 0x7f;
        if (x3) {
            result.push(String.fromCharCode(x0) +
                String.fromCharCode(x1) +
                String.fromCharCode(x2) +
                String.fromCharCode(x3));
        }
        else if (x2) {
            result.push(String.fromCharCode(x0) +
                String.fromCharCode(x1) +
                String.fromCharCode(x2));
        }
        else if (x1) {
            result.push(String.fromCharCode(x0) +
                String.fromCharCode(x1));
        }
        else {
            result.push(String.fromCharCode(x0));
        }
    }
    return result;
}
function prefixLengthFromIndex(a, b, start) {
    const n = Math.min(a.length, b.length);
    for (let i = start; i < n; ++i) {
        if (a.charCodeAt(i) !== b.charCodeAt(i)) {
            return i;
        }
    }
    return n;
}
function computePrefix(a, b) {
    let l;
    let s;
    if (a.length > b.length) {
        l = a;
        s = b;
    }
    else {
        l = b;
        s = a;
    }
    for (let i = 0; i < l.length; i++) {
        if (l.charCodeAt(i) !== (i >= s.length ? 0 : s.charCodeAt(i))) {
            return l.slice(0, i);
        }
    }
    return l;
}
function prefixCode(a, index) {
    const n = a.length;
    if (n <= index) {
        return 0;
    }
    else if (n <= index + 1) {
        return a.charCodeAt(index) << 21;
    }
    else if (n <= index + 2) {
        return (a.charCodeAt(index) << 21) + (a.charCodeAt(index + 1) << 14);
    }
    else if (n <= index + 3) {
        return (a.charCodeAt(index) << 21) + (a.charCodeAt(index + 1) << 14) + (a.charCodeAt(index + 2) << 7);
    }
    else {
        return (a.charCodeAt(index) << 21) + (a.charCodeAt(index + 1) << 14) + (a.charCodeAt(index + 2) << 7) + a.charCodeAt(index + 3);
    }
}
function allocIds(begin, end, count) {
    const prefix = computePrefix(begin, end);
    const lo = prefixCode(begin, prefix.length);
    const hi = prefixCode(end, prefix.length);
    const step = getStep(hi - lo, 2 * count);
    const bits = log2(BASE_COUNT + count);
    const offset = (Math.floor(1 + Math.random() * (1 << bits)) * getStep(hi - lo, 2 << bits)) >>> 0;
    const result = [];
    for (let i = 0, id = lo + offset; i < count; ++i, id += step) {
        const x0 = id >> 21;
        const x1 = (id >> 14) & 0x7f;
        const x2 = (id >> 7) & 0x7f;
        const x3 = id & 0x7f;
        if (x3) {
            result.push(prefix +
                String.fromCharCode(x0) +
                String.fromCharCode(x1) +
                String.fromCharCode(x2) +
                String.fromCharCode(x3));
        }
        else if (x2) {
            result.push(prefix +
                String.fromCharCode(x0) +
                String.fromCharCode(x1) +
                String.fromCharCode(x2));
        }
        else if (x1) {
            result.push(prefix +
                String.fromCharCode(x0) +
                String.fromCharCode(x1));
        }
        else {
            result.push(prefix + String.fromCharCode(x0));
        }
    }
    return result;
}
function compareIdFromIndex(a, b, start) {
    const an = a.length;
    const bn = b.length;
    const n = Math.min(a.length, b.length);
    for (let i = start; i < n; ++i) {
        const d = a.charCodeAt(i) - b.charCodeAt(i);
        if (d) {
            return d;
        }
    }
    return an - bn;
}
function compareId(a, b) {
    return compareIdFromIndex(a, b, 0);
}
function compareTaggedId(a, b) {
    return compareIdFromIndex(a.id, b.id, 0);
}
function interpolate(list, prefix, l, h, id) {
    const a = prefixCode(list[l], prefix);
    const b = prefixCode(list[h], prefix);
    const x = prefixCode(id, prefix);
    const t = (x - a) / (b - a);
    const r = Math.max(l, Math.min(h, Math.round((1 - t) * l + t * h))) | 0;
    return r;
}
function searchId(list, id) {
    if (list.length === 0) {
        return 0;
    }
    let l = 0;
    let lprefix = prefixLengthFromIndex(list[l], id, 0);
    let h = list.length - 1;
    let hprefix = prefixLengthFromIndex(list[h], id, 0);
    let i = list.length;
    while (l < h) {
        let p = Math.min(lprefix, hprefix);
        const m = interpolate(list, p, l, h, id);
        const x = list[m];
        p = prefixLengthFromIndex(id, x, p);
        if (p === x.length && p === id.length) {
            return m;
        }
        const d = compareIdFromIndex(x, id, p);
        if (d <= 0) {
            l = m + 1;
            lprefix = p;
        }
        else {
            i = m;
            h = m - 1;
            hprefix = p;
        }
    }
    if (l === h) {
        if (compareId(list[l], id) < 0) {
            return l + 1;
        }
        else {
            return l;
        }
    }
    return i;
}
//# sourceMappingURL=_id.js.map