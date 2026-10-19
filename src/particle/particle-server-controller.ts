import { GameServerState } from '../game-server-schema';
import {
  ParticleEntitySchema,
  ParticleEmitterSchema,
  ParticleParameterSchema,
  ParticlePrototypeSchema,
  packColor,
} from '@box/schema/particle/particle-schema';
import {
  ServerParticlePrototypeSchema,
  compareParticleParams,
  ServerParticleStateSchema,
  ServerParticleEntitySchema,
} from './particle-server-state';
import { vec3 } from 'gl-matrix';
import { compareId } from '@box/utils/id';
import { MS_PER_TICK } from '@box/schema/clock/clock-schema';

export const MIN_PARTICLE_LIFETIME = 0;
export const MAX_PARTICLE_LIFETIME = 60;
export const MIN_PARTICLE_EMIT_RATE = 0;
export const MAX_PARTICLE_EMIT_RATE = 65536;
export const MIN_PARTICLE_LIMIT = 0;
export const MAX_PARTICLE_LIMIT = 65536;
export const MAX_PARTICLE_NOISE_AMPL = 256;
export const MAX_PARTICLE_NOISE_FREQ = 256;

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, +x || 0));
}

function syncParticleState(state: GameServerState) {
  const particles = state.particles.entities;
  const seeds = state.project.seeds;
  const entityToSeed = state.seed.entityToSeed;

  // clear old particle state
  state.particles.entities = ServerParticleStateSchema.muData.entities.assign(
    particles,
    [],
  );

  for (let i = 0; i < entityToSeed.length; ++i) {
    const { id, seedId } = entityToSeed[i];
    const seedEntry = seeds[seedId];

    if (!seedEntry || !seedEntry.particle) {
      continue;
    }

    const seed = seedEntry.particle;

    // check if particle available
    if (
      seed.rate + seed.rateSpread > 0 &&
      seed.limit > 0 &&
      seed.lifetime + seed.lifetimeSpread > 0
    ) {
      // create new particle component
      const particle = ServerParticleEntitySchema.alloc();

      particle.id = id;

      particle.lifetime = seed.lifetime;
      particle.lifetimeSpread = seed.lifetimeSpread;

      particle.emitRate = seed.rate;
      particle.emitSpread = seed.rateSpread;

      particle.color0 = packColor(seed.color0);
      particle.color1 = packColor(seed.color1);
      particle.color2 = packColor(seed.color2);
      particle.color3 = packColor(seed.color3);
      particle.color4 = packColor(seed.color4);

      particle.size0 = seed.size0;
      particle.size1 = seed.size1;
      particle.size2 = seed.size2;
      particle.size3 = seed.size3;
      particle.size4 = seed.size4;

      particle.damping = seed.damping;
      particle.countLimit = seed.limit;
      particle.sizeSpread = seed.sizeSpread;

      vec3.set(
        particle.velocity,
        seed.velocity.x,
        seed.velocity.y,
        seed.velocity.z,
      );
      vec3.set(
        particle.velocitySpread,
        seed.velocitySpread.x,
        seed.velocitySpread.y,
        seed.velocitySpread.z,
      );
      vec3.set(
        particle.acceleration,
        seed.acceleration.x,
        seed.acceleration.y,
        seed.acceleration.z,
      );
      particle.noiseAmpl = seed.noiseAmpl;
      particle.noiseFreq = seed.noiseFreq;

      particles.push(particle);
    }
  }
}

export function updateParticleReplica(state: GameServerState) {
  // synchronize state particles
  if (state.sync) {
    syncParticleState(state);
  }

  // correct any errors in entity particle state
  const entityParticles = state.particles.entities;
  for (let i = 0; i < entityParticles.length; ++i) {
    const e = entityParticles[i];
    e.lifetime = clamp(
      e.lifetime,
      MIN_PARTICLE_LIFETIME,
      MAX_PARTICLE_LIFETIME,
    );
    e.lifetimeSpread = clamp(
      e.lifetimeSpread,
      MIN_PARTICLE_LIFETIME,
      MAX_PARTICLE_LIFETIME,
    );
    e.emitRate = clamp(
      e.emitRate,
      MIN_PARTICLE_EMIT_RATE,
      MAX_PARTICLE_EMIT_RATE,
    );
    e.emitSpread = clamp(
      e.emitSpread,
      MIN_PARTICLE_EMIT_RATE,
      MAX_PARTICLE_EMIT_RATE,
    );
    e.countLimit = clamp(e.countLimit, MIN_PARTICLE_LIMIT, MAX_PARTICLE_LIMIT);
    e.noiseAmpl = clamp(
      e.noiseAmpl,
      -MAX_PARTICLE_NOISE_AMPL,
      MAX_PARTICLE_NOISE_AMPL,
    );
    e.noiseFreq = clamp(
      e.noiseFreq,
      -MAX_PARTICLE_NOISE_FREQ,
      MAX_PARTICLE_NOISE_FREQ,
    );

    // TODO
    //  size, color, etc.
  }

  // convert entity particles into emitter/prototype pairs
  const prototypeIndex = state.particles.prototypeIndex;
  const { emitters, prototypes } = state.replica.particles;

  // realloc emitter array
  while (emitters.length < entityParticles.length) {
    emitters.push(ParticleEntitySchema.alloc());
  }
  while (entityParticles.length < emitters.length) {
    const x = emitters.pop();
    if (x) {
      ParticleEntitySchema.free(x);
    }
  }

  // update emitters and prototypes
  for (let i = 0; i < entityParticles.length; ++i) {
    const entity = entityParticles[i];

    // update emitter reference
    const emitter = emitters[i];
    emitter.id = entity.id;
    emitter.particleId = 0;
    ParticleEmitterSchema.assign(emitter, entity);

    // update prototype index
    const index = ServerParticlePrototypeSchema.alloc();
    index.id = 0;
    if (entity.animated) {
      index.animatedId = entity.id;
    } else {
      index.animatedId = 0;
    }
    index.emitterRef = emitter;
    index.inactive = true;
    ParticleParameterSchema.assign(index, entity);
    prototypeIndex.push(index);
  }

  // sort particle parameters
  prototypeIndex.sort(compareParticleParams);

  // scan for newly created prototypes and update emitter indices
  const now = (state.clock.tick * MS_PER_TICK) / 1000;
  let counter = state.particles.particleIdCounter;
  let ptr = 0;

  for (let i = 0; i < prototypeIndex.length; ++i) {
    const proto = prototypeIndex[i];
    const emitter = proto.emitterRef;
    proto.emitterRef = null;
    if (emitter) {
      // associated to an emitter, need to check if t
      if (ptr > 0) {
        // need to compare with previous particle element to see if anything changed
        const last = prototypeIndex[ptr - 1];
        emitter.particleId = proto.id = last.id;

        // if particle id is the same, then we use the previous particle id
        if (compareParticleParams(proto, last) === 0) {
          if (proto.animatedId) {
            ParticleParameterSchema.assign(last, proto);
          }
          last.lastTick = Math.max(
            last.lastTick,
            now + emitter.lifetime + emitter.lifetimeSpread,
          );
          last.inactive = false;
          continue;
        }
      }

      // new particle prototype: update index and append to replica
      emitter.particleId = proto.id = counter++;

      // clear dummy flag, now a real emitter prototype
      proto.inactive = false;

      // swap pointers
      prototypeIndex[i] = prototypeIndex[ptr];
      prototypeIndex[ptr++] = proto;

      proto.lastTick = now + emitter.lifetime + emitter.lifetimeSpread;
    } else {
      // prototype from previous tick, copy over
      prototypeIndex[i] = prototypeIndex[ptr];
      prototypeIndex[ptr++] = proto;
      proto.inactive = true;
    }
  }

  // update counters and length
  state.particles.particleIdCounter = counter;

  // clean up particle prototypes which are stale
  const N = ptr;
  ptr = 0;
  for (let i = 0; i < N; ++i) {
    const p = prototypeIndex[i];
    if (now < p.lastTick) {
      prototypeIndex[i] = prototypeIndex[ptr];
      prototypeIndex[ptr++] = p;
    }
  }

  // clean up old prototype references
  for (let i = ptr; i < prototypeIndex.length; ++i) {
    ServerParticlePrototypeSchema.free(prototypeIndex[i]);
  }
  prototypeIndex.length = ptr;

  // copy active prototypes into array
  prototypeIndex.sort(compareId);
  let rPtr = 0;
  for (let i = 0; i < prototypeIndex.length; ++i) {
    const p = prototypeIndex[i];
    if (p.inactive) {
      // skip inactive prototypes
      continue;
    }
    if (rPtr < prototypes.length) {
      const r = prototypes[rPtr++];
      r.id = p.id;
      ParticleParameterSchema.assign(r, p);
    } else {
      const r = ParticlePrototypeSchema.alloc();
      r.id = p.id;
      ParticleParameterSchema.assign(r, p);
      prototypes.push(r);
      rPtr++;
    }
  }
  for (let i = rPtr; i < prototypes.length; ++i) {
    ParticlePrototypeSchema.free(prototypes[i]);
  }
  prototypes.length = rPtr;
}
