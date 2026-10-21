import { GameClientState, GameClientAppState } from '../game-client-schema';
import {
  ClientParticleGroupSchema,
  ClientLocalEmitterSet,
  ClientLocalEmitter,
  ClientParticleGroupSetSchema,
  ClientParticleGroup,
  ClientParticlePendingSeedIds,
} from './particle-client-state';
import { vec4 } from 'gl-matrix';
import {
  ParticleWorkerTickSchema,
  ParticleWorkerEmitterSchema,
  ParticleWorkerMessage,
  ParticleWorkerGroupHeaderSchema,
  ParticleWorkerGroupInfo,
  ParticleWorkerGroupSchema,
} from './particle-worker-protocol';
import { zipId, compareId, getById, indexEqRange } from '@box/utils/id';
import {
  MuWriteStream,
  MuBuffer,
  freeBuffer,
  MuReadStream,
} from '@box/mudb/stream';
import { MS_PER_TICK } from '@box/schema/clock/clock-schema';
import { ParticleRenderer } from './interface';
import { GLParticleRenderer } from './gl-particle/gl-particle-controller';
import { GPUParticleRenderer } from './gpu-particle/gpu-particle-controller';

function unpackRGBA(rgbSize: vec4, color: number, size: number) {
  const s = (1 + (color >>> 24)) / 256;
  rgbSize[0] = s * (color & 0xff);
  rgbSize[1] = s * ((color >>> 8) & 0xff);
  rgbSize[2] = s * ((color >>> 16) & 0xff);
  rgbSize[3] = size;
}

export function updateLocalEmitters(
  state: GameClientState,
  localEmitters: ClientLocalEmitter[],
) {
  state.particles.localEmitters = ClientLocalEmitterSet.assign(
    state.particles.localEmitters,
    localEmitters,
  );
}

export function updateParticlePendingList(
  state: GameClientState,
  pendingSeedIds: typeof ClientParticlePendingSeedIds.identity,
) {
  ClientParticlePendingSeedIds.assign(
    state.particles.pendingSeedIds,
    pendingSeedIds,
  );
}

function syncParticleGroups(state: GameClientState) {
  const local = state.particles.particleBackGroups;
  const remote = state.replica.particles.prototypes;

  for (let i = 0; i < local.length; ++i) {
    local[i].live = false;
  }

  let needsSort = false;
  let localPtr = 0;
  const maxLocal = local.length - 1;
  for (let rptr = 0; rptr < remote.length; ++rptr) {
    const proto = remote[rptr];
    const id = proto.id << 1;

    let next: ClientParticleGroup;
    const nextIndex = indexEqRange(local, id, localPtr, maxLocal);
    if (nextIndex >= 0) {
      next = local[nextIndex];
      localPtr = nextIndex + 1;
    } else {
      next = ClientParticleGroupSchema.alloc();
      next.id = id;
      next.offset = 0;
      next.count = 0;
      local.push(next);
      needsSort = true;
    }

    next.live = true;
    next.targetId = proto.targetId;
    next.targetVector[0] =
      next.targetVector[1] =
      next.targetVector[2] =
      next.targetVector[3] =
        0;
    if (next.targetId) {
      next.targetVector[3] = proto.targetWeight;
    }

    next.forceNoise[0] = proto.acceleration[0];
    next.forceNoise[1] = proto.acceleration[1];
    next.forceNoise[2] = proto.acceleration[2];
    next.forceNoise[3] = proto.noiseAmpl;

    next.miscVector[0] = proto.noiseFreq / 64;
    next.miscVector[1] = proto.sizeSpread;
    next.miscVector[2] = Math.exp(proto.damping);
    next.miscVector[3] = 0; // temporarily unused

    unpackRGBA(next.rgbSize0, proto.color0 >>> 0, proto.size0);
    unpackRGBA(next.rgbSize1, proto.color1 >>> 0, proto.size1);
    unpackRGBA(next.rgbSize2, proto.color2 >>> 0, proto.size2);
    unpackRGBA(next.rgbSize3, proto.color3 >>> 0, proto.size3);
    unpackRGBA(next.rgbSize4, proto.color4 >>> 0, proto.size4);
  }

  // append editor particles
  if (!state.replica.running) {
    const editorParticles = state.particles.localEmitters;
    let nextPtr = 0;
    for (let eptr = 0; eptr < editorParticles.length; ++eptr) {
      const proto = editorParticles[eptr];
      const id = (proto.id << 1) + 1;

      let next: ClientParticleGroup;
      const nextIndex = indexEqRange(local, id, nextPtr, maxLocal);
      if (nextIndex >= 0) {
        next = local[nextIndex];
        nextPtr = nextIndex + 1;
      } else {
        next = ClientParticleGroupSchema.alloc();
        next.id = id;
        next.offset = next.count = 0;
        local.push(next);
        needsSort = true;
      }

      next.live = true;
      next.targetId = 0;
      next.targetVector[0] =
        next.targetVector[1] =
        next.targetVector[2] =
        next.targetVector[3] =
          0;

      next.forceNoise[0] = proto.acceleration[0];
      next.forceNoise[1] = proto.acceleration[1];
      next.forceNoise[2] = proto.acceleration[2];
      next.forceNoise[3] = proto.noiseAmpl;

      next.miscVector[0] = proto.noiseFreq / 64;
      next.miscVector[1] = proto.sizeSpread;
      next.miscVector[2] = Math.exp(proto.damping);
      next.miscVector[3] = 0;

      unpackRGBA(next.rgbSize0, proto.color0 >>> 0, proto.size0);
      unpackRGBA(next.rgbSize1, proto.color1 >>> 0, proto.size1);
      unpackRGBA(next.rgbSize2, proto.color2 >>> 0, proto.size2);
      unpackRGBA(next.rgbSize3, proto.color3 >>> 0, proto.size3);
      unpackRGBA(next.rgbSize4, proto.color4 >>> 0, proto.size4);
    }
  }

  // sort particles
  if (needsSort) {
    local.sort((a, b) => a.id - b.id);
  }

  // remove dead particles
  let ptr = 0;
  for (let i = 0; i < local.length; ++i) {
    const g = local[i];
    if (g.live || g.count > 0) {
      local[ptr++] = g;
    }
  }
  if (ptr !== local.length) {
    for (let i = local.length - 1; i >= ptr; --i) {
      ClientParticleGroupSchema.free(local[i]);
    }
    local.length = ptr;
  }
}

function syncParticleWorkerInfo(
  state: GameClientState,
  groupMeta: ParticleWorkerGroupInfo[],
) {
  const groups = state.particles.particleBackGroups;

  // clear count on all groups
  for (let i = 0; i < groups.length; ++i) {
    groups[i].count = 0;
  }

  // update meta data from worker
  zipId(
    (group, meta) => {
      group.offset = meta.offset;
      group.count = meta.count;
    },
    groups,
    groupMeta,
  );

  // remove dead groups
  let ptr = 0;
  for (let i = 0; i < groups.length; ++i) {
    const g = groups[i];
    if (g.count > 0) {
      groups[ptr++] = g;
    } else {
      ClientParticleGroupSchema.free(g);
    }
  }
  groups.length = ptr;
}

export function restoreParticles(state: GameClientState) {
  state.particles.particleBackGroups = ClientParticleGroupSetSchema.assign(
    state.particles.particleBackGroups,
    ClientParticleGroupSetSchema.identity,
  );
  state.particles.particleGroups = ClientParticleGroupSetSchema.assign(
    state.particles.particleBackGroups,
    ClientParticleGroupSetSchema.identity,
  );
}

let particleRenderer: ParticleRenderer = GLParticleRenderer;

export async function setupClientParticles(state: GameClientState) {
  if (state.gpu.rewgpu) {
    particleRenderer = GPUParticleRenderer;
  }

  particleRenderer.initBuffer(state);

  let pWorker: Worker;

  if (!process.env.RUSTY) {
    pWorker = new Worker(new URL('./particle.worker', import.meta.url));
  } else {
    pWorker = new Worker(`${__webpack_public_path__}/particle.worker.js`);
  }

  state.particles.worker = pWorker;

  pWorker.onmessage = function (ev) {
    // clear update flag
    state.particles.updateInProgress = false;

    // unpack message
    const data: ParticleWorkerMessage = ev.data;

    // return memory into message pool
    for (let i = 0; i < data.free.length; ++i) {
      freeBuffer(new MuBuffer(data.free[i]));
    }

    if (data.message) {
      // parse header
      const stream = new MuReadStream(new Uint8Array(data.message));

      // parse header from packet
      const header = ParticleWorkerGroupHeaderSchema.patch(
        ParticleWorkerGroupHeaderSchema.identity,
        stream,
      );
      syncParticleWorkerInfo(state, header.groups);

      // upload particle data
      const count = header.count;
      const offset = stream.offset;
      particleRenderer.updateParticleData(state, stream, count, offset);
      state.particles.swapNeeded = true;
      ParticleWorkerGroupHeaderSchema.free(header);
      state.particles.workerMemory.push(data.message);
    } else {
      syncParticleWorkerInfo(state, []);
      state.particles.swapNeeded = true;
    }
  };
}

function updateParticleTargets(state: GameClientState) {
  const groups = state.particles.particleGroups;
  for (let i = 0; i < groups.length; ++i) {
    const g = groups[i];
    const t = g.targetVector;
    if (g.targetId && t[3]) {
      const box = getById(state.renderBoxes, g.targetId);
      if (box) {
        t[0] = box.px;
        t[1] = box.py;
        t[2] = box.pz;
      }
    }
  }

  zipId(
    (front, back) => {
      vec4.copy(back.targetVector, front.targetVector);
    },
    groups,
    state.particles.particleBackGroups,
  );
}

export function tickClientParticles(state: GameClientState) {
  updateParticleTargets(state);

  const worker = state.particles.worker;
  if (
    !worker ||
    state.particles.updateInProgress ||
    state.appState !== GameClientAppState.CONNECTED ||
    (state.replica.particles.emitters.length === 0 &&
      state.particles.particleBackGroups.length === 0 &&
      !(state.replica.running || state.particles.localEmitters.length !== 0))
  ) {
    return;
  }

  // send new tick event to server
  syncParticleGroups(state);

  // prepare packet
  const packet = ParticleWorkerTickSchema.alloc();
  packet.reset = state.particles.resetNeeded;
  packet.now = (state.clock.tick * MS_PER_TICK) / 1000;
  packet.deltaT = Math.min(
    1,
    ((state.clock.tick - state.particles.lastUpdateTick) * MS_PER_TICK) / 1000,
  );
  packet.maxParticles = state.settings.maxParticles;
  packet.maxGroups = state.settings.maxParticleGroups;

  state.particles.resetNeeded = false;

  const emitters = packet.emitters;
  emitters.length = 0;
  zipId(
    (body, box, info) => {
      const emitter = ParticleWorkerEmitterSchema.alloc();
      emitter.id = info.particleId << 1;

      emitter.minEmit = info.emitRate;
      emitter.spreadEmit = info.emitSpread;

      emitter.minLifetime = info.lifetime;
      emitter.spreadLifetime = info.lifetimeSpread;

      const { px, py, pz, rx, ry, rz } = box;

      emitter.minX = px - rx;
      emitter.minY = py - ry;
      emitter.minZ = pz - rz;

      emitter.spreadX = 2 * rx;
      emitter.spreadY = 2 * ry;
      emitter.spreadZ = 2 * rz;

      const vx = body.vx + info.velocity[0];
      const vy = body.vy + info.velocity[1];
      const vz = body.vz + info.velocity[2];

      const vsx = info.velocitySpread[0];
      const vsy = info.velocitySpread[1];
      const vsz = info.velocitySpread[2];

      emitter.minVX = vx - 0.5 * vsx;
      emitter.minVY = vy - 0.5 * vsy;
      emitter.minVZ = vz - 0.5 * vsz;

      emitter.spreadVX = vsx;
      emitter.spreadVY = vsy;
      emitter.spreadVZ = vsz;

      emitters.push(emitter);
    },
    state.bodies,
    state.renderBoxes,
    state.replica.particles.emitters,
  );

  if (!state.replica.running) {
    const editorParticles = state.particles.localEmitters;
    for (let i = 0; i < editorParticles.length; ++i) {
      const info = editorParticles[i];
      const emitter = ParticleWorkerEmitterSchema.alloc();
      emitter.id = (info.id << 1) + 1;

      emitter.minEmit = info.emitRate;
      emitter.spreadEmit = info.emitSpread;

      emitter.minLifetime = info.lifetime;
      emitter.spreadLifetime = info.lifetimeSpread;

      const px = info.position[0];
      const py = info.position[1];
      const pz = info.position[2];

      const bx = info.bounds[0];
      const by = info.bounds[1];
      const bz = info.bounds[2];

      emitter.minX = px - bx;
      emitter.minY = py - by;
      emitter.minZ = pz - bz;

      emitter.spreadX = 2 * bx;
      emitter.spreadY = 2 * by;
      emitter.spreadZ = 2 * bz;

      const vx = info.velocity[0];
      const vy = info.velocity[1];
      const vz = info.velocity[2];

      const vsx = info.velocitySpread[0];
      const vsy = info.velocitySpread[1];
      const vsz = info.velocitySpread[2];

      emitter.minVX = vx - 0.5 * vsx;
      emitter.minVY = vy - 0.5 * vsy;
      emitter.minVZ = vz - 0.5 * vsz;

      emitter.spreadVX = vsx;
      emitter.spreadVY = vsy;
      emitter.spreadVZ = vsz;

      emitters.push(emitter);
    }
  }

  // sort by particle id
  emitters.sort(compareId);

  // send to worker
  const stream = new MuWriteStream(emitters.length * 18 * 4 + 16);
  ParticleWorkerTickSchema.diff(
    ParticleWorkerTickSchema.identity,
    packet,
    stream,
  );

  // send packet to worker
  const buffer = stream.buffer.buffer;
  const memory = state.particles.workerMemory.slice();
  memory.push(buffer);
  worker.postMessage(
    { message: buffer, free: state.particles.workerMemory },
    memory,
  );
  state.particles.workerMemory.length = 0;

  // set update in progress flag
  state.particles.updateInProgress = true;
  state.particles.lastUpdateTick = state.clock.tick;
}
