import {
  ParticleWorkerMessage,
  ParticleWorkerTickSchema,
  ParticleWorkerEmitter,
  ParticleWorkerGroupInfo,
  ParticleWorkerGroupHeaderSchema,
  ParticleWorkerGroupSchema,
} from './particle-worker-protocol';
import {
  freeBuffer,
  MuBuffer,
  MuReadStream,
  MuWriteStream,
} from '@box/mudb/stream';
import { alloc, free } from '../utils/pool';
import { compareId } from '@box/utils/id';

// particle format:
//
//  x, y, z, lifeStart
//  vx, vy, vz, lifeEnd
//
const PARTICLE_DIMENSION = 8;
const PARTICLE_BYTES = PARTICLE_DIMENSION * 4;

class WorkerParticleGroup {
  public id = 0;
  public count = 0;
  public particles = new Float32Array(alloc(1024));

  public bytes: Uint8Array;

  constructor() {
    this.bytes = new Uint8Array(this.particles.buffer);
  }

  public realloc(n: number) {
    if (n < this.particles.length) {
      return;
    }
    const next = new Float32Array(alloc(4 * n));
    next.set(this.particles);

    free(this.particles.buffer);

    this.particles = next;
    this.bytes = new Uint8Array(next.buffer);
  }

  public emit(
    count: number,
    tick: number,
    minX: number,
    minY: number,
    minZ: number,
    spreadX: number,
    spreadY: number,
    spreadZ: number,
    minVX: number,
    minVY: number,
    minVZ: number,
    spreadVX: number,
    spreadVY: number,
    spreadVZ: number,
    minLifetime: number,
    spreadLifetime: number,
  ) {
    let ptr = this.count;
    const particles = this.particles;
    for (let i = 0; i < count; ++i) {
      const t0 = tick + 0.25 * Math.random();
      particles[ptr++] = minX + Math.random() * spreadX;
      particles[ptr++] = minY + Math.random() * spreadY;
      particles[ptr++] = minZ + Math.random() * spreadZ;
      particles[ptr++] = t0;
      particles[ptr++] = minVX + Math.random() * spreadVX;
      particles[ptr++] = minVY + Math.random() * spreadVY;
      particles[ptr++] = minVZ + Math.random() * spreadVZ;
      particles[ptr++] = t0 + minLifetime + Math.random() * spreadLifetime;
    }
    this.count = ptr;
  }
}

const groups: WorkerParticleGroup[] = [];
const groupIndex: { [id: number]: WorkerParticleGroup } = {};

function clearParticles() {
  for (let i = 0; i < groups.length; ++i) {
    groups[i].count = 0;
  }
}

function removeDeadParticles(now: number) {
  for (let i = 0; i < groups.length; ++i) {
    // loop over particles in group, compact dead particles
    const g = groups[i];
    const { count, particles } = g;
    let r = 0;
    for (let ptr = 0; ptr < count; ptr += PARTICLE_DIMENSION) {
      if (now < particles[ptr + 7]) {
        if (r !== ptr) {
          particles[r] = particles[ptr];
          particles[r + 1] = particles[ptr + 1];
          particles[r + 2] = particles[ptr + 2];
          particles[r + 3] = particles[ptr + 3];
          particles[r + 4] = particles[ptr + 4];
          particles[r + 5] = particles[ptr + 5];
          particles[r + 6] = particles[ptr + 6];
          particles[r + 7] = particles[ptr + 7];
        }
        r += PARTICLE_DIMENSION;
      }
    }
    g.count = r;
  }
}

function emitParticles(
  tick: number,
  emitters: ParticleWorkerEmitter[],
  maxParticles: number,
  deltaT: number,
) {
  let remainingParticles = maxParticles;
  for (let i = 0; i < emitters.length; ++i) {
    const emitter = emitters[i];
    const emitVal = Math.floor(
      Math.random() +
        deltaT * (Math.random() * emitter.spreadEmit + emitter.minEmit),
    );
    const id = emitter.id;
    let g = groupIndex[id];

    if (g) {
      g.count = Math.min(g.count, remainingParticles * PARTICLE_DIMENSION);
      remainingParticles -= (g.count / PARTICLE_DIMENSION) | 0;
    }

    // clamp emit count
    const count = Math.min(emitVal, remainingParticles);

    // if count is 0, skip
    if (count <= 0) {
      continue;
    }

    // allocate new group if necessary
    if (!g) {
      groupIndex[id] = g = new WorkerParticleGroup();
      groups.push(g);
      g.id = id;
    }

    // emit particles
    g.realloc(g.count + PARTICLE_DIMENSION * count);
    g.emit(
      count,
      tick,
      emitter.minX,
      emitter.minY,
      emitter.minZ,
      emitter.spreadX,
      emitter.spreadY,
      emitter.spreadZ,
      emitter.minVX,
      emitter.minVY,
      emitter.minVZ,
      emitter.spreadVX,
      emitter.spreadVY,
      emitter.spreadVZ,
      emitter.minLifetime,
      emitter.spreadLifetime,
    );
  }
}

function removeEmptyGroups() {
  let ptr = 0;
  for (let i = 0; i < groups.length; ++i) {
    const g = groups[i];
    if (g.count > 0) {
      groups[ptr++] = g;
    } else {
      free(g.particles.buffer);
      delete groupIndex[g.id];
    }
  }
  groups.length = ptr;
}

function coallesceGroups(groupInfo: ParticleWorkerGroupInfo[]) {
  let total = 0;
  for (let i = 0; i < groups.length; ++i) {
    const { count, id } = groups[i];
    const pcount = (count / PARTICLE_DIMENSION) | 0;
    const info = ParticleWorkerGroupSchema.alloc();
    info.id = id;
    info.count = pcount;
    info.offset = total;
    groupInfo.push(info);

    total += pcount;
  }
  return total;
}

function serializeParticles(
  stream: MuWriteStream,
  groupInfo: ParticleWorkerGroupInfo[],
) {
  for (let i = 0; i < groups.length; ++i) {
    const g = groups[i];
    const info = groupInfo[i];
    if (info.count > 0) {
      stream.buffer.uint8.set(
        g.bytes.subarray(0, PARTICLE_BYTES * info.count),
        stream.offset + PARTICLE_BYTES * info.offset,
      );
    }
  }
}

addEventListener('message', function (ev) {
  const data: ParticleWorkerMessage = ev.data;

  // return buffers to pool
  for (let i = 0; i < data.free.length; ++i) {
    freeBuffer(new MuBuffer(data.free[i]));
  }

  // parse packet
  const stream = new MuReadStream(new Uint8Array(data.message));
  const packet = ParticleWorkerTickSchema.patch(
    ParticleWorkerTickSchema.identity,
    stream,
  );

  // update particles
  if (packet.reset) {
    clearParticles();
  } else {
    removeDeadParticles(packet.now);
    emitParticles(
      packet.now,
      packet.emitters,
      packet.maxParticles,
      packet.deltaT,
    );
  }
  removeEmptyGroups();
  groups.sort(compareId);

  // clamp group count
  while (groups.length > packet.maxGroups) {
    const g = groups.pop();
    if (g) {
      free(g.particles.buffer);
      delete groupIndex[g.id];
    }
  }

  // serialize packet state data
  const headers = ParticleWorkerGroupHeaderSchema.alloc();
  const totalCount = coallesceGroups(headers.groups);
  headers.count = totalCount;
  const result = new MuWriteStream(
    32 + headers.groups.length * 32 + PARTICLE_BYTES * totalCount,
  );
  if (
    totalCount > 0 &&
    ParticleWorkerGroupHeaderSchema.diff(
      ParticleWorkerGroupHeaderSchema.identity,
      headers,
      result,
    )
  ) {
    // write bytes into stream
    result.grow(PARTICLE_BYTES * totalCount);
    serializeParticles(result, headers.groups);

    // send packet back to server
    postMessage(
      {
        message: result.buffer.buffer,
        free: [data.message],
      },
      [result.buffer.buffer, data.message],
    );
  } else {
    result.destroy();
    postMessage(
      {
        message: null,
        free: [data.message],
      },
      [data.message],
    );
  }

  ParticleWorkerTickSchema.free(packet);
  ParticleWorkerGroupHeaderSchema.free(headers);
});
