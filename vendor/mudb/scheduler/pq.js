"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NIL = exports.PQEvent = void 0;
exports.merge = merge;
exports.pop = pop;
exports.decreaseKey = decreaseKey;
exports.createNode = createNode;
class PQEvent {
    constructor(id, time, event, parent, left, right) {
        this.id = id;
        this.time = time;
        this.event = event;
        this.parent = parent;
        this.left = left;
        this.right = right;
    }
}
exports.PQEvent = PQEvent;
exports.NIL = new PQEvent(-1, -Infinity, () => { }, null, null, null);
exports.NIL.parent = exports.NIL.left = exports.NIL.right = exports.NIL;
function link(a, b) {
    b.right = a.left;
    a.left.parent = b;
    a.left = b;
    b.parent = a;
    a.right = exports.NIL;
    return a;
}
function merge(a, b) {
    if (a === exports.NIL) {
        return b;
    }
    else if (b === exports.NIL) {
        return a;
    }
    else if (a.time < b.time) {
        return link(a, b);
    }
    else {
        return link(b, a);
    }
}
function pop(root) {
    let p = root.left;
    root.left = exports.NIL;
    root = p;
    while (true) {
        let q = root.right;
        if (q === exports.NIL) {
            break;
        }
        p = root;
        let r = q.right;
        let s = merge(p, q);
        root = s;
        while (true) {
            p = r;
            q = r.right;
            if (q === exports.NIL) {
                break;
            }
            r = q.right;
            s = s.right = merge(p, q);
        }
        s.right = exports.NIL;
        if (p !== exports.NIL) {
            p.right = root;
            root = p;
        }
    }
    root.parent = exports.NIL;
    return root;
}
function decreaseKey(root, p, time) {
    p.time = time;
    const q = p.parent;
    if (q.time < p.time) {
        return root;
    }
    const r = p.right;
    r.parent = q;
    if (q.left === p) {
        q.left = r;
    }
    else {
        q.right = r;
    }
    if (root.time <= p.time) {
        const l = root.left;
        l.parent = p;
        p.right = l;
        root.left = p;
        p.parent = root;
        return root;
    }
    else {
        const l = p.left;
        root.right = l;
        l.parent = root;
        p.left = root;
        root.parent = p;
        p.right = p.parent = exports.NIL;
        return p;
    }
}
function createNode(id, time, event) {
    return new PQEvent(id, time, event, exports.NIL, exports.NIL, exports.NIL);
}
//# sourceMappingURL=pq.js.map