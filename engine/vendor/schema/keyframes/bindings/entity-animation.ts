import { GameEntityKeyframe } from '../../api/js/api';
import {
  InteractComponent,
  InteractComponentSchema,
} from '../../interact/interact-protocol';
import { NetModel, NetModelSchema } from '../../mesh/model-schema';
import {
  ParticleEmitter,
  ParticleEmitterSchema,
  ParticlePrototype,
  ParticlePrototypeSchema,
} from '../../particle/particle-schema';
import {
  RigidBody,
  RigidBodyFlags,
  RigidBodySchema,
} from '../../physics/physics-schema';
import { AnimationBindingFactory } from '../keyframe-binding';

const ENTITY = new AnimationBindingFactory<GameEntityKeyframe>('entity');

const PHYS = ENTITY.component<RigidBody, 'physics'>(
  'physics',
  RigidBodySchema.identity,
);
const MESH = ENTITY.component<NetModel, 'mesh'>(
  'mesh',
  NetModelSchema.identity,
);
const PART = ENTITY.component<ParticleEmitter, 'particles'>(
  'particles',
  ParticleEmitterSchema.identity,
);
const PART_MAT = ENTITY.component<ParticlePrototype, 'particle_mat'>(
  'particle_mat',
  ParticlePrototypeSchema.identity,
);
const HINT = ENTITY.component<InteractComponent, 'interact'>(
  'interact',
  InteractComponentSchema.identity,
);

// TODO: Particle materials

export const ENTITY_ANIM_BINDING = ENTITY.create({
  singleton: false,
  keyframe: {
    components: ENTITY.keyframe(
      MESH.bind(
        MESH.mesh('mesh', 'meshId'),
        MESH.bool('meshInvisible', 'invisible'),
        MESH.num('meshEmissive', 'emissive'),
        MESH.num('meshMetalness', 'metalness'),
        MESH.num('meshShininess', 'shininess'),
        MESH.propVec3(
          'meshScale',
          ['scaleX', 'scaleY', 'scaleZ'],
          1 / 64,
          1 / 64,
          1024,
        ),
        MESH.propVec3('meshOffset', ['offsetX', 'offsetY', 'offsetZ'], 1 / 64),
        MESH.meshColor(),
      ),
      PHYS.bind(
        PHYS.propVec3('velocity', ['vx', 'vy', 'vz'], 1 / 64, -128, 128),
        PHYS.physOrientation(),
        PHYS.physPosition(),
        PHYS.num('friction', 'friction'),
        PHYS.num('mass', 'mass'),
        PHYS.num('restitution', 'restitution'),
        PHYS.bit('collides', 'flags', RigidBodyFlags.COLLIDES),
        PHYS.bit('gravity', 'flags', RigidBodyFlags.GRAVITY),
        PHYS.bit('fixed', 'flags', RigidBodyFlags.FIXED),
      ),
      PART.bind(
        PART.num('particleLifetime', 'lifetime'),
        PART.num('particleLifetimeSpread', 'lifetimeSpread'),
        PART.num('particleLimit', 'countLimit'),
        PART.num('particleRate', 'emitRate'),
        PART.num('particleRateSpread', 'emitSpread'),
        PART.vec3('particleVelocity', 'velocity' as never),
        PART.vec3('particleVelocitySpread', 'velocitySpread' as never),
      ),
      PART_MAT.bind(
        PART_MAT.particleColor(),
        PART_MAT.particleSize(),
        PART_MAT.num('particleSizeSpread', 'sizeSpread', 1 / 16, 0, 100),
        PART_MAT.num('particleDamping', 'damping'),
        PART_MAT.vec3('particleAcceleration', 'acceleration' as never),
        PART_MAT.num('particleNoise', 'noiseAmpl'),
        PART_MAT.num('particleNoiseFrequency', 'noiseFreq'),
        PART_MAT.entity('particleTarget', 'targetId'),
        PART_MAT.num('particleTargetWeight', 'targetWeight'),
      ),
      HINT.bind(HINT.rgb('interactColor', 'color' as never)),
    ),
    props: {},
  },
  props: {},
});

export const EntityAnimationSchema = ENTITY_ANIM_BINDING.schema;
export type EntityAnimation = typeof EntityAnimationSchema.identity;
export const EntityAnimationSetSchema = ENTITY_ANIM_BINDING.setSchema;
export const EntityAnimationIndexSchema = ENTITY_ANIM_BINDING.indexSchema;
export type EntityAnimationIndex = typeof EntityAnimationIndexSchema.identity;
