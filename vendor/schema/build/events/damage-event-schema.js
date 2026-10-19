"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DamageEventSchema = exports.RespawnEventSetSchema = exports.RespawnEventSchema = exports.HurtEventSetSchema = exports.HurtEventSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.HurtEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(0),
    damage: new schema_1.MuVarint(0),
});
exports.HurtEventSetSchema = new schema_1.MuArray(exports.HurtEventSchema, Infinity);
exports.RespawnEventSchema = new schema_1.MuStruct({
    tick: new schema_1.MuVarint(),
    id: new schema_1.MuVarint(),
});
exports.RespawnEventSetSchema = new schema_1.MuArray(exports.RespawnEventSchema, Infinity);
exports.DamageEventSchema = new schema_1.MuStruct({
    hurt: exports.HurtEventSetSchema,
    respawn: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    die: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
});
//# sourceMappingURL=damage-event-schema.js.map