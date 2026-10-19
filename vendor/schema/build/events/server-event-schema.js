"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerEventSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const physics_event_schema_1 = require("./physics-event-schema");
const chat_event_schema_1 = require("./chat-event-schema");
const voxel_event_schema_1 = require("./voxel-event-schema");
const net_events_1 = require("./net-events");
const client_keyboard_event_schema_1 = require("./client-keyboard-event-schema");
exports.ServerEventSchema = new schema_1.MuStruct({
    // voxel events
    voxel: voxel_event_schema_1.VoxelEventSchema,
    // chat events
    chat: chat_event_schema_1.ChatEventSchema,
    // physics events
    physics: physics_event_schema_1.PhysicsEventSchema,
    // Network events
    net: net_events_1.ScriptNetInputSetSchema,
    // player state events
    connect: new schema_1.MuArray(new schema_1.MuUTF8(), Infinity),
    join: new schema_1.MuArray(new schema_1.MuUTF8(), Infinity),
    disconnect: new schema_1.MuArray(new schema_1.MuUTF8(), Infinity),
    keyboard: client_keyboard_event_schema_1.ClientKeyboardEventsSchema,
});
//# sourceMappingURL=server-event-schema.js.map