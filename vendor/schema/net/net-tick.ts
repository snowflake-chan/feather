import {
  zipId,
  indexPred,
  compareId,
  getById,
  indexEqRange,
} from '@box/utils/id';
import { MuStruct, MuUint32, MuFloat64, MuBoolean } from '@box/mudb/schema';
import {
  NetInput,
  NetState,
  NetClientInput,
  TaggedNetClientInputSchema,
  NetClientInputSchema,
  TaggedNetClientInput,
  NetPositionCorrectionSchema,
} from './net-schema';
import {
  PhysicsParamsSchema,
  RigidBodySchema,
  RigidBody,
  RigidBodySetSchema,
  RigidBodyFlags,
  ContactIndex,
} from '../physics/physics-schema';
import {
  PlayerSchema,
  PlayerInputSchema,
  PlayerInputSet,
  PlayerSet,
  PlayerInput,
} from '../player/player-schema';
import {
  PhysicsZoneSetSchema,
  ZoneSelectorGroupSetSchema,
} from '../zone/zone-schema';
import { VoxelCollision } from '../voxel/voxel-collision-schema';
import { BlockIndex } from '../voxel/block-schema';

import { patchList, patchItem } from './delta';
import { PhysicsZoneIndex } from '../physics/zone-index';
import {
  solvePhysics,
  rebuildBodyTree,
  propagateLocks,
  clearBodyLocks,
  extractContactIndex,
} from '../physics/physics-solve';
import { CollisionFilterSchema } from '../physics/collision-filter';
import {
  applyPlayerInputForces,
  updatePlayerPhysics,
} from '../player/player-move';
import { sortedArrayDelete } from '../utils/sorted-array-remove';

const NetCorrectionTargetSchema = new MuStruct({
  id: new MuUint32(),
  authority: new MuBoolean(false),
  weight: new MuFloat64(0),

  px: new MuFloat64(),
  py: new MuFloat64(),
  pz: new MuFloat64(),

  vx: new MuFloat64(),
  vy: new MuFloat64(),
  vz: new MuFloat64(),
});
type NetCorrectionTarget = typeof NetCorrectionTargetSchema.identity;

const NET_TARGETS: NetCorrectionTarget[] = [];

// Clear out net target array, free all pending net targets
function clearNetTargets() {
  for (let i = 0; i < NET_TARGETS.length; ++i) {
    NetCorrectionTargetSchema.free(NET_TARGETS[i]);
  }
  NET_TARGETS.length = 0;
}

function scaleTarget(t: NetCorrectionTarget, w: number) {
  t.px *= w;
  t.py *= w;
  t.pz *= w;
  t.vx *= w;
  t.vy *= w;
  t.vz *= w;
}

function accumTarget(dst: NetCorrectionTarget, nt: NetCorrectionTarget) {
  const w = nt.weight;
  dst.px += w * nt.px;
  dst.py += w * nt.py;
  dst.pz += w * nt.pz;
  dst.vx += w * nt.vx;
  dst.vy += w * nt.vy;
  dst.vz += w * nt.vz;
  dst.weight += w;
}

// combine all net targets with the same id
function coallesceTargets() {
  NET_TARGETS.sort(compareId);
  let count = 0;
  let ptr = 0;
  while (ptr < NET_TARGETS.length) {
    const head = NET_TARGETS[ptr++];

    // 把速度和位置 * 一个 weight，不是自己就打0.25折
    scaleTarget(head, head.weight);
    // 合并相同ID数据。每一个客户端都会算一遍所有的target，一定会有重复ID
    while (ptr < NET_TARGETS.length) {
      const x = NET_TARGETS[ptr];
      if (x.id !== head.id) {
        break;
      }
      accumTarget(head, x);
      NetCorrectionTargetSchema.free(x);
      head.authority = false;
      ptr++;
    }

    // 加完后按比例又✖️回来了
    scaleTarget(head, 1 / head.weight);
    NET_TARGETS[count++] = head;
  }
  NET_TARGETS.length = count;
}

function updateInputSet(
  playerInputs: PlayerInputSet,
  removeIds: number[],
  upserts: PlayerSet,
) {
  sortedArrayDelete(PlayerInputSchema, playerInputs, removeIds);

  // append elements to list while not sorted
  let iptr = 0;
  let uptr = 0;
  const IN = playerInputs.length;
  const UN = upserts.length;
  while (iptr < IN && uptr < UN) {
    const a = playerInputs[iptr].id;
    const b = upserts[uptr].id;
    if (a < b) {
      iptr++;
    } else if (b < a) {
      const x = PlayerInputSchema.clone(PlayerInputSchema.identity);
      x.id = b;
      playerInputs.push(x);
      uptr++;
    } else {
      uptr++;
      iptr++;
    }
  }
  while (uptr < UN) {
    const x = PlayerInputSchema.clone(PlayerInputSchema.identity);
    x.id = upserts[uptr++].id;
    playerInputs.push(x);
  }
  if (playerInputs.length !== IN) {
    playerInputs.sort(compareId);
  }
}

//
// input stores transitions from tick t to t + 1
//

function handlePlayerInput(
  clientInput: TaggedNetClientInput,
  input: PlayerInput,
) {
  const { inputState, inputAngle, inputPitch, inputCameraAngle, bodies } =
    clientInput.input;
  input.state = inputState;
  input.angle = inputAngle;
  input.pitch = inputPitch;
  input.cameraAngle = inputCameraAngle;

  // push all the correction terms into the queue
  for (let i = 0; i < bodies.length; ++i) {
    const inputBody = bodies[i];
    const target = NetCorrectionTargetSchema.alloc();
    NetPositionCorrectionSchema.assign(target, inputBody);
    // 表示当前用户的物理模型，就有authority了，weight也等于1了
    if (inputBody.id === clientInput.id) {
      target.weight = 1;
      target.authority = true;
    } else {
      target.weight = 0.25;
      target.authority = false;
    }
    NET_TARGETS.push(target);
  }
}

function applyPositionCorrection(
  targets: NetCorrectionTarget[],
  bodies: RigidBody[],
  predictedBodies: RigidBody[],
) {
  let bodyLo = 0;
  const bodyHi = bodies.length - 1;

  // discard corrections for locked bodies
  let targetPtr = 0;
  for (let i = 0; i < targets.length; ++i) {
    const target = targets[i];
    target.weight = 0;

    // search next body pointer
    const bodyPtr = indexEqRange(bodies, target.id, bodyLo, bodyHi);
    if (bodyPtr < 0) {
      NetCorrectionTargetSchema.free(target);
      continue;
    }
    bodyLo = bodyPtr;

    // find next body
    const body = bodies[bodyPtr];
    if (
      body.flags &
      (RigidBodyFlags.LOCKED | RigidBodyFlags.FIXED | RigidBodyFlags.ANIMATED)
    ) {
      NetCorrectionTargetSchema.free(target);
      continue;
    }

    // read predicted body
    const predicted = predictedBodies[bodyPtr];

    // apply velocity impulse correction factor
    body.vx += target.px - predicted.px;
    body.vy += target.py - predicted.py;
    body.vz += target.pz - predicted.pz;

    target.weight = 1;

    //append to list
    targets[targetPtr++] = target;
  }
  targets.length = targetPtr;
}

function applyVelocityCorrection(
  targets: NetCorrectionTarget[],
  bodies: RigidBody[],
) {
  let bodyLo = 0;
  const bodyHi = bodies.length - 1;

  for (let i = 0; i < targets.length; ++i) {
    const target = targets[i];
    if (target.weight > 0) {
      // walk body pointer
      const bodyPtr = indexEqRange(bodies, target.id, bodyLo, bodyHi);
      if (bodyPtr < 0) {
        continue;
      }
      bodyLo = bodyPtr;

      // find next body
      const body = bodies[bodyPtr];
      body.vx = target.vx;
      body.vy = target.vy;
      body.vz = target.vz;
      if (target.authority) {
        body.px = target.px;
        body.py = target.py;
        body.pz = target.pz;
      }
    }
  }
}

export function netTick(
  netState: NetState,
  netInput: NetInput,
  blockIndex: BlockIndex,
  collision: VoxelCollision,
  contact: ContactIndex,
  zoneIndex: PhysicsZoneIndex,
  updateLocks: boolean,
  fullContact: boolean,
) {
  // copy input data from server corrections to netState
  patchList(PlayerSchema, netState.players, netInput.playerDelta);
  patchList(RigidBodySchema, netState.bodies, netInput.bodyDelta);
  patchItem(PhysicsParamsSchema, netState.physics, netInput.physicsDelta);

  // update filter
  if (netInput.filterChanged) {
    CollisionFilterSchema.assign(netState.collisionFilter, netInput.filter);
  }

  // update zones
  if (netInput.zoneChanged) {
    ZoneSelectorGroupSetSchema.assign(
      netState.zoneSelectors,
      netInput.zoneSelectors,
    );
    PhysicsZoneSetSchema.assign(netState.zones, netInput.zones);
  }

  // rebuild zone index
  zoneIndex.rebuild(netState.zones, netState.zoneSelectors);

  // update netstate input set (dumb hack)
  updateInputSet(
    netState.playerInputs,
    netInput.playerDelta.remove,
    netInput.playerDelta.upserts,
  );

  // lock any bodies which were updated by server
  if (updateLocks) {
    clearBodyLocks(netState.bodies);
    const upserts = netInput.bodyDelta.upserts;
    for (let i = 0; i < upserts.length; ++i) {
      const body = getById(netState.bodies, upserts[i].id);
      if (body && !(body.flags & RigidBodyFlags.ANIMATED)) {
        body.flags |= RigidBodyFlags.LOCKED;
      }
    }
  }

  // copy input data from clients into player structure
  clearNetTargets();
  if (netInput.clients.length === 1) {
    const playerInput = getById(netState.playerInputs, netInput.clients[0].id);
    if (playerInput) {
      handlePlayerInput(netInput.clients[0], playerInput);
    }
  } else if (netInput.clients.length > 1) {
    // 每一个有输入的客户端都算一遍
    zipId(handlePlayerInput, netInput.clients, netState.playerInputs);
  }
  // 相同ID按比例合并数据
  coallesceTargets();

  // apply player input forces
  applyPlayerInputForces(
    netState.bodies,
    netState.players,
    netState.playerInputs,
    1,
    netState.physics.velocityDamping,
    netState.physics.gravity,
  );
  const iterCount = netState.physics.useOBB ? 4 : 1;

  if (NET_TARGETS.length > 0) {
    // first compute predicted positions
    const predictedBodies = RigidBodySetSchema.clone(netState.bodies);
    // solve(netState.physics, predictedBodies, 1, collision, false);
    for (let i = 0; i < iterCount; i++) {
      solvePhysics(
        netState.physics,
        predictedBodies,
        1 / iterCount,
        blockIndex,
        collision,
        netState.collisionFilter,
        zoneIndex,
      );
    }

    // using predicted positions we then compute a minimal virtual force to move objects to target states
    applyPositionCorrection(NET_TARGETS, netState.bodies, predictedBodies);

    // do an actual solve now to get the body states using virtual forces
    // solve(netState.physics, netState.bodies, 1, collision, true, contact);
    for (let i = 0; i < iterCount; i++) {
      solvePhysics(
        netState.physics,
        netState.bodies,
        1 / iterCount,
        blockIndex,
        collision,
        netState.collisionFilter,
        zoneIndex,
      );
    }

    // apply velocity correction factor
    applyVelocityCorrection(NET_TARGETS, netState.bodies);

    // release predicted body states
    RigidBodySetSchema.free(predictedBodies);
  } else {
    for (let i = 0; i < iterCount; i++) {
      solvePhysics(
        netState.physics,
        netState.bodies,
        1 / iterCount,
        blockIndex,
        collision,
        netState.collisionFilter,
        zoneIndex,
      );
    }
  }

  // update lock set
  if (updateLocks) {
    propagateLocks(netState.physics, true);
  }

  if (fullContact) {
    extractContactIndex(netState.physics, netState.bodies, contact);
  } else {
    extractContactIndex(netState.physics, netState.players, contact);
  }

  // update player flags
  const bodyBush = rebuildBodyTree(netState.bodies);
  updatePlayerPhysics(
    blockIndex,
    netState.players,
    netState.playerInputs,
    contact,
    netState.bodies,
    collision,
    bodyBush,
  );

  // snap net state to serialized form
  return netState;
}

// merge input from a client
export function mergeNetInput(
  input: NetInput,
  id: number,
  clientInput: NetClientInput,
  allowBodyUpdates: boolean,
) {
  const clients = input.clients;
  const idx = indexPred(clients, id);

  // check search
  let entry: TaggedNetClientInput;
  if (0 <= idx && idx < clients.length && clients[idx].id === id) {
    entry = clients[idx];
  } else {
    entry = TaggedNetClientInputSchema.alloc();
    entry.id = id;
    clients.splice(idx + 1, 0, entry);
  }

  if (allowBodyUpdates) {
    NetClientInputSchema.assign(entry.input, clientInput);
  } else {
    entry.input.inputAngle = clientInput.inputAngle;
    entry.input.inputState = clientInput.inputState;
    entry.input.inputPitch = clientInput.inputPitch;
    entry.input.inputCameraAngle = clientInput.inputCameraAngle;
    entry.input.bodies.length = 0;
  }
}
