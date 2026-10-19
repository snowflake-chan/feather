"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subII = subII;
exports.allocId = allocId;
exports.allocIds = allocIds;
exports.preAllocIds = preAllocIds;
exports.allocIdsEx = allocIdsEx;
const _id_1 = require("@box/mudb/rda/_id");
const BASE = _id_1.ID_MAX.charCodeAt(0);
const ALLOC_BOUNDARY = 10;
const strategies = {};
function log2(v_) {
    let r = 0;
    let shift = 0;
    let v = v_;
    r = v > 0xffff ? 1 << 4 : 0;
    v >>>= r;
    shift = v > 0xff ? 1 << 3 : 0;
    v >>>= shift;
    r |= shift;
    shift = v > 0xf ? 1 << 2 : 0;
    v >>>= shift;
    r |= shift;
    shift = v > 0x3 ? 1 << 1 : 0;
    v >>>= shift;
    r |= shift;
    return r | (v >> 1);
}
function subChar(a, b) {
    const x = a ? a.charCodeAt(0) : 0;
    const y = b ? b.charCodeAt(0) : 0;
    return x - y;
}
function subII(a, b, depth, max) {
    let result = 0;
    let borrow = 0;
    let x = 1;
    for (let i = depth; i >= 0; i--, x *= BASE) {
        const d = subChar(a[i], b[i]) - borrow;
        borrow = d >= 0 ? 0 : 1;
        result += x * (borrow === 0 ? d : d + BASE);
        if (result >= max) {
            return max;
        }
    }
    if (borrow == 1) {
        return x - result;
    }
    return result;
}
function addIN(a, b, depth) {
    if (depth === undefined) {
        depth = a.length - 1;
    }
    let result = '';
    let carry = 0;
    for (let i = depth; i >= 0; i--) {
        const lo = b % BASE;
        const x = (i < a.length ? a[i].charCodeAt(0) : 0) + carry + lo;
        carry = x >= BASE ? 1 : x < 0 ? -1 : 0;
        b = (b - lo) / BASE;
        result = String.fromCharCode(carry === 0 ? x : (x + BASE) % BASE) + result;
        if (b === 0 && carry === 0) {
            for (let j = i - a.length; j > 0; j--) {
                result = String.fromCharCode(0) + result;
            }
            return a.substr(0, i) + result;
        }
    }
    return a;
}
function allocId(begin, end) {
    let depth = Math.max(begin.length, end.length) - 1;
    let interval = 0;
    while (true) {
        interval = subII(end, begin, depth, ALLOC_BOUNDARY * 10 + 1) - 1;
        if (interval >= 1) {
            break;
        }
        depth++;
    }
    const step = Math.ceil(Math.min(ALLOC_BOUNDARY, interval) * Math.random());
    if (!(depth in strategies)) {
        strategies[depth] = Math.random() > 0.5;
    }
    if (strategies[depth]) {
        return addIN(begin, step, depth);
    }
    else {
        return addIN(end, -step, depth);
    }
}
function allocIds(begin, end, count) {
    if (count === 0) {
        return [];
    }
    const allocIdsData = {};
    preAllocIds(begin, end, count, allocIdsData);
    return allocIdsEx(allocIdsData, count);
}
function preAllocIds(begin, end, count, out) {
    let depth = Math.max(begin.length, end.length) - 1;
    let interval = 0;
    const step = log2(count + 1);
    while (true) {
        interval =
            subII(end, begin, depth, step * count * 10 + ALLOC_BOUNDARY) -
                step * count -
                step;
        if (interval >= count) {
            break;
        }
        depth++;
    }
    const offset = Math.ceil(Math.min(ALLOC_BOUNDARY, interval) * Math.random());
    out.beginId =
        Math.random() > 0.5
            ? addIN(begin, offset, depth)
            : addIN(end, -offset - step * count, depth);
    out.step = step;
}
function allocIdsEx({ beginId, step }, count) {
    const result = [beginId];
    for (let i = 0; i < count - 1; i++) {
        result.push(addIN(result[i], step));
    }
    return result;
}
//# sourceMappingURL=murda-id.js.map