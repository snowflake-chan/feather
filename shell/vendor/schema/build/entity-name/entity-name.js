"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityNameComponentSetSchema = exports.EntityNameComponentSchema = void 0;
const quantized_float_1 = require("@box/mudb/schema/quantized-float");
const sorted_array_1 = require("@box/mudb/schema/sorted-array");
const struct_1 = require("@box/mudb/schema/struct");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
const id_1 = require("@box/utils/id");
const quantized_schema_1 = require("../utils/quantized-schema");
const gl_matrix_1 = require("gl-matrix");
exports.EntityNameComponentSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    radius: new quantized_float_1.MuQuantizedFloat(1 / 16, 16),
    name: new utf8_1.MuUTF8(),
    color: new quantized_schema_1.QuantizedVec3Schema(1 / 256, gl_matrix_1.vec3.fromValues(1, 1, 1)),
});
exports.EntityNameComponentSetSchema = new sorted_array_1.MuSortedArray(exports.EntityNameComponentSchema, Infinity, id_1.compareId);
