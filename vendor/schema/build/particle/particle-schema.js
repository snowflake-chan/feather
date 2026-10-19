"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticleReplicaSchema = exports.ParticlePrototypeSchema = exports.ParticleEntitySchema = exports.ParticleParameterSchema = exports.ParticleEmitterSchema = void 0;
exports.packColor = packColor;
const schema_1 = require("@box/mudb/schema");
const quantized_schema_1 = require("../utils/quantized-schema");
const id_1 = require("@box/utils/id");
function packColor(c) {
    const intensity = Math.floor(Math.min(256, Math.max(1, c.r, c.g, c.b))) - 1;
    const r = Math.max(0, Math.min(255, (255 * c.r) / intensity)) | 0;
    const g = Math.max(0, Math.min(255, (255 * c.g) / intensity)) | 0;
    const b = Math.max(0, Math.min(255, (255 * c.b) / intensity)) | 0;
    return r | (g << 8) | (b << 16) | (intensity << 24);
}
exports.ParticleEmitterSchema = new schema_1.MuStruct({
    // limits
    countLimit: new schema_1.MuVarint(100),
    // emit rate
    emitRate: new schema_1.MuQuantizedFloat(1 / 64, 1),
    emitSpread: new schema_1.MuQuantizedFloat(1 / 64, 0),
    // particle life time
    lifetime: new schema_1.MuQuantizedFloat(1 / 16, 1),
    lifetimeSpread: new schema_1.MuQuantizedFloat(1 / 16, 0),
    // velocity bias
    velocity: new quantized_schema_1.QuantizedVec3Schema(1 / 64),
    velocitySpread: new quantized_schema_1.QuantizedVec3Schema(1 / 64),
});
// precomputed particle data, stored in a table
exports.ParticleParameterSchema = new schema_1.MuStruct({
    // external forces applied to the particle system
    acceleration: new quantized_schema_1.QuantizedVec3Schema(1 / 64),
    // noise weight
    noiseAmpl: new schema_1.MuQuantizedFloat(1 / 64),
    noiseFreq: new schema_1.MuQuantizedFloat(1 / 128),
    // particle target entity
    targetId: new schema_1.MuVarint(),
    targetWeight: new schema_1.MuQuantizedFloat(1 / 128, 0),
    // particle color curve
    color0: new schema_1.MuUint32(0xffffffff),
    color1: new schema_1.MuUint32(0xffffffff),
    color2: new schema_1.MuUint32(0xffffffff),
    color3: new schema_1.MuUint32(0xffffffff),
    color4: new schema_1.MuUint32(0xffffffff),
    // particle size curve
    size0: new schema_1.MuQuantizedFloat(1 / 64, 1),
    size1: new schema_1.MuQuantizedFloat(1 / 64, 1),
    size2: new schema_1.MuQuantizedFloat(1 / 64, 1),
    size3: new schema_1.MuQuantizedFloat(1 / 64, 1),
    size4: new schema_1.MuQuantizedFloat(1 / 64, 1),
    sizeSpread: new schema_1.MuQuantizedFloat(1 / 64),
    // velocity damping
    damping: new schema_1.MuQuantizedFloat(1 / 1024, 0),
});
// entity particle emitter data
exports.ParticleEntitySchema = new schema_1.MuStruct(Object.assign({ id: new schema_1.MuVarint(), particleId: new schema_1.MuVarint() }, exports.ParticleEmitterSchema.muData));
// cached particle properties
exports.ParticlePrototypeSchema = new schema_1.MuStruct(Object.assign({ id: new schema_1.MuVarint() }, exports.ParticleParameterSchema.muData));
// replicated particle state
// split particles into emitters and prototypes to save bandwidth
exports.ParticleReplicaSchema = new schema_1.MuStruct({
    // emitters are attached to entities and emit particles at some rate
    emitters: new schema_1.MuSortedArray(exports.ParticleEntitySchema, Infinity, id_1.compareId),
    // prototypes are bulk particle configuration data (color etc.) which is commonly shared by many entities
    prototypes: new schema_1.MuSortedArray(exports.ParticlePrototypeSchema, Infinity, id_1.compareId),
});
//# sourceMappingURL=particle-schema.js.map