"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientEventSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const math_schema_1 = require("../utils/math-schema");
const init_array_1 = require("@box/utils/init-array");
const input_schema_1 = require("../input/input-schema");
const animation_event_schema_1 = require("./animation-event-schema");
const chat_event_schema_1 = require("./chat-event-schema");
const voxel_event_schema_1 = require("./voxel-event-schema");
const damage_event_schema_1 = require("./damage-event-schema");
const player_event_schema_1 = require("./player-event-schema");
const emote_event_schema_1 = require("./emote-event-schema");
exports.ClientEventSchema = new schema_1.MuStruct({
    // voxel events
    voxel: voxel_event_schema_1.VoxelEventSchema,
    // animation events
    animation: animation_event_schema_1.AnimationEventSchema,
    // chat events
    chat: chat_event_schema_1.ChatEventSchema,
    // damage
    damage: damage_event_schema_1.DamageEventSchema,
    // players emote events
    emote: emote_event_schema_1.EmoteEventsSchema,
    // input stuff
    lookAxisMovement: math_schema_1.Vec2Schema,
    keyTap: new schema_1.MuArray(new schema_1.MuUint8(0), Infinity, (0, init_array_1.initArray)(input_schema_1.GameKeys.KEY_COUNT, () => 0)),
    // player inputs
    playerInput: new schema_1.MuArray(player_event_schema_1.PlayerInputEventSchema, Infinity),
    // player events
    playerJoin: new schema_1.MuArray(player_event_schema_1.PlayerEventSchema, Infinity),
    playerLeave: new schema_1.MuArray(player_event_schema_1.PlayerEventSchema, Infinity),
});
//# sourceMappingURL=client-event-schema.js.map