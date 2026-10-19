"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentZoneSetSchema = exports.EnvironmentZoneSchema = exports.PhysicsZoneSetSchema = exports.PhysicsZoneSchema = exports.ZoneSelectorGroupSetSchema = exports.ZoneSelectorGroupSchema = exports.ZoneSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const project_rda_1 = require("../project/project-rda");
const id_1 = require("@box/utils/id");
// common zone stuff
exports.ZoneSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    // bounds
    minX: new schema_1.MuQuantizedFloat(1 / 16, 0),
    minY: new schema_1.MuQuantizedFloat(1 / 16, 0),
    minZ: new schema_1.MuQuantizedFloat(1 / 16, 0),
    maxX: new schema_1.MuQuantizedFloat(1 / 16, 0),
    maxY: new schema_1.MuQuantizedFloat(1 / 16, 0),
    maxZ: new schema_1.MuQuantizedFloat(1 / 16, 0),
});
exports.ZoneSelectorGroupSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    groupBits: new schema_1.MuSortedArray(new schema_1.MuVarint(), Infinity, (a, b) => a - b),
});
exports.ZoneSelectorGroupSetSchema = new schema_1.MuSortedArray(exports.ZoneSelectorGroupSchema, Infinity, id_1.compareId);
exports.PhysicsZoneSchema = new schema_1.MuStruct(Object.assign({ 
    // selector group for this zone
    selectorGroup: new schema_1.MuVarint(0), 
    // physics effects
    massScale: new schema_1.MuQuantizedFloat(1 / 256, 0), fx: new schema_1.MuQuantizedFloat(1 / 1024, 0), fy: new schema_1.MuQuantizedFloat(1 / 1024, 0), fz: new schema_1.MuQuantizedFloat(1 / 1024, 0) }, exports.ZoneSchema.muData));
exports.PhysicsZoneSetSchema = new schema_1.MuSortedArray(exports.PhysicsZoneSchema, Infinity, id_1.compareId);
exports.EnvironmentZoneSchema = new schema_1.MuStruct(Object.assign({ 
    // weather effects
    overrideFog: new schema_1.MuBoolean(false), fog: project_rda_1.FogRDA.stateSchema, overrideSky: new schema_1.MuBoolean(false), sky: project_rda_1.SkyRDA.stateSchema, overrideSnow: new schema_1.MuBoolean(false), snow: project_rda_1.SnowRDA.stateSchema, overrideRain: new schema_1.MuBoolean(false), rain: project_rda_1.RainRDA.stateSchema }, exports.ZoneSchema.muData));
exports.EnvironmentZoneSetSchema = new schema_1.MuSortedArray(exports.EnvironmentZoneSchema, Infinity, id_1.compareId);
//# sourceMappingURL=zone-schema.js.map