"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentZoneSetSchema = exports.EnvironmentZoneSchema = exports.PhysicsZoneSetSchema = exports.PhysicsZoneSchema = exports.ZoneSelectorGroupSetSchema = exports.ZoneSelectorGroupSchema = exports.ZoneSchema = void 0;
const boolean_1 = require("@box/mudb/schema/boolean");
const quantized_float_1 = require("@box/mudb/schema/quantized-float");
const sorted_array_1 = require("@box/mudb/schema/sorted-array");
const struct_1 = require("@box/mudb/schema/struct");
const varint_1 = require("@box/mudb/schema/varint");
const project_rda_1 = require("../project/project-rda");
const id_1 = require("@box/utils/id");
// common zone stuff
exports.ZoneSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    // bounds
    minX: new quantized_float_1.MuQuantizedFloat(1 / 16, 0),
    minY: new quantized_float_1.MuQuantizedFloat(1 / 16, 0),
    minZ: new quantized_float_1.MuQuantizedFloat(1 / 16, 0),
    maxX: new quantized_float_1.MuQuantizedFloat(1 / 16, 0),
    maxY: new quantized_float_1.MuQuantizedFloat(1 / 16, 0),
    maxZ: new quantized_float_1.MuQuantizedFloat(1 / 16, 0),
});
exports.ZoneSelectorGroupSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    groupBits: new sorted_array_1.MuSortedArray(new varint_1.MuVarint(), Infinity, (a, b) => a - b),
});
exports.ZoneSelectorGroupSetSchema = new sorted_array_1.MuSortedArray(exports.ZoneSelectorGroupSchema, Infinity, id_1.compareId);
exports.PhysicsZoneSchema = new struct_1.MuStruct(Object.assign({ 
    // selector group for this zone
    selectorGroup: new varint_1.MuVarint(0), 
    // physics effects
    massScale: new quantized_float_1.MuQuantizedFloat(1 / 256, 0), fx: new quantized_float_1.MuQuantizedFloat(1 / 1024, 0), fy: new quantized_float_1.MuQuantizedFloat(1 / 1024, 0), fz: new quantized_float_1.MuQuantizedFloat(1 / 1024, 0) }, exports.ZoneSchema.muData));
exports.PhysicsZoneSetSchema = new sorted_array_1.MuSortedArray(exports.PhysicsZoneSchema, Infinity, id_1.compareId);
exports.EnvironmentZoneSchema = new struct_1.MuStruct(Object.assign({ 
    // weather effects
    overrideFog: new boolean_1.MuBoolean(false), fog: project_rda_1.FogRDA.stateSchema, overrideSky: new boolean_1.MuBoolean(false), sky: project_rda_1.SkyRDA.stateSchema, overrideSnow: new boolean_1.MuBoolean(false), snow: project_rda_1.SnowRDA.stateSchema, overrideRain: new boolean_1.MuBoolean(false), rain: project_rda_1.RainRDA.stateSchema }, exports.ZoneSchema.muData));
exports.EnvironmentZoneSetSchema = new sorted_array_1.MuSortedArray(exports.EnvironmentZoneSchema, Infinity, id_1.compareId);
