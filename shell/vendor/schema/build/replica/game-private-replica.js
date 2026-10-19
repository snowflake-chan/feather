"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamePrivateReplicaSetSchema = exports.GamePrivateReplicaSchema = exports.PlayerGamepadSchema = void 0;
const index_1 = require("../content-server/index");
const boolean_1 = require("@box/mudb/schema/boolean");
const sorted_array_1 = require("@box/mudb/schema/sorted-array");
const struct_1 = require("@box/mudb/schema/struct");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
const id_1 = require("@box/utils/id");
const camera_schema_1 = require("../camera/camera-schema");
const sound_protocol_1 = require("../sound/sound-protocol");
exports.PlayerGamepadSchema = new struct_1.MuStruct({
    joystickBackground: new utf8_1.MuUTF8(''),
    joystickController: new utf8_1.MuUTF8(''),
    flyButton: new utf8_1.MuUTF8(''),
    flyingBackground: new utf8_1.MuUTF8(''),
    flyingController: new utf8_1.MuUTF8(''),
    jump: new utf8_1.MuUTF8(''),
    crouch: new utf8_1.MuUTF8(''),
    actionA: new utf8_1.MuUTF8(''),
    actionB: new utf8_1.MuUTF8(''),
});
exports.GamePrivateReplicaSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    // color LUT
    colorLUT: index_1.HashSchema,
    // enable cursor
    enableCursor: new boolean_1.MuBoolean(false),
    // music
    music: sound_protocol_1.SoundEffectSchema,
    // camera state
    camera: camera_schema_1.CameraConfigurationSchema,
    //gamepad
    gamepad: exports.PlayerGamepadSchema,
});
exports.GamePrivateReplicaSetSchema = new sorted_array_1.MuSortedArray(exports.GamePrivateReplicaSchema, Infinity, id_1.compareId);
