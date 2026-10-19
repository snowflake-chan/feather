"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptNetInputSetSchema = exports.ScriptNetInputSchema = void 0;
const net_schema_1 = require("../net/net-schema");
const array_1 = require("@box/mudb/schema/array");
const struct_1 = require("@box/mudb/schema/struct");
const varint_1 = require("@box/mudb/schema/varint");
exports.ScriptNetInputSchema = new struct_1.MuStruct(Object.assign({ id: new varint_1.MuVarint(0) }, net_schema_1.NetInputEventSchema.muData));
exports.ScriptNetInputSetSchema = new array_1.MuArray(exports.ScriptNetInputSchema, Infinity);
