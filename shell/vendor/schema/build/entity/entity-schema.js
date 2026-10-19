"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityStateSchema = exports.DeletedEntitiesSchema = exports.EntitySetSchema = void 0;
const boolean_1 = require("@box/mudb/schema/boolean");
const dictionary_1 = require("@box/mudb/schema/dictionary");
const sorted_array_1 = require("@box/mudb/schema/sorted-array");
const struct_1 = require("@box/mudb/schema/struct");
const uint32_1 = require("@box/mudb/schema/uint32");
const varint_1 = require("@box/mudb/schema/varint");
exports.EntitySetSchema = new sorted_array_1.MuSortedArray(new varint_1.MuVarint(), Infinity, (a, b) => a - b);
exports.DeletedEntitiesSchema = new dictionary_1.MuDictionary(new boolean_1.MuBoolean(false), Infinity);
exports.EntityStateSchema = new struct_1.MuStruct({
    counter: new uint32_1.MuUint32(1),
    entities: exports.EntitySetSchema,
    pendingDelete: exports.EntitySetSchema,
    deletedEntities: exports.DeletedEntitiesSchema,
});
