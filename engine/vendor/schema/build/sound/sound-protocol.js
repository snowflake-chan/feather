"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundProtocolSchema = exports.SoundReplicaSchema = exports.PlayerSoundEffectSetSchema = exports.PlayerSoundEffectSchema = exports.EntitySoundEffectSetSchema = exports.EntitySoundEffectSchema = exports.AmbientSoundEffectSchema = exports.SoundEffectSchema = exports.PlaySoundMessage = exports.PlaySoundPositionSchema = exports.SoundSetSchema = exports.HashSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const quantized_schema_1 = require("../utils/quantized-schema");
const id_1 = require("@box/utils/id");
exports.HashSchema = new schema_1.MuASCII();
exports.SoundSetSchema = new schema_1.MuArray(exports.HashSchema, Infinity);
exports.PlaySoundPositionSchema = new schema_1.MuUnion({
    global: new schema_1.MuVoid(),
    player: new schema_1.MuVarint(),
    entity: new schema_1.MuVarint(),
    position: new quantized_schema_1.QuantizedVec3Schema(1 / 16),
});
exports.PlaySoundMessage = new schema_1.MuStruct({
    soundId: new schema_1.MuVarint(),
    sampleId: new schema_1.MuVarint(),
    position: exports.PlaySoundPositionSchema,
    radius: new schema_1.MuQuantizedFloat(1 / 16, 0),
    pitch: new schema_1.MuQuantizedFloat(1 / 256, 1),
    gain: new schema_1.MuQuantizedFloat(1 / 256, 1),
});
exports.SoundEffectSchema = new schema_1.MuStruct({
    sampleId: new schema_1.MuVarint(),
    radius: new schema_1.MuQuantizedFloat(1 / 16, 32),
    gain: new schema_1.MuQuantizedFloat(1 / 256, 1),
    gainRange: new schema_1.MuQuantizedFloat(1 / 256, 0),
    pitch: new schema_1.MuQuantizedFloat(1 / 256, 0),
    pitchRange: new schema_1.MuQuantizedFloat(1 / 256, 0),
});
exports.AmbientSoundEffectSchema = new schema_1.MuStruct({
    ambient: exports.SoundEffectSchema,
    breakVoxel: exports.SoundEffectSchema,
    placeVoxel: exports.SoundEffectSchema,
    playerJoin: exports.SoundEffectSchema,
    playerLeave: exports.SoundEffectSchema,
});
exports.EntitySoundEffectSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    chat: exports.SoundEffectSchema,
    hurt: exports.SoundEffectSchema,
    die: exports.SoundEffectSchema,
    interact: exports.SoundEffectSchema,
});
exports.EntitySoundEffectSetSchema = new schema_1.MuSortedArray(exports.EntitySoundEffectSchema, Infinity, id_1.compareId);
exports.PlayerSoundEffectSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
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
exports.PlayerSoundEffectSetSchema = new schema_1.MuSortedArray(exports.PlayerSoundEffectSchema, Infinity, id_1.compareId);
exports.SoundReplicaSchema = new schema_1.MuStruct({
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
        resume: new schema_1.MuVarint(),
        pause: new schema_1.MuVarint(),
        stop: new schema_1.MuVarint(),
        setCurrentTime: new schema_1.MuStruct({
            soundId: new schema_1.MuVarint(),
            currentTime: new schema_1.MuFloat32(),
        }),
        setCurrentTimeAndResume: new schema_1.MuStruct({
            soundId: new schema_1.MuVarint(),
            currentTime: new schema_1.MuFloat32(),
        }),
    },
    server: {},
};
//# sourceMappingURL=sound-protocol.js.map