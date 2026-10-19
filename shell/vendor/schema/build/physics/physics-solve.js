"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebuildBodyTree = rebuildBodyTree;
exports.solvePhysics = solvePhysics;
exports.extractContactIndex = extractContactIndex;
exports.clearBodyLocks = clearBodyLocks;
exports.propagateLocks = propagateLocks;
const physics_schema_1 = require("./physics-schema");
const contact_controller_1 = require("./contact-controller");
const body_rbush_1 = require("./body-rbush");
const constraint_1 = require("./constraint");
const prepare_bodies_1 = require("./prepare-bodies");
const lock_body_1 = require("./lock-body");
const def_1 = require("./def");
__exportStar(require("./def"), exports);
function getConstraint(physics) {
    return physics.useOBB ? constraint_1.OBBContactConstraint : constraint_1.AABBContactConstraint;
}
// external hack method, reuse internal body pool to build a collision structure for player movement queries
function rebuildBodyTree(bodies) {
    const nodes = [];
    let ptr = 0;
    for (let i = 0; i < bodies.length; ++i) {
        const b = bodies[i];
        if (b.flags & physics_schema_1.RigidBodyFlags.COLLIDES) {
            const box = prepare_bodies_1.BOX_POOL[ptr++];
            const { id, px, py, pz, rx, ry, rz } = b;
            box.minX = px - rx;
            box.minY = py - ry;
            box.minZ = pz - rz;
            box.maxX = px + rx;
            box.maxY = py + ry;
            box.maxZ = pz + rz;
            box.id = id;
            nodes.push(box);
        }
    }
    (0, body_rbush_1.clearNodePool)();
    return (0, body_rbush_1.createBodyRBush)(nodes, 0, nodes.length - 1, 0);
}
const A_RESULT = [0];
const B_RESULT = [0];
function findContacts(constraint, geom, filter) {
    // clear contact list
    constraint.clearContacts();
    // if no bodies are active, then bail out
    if (prepare_bodies_1.ACTIVE_BODIES.length === 0) {
        return;
    }
    // generate active rbush
    (0, body_rbush_1.clearNodePool)();
    // 建立active的RTree
    // 创建R-tree，碰撞初筛都在里面算哦，好多优化
    const activeRBush = (0, body_rbush_1.createBodyRBush)(prepare_bodies_1.ACTIVE_BOXES, 0, prepare_bodies_1.ACTIVE_BOXES.length - 1, 0);
    // find all active body collisions
    A_RESULT.length = 0;
    B_RESULT.length = 0;
    // 计算动态残影组成最大盒子静态碰撞结果
    (0, body_rbush_1.resolveSelfBodyCollisions)(A_RESULT, B_RESULT, activeRBush);
    // 仔细计算动态碰撞结果
    for (let i = 0; i < A_RESULT.length; ++i) {
        constraint.processActiveContact(A_RESULT[i], B_RESULT[i], filter);
    }
    // sort indexes
    constraint.sortContacts();
    // early out if no fixed collisions
    if (prepare_bodies_1.FIXED_BODIES.length > 0) {
        // find all fixed-active collisions
        const fixedRBush = (0, body_rbush_1.createBodyRBush)(prepare_bodies_1.FIXED_BOXES, 0, prepare_bodies_1.FIXED_BOXES.length - 1, 0);
        A_RESULT.length = 0;
        B_RESULT.length = 0;
        (0, body_rbush_1.resolveBodyCollisions)(A_RESULT, B_RESULT, activeRBush, fixedRBush);
        for (let i = 0; i < A_RESULT.length; ++i) {
            constraint.processFixedContact(A_RESULT[i], B_RESULT[i], filter);
        }
    }
    // find all terrain contacts
    constraint.findTerrainContacts(geom);
}
function postIntegrateActive() {
    for (let i = 0; i < prepare_bodies_1.ACTIVE_BODIES.length; ++i) {
        const b = prepare_bodies_1.ACTIVE_BODIES[i];
        const vx = prepare_bodies_1.DX[i];
        const vy = prepare_bodies_1.DY[i];
        const vz = prepare_bodies_1.DZ[i];
        b.px = prepare_bodies_1.X0[i] + vx * prepare_bodies_1.DT;
        b.py = prepare_bodies_1.Y0[i] + vy * prepare_bodies_1.DT;
        b.pz = prepare_bodies_1.Z0[i] + vz * prepare_bodies_1.DT;
        b.vx = (0, def_1.clampVelocityAndSleep)(vx);
        b.vy = (0, def_1.clampVelocityAndSleep)(vy);
        b.vz = (0, def_1.clampVelocityAndSleep)(vz);
        b.ax = prepare_bodies_1.AX[i];
        b.ay = prepare_bodies_1.AY[i];
        b.az = prepare_bodies_1.AZ[i];
        const q = [prepare_bodies_1.QX[i], prepare_bodies_1.QY[i], prepare_bodies_1.QZ[i], prepare_bodies_1.QW[i]];
        (0, def_1.calcQuatByVelocity)(q, b.ax, b.ay, b.az, prepare_bodies_1.DT);
        b.qx = q[0];
        b.qy = q[1];
        b.qz = q[2];
        b.qw = q[3];
    }
}
/**
 *
 * @param physics
 * @param bodies
 * @param dt
 * @param blockIndex
 * @param geom
 * @param filter
 * @param zones
 */
function solvePhysics(physics, bodies, dt, blockIndex, geom, filter, zones) {
    const constraint = getConstraint(physics);
    // update global variables
    (0, prepare_bodies_1.updateGlobalVariables)(physics, dt, blockIndex);
    // unpack body index
    // 就是数据清空然后重新设新数据到一堆数组里
    // 后面的计算就可以用上面事先算好的const数组
    (0, prepare_bodies_1.prepareBodies)(bodies, geom, zones);
    // find all contacts
    findContacts(constraint, geom, filter);
    // solve for forces using sequential impulses
    constraint.presolveCollisions();
    constraint.solveCollisions();
    // integrate final body position
    postIntegrateActive();
}
function unpackContactIndex(contactIndex, entities) {
    const n = entities.length;
    if (contactIndex.length > n) {
        for (let i = n; i < contactIndex.length; ++i) {
            physics_schema_1.ContactRecordSchema.free(contactIndex[i]);
        }
        contactIndex.length = n;
    }
    let activePtr = 0;
    let fixedPtr = 0;
    for (let i = 0; i < contactIndex.length; ++i) {
        const record = contactIndex[i];
        const id = (record.id = entities[i].id);
        // clear buffers
        for (let j = 0; j < record.body.length; ++j) {
            physics_schema_1.BodyContactSchema.free(record.body[j]);
        }
        for (let j = 0; j < record.voxel.length; ++j) {
            physics_schema_1.VoxelContactSchema.free(record.voxel[j]);
        }
        record.body.length =
            record.voxel.length =
                record.fluidVolumeFraction.length =
                    record.fluidVoxels.length =
                        0;
        // update references
        while (activePtr < prepare_bodies_1.ACTIVE_BODIES.length &&
            prepare_bodies_1.ACTIVE_BODIES[activePtr].id < id) {
            prepare_bodies_1.ACTIVE_CONTACTS[activePtr++] = null;
        }
        if (activePtr < prepare_bodies_1.ACTIVE_BODIES.length &&
            prepare_bodies_1.ACTIVE_BODIES[activePtr].id === id) {
            prepare_bodies_1.ACTIVE_CONTACTS[activePtr++] = record;
        }
        while (fixedPtr < prepare_bodies_1.FIXED_BODIES.length && prepare_bodies_1.FIXED_BODIES[fixedPtr].id < id) {
            prepare_bodies_1.FIXED_CONTACTS[fixedPtr++] = null;
        }
        if (fixedPtr < prepare_bodies_1.FIXED_BODIES.length && prepare_bodies_1.FIXED_BODIES[fixedPtr].id === id) {
            prepare_bodies_1.FIXED_CONTACTS[fixedPtr++] = record;
        }
    }
    for (let i = contactIndex.length; i < n; ++i) {
        const record = physics_schema_1.ContactRecordSchema.alloc();
        const id = (record.id = entities[i].id);
        // clear buffers
        record.body.length =
            record.voxel.length =
                record.fluidVolumeFraction.length =
                    record.fluidVoxels.length =
                        0;
        // update references
        while (activePtr < prepare_bodies_1.ACTIVE_BODIES.length &&
            prepare_bodies_1.ACTIVE_BODIES[activePtr].id < id) {
            prepare_bodies_1.ACTIVE_CONTACTS[activePtr++] = null;
        }
        if (activePtr < prepare_bodies_1.ACTIVE_BODIES.length &&
            prepare_bodies_1.ACTIVE_BODIES[activePtr].id === id) {
            prepare_bodies_1.ACTIVE_CONTACTS[activePtr++] = record;
        }
        while (fixedPtr < prepare_bodies_1.FIXED_BODIES.length && prepare_bodies_1.FIXED_BODIES[fixedPtr].id < id) {
            prepare_bodies_1.FIXED_CONTACTS[fixedPtr++] = null;
        }
        if (fixedPtr < prepare_bodies_1.FIXED_BODIES.length && prepare_bodies_1.FIXED_BODIES[fixedPtr].id === id) {
            prepare_bodies_1.FIXED_CONTACTS[fixedPtr++] = record;
        }
        // append to queue
        contactIndex.push(record);
    }
    for (let i = activePtr; i < prepare_bodies_1.ACTIVE_BODIES.length; ++i) {
        prepare_bodies_1.ACTIVE_CONTACTS[i] = null;
    }
    for (let i = fixedPtr; i < prepare_bodies_1.FIXED_BODIES.length; ++i) {
        prepare_bodies_1.FIXED_CONTACTS[i] = null;
    }
}
function updateFluidContact(contactIndex) {
    let contactPtr = 0;
    let fluidPtr = 0;
    while (fluidPtr < prepare_bodies_1.FLUID_CONTACTS.length && contactPtr < contactIndex.length) {
        const contact = contactIndex[contactPtr];
        const fluidId = prepare_bodies_1.FLUID_CONTACTS[fluidPtr];
        if (fluidId < contact.id) {
            fluidPtr += 3;
        }
        else if (contact.id < fluidId) {
            contactPtr += 1;
        }
        else {
            const block = prepare_bodies_1.FLUID_CONTACTS[fluidPtr + 1];
            const volume = prepare_bodies_1.FLUID_CONTACTS[fluidPtr + 2];
            // insertion sort into contact fluid record
            (0, contact_controller_1.addFluidContactRecord)(contact, block, volume);
            fluidPtr += 3;
        }
    }
}
function extractContactIndex(physics, bodies, contactIndex) {
    // reallocate contact index
    unpackContactIndex(contactIndex, bodies);
    // update fluid contact
    updateFluidContact(contactIndex);
    // update regular contact index
    getConstraint(physics).updateContactIndex();
    // compact all contact index entries
    (0, contact_controller_1.compactContactIndex)(contactIndex);
}
// clear all locks on all rigid bodies
function clearBodyLocks(bodies) {
    for (let i = 0; i < bodies.length; ++i) {
        bodies[i].flags &= ~physics_schema_1.RigidBodyFlags.LOCKED;
    }
}
// propagate locks directly
function propagateLocks(physics, skipPlayers) {
    // create a sentinel island for locks
    lock_body_1.ISLAND_PARENT[lock_body_1.LOCK_ISLAND] = lock_body_1.LOCK_ISLAND;
    lock_body_1.ISLAND_RANK[lock_body_1.LOCK_ISLAND] = 0;
    // first pass: loop over active objects, initialize links and parents.  connect locked objects to the lock island sentineal
    for (let i = 0; i < prepare_bodies_1.ACTIVE_BODIES.length; ++i) {
        const f = prepare_bodies_1.ACTIVE_BODIES[i].flags;
        if (skipPlayers && f & physics_schema_1.RigidBodyFlags.PLAYER) {
            lock_body_1.ISLAND_PARENT[i] = -1;
            lock_body_1.ISLAND_RANK[i] = 0;
        }
        else {
            lock_body_1.ISLAND_PARENT[i] = i;
            lock_body_1.ISLAND_RANK[i] = 0;
            if (f & physics_schema_1.RigidBodyFlags.LOCKED) {
                (0, lock_body_1.islandLink)(i, lock_body_1.LOCK_ISLAND);
            }
        }
    }
    // second pass: loop over all active contacts and update links in union-find data structure
    getConstraint(physics).propagateLocks();
    // final pass: set locked flag on all bodies in the locked set
    const locked = (0, lock_body_1.islandFind)(lock_body_1.LOCK_ISLAND);
    for (let i = 0; i < prepare_bodies_1.ACTIVE_BODIES.length; ++i) {
        if ((0, lock_body_1.islandFind)(i) === locked) {
            prepare_bodies_1.ACTIVE_BODIES[i].flags |= physics_schema_1.RigidBodyFlags.LOCKED;
        }
    }
}
