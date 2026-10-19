"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptSentEventSchema = void 0;
const damage_event_schema_1 = require("./damage-event-schema");
const struct_1 = require("@box/mudb/schema/struct");
exports.ScriptSentEventSchema = new struct_1.MuStruct({
    damage: damage_event_schema_1.DamageEventSchema,
});
