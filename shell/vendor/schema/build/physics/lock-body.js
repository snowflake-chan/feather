"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCK_ISLAND = exports.ISLAND_RANK = exports.ISLAND_PARENT = void 0;
exports.expandLockSet = expandLockSet;
exports.islandFind = islandFind;
exports.islandLink = islandLink;
const physics_schema_1 = require("./physics-schema");
const id_1 = require("@box/utils/id");
const def_1 = require("./def");
let FLAG_MASK = physics_schema_1.RigidBodyFlags.LOCKED | physics_schema_1.RigidBodyFlags.FIXED | physics_schema_1.RigidBodyFlags.PLAYER;
const PENDING_LOCK = [];
function lockRec(bodies, contacts) {
    while (PENDING_LOCK.length > 0) {
        const i = PENDING_LOCK.pop() || 0;
        const adj = contacts[i].body;
        for (let j = 0; j < adj.length; ++j) {
            const otherId = adj[j].otherId;
            const otherIndex = (0, id_1.indexEq)(bodies, otherId);
            if (otherIndex < 0) {
                continue;
            }
            const b = bodies[otherIndex];
            if (b.flags & FLAG_MASK) {
                continue;
            }
            b.flags |= physics_schema_1.RigidBodyFlags.LOCKED;
            PENDING_LOCK.push(otherIndex);
        }
    }
}
// grow all touching body lock sets recursively
function expandLockSet(bodies, contact, skipPlayers) {
    for (let i = 0; i < bodies.length; ++i) {
        if (bodies[i].flags & physics_schema_1.RigidBodyFlags.LOCKED) {
            PENDING_LOCK.push(i);
        }
    }
    if (PENDING_LOCK.length > 0) {
        FLAG_MASK =
            physics_schema_1.RigidBodyFlags.LOCKED |
                physics_schema_1.RigidBodyFlags.FIXED |
                (skipPlayers ? physics_schema_1.RigidBodyFlags.PLAYER : 0);
        lockRec(bodies, contact);
    }
}
// contact islands
exports.ISLAND_PARENT = new Int32Array(def_1.MAX_BODIES + 1);
exports.ISLAND_RANK = new Int32Array(def_1.MAX_BODIES + 1);
exports.LOCK_ISLAND = def_1.MAX_BODIES;
function islandFind(a) {
    let x = a;
    while (true) {
        const p = exports.ISLAND_PARENT[x];
        if (p === x || p < 0) {
            return p;
        }
        const n = exports.ISLAND_PARENT[p];
        exports.ISLAND_PARENT[x] = n;
        x = p;
    }
}
function islandLink(a, b) {
    const x = islandFind(a);
    const y = islandFind(b);
    if (x < 0 || y < 0) {
        return;
    }
    const xr = exports.ISLAND_RANK[x];
    const yr = exports.ISLAND_RANK[y];
    if (xr < yr) {
        // xrank is smaller so make y parent
        exports.ISLAND_PARENT[x] = y;
        if (xr === yr) {
            exports.ISLAND_RANK[y] += 1;
        }
    }
    else {
        exports.ISLAND_PARENT[y] = x;
        if (xr === yr) {
            exports.ISLAND_RANK[x] += 1;
        }
    }
}
