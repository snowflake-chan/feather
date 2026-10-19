"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractProtocol = exports.InteractMessageSchema = exports.InteractComponentSetSchema = exports.InteractComponentSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const id_1 = require("@box/utils/id");
const quantized_schema_1 = require("../utils/quantized-schema");
const gl_matrix_1 = require("gl-matrix");
const emote_event_schema_1 = require("../events/emote-event-schema");
exports.InteractComponentSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    radius: new schema_1.MuQuantizedFloat(1 / 16, 16),
    hint: new schema_1.MuUTF8(),
    color: new quantized_schema_1.QuantizedVec3Schema(1 / 256, gl_matrix_1.vec3.fromValues(1, 1, 1)),
});
exports.InteractComponentSetSchema = new schema_1.MuSortedArray(exports.InteractComponentSchema, Infinity, id_1.compareId);
exports.InteractMessageSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    tick: new schema_1.MuQuantizedFloat(1 / 16),
});
exports.InteractProtocol = {
    name: 'entity-interact',
    client: {
        acknowledgeInteract: new schema_1.MuVoid(),
        emoteEvent: emote_event_schema_1.EmoteEventSchema,
    },
    server: {
        interact: exports.InteractMessageSchema,
        playEmote: emote_event_schema_1.EmoteSchema,
    },
};
//# sourceMappingURL=interact-protocol.js.map