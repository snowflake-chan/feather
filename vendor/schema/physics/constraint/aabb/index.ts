import type { VoxelCollision } from '../../../voxel/voxel-collision-schema';
import { collideSolid } from '../../../voxel/voxel-collision';

import { sweepSweepIntersect, boxSweepIntersect } from '../../box-collide';
import { testCollisionFilter } from '../../collision-filter';
import {
  ACTIVE_GROUP,
  X0,
  Y0,
  Z0,
  X1,
  Y1,
  Z1,
  RX,
  RY,
  RZ,
  DX,
  DY,
  DZ,
  ArrayType,
  INV_MASS,
  ACTIVE_BODIES,
  FIX_GROUP,
  FIX_X0,
  FIX_Y0,
  FIX_Z0,
  FIX_X1,
  FIX_Y1,
  FIX_Z1,
  FIX_RX,
  FIX_RY,
  FIX_RZ,
  MASS,
  FIX_DX,
  FIX_DY,
  FIX_DZ,
  TERRAIN_HITS,
  ACTIVE_BOXES,
} from '../../prepare-bodies';
import { MAX_BODIES, VOXEL_EPSILON, ACTIVE_ITER_COUNT } from '../../def';
import {
  ACTIVE_X_CONTACTS,
  ACTIVE_Y_CONTACTS,
  ACTIVE_Z_CONTACTS,
  clearActiveContacts,
} from './active-contact';
import type { ActiveContact, ActiveContactSet } from './active-contact';
import {
  FIXED_X_CONTACTS,
  FIXED_Y_CONTACTS,
  FIXED_Z_CONTACTS,
  clearFixedContacts,
} from './fixed-contact';
import type { FixedContactSet } from './fixed-contact';
import {
  TERRAIN_X_CONTACTS,
  TERRAIN_Y_CONTACTS,
  TERRAIN_Z_CONTACTS,
  clearTerrainContacts,
} from './terrain-contact';
import type { TerrainContactSet } from './terrain-contact';

import { ContactConstraint } from '../interface';

export class AABBContact implements ContactConstraint {
  public clearContacts(): void {
    clearActiveContacts();
    clearFixedContacts();
    clearTerrainContacts();
  }

  public sortContacts(): void {
    ACTIVE_X_CONTACTS.sort();
    ACTIVE_Y_CONTACTS.sort();
    ACTIVE_Z_CONTACTS.sort();
  }

  public updateContactIndex(): void {
    // X
    ACTIVE_X_CONTACTS.updateIndex(0);
    FIXED_X_CONTACTS.updateIndex(0);
    TERRAIN_X_CONTACTS.updateIndex(0);
    // Y
    ACTIVE_Y_CONTACTS.updateIndex(1);
    FIXED_Y_CONTACTS.updateIndex(1);
    TERRAIN_Y_CONTACTS.updateIndex(1);
    // Z
    ACTIVE_Z_CONTACTS.updateIndex(2);
    FIXED_Z_CONTACTS.updateIndex(2);
    TERRAIN_Z_CONTACTS.updateIndex(2);
  }

  public propagateLocks(): void {
    ACTIVE_X_CONTACTS.propagateLocks();
    ACTIVE_Y_CONTACTS.propagateLocks();
    ACTIVE_Z_CONTACTS.propagateLocks();
  }

  public processActiveContact(
    ai: number,
    bi: number,
    filter: number[][],
  ): void {
    // 碰撞组过滤
    if (!testCollisionFilter(filter, ACTIVE_GROUP[ai], ACTIVE_GROUP[bi])) {
      return;
    }

    const hit = sweepSweepIntersect(
      X0[ai],
      Y0[ai],
      Z0[ai],
      X1[ai],
      Y1[ai],
      Z1[ai],
      RX[ai],
      RY[ai],
      RZ[ai],
      X0[bi],
      Y0[bi],
      Z0[bi],
      X1[bi],
      Y1[bi],
      Z1[bi],
      RX[bi],
      RY[bi],
      RZ[bi],
    );

    if (!hit.collides) {
      return;
    }

    const { axis, flip, depth } = hit;

    if (axis === 0) {
      ACTIVE_X_CONTACTS.push(flip, ai, bi, DX, depth);
    } else if (axis === 1) {
      ACTIVE_Y_CONTACTS.push(flip, ai, bi, DY, depth);
    } else if (axis === 2) {
      ACTIVE_Z_CONTACTS.push(flip, ai, bi, DZ, depth);
    }
  }
  public processFixedContact(ai: number, fi: number, filter: number[][]): void {
    if (!testCollisionFilter(filter, ACTIVE_GROUP[ai], FIX_GROUP[fi])) {
      return;
    }
    const hit = sweepSweepIntersect(
      X0[ai],
      Y0[ai],
      Z0[ai],
      X1[ai],
      Y1[ai],
      Z1[ai],
      RX[ai],
      RY[ai],
      RZ[ai],
      FIX_X0[fi],
      FIX_Y0[fi],
      FIX_Z0[fi],
      FIX_X1[fi],
      FIX_Y1[fi],
      FIX_Z1[fi],
      FIX_RX[fi],
      FIX_RY[fi],
      FIX_RZ[fi],
    );

    if (!hit.collides) {
      return;
    }

    const { axis, flip, depth } = hit;

    if (axis === 0) {
      FIXED_X_CONTACTS.push(flip, ai, fi, DX, FIX_DX, depth);
    } else if (axis === 1) {
      FIXED_Y_CONTACTS.push(flip, ai, fi, DY, FIX_DY, depth);
    } else if (axis === 2) {
      FIXED_Z_CONTACTS.push(flip, ai, fi, DZ, FIX_DZ, depth);
    }
  }

  public findTerrainContacts(geom: VoxelCollision): void {
    for (let i = 0; i < ACTIVE_BOXES.length; ++i) {
      const box = ACTIVE_BOXES[i];
      TERRAIN_HITS.length = 0;
      collideSolid(
        TERRAIN_HITS,
        geom,
        box.minX - VOXEL_EPSILON,
        box.minY - VOXEL_EPSILON,
        box.minZ - VOXEL_EPSILON,
        box.maxX + VOXEL_EPSILON,
        box.maxY + VOXEL_EPSILON,
        box.maxZ + VOXEL_EPSILON,
      );
      if (TERRAIN_HITS.length === 0) {
        continue;
      }
      const x0 = X0[i];
      const y0 = Y0[i];
      const z0 = Z0[i];
      const x1 = X1[i];
      const y1 = Y1[i];
      const z1 = Z1[i];
      const rx = RX[i];
      const ry = RY[i];
      const rz = RZ[i];
      for (let j = 0; j < TERRAIN_HITS.length; ++j) {
        const hit = TERRAIN_HITS[j];
        const sweepHit = boxSweepIntersect(
          x0,
          y0,
          z0,
          x1,
          y1,
          z1,
          rx,
          ry,
          rz,
          hit.minX,
          hit.minY,
          hit.minZ,
          hit.maxX,
          hit.maxY,
          hit.maxZ,
          hit.faces,
        );
        if (sweepHit.collides) {
          const { axis, flip, depth } = sweepHit;
          if (axis === 0) {
            TERRAIN_X_CONTACTS.push(flip, i, hit, depth, DX);
          } else if (axis === 1) {
            if (!flip) {
              // special case for conveyor belts
              TERRAIN_Y_CONTACTS.pushMotor(i, hit, depth, DY);
            } else {
              TERRAIN_Y_CONTACTS.push(flip, i, hit, depth, DY);
            }
          } else if (axis === 2) {
            TERRAIN_Z_CONTACTS.push(flip, i, hit, depth, DZ);
          }
        }
      }
    }
  }

  public presolveCollisions(): void {
    iterateAxisCollisions(
      DY,
      ACTIVE_Y_CONTACTS,
      FIXED_Y_CONTACTS,
      TERRAIN_Y_CONTACTS,
    );
    iterateAxisCollisions(
      DX,
      ACTIVE_X_CONTACTS,
      FIXED_X_CONTACTS,
      TERRAIN_X_CONTACTS,
    );
    iterateAxisCollisions(
      DZ,
      ACTIVE_Z_CONTACTS,
      FIXED_Z_CONTACTS,
      TERRAIN_Z_CONTACTS,
    );

    applyFriction();
  }

  public solveCollisions(): void {
    solveAxis(DY, ACTIVE_Y_CONTACTS, FIXED_Y_CONTACTS, TERRAIN_Y_CONTACTS);
    solveAxis(DX, ACTIVE_X_CONTACTS, FIXED_X_CONTACTS, TERRAIN_X_CONTACTS);
    solveAxis(DZ, ACTIVE_Z_CONTACTS, FIXED_Z_CONTACTS, TERRAIN_Z_CONTACTS);
  }
}

function ALLOC(size: number) {
  return new Float32Array(size);
}
const TO_VISIT = new Uint32Array(MAX_BODIES);
const VISIT_EDGE = new Uint32Array(MAX_BODIES);
const DLAMBDA = ALLOC(MAX_BODIES);

const ACTIVE_EDGE = 1;
const FIXED_EDGE = 2;
const TERRAIN_EDGE = 3;
const EDGE_SHIFT = 2;
const EDGE_MASK = (1 << EDGE_SHIFT) - 1;

function clearLocked() {
  const N = ACTIVE_BODIES.length;
  for (let i = 0; i < N; ++i) {
    VISIT_EDGE[i] = 0;
  }
}

function solveShockOut(
  v: ArrayType,
  adj: ActiveContact[],
  adjIndex: Int32Array,
  fixA: number[],
  fixBias: number[],
  fixLambda: number[],
  terrainA: number[],
  terrainBias: number[],
  terrainLambda: number[],
) {
  // reset queue and visit flag
  clearLocked();
  let visitPtr = 0;

  // handle terrain contacts
  for (let i = 0; i < terrainA.length; ++i) {
    const ai = terrainA[i];
    const bias = terrainBias[i];
    const lambda = terrainLambda[i];
    const lambda1 = (terrainLambda[i] = Math.max(
      0,
      lambda + MASS[ai] * (bias - v[ai]),
    ));
    const dlambda = lambda1 - lambda;
    v[ai] += INV_MASS[ai] * dlambda;
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
    const lambda1 = (fixLambda[i] = Math.max(
      0,
      lambda + MASS[ai] * (bias - v[ai]),
    ));
    const dlambda = lambda1 - lambda;
    v[ai] += INV_MASS[ai] * dlambda;
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
      const bm = MASS[bi];
      const bmv = INV_MASS[bi];
      const lambda1 = (c.lambda = Math.max(
        0,
        lambda + bm * (bias + v[ai] - v[bi]),
      ));
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
    } else if (edgeType === TERRAIN_EDGE) {
      terrainLambda[edgeIndex] += dlambda;
    } else if (edgeType === FIXED_EDGE) {
      fixLambda[edgeIndex] += dlambda;
    }
  }
}

function solveShockIn(
  v: ArrayType,
  adj: ActiveContact[],
  adjIndex: Int32Array,
  fixB: number[],
  fixBias: number[],
  fixLambda: number[],
  terrainB: number[],
  terrainBias: number[],
  terrainLambda: number[],
) {
  // reset queue and visit flag
  clearLocked();
  let visitPtr = 0;

  // handle terrain contacts
  for (let i = 0; i < terrainB.length; ++i) {
    const bi = terrainB[i];
    const bias = terrainBias[i];
    const lambda = terrainLambda[i];
    const lambda1 = (terrainLambda[i] = Math.max(
      0,
      lambda + MASS[bi] * (bias + v[bi]),
    ));
    v[bi] -= INV_MASS[bi] * (lambda1 - lambda);
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
    const lambda1 = (fixLambda[i] = Math.max(
      0,
      lambda + MASS[bi] * (bias + v[bi]),
    ));
    v[bi] -= INV_MASS[bi] * (lambda1 - lambda);
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
      const am = MASS[ai];
      const amv = INV_MASS[ai];
      const lambda1 = (c.lambda = Math.max(
        0,
        lambda + am * (bias + v[ai] - v[bi]),
      ));
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
    } else if (edgeType === TERRAIN_EDGE) {
      terrainLambda[edgeIndex] += dlambda;
    } else if (edgeType === FIXED_EDGE) {
      fixLambda[edgeIndex] += dlambda;
    }
  }
}

function solveAxis(
  v: ArrayType,
  active: ActiveContactSet,
  fixed: FixedContactSet,
  terrain: TerrainContactSet,
) {
  active.solve(ACTIVE_ITER_COUNT, v);
  solveShockAxis(v, active, fixed, terrain);
}

function iterateAxisCollisions(
  v: ArrayType,
  active: ActiveContactSet,
  fixed: FixedContactSet,
  terrain: TerrainContactSet,
) {
  solveShockAxis(v, active, fixed, terrain);
  active.solve(ACTIVE_ITER_COUNT, v);
}

function solveShockAxis(
  v: ArrayType,
  activeContacts: ActiveContactSet,
  fixedContacts: FixedContactSet,
  terrainContacts: TerrainContactSet,
) {
  solveShockOut(
    v,
    activeContacts.outC,
    activeContacts.outIndex,
    fixedContacts.outA,
    fixedContacts.outBias,
    fixedContacts.outLambda,
    terrainContacts.outA,
    terrainContacts.outBias,
    terrainContacts.outLambda,
  );
  solveShockIn(
    v,
    activeContacts.inC,
    activeContacts.inIndex,
    fixedContacts.inA,
    fixedContacts.inBias,
    fixedContacts.inLambda,
    terrainContacts.inA,
    terrainContacts.inBias,
    terrainContacts.inLambda,
  );
}

function applyFriction() {
  // Y
  ACTIVE_Y_CONTACTS.applyFriction(DZ, DX);
  TERRAIN_Y_CONTACTS.applyFrictionMotor(DZ, DX);
  FIXED_Y_CONTACTS.applyFriction(DZ, DX, FIX_DZ, FIX_DX);
  // X
  ACTIVE_X_CONTACTS.applyFriction(DY, DZ);
  TERRAIN_X_CONTACTS.applyFriction(DY, DZ);
  FIXED_X_CONTACTS.applyFriction(DY, DZ, FIX_DY, FIX_DZ);
  // Z
  ACTIVE_Z_CONTACTS.applyFriction(DX, DY);
  TERRAIN_Z_CONTACTS.applyFriction(DX, DY);
  FIXED_Z_CONTACTS.applyFriction(DX, DY, FIX_DX, FIX_DY);
}
