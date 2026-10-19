"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundProtocolSchema = exports.SoundReplicaSchema = exports.PlayerSoundEffectSetSchema = exports.PlayerSoundEffectSchema = exports.EntitySoundEffectSetSchema = exports.EntitySoundEffectSchema = exports.AmbientSoundEffectSchema = exports.SoundEffectSchema = exports.PlaySoundMessage = exports.PlaySoundPositionSchema = exports.SoundSetSchema = exports.HashSchema = void 0;
const array_1 = require("@box/mudb/schema/array");
const ascii_1 = require("@box/mudb/schema/ascii");
const float32_1 = require("@box/mudb/schema/float32");
const quantized_float_1 = require("@box/mudb/schema/quantized-float");
const sorted_array_1 = require("@box/mudb/schema/sorted-array");
const struct_1 = require("@box/mudb/schema/struct");
const union_1 = require("@box/mudb/schema/union");
const varint_1 = require("@box/mudb/schema/varint");
const void_1 = require("@box/mudb/schema/void");
const quantized_schema_1 = require("../utils/quantized-schema");
const id_1 = require("@box/utils/id");
exports.HashSchema = new ascii_1.MuASCII();
exports.SoundSetSchema = new array_1.MuArray(exports.HashSchema, Infinity);
exports.PlaySoundPositionSchema = new union_1.MuUnion({
    global: new void_1.MuVoid(),
    player: new varint_1.MuVarint(),
    entity: new varint_1.MuVarint(),
    position: new quantized_schema_1.QuantizedVec3Schema(1 / 16),
});
exports.PlaySoundMessage = new struct_1.MuStruct({
    soundId: new varint_1.MuVarint(),
    sampleId: new varint_1.MuVarint(),
    position: exports.PlaySoundPositionSchema,
    radius: new quantized_float_1.MuQuantizedFloat(1 / 16, 0),
    pitch: new quantized_float_1.MuQuantizedFloat(1 / 256, 1),
    gain: new quantized_float_1.MuQuantizedFloat(1 / 256, 1),
});
exports.SoundEffectSchema = new struct_1.MuStruct({
    sampleId: new varint_1.MuVarint(),
    radius: new quantized_float_1.MuQuantizedFloat(1 / 16, 32),
    gain: new quantized_float_1.MuQuantizedFloat(1 / 256, 1),
    gainRange: new quantized_float_1.MuQuantizedFloat(1 / 256, 0),
    pitch: new quantized_float_1.MuQuantizedFloat(1 / 256, 0),
    pitchRange: new quantized_float_1.MuQuantizedFloat(1 / 256, 0),
});
exports.AmbientSoundEffectSchema = new struct_1.MuStruct({
    ambient: exports.SoundEffectSchema,
    breakVoxel: exports.SoundEffectSchema,
    placeVoxel: exports.SoundEffectSchema,
    playerJoin: exports.SoundEffectSchema,
    playerLeave: exports.SoundEffectSchema,
});
exports.EntitySoundEffectSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    chat: exports.SoundEffectSchema,
    hurt: exports.SoundEffectSchema,
    die: exports.SoundEffectSchema,
    interact: exports.SoundEffectSchema,
});
exports.EntitySoundEffectSetSchema = new sorted_array_1.MuSortedArray(exports.EntitySoundEffectSchema, Infinity, id_1.compareId);
exports.PlayerSoundEffectSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    spawn: exports.SoundEffectSchema,
    jump: exports.SoundEffectSchema,
    doubleJump: exports.SoundEffectSchema,
    land: exports.SoundEffectSchema,
    crouch: exports.SoundEffectSchema,
    step: exports.SoundEffectSchema,
    swim: exports.SoundEffectSchema,
    action0: exports.SoundEffectSchema,
    action1: exports.SoundEffectSchema,
    enterWater: exports.SoundEffectSchema,
    leaveWater: exports.SoundEffectSchema,
    startFly: exports.SoundEffectSchema,
    endFly: exports.SoundEffectSchema,
});
exports.PlayerSoundEffectSetSchema = new sorted_array_1.MuSortedArray(exports.PlayerSoundEffectSchema, Infinity, id_1.compareId);
exports.SoundReplicaSchema = new struct_1.MuStruct({
    // Ambient sound effects
    ambientSound: exports.AmbientSoundEffectSchema,
    // entity sounds
    entitySound: exports.EntitySoundEffectSetSchema,
    // player sounds
    playerSound: exports.PlayerSoundEffectSetSchema,
});
exports.SoundProtocolSchema = {
    name: 'sound',
    client: {
        resetDictionary: exports.SoundSetSchema,
        play: exports.PlaySoundMessage,
        resume: new varint_1.MuVarint(),
        pause: new varint_1.MuVarint(),
        stop: new varint_1.MuVarint(),
        setCurrentTime: new struct_1.MuStruct({
            soundId: new varint_1.MuVarint(),
            currentTime: new float32_1.MuFloat32(),
        }),
        setCurrentTimeAndResume: new struct_1.MuStruct({
            soundId: new varint_1.MuVarint(),
            currentTime: new float32_1.MuFloat32(),
        }),
    },
    server: {},
};
