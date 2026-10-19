"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamePrivateReplicaSetSchema = exports.GamePrivateReplicaSchema = exports.PlayerGamepadSchema = void 0;
const index_1 = require("../content-server/index");
const schema_1 = require("@box/mudb/schema");
const id_1 = require("@box/utils/id");
const camera_schema_1 = require("../camera/camera-schema");
const sound_protocol_1 = require("../sound/sound-protocol");
exports.PlayerGamepadSchema = new schema_1.MuStruct({
    joystickBackground: new schema_1.MuUTF8(''),
    joystickController: new schema_1.MuUTF8(''),
    flyButton: new schema_1.MuUTF8(''),
    flyingBackground: new schema_1.MuUTF8(''),
    flyingController: new schema_1.MuUTF8(''),
    jump: new schema_1.MuUTF8(''),
    crouch: new schema_1.MuUTF8(''),
    actionA: new schema_1.MuUTF8(''),
    actionB: new schema_1.MuUTF8(''),
});
exports.GamePrivateReplicaSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    // color LUT
    colorLUT: index_1.HashSchema,
    // enable cursor
    enableCursor: new schema_1.MuBoolean(false),
    // music
    music: sound_protocol_1.SoundEffectSchema,
    // camera state
    camera: camera_schema_1.CameraConfigurationSchema,
    //gamepad
    gamepad: exports.PlayerGamepadSchema,
});
exports.GamePrivateReplicaSetSchema = new schema_1.MuSortedArray(exports.GamePrivateReplicaSchema, Infinity, id_1.compareId);
//# sourceMappingURL=game-private-replica.js.map