"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AABBContact = void 0;
const voxel_collision_1 = require("../../../voxel/voxel-collision");
const box_collide_1 = require("../../box-collide");
const collision_filter_1 = require("../../collision-filter");
const prepare_bodies_1 = require("../../prepare-bodies");
const def_1 = require("../../def");
const active_contact_1 = require("./active-contact");
const fixed_contact_1 = require("./fixed-contact");
const terrain_contact_1 = require("./terrain-contact");
class AABBContact {
    clearContacts() {
        (0, active_contact_1.clearActiveContacts)();
        (0, fixed_contact_1.clearFixedContacts)();
        (0, terrain_contact_1.clearTerrainContacts)();
    }
    sortContacts() {
        active_contact_1.ACTIVE_X_CONTACTS.sort();
        active_contact_1.ACTIVE_Y_CONTACTS.sort();
        active_contact_1.ACTIVE_Z_CONTACTS.sort();
    }
    updateContactIndex() {
        // X
        active_contact_1.ACTIVE_X_CONTACTS.updateIndex(0);
        fixed_contact_1.FIXED_X_CONTACTS.updateIndex(0);
        terrain_contact_1.TERRAIN_X_CONTACTS.updateIndex(0);
        // Y
        active_contact_1.ACTIVE_Y_CONTACTS.updateIndex(1);
        fixed_contact_1.FIXED_Y_CONTACTS.updateIndex(1);
        terrain_contact_1.TERRAIN_Y_CONTACTS.updateIndex(1);
        // Z
        active_contact_1.ACTIVE_Z_CONTACTS.updateIndex(2);
        fixed_contact_1.FIXED_Z_CONTACTS.updateIndex(2);
        terrain_contact_1.TERRAIN_Z_CONTACTS.updateIndex(2);
    }
    propagateLocks() {
        active_contact_1.ACTIVE_X_CONTACTS.propagateLocks();
        active_contact_1.ACTIVE_Y_CONTACTS.propagateLocks();
        active_contact_1.ACTIVE_Z_CONTACTS.propagateLocks();
    }
    processActiveContact(ai, bi, filter) {
        // 碰撞组过滤
        if (!(0, collision_filter_1.testCollisionFilter)(filter, prepare_bodies_1.ACTIVE_GROUP[ai], prepare_bodies_1.ACTIVE_GROUP[bi])) {
            return;
        }
        const hit = (0, box_collide_1.sweepSweepIntersect)(prepare_bodies_1.X0[ai], prepare_bodies_1.Y0[ai], prepare_bodies_1.Z0[ai], prepare_bodies_1.X1[ai], prepare_bodies_1.Y1[ai], prepare_bodies_1.Z1[ai], prepare_bodies_1.RX[ai], prepare_bodies_1.RY[ai], prepare_bodies_1.RZ[ai], prepare_bodies_1.X0[bi], prepare_bodies_1.Y0[bi], prepare_bodies_1.Z0[bi], prepare_bodies_1.X1[bi], prepare_bodies_1.Y1[bi], prepare_bodies_1.Z1[bi], prepare_bodies_1.RX[bi], prepare_bodies_1.RY[bi], prepare_bodies_1.RZ[bi]);
        if (!hit.collides) {
            return;
        }
        const { axis, flip, depth } = hit;
        if (axis === 0) {
            active_contact_1.ACTIVE_X_CONTACTS.push(flip, ai, bi, prepare_bodies_1.DX, depth);
        }
        else if (axis === 1) {
            active_contact_1.ACTIVE_Y_CONTACTS.push(flip, ai, bi, prepare_bodies_1.DY, depth);
        }
        else if (axis === 2) {
            active_contact_1.ACTIVE_Z_CONTACTS.push(flip, ai, bi, prepare_bodies_1.DZ, depth);
        }
    }
    processFixedContact(ai, fi, filter) {
        if (!(0, collision_filter_1.testCollisionFilter)(filter, prepare_bodies_1.ACTIVE_GROUP[ai], prepare_bodies_1.FIX_GROUP[fi])) {
            return;
        }
        const hit = (0, box_collide_1.sweepSweepIntersect)(prepare_bodies_1.X0[ai], prepare_bodies_1.Y0[ai], prepare_bodies_1.Z0[ai], prepare_bodies_1.X1[ai], prepare_bodies_1.Y1[ai], prepare_bodies_1.Z1[ai], prepare_bodies_1.RX[ai], prepare_bodies_1.RY[ai], prepare_bodies_1.RZ[ai], prepare_bodies_1.FIX_X0[fi], prepare_bodies_1.FIX_Y0[fi], prepare_bodies_1.FIX_Z0[fi], prepare_bodies_1.FIX_X1[fi], prepare_bodies_1.FIX_Y1[fi], prepare_bodies_1.FIX_Z1[fi], prepare_bodies_1.FIX_RX[fi], prepare_bodies_1.FIX_RY[fi], prepare_bodies_1.FIX_RZ[fi]);
        if (!hit.collides) {
            return;
        }
        const { axis, flip, depth } = hit;
        if (axis === 0) {
            fixed_contact_1.FIXED_X_CONTACTS.push(flip, ai, fi, prepare_bodies_1.DX, prepare_bodies_1.FIX_DX, depth);
        }
        else if (axis === 1) {
            fixed_contact_1.FIXED_Y_CONTACTS.push(flip, ai, fi, prepare_bodies_1.DY, prepare_bodies_1.FIX_DY, depth);
        }
        else if (axis === 2) {
            fixed_contact_1.FIXED_Z_CONTACTS.push(flip, ai, fi, prepare_bodies_1.DZ, prepare_bodies_1.FIX_DZ, depth);
        }
    }
    findTerrainContacts(geom) {
        for (let i = 0; i < prepare_bodies_1.ACTIVE_BOXES.length; ++i) {
            const box = prepare_bodies_1.ACTIVE_BOXES[i];
            prepare_bodies_1.TERRAIN_HITS.length = 0;
            (0, voxel_collision_1.collideSolid)(prepare_bodies_1.TERRAIN_HITS, geom, box.minX - def_1.VOXEL_EPSILON, box.minY - def_1.VOXEL_EPSILON, box.minZ - def_1.VOXEL_EPSILON, box.maxX + def_1.VOXEL_EPSILON, box.maxY + def_1.VOXEL_EPSILON, box.maxZ + def_1.VOXEL_EPSILON);
            if (prepare_bodies_1.TERRAIN_HITS.length === 0) {
                continue;
            }
            const x0 = prepare_bodies_1.X0[i];
            const y0 = prepare_bodies_1.Y0[i];
            const z0 = prepare_bodies_1.Z0[i];
            const x1 = prepare_bodies_1.X1[i];
            const y1 = prepare_bodies_1.Y1[i];
            const z1 = prepare_bodies_1.Z1[i];
            const rx = prepare_bodies_1.RX[i];
            const ry = prepare_bodies_1.RY[i];
            const rz = prepare_bodies_1.RZ[i];
            for (let j = 0; j < prepare_bodies_1.TERRAIN_HITS.length; ++j) {
                const hit = prepare_bodies_1.TERRAIN_HITS[j];
                const sweepHit = (0, box_collide_1.boxSweepIntersect)(x0, y0, z0, x1, y1, z1, rx, ry, rz, hit.minX, hit.minY, hit.minZ, hit.maxX, hit.maxY, hit.maxZ, hit.faces);
                if (sweepHit.collides) {
                    const { axis, flip, depth } = sweepHit;
                    if (axis === 0) {
                        terrain_contact_1.TERRAIN_X_CONTACTS.push(flip, i, hit, depth, prepare_bodies_1.DX);
                    }
                    else if (axis === 1) {
                        if (!flip) {
                            // special case for conveyor belts
                            terrain_contact_1.TERRAIN_Y_CONTACTS.pushMotor(i, hit, depth, prepare_bodies_1.DY);
                        }
                        else {
                            terrain_contact_1.TERRAIN_Y_CONTACTS.push(flip, i, hit, depth, prepare_bodies_1.DY);
                        }
                    }
                    else if (axis === 2) {
                        terrain_contact_1.TERRAIN_Z_CONTACTS.push(flip, i, hit, depth, prepare_bodies_1.DZ);
                    }
                }
            }
        }
    }
    presolveCollisions() {
        iterateAxisCollisions(prepare_bodies_1.DY, active_contact_1.ACTIVE_Y_CONTACTS, fixed_contact_1.FIXED_Y_CONTACTS, terrain_contact_1.TERRAIN_Y_CONTACTS);
        iterateAxisCollisions(prepare_bodies_1.DX, active_contact_1.ACTIVE_X_CONTACTS, fixed_contact_1.FIXED_X_CONTACTS, terrain_contact_1.TERRAIN_X_CONTACTS);
        iterateAxisCollisions(prepare_bodies_1.DZ, active_contact_1.ACTIVE_Z_CONTACTS, fixed_contact_1.FIXED_Z_CONTACTS, terrain_contact_1.TERRAIN_Z_CONTACTS);
        applyFriction();
    }
    solveCollisions() {
        solveAxis(prepare_bodies_1.DY, active_contact_1.ACTIVE_Y_CONTACTS, fixed_contact_1.FIXED_Y_CONTACTS, terrain_contact_1.TERRAIN_Y_CONTACTS);
        solveAxis(prepare_bodies_1.DX, active_contact_1.ACTIVE_X_CONTACTS, fixed_contact_1.FIXED_X_CONTACTS, terrain_contact_1.TERRAIN_X_CONTACTS);
        solveAxis(prepare_bodies_1.DZ, active_contact_1.ACTIVE_Z_CONTACTS, fixed_contact_1.FIXED_Z_CONTACTS, terrain_contact_1.TERRAIN_Z_CONTACTS);
    }
}
exports.AABBContact = AABBContact;
function ALLOC(size) {
    return new Float32Array(size);
}
const TO_VISIT = new Uint32Array(def_1.MAX_BODIES);
const VISIT_EDGE = new Uint32Array(def_1.MAX_BODIES);
const DLAMBDA = ALLOC(def_1.MAX_BODIES);
const ACTIVE_EDGE = 1;
const FIXED_EDGE = 2;
const TERRAIN_EDGE = 3;
const EDGE_SHIFT = 2;
const EDGE_MASK = (1 << EDGE_SHIFT) - 1;
function clearLocked() {
    const N = prepare_bodies_1.ACTIVE_BODIES.length;
    for (let i = 0; i < N; ++i) {
        VISIT_EDGE[i] = 0;
    }
}
function solveShockOut(v, adj, adjIndex, fixA, fixBias, fixLambda, terrainA, terrainBias, terrainLambda) {
    // reset queue and visit flag
    clearLocked();
    let visitPtr = 0;
    // handle terrain contacts
    for (let i = 0; i < terrainA.length; ++i) {
        const ai = terrainA[i];
        const bias = terrainBias[i];
        const lambda = terrainLambda[i];
        const lambda1 = (terrainLambda[i] = Math.max(0, lambda + prepare_bodies_1.MASS[ai] * (bias - v[ai])));
        const dlambda = lambda1 - lambda;
        v[ai] += prepare_bodies_1.INV_MASS[ai] * dlambda;
        if (lambda1) {
            const open = !VISIT_EDGE[ai];
            VISIT_EDGE[ai] = (i << EDGE_SHIFT) | TERRAIN_EDGE;
            if (open) {
                DLAMBDA[ai] = 0;
                TO_VISIT[visitPtr++] = ai;
            }
        }
    }
    // handle fixed contacts
    for (let i = 0; i < fixA.length; ++i) {
        const ai = fixA[i];
        const bias = fixBias[i];
        const lambda = fixLambda[i];
        const lambda1 = (fixLambda[i] = Math.max(0, lambda + prepare_bodies_1.MASS[ai] * (bias - v[ai])));
        const dlambda = lambda1 - lambda;
        v[ai] += prepare_bodies_1.INV_MASS[ai] * dlambda;
        if (lambda1) {
            const open = !VISIT_EDGE[ai];
            VISIT_EDGE[ai] = (i << EDGE_SHIFT) | FIXED_EDGE;
            if (open) {
                TO_VISIT[visitPtr++] = ai;
                DLAMBDA[ai] = 0;
            }
        }
    }
    // propagate shockwave
    for (let ptr = 0; ptr < visitPtr; ++ptr) {
        const ai = TO_VISIT[ptr];
        for (let i = adjIndex[ai]; i < adj.length; ++i) {
            const c = adj[i];
            if (c.ai !== ai) {
                break;
            }
            const bi = c.bi;
            if (VISIT_EDGE[bi]) {
                continue;
            }
            const { bias, lambda } = c;
            const bm = prepare_bodies_1.MASS[bi];
            const bmv = prepare_bodies_1.INV_MASS[bi];
            const lambda1 = (c.lambda = Math.max(0, lambda + bm * (bias + v[ai] - v[bi])));
            const dlambda = lambda1 - lambda;
            DLAMBDA[ai] += dlambda;
            v[bi] += bmv * dlambda;
            if (lambda1) {
                TO_VISIT[visitPtr++] = bi;
                DLAMBDA[bi] = 0;
                VISIT_EDGE[bi] = (i << EDGE_SHIFT) | ACTIVE_EDGE;
            }
        }
    }
    // backwards update lagrange multipliers
    for (let ptr = visitPtr - 1; ptr >= 0; --ptr) {
        const bi = TO_VISIT[ptr];
        const edge = VISIT_EDGE[bi];
        const dlambda = DLAMBDA[bi];
        const edgeType = edge & EDGE_MASK;
        const edgeIndex = edge >>> EDGE_SHIFT;
        if (edgeType === ACTIVE_EDGE) {
            const c = adj[edgeIndex];
            c.lambda += dlambda;
            DLAMBDA[c.ai] += dlambda;
        }
        else if (edgeType === TERRAIN_EDGE) {
            terrainLambda[edgeIndex] += dlambda;
        }
        else if (edgeType === FIXED_EDGE) {
            fixLambda[edgeIndex] += dlambda;
        }
    }
}
function solveShockIn(v, adj, adjIndex, fixB, fixBias, fixLambda, terrainB, terrainBias, terrainLambda) {
    // reset queue and visit flag
    clearLocked();
    let visitPtr = 0;
    // handle terrain contacts
    for (let i = 0; i < terrainB.length; ++i) {
        const bi = terrainB[i];
        const bias = terrainBias[i];
        const lambda = terrainLambda[i];
        const lambda1 = (terrainLambda[i] = Math.max(0, lambda + prepare_bodies_1.MASS[bi] * (bias + v[bi])));
        v[bi] -= prepare_bodies_1.INV_MASS[bi] * (lambda1 - lambda);
        if (lambda1) {
            const open = !VISIT_EDGE[bi];
            VISIT_EDGE[bi] = (i << EDGE_SHIFT) | TERRAIN_EDGE;
            if (open) {
                DLAMBDA[bi] = 0;
                TO_VISIT[visitPtr++] = bi;
            }
        }
    }
    // handle fixed contacts
    for (let i = 0; i < fixB.length; ++i) {
        const bi = fixB[i];
        const bias = fixBias[i];
        const lambda = fixLambda[i];
        const lambda1 = (fixLambda[i] = Math.max(0, lambda + prepare_bodies_1.MASS[bi] * (bias + v[bi])));
        v[bi] -= prepare_bodies_1.INV_MASS[bi] * (lambda1 - lambda);
        if (lambda1) {
            const open = !VISIT_EDGE[bi];
            VISIT_EDGE[bi] = (i << EDGE_SHIFT) | FIXED_EDGE;
            if (open) {
                DLAMBDA[bi] = 0;
                TO_VISIT[visitPtr++] = bi;
            }
        }
    }
    // propagate shockwave
    for (let ptr = 0; ptr < visitPtr; ++ptr) {
        const bi = TO_VISIT[ptr];
        for (let i = adjIndex[bi]; i < adj.length; ++i) {
            const c = adj[i];
            if (c.bi !== bi) {
                break;
            }
            const ai = c.ai;
            if (VISIT_EDGE[ai]) {
                continue;
            }
            const { bias, lambda } = c;
            const am = prepare_bodies_1.MASS[ai];
            const amv = prepare_bodies_1.INV_MASS[ai];
            const lambda1 = (c.lambda = Math.max(0, lambda + am * (bias + v[ai] - v[bi])));
            const dlambda = lambda1 - lambda;
            DLAMBDA[bi] += dlambda;
            v[ai] -= amv * dlambda;
            if (lambda1) {
                TO_VISIT[visitPtr++] = ai;
                DLAMBDA[ai] = 0;
                VISIT_EDGE[ai] = (i << EDGE_SHIFT) | ACTIVE_EDGE;
            }
        }
    }
    // backwards update lagrange multipliers
    for (let ptr = visitPtr - 1; ptr >= 0; --ptr) {
        const ai = TO_VISIT[ptr];
        const edge = VISIT_EDGE[ai];
        const dlambda = DLAMBDA[ai];
        const edgeType = edge & EDGE_MASK;
        const edgeIndex = edge >>> EDGE_SHIFT;
        if (edgeType === ACTIVE_EDGE) {
            const c = adj[edgeIndex];
            c.lambda += dlambda;
            DLAMBDA[c.bi] += dlambda;
        }
        else if (edgeType === TERRAIN_EDGE) {
            terrainLambda[edgeIndex] += dlambda;
        }
        else if (edgeType === FIXED_EDGE) {
            fixLambda[edgeIndex] += dlambda;
        }
    }
}
function solveAxis(v, active, fixed, terrain) {
    active.solve(def_1.ACTIVE_ITER_COUNT, v);
    solveShockAxis(v, active, fixed, terrain);
}
function iterateAxisCollisions(v, active, fixed, terrain) {
    solveShockAxis(v, active, fixed, terrain);
    active.solve(def_1.ACTIVE_ITER_COUNT, v);
}
function solveShockAxis(v, activeContacts, fixedContacts, terrainContacts) {
    solveShockOut(v, activeContacts.outC, activeContacts.outIndex, fixedContacts.outA, fixedContacts.outBias, fixedContacts.outLambda, terrainContacts.outA, terrainContacts.outBias, terrainContacts.outLambda);
    solveShockIn(v, activeContacts.inC, activeContacts.inIndex, fixedContacts.inA, fixedContacts.inBias, fixedContacts.inLambda, terrainContacts.inA, terrainContacts.inBias, terrainContacts.inLambda);
}
function applyFriction() {
    // Y
    active_contact_1.ACTIVE_Y_CONTACTS.applyFriction(prepare_bodies_1.DZ, prepare_bodies_1.DX);
    terrain_contact_1.TERRAIN_Y_CONTACTS.applyFrictionMotor(prepare_bodies_1.DZ, prepare_bodies_1.DX);
    fixed_contact_1.FIXED_Y_CONTACTS.applyFriction(prepare_bodies_1.DZ, prepare_bodies_1.DX, prepare_bodies_1.FIX_DZ, prepare_bodies_1.FIX_DX);
    // X
    active_contact_1.ACTIVE_X_CONTACTS.applyFriction(prepare_bodies_1.DY, prepare_bodies_1.DZ);
    terrain_contact_1.TERRAIN_X_CONTACTS.applyFriction(prepare_bodies_1.DY, prepare_bodies_1.DZ);
    fixed_contact_1.FIXED_X_CONTACTS.applyFriction(prepare_bodies_1.DY, prepare_bodies_1.DZ, prepare_bodies_1.FIX_DY, prepare_bodies_1.FIX_DZ);
    // Z
    active_contact_1.ACTIVE_Z_CONTACTS.applyFriction(prepare_bodies_1.DX, prepare_bodies_1.DY);
    terrain_contact_1.TERRAIN_Z_CONTACTS.applyFriction(prepare_bodies_1.DX, prepare_bodies_1.DY);
    fixed_contact_1.FIXED_Z_CONTACTS.applyFriction(prepare_bodies_1.DX, prepare_bodies_1.DY, prepare_bodies_1.FIX_DX, prepare_bodies_1.FIX_DY);
}
//# sourceMappingURL=index.js.map