"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaListSchema = DeltaListSchema;
exports.DeltaSchema = DeltaSchema;
const array_1 = require("@box/mudb/schema/array");
const boolean_1 = require("@box/mudb/schema/boolean");
const struct_1 = require("@box/mudb/schema/struct");
const uint32_1 = require("@box/mudb/schema/uint32");
function DeltaListSchema(schema) {
    return new struct_1.MuStruct({
        upserts: schema,
        remove: new array_1.MuArray(new uint32_1.MuUint32(0), Infinity),
    });
}
function DeltaSchema(schema) {
    return new struct_1.MuStruct({
        patch: schema,
        changed: new boolean_1.MuBoolean(false),
    });
}
