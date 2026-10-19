"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityNameComponentSetSchema = exports.EntityNameComponentSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const id_1 = require("@box/utils/id");
const quantized_schema_1 = require("../utils/quantized-schema");
const gl_matrix_1 = require("gl-matrix");
exports.EntityNameComponentSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    radius: new schema_1.MuQuantizedFloat(1 / 16, 16),
    name: new schema_1.MuUTF8(),
    color: new quantized_schema_1.QuantizedVec3Schema(1 / 256, gl_matrix_1.vec3.fromValues(1, 1, 1)),
});
exports.EntityNameComponentSetSchema = new schema_1.MuSortedArray(exports.EntityNameComponentSchema, Infinity, id_1.compareId);
//# sourceMappingURL=entity-name.js.map