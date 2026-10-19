"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmoteEventsSchema = exports.EmoteEventSchema = exports.EmoteSchema = void 0;
const array_1 = require("@box/mudb/schema/array");
const struct_1 = require("@box/mudb/schema/struct");
const uint8_1 = require("@box/mudb/schema/uint8");
const varint_1 = require("@box/mudb/schema/varint");
const ik_schema_1 = require("../animation/ik-schema");
exports.EmoteSchema = new uint8_1.MuUint8(ik_schema_1.GroundEmote.none);
exports.EmoteEventSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    emote: exports.EmoteSchema,
});
exports.EmoteEventsSchema = new array_1.MuArray(exports.EmoteEventSchema, Infinity);
