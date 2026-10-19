"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NIL = exports.NIL_LAMBDA = void 0;
exports.clearPool = clearPool;
exports.stats = stats;
exports.create = create;
exports.free = free;
exports.cmp = cmp;
exports.merge = merge;
exports.takeMin = takeMin;
exports.decreaseKey = decreaseKey;
const NIL_LAMBDA = () => false;
exports.NIL_LAMBDA = NIL_LAMBDA;
let _series = 0;
class PairingHeapNode {
    constructor(weight, taskId, lambda, _serial, _parent, _left, _right) {
        this.weight = weight;
        this.taskId = taskId;
        this.lambda = lambda;
        this._serial = _serial;
        this._parent = _parent;
        this._left = _left;
        this._right = _right;
    }
}
let _pool = null;
let nodesCreated = 0;
let nodesReused = 0;
function clearPool() {
    _pool = null;
    nodesCreated = 0;
    nodesReused = 0;
}
function stats() {
    return { nodesCreated, nodesReused };
}
exports.NIL = new PairingHeapNode(-Infinity, -1, exports.NIL_LAMBDA, -1, null, null, null);
exports.NIL._left = exports.NIL._right = exports.NIL._parent = exports.NIL;
function create(weight, taskId) {
    if (taskId < 0) {
        throw new Error('negative taskID not allowed');
    }
    if (!_pool) {
        nodesCreated++;
        return new PairingHeapNode(weight, taskId, exports.NIL_LAMBDA, _series++, exports.NIL, exports.NIL, exports.NIL);
    }
    nodesReused++;
    const head = _pool;
    if (head._parent === exports.NIL) {
        _pool = null;
    }
    else {
        _pool = head._parent;
    }
    head._parent = exports.NIL;
    head.weight = weight;
    head.taskId = taskId;
    head._serial = _series++;
    return head;
}
function free(node) {
    if (node === exports.NIL) {
        return;
    }
    node._parent = _pool;
    node.lambda = exports.NIL_LAMBDA;
    node._left = node._right = exports.NIL;
    _pool = node;
}
function cmp(a, b) {
    if (a.weight === b.weight) {
        return a._serial < b._serial;
    }
    return a.weight < b.weight;
}
function link(a, b) {
    const al = a._left;
    b._right = al;
    al._parent = b;
    b._parent = a;
    a._left = b;
    a._right = exports.NIL;
    return a;
}
function merge(a, b) {
    if (a === exports.NIL) {
        return b;
    }
    else if (b === exports.NIL) {
        return a;
    }
    else if (cmp(a, b)) {
        return link(a, b);
    }
    else {
        return link(b, a);
    }
}
function takeMin(root) {
    let p = root._left;
    root._left = exports.NIL;
    root = p;
    while (true) {
        let q = root._right;
        if (q === exports.NIL) {
            break;
        }
        p = root;
        let r = q._right;
        let s = merge(p, q);
        root = s;
        while (true) {
            p = r;
            q = r._right;
            if (q === exports.NIL) {
                break;
            }
            r = q._right;
            s = s._right = merge(p, q);
        }
        s._right = exports.NIL;
        if (p !== exports.NIL) {
            p._right = root;
            root = p;
        }
    }
    root._parent = exports.NIL;
    return root;
}
function decreaseKey(root, p) {
    const q = p._parent;
    if (cmp(q, p)) {
        return root;
    }
    const r = p._right;
    r._parent = q;
    if (q._left === p) {
        q._left = r;
    }
    else {
        q._right = r;
    }
    if (cmp(root, p)) {
        const l = root._left;
        l._parent = p;
        p._right = l;
        root._left = p;
        p._parent = root;
        return root;
    }
    else {
        const l = p._left;
        root._right = l;
        l._parent = root;
        p._left = root;
        root._parent = p;
        p._right = p._parent = exports.NIL;
        return p;
    }
}
