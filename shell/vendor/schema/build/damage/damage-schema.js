"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DamageSetSchema = exports.DamageSchema = void 0;
const boolean_1 = require("@box/mudb/schema/boolean");
const quantized_float_1 = require("@box/mudb/schema/quantized-float");
const sorted_array_1 = require("@box/mudb/schema/sorted-array");
const struct_1 = require("@box/mudb/schema/struct");
const varint_1 = require("@box/mudb/schema/varint");
const id_1 = require("@box/utils/id");
exports.DamageSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    // display style
    showHealthBar: new boolean_1.MuBoolean(true),
    // damage level
    hp: new quantized_float_1.MuQuantizedFloat(1 / 256, 100),
    maxHp: new quantized_float_1.MuQuantizedFloat(1 / 256, 100),
});
exports.DamageSetSchema = new sorted_array_1.MuSortedArray(exports.DamageSchema, Infinity, id_1.compareId);
