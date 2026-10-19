"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DamageEventSchema = exports.RespawnEventSetSchema = exports.RespawnEventSchema = exports.HurtEventSetSchema = exports.HurtEventSchema = void 0;
const array_1 = require("@box/mudb/schema/array");
const struct_1 = require("@box/mudb/schema/struct");
const varint_1 = require("@box/mudb/schema/varint");
exports.HurtEventSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(0),
    damage: new varint_1.MuVarint(0),
});
exports.HurtEventSetSchema = new array_1.MuArray(exports.HurtEventSchema, Infinity);
exports.RespawnEventSchema = new struct_1.MuStruct({
    tick: new varint_1.MuVarint(),
    id: new varint_1.MuVarint(),
});
exports.RespawnEventSetSchema = new array_1.MuArray(exports.RespawnEventSchema, Infinity);
exports.DamageEventSchema = new struct_1.MuStruct({
    hurt: exports.HurtEventSetSchema,
    respawn: new array_1.MuArray(new varint_1.MuVarint(), Infinity),
    die: new array_1.MuArray(new varint_1.MuVarint(), Infinity),
});
