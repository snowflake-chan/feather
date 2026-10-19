"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityAnimationIndexSchema = exports.EntityAnimationSetSchema = exports.EntityAnimationSchema = exports.ENTITY_ANIM_BINDING = void 0;
const interact_protocol_1 = require("../../interact/interact-protocol");
const model_schema_1 = require("../../mesh/model-schema");
const particle_schema_1 = require("../../particle/particle-schema");
const physics_schema_1 = require("../../physics/physics-schema");
const keyframe_binding_1 = require("../keyframe-binding");
const ENTITY = new keyframe_binding_1.AnimationBindingFactory('entity');
const PHYS = ENTITY.component('physics', physics_schema_1.RigidBodySchema.identity);
const MESH = ENTITY.component('mesh', model_schema_1.NetModelSchema.identity);
const PART = ENTITY.component('particles', particle_schema_1.ParticleEmitterSchema.identity);
const PART_MAT = ENTITY.component('particle_mat', particle_schema_1.ParticlePrototypeSchema.identity);
const HINT = ENTITY.component('interact', interact_protocol_1.InteractComponentSchema.identity);
// TODO: Particle materials
exports.ENTITY_ANIM_BINDING = ENTITY.create({
    singleton: false,
    keyframe: {
        components: ENTITY.keyframe(MESH.bind(MESH.mesh('mesh', 'meshId'), MESH.bool('meshInvisible', 'invisible'), MESH.num('meshEmissive', 'emissive'), MESH.num('meshMetalness', 'metalness'), MESH.num('meshShininess', 'shininess'), MESH.propVec3('meshScale', ['scaleX', 'scaleY', 'scaleZ'], 1 / 64, 1 / 64, 1024), MESH.propVec3('meshOffset', ['offsetX', 'offsetY', 'offsetZ'], 1 / 64), MESH.meshColor()), PHYS.bind(PHYS.propVec3('velocity', ['vx', 'vy', 'vz'], 1 / 64, -128, 128), PHYS.physOrientation(), PHYS.physPosition(), PHYS.num('friction', 'friction'), PHYS.num('mass', 'mass'), PHYS.num('restitution', 'restitution'), PHYS.bit('collides', 'flags', physics_schema_1.RigidBodyFlags.COLLIDES), PHYS.bit('gravity', 'flags', physics_schema_1.RigidBodyFlags.GRAVITY), PHYS.bit('fixed', 'flags', physics_schema_1.RigidBodyFlags.FIXED)), PART.bind(PART.num('particleLifetime', 'lifetime'), PART.num('particleLifetimeSpread', 'lifetimeSpread'), PART.num('particleLimit', 'countLimit'), PART.num('particleRate', 'emitRate'), PART.num('particleRateSpread', 'emitSpread'), PART.vec3('particleVelocity', 'velocity'), PART.vec3('particleVelocitySpread', 'velocitySpread')), PART_MAT.bind(PART_MAT.particleColor(), PART_MAT.particleSize(), PART_MAT.num('particleSizeSpread', 'sizeSpread', 1 / 16, 0, 100), PART_MAT.num('particleDamping', 'damping'), PART_MAT.vec3('particleAcceleration', 'acceleration'), PART_MAT.num('particleNoise', 'noiseAmpl'), PART_MAT.num('particleNoiseFrequency', 'noiseFreq'), PART_MAT.entity('particleTarget', 'targetId'), PART_MAT.num('particleTargetWeight', 'targetWeight')), HINT.bind(HINT.rgb('interactColor', 'color'))),
        props: {},
    },
    props: {},
});
exports.EntityAnimationSchema = exports.ENTITY_ANIM_BINDING.schema;
exports.EntityAnimationSetSchema = exports.ENTITY_ANIM_BINDING.setSchema;
exports.EntityAnimationIndexSchema = exports.ENTITY_ANIM_BINDING.indexSchema;
