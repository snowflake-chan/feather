"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollisionFilterSchema = exports.CollisionGroupSchema = void 0;
const array_1 = require("@box/mudb/schema/array");
const sorted_array_1 = require("@box/mudb/schema/sorted-array");
const varint_1 = require("@box/mudb/schema/varint");
exports.CollisionGroupSchema = new sorted_array_1.MuSortedArray(new varint_1.MuVarint(), Infinity, (a, b) => a - b);
exports.CollisionFilterSchema = new array_1.MuArray(exports.CollisionGroupSchema, Infinity);
