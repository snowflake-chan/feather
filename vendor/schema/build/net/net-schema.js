"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetPublicSetSchema = exports.NetPublicSchema = exports.NetSecretSchema = exports.NetProtocolSchema = exports.ClientScriptSrcSchema = exports.NetMessageType = exports.NetInputSchema = exports.TaggedNetClientInputSchema = exports.TimestampedClientInputSchema = exports.NetClientInputSchema = exports.NetInputEventSchema = exports.NetInputEventBits = exports.NetPositionCorrectionSetSchema = exports.NetPositionCorrectionSchema = exports.NetStateSchema = exports.PUBLIC_BUFFER_DIVISOR = exports.MAX_INPUT_EVENTS = exports.MAX_CLIENT_INPUT_ENTITIES = void 0;
exports.compareNetPublic = compareNetPublic;
const schema_1 = require("@box/mudb/schema");
const physics_schema_1 = require("../physics/physics-schema");
const player_schema_1 = require("../player/player-schema");
const delta_schema_1 = require("./delta-schema");
const id_1 = require("@box/utils/id");
const quantized_schema_1 = require("../utils/quantized-schema");
const script_events_1 = require("../events/script-events");
const collision_filter_schema_1 = require("../physics/collision-filter-schema");
const zone_schema_1 = require("../zone/zone-schema");
const player_schema_2 = require("../player/player-schema");
const zone_schema_2 = require("../zone/zone-schema");
const game_replica_1 = require("../replica/game-replica");
const game_private_replica_1 = require("../replica/game-private-replica");
const permission_rda_1 = require("../permissions/permission-rda");
const client_keyboard_event_schema_1 = require("../events/client-keyboard-event-schema");
exports.MAX_CLIENT_INPUT_ENTITIES = 32;
exports.MAX_INPUT_EVENTS = 256;
exports.PUBLIC_BUFFER_DIVISOR = 4;
exports.NetStateSchema = new schema_1.MuStruct({
    players: player_schema_1.PlayerSetSchema,
    playerInputs: player_schema_1.PlayerInputSetSchema,
    physics: physics_schema_1.PhysicsParamsSchema,
    bodies: physics_schema_1.RigidBodySetSchema,
    collisionFilter: collision_filter_schema_1.CollisionFilterSchema,
    zones: zone_schema_1.PhysicsZoneSetSchema,
    zoneSelectors: zone_schema_1.ZoneSelectorGroupSetSchema,
});
exports.NetPositionCorrectionSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    px: physics_schema_1.PhysicsPositionComponentSchema,
    py: physics_schema_1.PhysicsPositionComponentSchema,
    pz: physics_schema_1.PhysicsPositionComponentSchema,
    vx: physics_schema_1.PhysicsPositionComponentSchema,
    vy: physics_schema_1.PhysicsPositionComponentSchema,
    vz: physics_schema_1.PhysicsPositionComponentSchema,
});
exports.NetPositionCorrectionSetSchema = new schema_1.MuSortedArray(exports.NetPositionCorrectionSchema, Infinity, id_1.compareId);
// input from a client to the server
var NetInputEventBits;
(function (NetInputEventBits) {
    NetInputEventBits[NetInputEventBits["ACTION0"] = 1] = "ACTION0";
    NetInputEventBits[NetInputEventBits["ACTION1"] = 2] = "ACTION1";
    NetInputEventBits[NetInputEventBits["JUMP"] = 4] = "JUMP";
    NetInputEventBits[NetInputEventBits["WALK"] = 8] = "WALK";
    NetInputEventBits[NetInputEventBits["CROUCH"] = 16] = "CROUCH";
    NetInputEventBits[NetInputEventBits["RUN"] = 32] = "RUN";
    NetInputEventBits[NetInputEventBits["DOUBLE_JUMP"] = 64] = "DOUBLE_JUMP";
    NetInputEventBits[NetInputEventBits["FLY"] = 128] = "FLY";
})(NetInputEventBits || (exports.NetInputEventBits = NetInputEventBits = {}));
exports.NetInputEventSchema = new schema_1.MuStruct({
    // Time input occured
    tick: new schema_1.MuQuantizedFloat(1 / 64),
    // position of player
    position: physics_schema_1.PhysicsPositionSchema,
    // ray cast info
    rayTime: new schema_1.MuQuantizedFloat(1 / 256, -1),
    rayHitEntity: new schema_1.MuVarint(0),
    rayHitVoxelX: new schema_1.MuVarint(0),
    rayHitVoxelY: new schema_1.MuVarint(0),
    rayHitVoxelZ: new schema_1.MuVarint(0),
    rayHitNormal: physics_schema_1.CubeAxisSchema,
    rayOrigin: physics_schema_1.PhysicsPositionSchema,
    rayDirection: new quantized_schema_1.QuantizedVec3Schema(1 / 1024),
    // state of all pressed buttons
    buttonState: new schema_1.MuUint8(0),
    prevButtonState: new schema_1.MuUint8(0),
});
exports.NetClientInputSchema = new schema_1.MuStruct({
    // input variables
    inputState: new schema_1.MuUint16(0),
    inputAngle: new schema_1.MuUint8(0),
    inputPitch: new schema_1.MuUint8(0),
    inputCameraAngle: new schema_1.MuUint8(0),
    // player body inputs
    bodies: new schema_1.MuSortedArray(exports.NetPositionCorrectionSchema, Infinity, id_1.compareId),
});
exports.TimestampedClientInputSchema = new schema_1.MuStruct({
    tick: new schema_1.MuRelativeVarint(0),
    input: exports.NetClientInputSchema,
    pauseCounter: new schema_1.MuRelativeVarint(0),
    events: new schema_1.MuArray(exports.NetInputEventSchema, Infinity),
});
// network state
// Input tagged by entity id
exports.TaggedNetClientInputSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(0),
    input: exports.NetClientInputSchema,
});
// complete network input
exports.NetInputSchema = new schema_1.MuStruct({
    // client inputs
    clients: new schema_1.MuSortedArray(exports.TaggedNetClientInputSchema, Infinity),
    // server corrections
    playerDelta: (0, delta_schema_1.DeltaListSchema)(player_schema_1.PlayerSetSchema),
    bodyDelta: (0, delta_schema_1.DeltaListSchema)(physics_schema_1.RigidBodySetSchema),
    physicsDelta: (0, delta_schema_1.DeltaSchema)(physics_schema_1.PhysicsParamsSchema),
    // if set, update collision filter schema
    filterChanged: new schema_1.MuBoolean(false),
    filter: collision_filter_schema_1.CollisionFilterSchema,
    // zone updates
    zoneChanged: new schema_1.MuBoolean(false),
    zones: zone_schema_1.PhysicsZoneSetSchema,
    zoneSelectors: zone_schema_1.ZoneSelectorGroupSetSchema,
});
var NetMessageType;
(function (NetMessageType) {
    NetMessageType[NetMessageType["PUBLIC"] = 0] = "PUBLIC";
    NetMessageType[NetMessageType["SECRET"] = 1] = "SECRET";
    // bit mask stuff
    NetMessageType[NetMessageType["SHIFT"] = 1] = "SHIFT";
    NetMessageType[NetMessageType["MASK"] = 1] = "MASK";
})(NetMessageType || (exports.NetMessageType = NetMessageType = {}));
exports.ClientScriptSrcSchema = new schema_1.MuDictionary(new schema_1.MuUTF8(), Infinity);
exports.NetProtocolSchema = {
    name: 'game-net',
    client: {
        scriptEvents: script_events_1.ScriptSentEventSchema,
        exceedUserLimit: new schema_1.MuVarint(0),
        kickSessionReason: new schema_1.MuUint8(0),
        syncClientScriptModules: exports.ClientScriptSrcSchema,
    },
    server: {
        join: new schema_1.MuVoid(),
        synchronize: new schema_1.MuVoid(),
        acknowledge: new schema_1.MuUint32(),
        unpause: new schema_1.MuUint32(),
        pause: new schema_1.MuVoid(),
        input: exports.TimestampedClientInputSchema,
        sendKeyBoardEvent: client_keyboard_event_schema_1.ClientKeyboardEventSchema,
    },
};
// client specific info
exports.NetSecretSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(0),
    userId: permission_rda_1.UserIdSchema,
    userName: new schema_1.MuUTF8(),
    userAvatar: new schema_1.MuUTF8(),
    avatarSkin: player_schema_2.PlayerSkinHashSchema,
    loginState: new schema_1.MuUint8(player_schema_2.PlayerLoginState.UNKNOWN),
    onlineInfo: new schema_1.MuStruct({
        onlineCount: new schema_1.MuVarint(),
        offlineCount: new schema_1.MuVarint(),
    }),
    // pause counters
    netPaused: new schema_1.MuBoolean(true),
    // player environment zones
    environmentZones: zone_schema_2.EnvironmentZoneSetSchema,
    // replicated state
    replica: game_private_replica_1.GamePrivateReplicaSchema,
});
// public, global replica info
exports.NetPublicSchema = new schema_1.MuStruct({
    // Current simulation tick
    tick: new schema_1.MuRelativeVarint(0),
    // Frameskip
    frameSkip: new schema_1.MuRelativeVarint(0),
    // Player state
    state: exports.NetStateSchema,
    // Replicated state
    replica: game_replica_1.GameReplicaSchema,
});
function compareNetPublic(x, y) {
    return x.tick - y.tick;
}
exports.NetPublicSetSchema = new schema_1.MuSortedArray(exports.NetPublicSchema, Infinity, compareNetPublic);
//# sourceMappingURL=net-schema.js.map