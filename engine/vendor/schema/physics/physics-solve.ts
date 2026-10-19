import { VoxelCollision } from '../voxel/voxel-collision-schema';
import {
  RigidBodyFlags,
  RigidBody,
  ContactIndex,
  PhysicsParams,
  RigidBodySet,
  ContactRecordSchema,
  VoxelContactSchema,
  BodyContactSchema,
} from './physics-schema';
import {
  compactContactIndex,
  addFluidContactRecord,
} from './contact-controller';

import {
  BodyCollisionBox,
  clearNodePool,
  createBodyRBush,
  resolveBodyCollisions,
  resolveSelfBodyCollisions,
} from './body-rbush';
import { BlockIndex } from '../voxel/block-schema';
import { TaggedId } from '@box/utils/id';
import { CollisionFilter } from './collision-filter';
import { PhysicsZoneIndex } from './zone-index';

import { AABBContactConstraint, OBBContactConstraint } from './constraint';

import {
  X0,
  Y0,
  Z0,
  DX,
  DY,
  DZ,
  ACTIVE_BODIES,
  ACTIVE_CONTACTS,
  FIXED_CONTACTS,
  FIXED_BODIES,
  ACTIVE_BOXES,
  BOX_POOL,
  FIXED_BOXES,
  updateGlobalVariables,
  prepareBodies,
  DT,
  AX,
  AY,
  AZ,
  FLUID_CONTACTS,
  QX,
  QY,
  QZ,
  QW,
} from './prepare-bodies';
import {
  ISLAND_PARENT,
  LOCK_ISLAND,
  ISLAND_RANK,
  islandFind,
  islandLink,
} from './lock-body';
import { clampVelocityAndSleep, calcQuatByVelocity } from './def';
import { ContactConstraint } from './constraint/interface';

export * from './def';

function getConstraint(physics: PhysicsParams) {
  return physics.useOBB ? OBBContactConstraint : AABBContactConstraint;
}

// external hack method, reuse internal body pool to build a collision structure for player movement queries
export function rebuildBodyTree(bodies: RigidBody[]) {
  const nodes: BodyCollisionBox[] = [];

  let ptr = 0;
  for (let i = 0; i < bodies.length; ++i) {
    const b = bodies[i];
    if (b.flags & RigidBodyFlags.COLLIDES) {
      const box = BOX_POOL[ptr++];
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

  clearNodePool();
  return createBodyRBush(nodes, 0, nodes.length - 1, 0);
}

const A_RESULT: number[] = [0];
const B_RESULT: number[] = [0];

function findContacts(
  constraint: ContactConstraint,
  geom: VoxelCollision,
  filter: CollisionFilter,
) {
  // clear contact list
  constraint.clearContacts();

  // if no bodies are active, then bail out
  if (ACTIVE_BODIES.length === 0) {
    return;
  }

  // generate active rbush
  clearNodePool();
  // 建立active的RTree
  // 创建R-tree，碰撞初筛都在里面算哦，好多优化
  const activeRBush = createBodyRBush(
    ACTIVE_BOXES,
    0,
    ACTIVE_BOXES.length - 1,
    0,
  );

  // find all active body collisions
  A_RESULT.length = 0;
  B_RESULT.length = 0;
  // 计算动态残影组成最大盒子静态碰撞结果
  resolveSelfBodyCollisions(A_RESULT, B_RESULT, activeRBush);
  // 仔细计算动态碰撞结果
  for (let i = 0; i < A_RESULT.length; ++i) {
    constraint.processActiveContact(A_RESULT[i], B_RESULT[i], filter);
  }

  // sort indexes
  constraint.sortContacts();

  // early out if no fixed collisions
  if (FIXED_BODIES.length > 0) {
    // find all fixed-active collisions
    const fixedRBush = createBodyRBush(
      FIXED_BOXES,
      0,
      FIXED_BOXES.length - 1,
      0,
    );
    A_RESULT.length = 0;
    B_RESULT.length = 0;
    resolveBodyCollisions(A_RESULT, B_RESULT, activeRBush, fixedRBush);
    for (let i = 0; i < A_RESULT.length; ++i) {
      constraint.processFixedContact(A_RESULT[i], B_RESULT[i], filter);
    }
  }

  // find all terrain contacts
  constraint.findTerrainContacts(geom);
}

function postIntegrateActive() {
  for (let i = 0; i < ACTIVE_BODIES.length; ++i) {
    const b = ACTIVE_BODIES[i];

    const vx = DX[i];
    const vy = DY[i];
    const vz = DZ[i];

    b.px = X0[i] + vx * DT;
    b.py = Y0[i] + vy * DT;
    b.pz = Z0[i] + vz * DT;

    b.vx = clampVelocityAndSleep(vx);
    b.vy = clampVelocityAndSleep(vy);
    b.vz = clampVelocityAndSleep(vz);

    b.ax = AX[i];
    b.ay = AY[i];
    b.az = AZ[i];

    const q: [number, number, number, number] = [QX[i], QY[i], QZ[i], QW[i]];
    calcQuatByVelocity(q, b.ax, b.ay, b.az, DT);
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
export function solvePhysics(
  physics: PhysicsParams,
  bodies: RigidBodySet,
  dt: number,
  blockIndex: BlockIndex,
  geom: VoxelCollision,
  filter: CollisionFilter,
  zones: PhysicsZoneIndex,
) {
  const constraint = getConstraint(physics);
  // update global variables
  updateGlobalVariables(physics, dt, blockIndex);

  // unpack body index
  // 就是数据清空然后重新设新数据到一堆数组里
  // 后面的计算就可以用上面事先算好的const数组
  prepareBodies(bodies, geom, zones);

  // find all contacts
  findContacts(constraint, geom, filter);

  // solve for forces using sequential impulses
  constraint.presolveCollisions();
  constraint.solveCollisions();

  // integrate final body position
  postIntegrateActive();
}

function unpackContactIndex(contactIndex: ContactIndex, entities: TaggedId[]) {
  const n = entities.length;
  if (contactIndex.length > n) {
    for (let i = n; i < contactIndex.length; ++i) {
      ContactRecordSchema.free(contactIndex[i]);
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
      BodyContactSchema.free(record.body[j]);
    }
    for (let j = 0; j < record.voxel.length; ++j) {
      VoxelContactSchema.free(record.voxel[j]);
    }

    record.body.length =
      record.voxel.length =
      record.fluidVolumeFraction.length =
      record.fluidVoxels.length =
        0;

    // update references
    while (
      activePtr < ACTIVE_BODIES.length &&
      ACTIVE_BODIES[activePtr].id < id
    ) {
      ACTIVE_CONTACTS[activePtr++] = null;
    }
    if (
      activePtr < ACTIVE_BODIES.length &&
      ACTIVE_BODIES[activePtr].id === id
    ) {
      ACTIVE_CONTACTS[activePtr++] = record;
    }
    while (fixedPtr < FIXED_BODIES.length && FIXED_BODIES[fixedPtr].id < id) {
      FIXED_CONTACTS[fixedPtr++] = null;
    }
    if (fixedPtr < FIXED_BODIES.length && FIXED_BODIES[fixedPtr].id === id) {
      FIXED_CONTACTS[fixedPtr++] = record;
    }
  }

  for (let i = contactIndex.length; i < n; ++i) {
    const record = ContactRecordSchema.alloc();
    const id = (record.id = entities[i].id);

    // clear buffers
    record.body.length =
      record.voxel.length =
      record.fluidVolumeFraction.length =
      record.fluidVoxels.length =
        0;

    // update references
    while (
      activePtr < ACTIVE_BODIES.length &&
      ACTIVE_BODIES[activePtr].id < id
    ) {
      ACTIVE_CONTACTS[activePtr++] = null;
    }
    if (
      activePtr < ACTIVE_BODIES.length &&
      ACTIVE_BODIES[activePtr].id === id
    ) {
      ACTIVE_CONTACTS[activePtr++] = record;
    }
    while (fixedPtr < FIXED_BODIES.length && FIXED_BODIES[fixedPtr].id < id) {
      FIXED_CONTACTS[fixedPtr++] = null;
    }
    if (fixedPtr < FIXED_BODIES.length && FIXED_BODIES[fixedPtr].id === id) {
      FIXED_CONTACTS[fixedPtr++] = record;
    }

    // append to queue
    contactIndex.push(record);
  }

  for (let i = activePtr; i < ACTIVE_BODIES.length; ++i) {
    ACTIVE_CONTACTS[i] = null;
  }

  for (let i = fixedPtr; i < FIXED_BODIES.length; ++i) {
    FIXED_CONTACTS[i] = null;
  }
}

function updateFluidContact(contactIndex: ContactIndex) {
  let contactPtr = 0;
  let fluidPtr = 0;

  while (fluidPtr < FLUID_CONTACTS.length && contactPtr < contactIndex.length) {
    const contact = contactIndex[contactPtr];
    const fluidId = FLUID_CONTACTS[fluidPtr];
    if (fluidId < contact.id) {
      fluidPtr += 3;
    } else if (contact.id < fluidId) {
      contactPtr += 1;
    } else {
      const block = FLUID_CONTACTS[fluidPtr + 1];
      const volume = FLUID_CONTACTS[fluidPtr + 2];

      // insertion sort into contact fluid record
      addFluidContactRecord(contact, block, volume);

      fluidPtr += 3;
    }
  }
}

export function extractContactIndex(
  physics: PhysicsParams,
  bodies: TaggedId[],
  contactIndex: ContactIndex,
) {
  // reallocate contact index
  unpackContactIndex(contactIndex, bodies);

  // update fluid contact
  updateFluidContact(contactIndex);

  // update regular contact index
  getConstraint(physics).updateContactIndex();

  // compact all contact index entries
  compactContactIndex(contactIndex);
}

// clear all locks on all rigid bodies
export function clearBodyLocks(bodies: RigidBodySet) {
  for (let i = 0; i < bodies.length; ++i) {
    bodies[i].flags &= ~RigidBodyFlags.LOCKED;
  }
}

// propagate locks directly
export function propagateLocks(physics: PhysicsParams, skipPlayers: boolean) {
  // create a sentinel island for locks
  ISLAND_PARENT[LOCK_ISLAND] = LOCK_ISLAND;
  ISLAND_RANK[LOCK_ISLAND] = 0;

  // first pass: loop over active objects, initialize links and parents.  connect locked objects to the lock island sentineal
  for (let i = 0; i < ACTIVE_BODIES.length; ++i) {
    const f = ACTIVE_BODIES[i].flags;
    if (skipPlayers && f & RigidBodyFlags.PLAYER) {
      ISLAND_PARENT[i] = -1;
      ISLAND_RANK[i] = 0;
    } else {
      ISLAND_PARENT[i] = i;
      ISLAND_RANK[i] = 0;
      if (f & RigidBodyFlags.LOCKED) {
        islandLink(i, LOCK_ISLAND);
      }
    }
  }

  // second pass: loop over all active contacts and update links in union-find data structure
  getConstraint(physics).propagateLocks();

  // final pass: set locked flag on all bodies in the locked set
  const locked = islandFind(LOCK_ISLAND);
  for (let i = 0; i < ACTIVE_BODIES.length; ++i) {
    if (islandFind(i) === locked) {
      ACTIVE_BODIES[i].flags |= RigidBodyFlags.LOCKED;
    }
  }
}
