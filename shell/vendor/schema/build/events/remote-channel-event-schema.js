"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteClientEventsSchema = exports.RemoteClientEventSchema = exports.RemoteChannelEventsSchema = exports.RemoteChannelEventSchema = void 0;
const array_1 = require("@box/mudb/schema/array");
const struct_1 = require("@box/mudb/schema/struct");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
const REMOTE_EVENT_SPEC = {
    tick: new varint_1.MuVarint(),
    args: new utf8_1.MuUTF8(),
};
exports.RemoteChannelEventSchema = new struct_1.MuStruct(Object.assign({ id: new varint_1.MuVarint() }, REMOTE_EVENT_SPEC));
exports.RemoteChannelEventsSchema = new array_1.MuArray(exports.RemoteChannelEventSchema, Infinity);
exports.RemoteClientEventSchema = new struct_1.MuStruct(REMOTE_EVENT_SPEC);
exports.RemoteClientEventsSchema = new array_1.MuArray(exports.RemoteClientEventSchema, Infinity);
