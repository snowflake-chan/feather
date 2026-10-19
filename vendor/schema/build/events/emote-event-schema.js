"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmoteEventsSchema = exports.EmoteEventSchema = exports.EmoteSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const ik_schema_1 = require("../animation/ik-schema");
exports.EmoteSchema = new schema_1.MuUint8(ik_schema_1.GroundEmote.none);
exports.EmoteEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    emote: exports.EmoteSchema,
});
exports.EmoteEventsSchema = new schema_1.MuArray(exports.EmoteEventSchema, Infinity);
//# sourceMappingURL=emote-event-schema.js.map