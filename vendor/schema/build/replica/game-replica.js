"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameReplicaSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const environment_schema_1 = require("../environment/environment-schema");
const model_schema_1 = require("../mesh/model-schema");
const player_schema_1 = require("../player/player-schema");
const damage_schema_1 = require("../damage/damage-schema");
const particle_schema_1 = require("../particle/particle-schema");
const interact_protocol_1 = require("../interact/interact-protocol");
const entity_name_1 = require("../entity-name/entity-name");
const sound_protocol_1 = require("../sound/sound-protocol");
const keyframe_schema_1 = require("../keyframes/keyframe-schema");
const entity_schema_1 = require("../entity/entity-schema");
// -----------------------------------------------------------------
// Server to client replicated state
//  This data gets written by the server and is automatically pushed out to all clients
//  whenever something changes.
//
//  Clients use whatever the most recent version of the replica they received
// ----------------------------------------------------------------
exports.GameReplicaSchema = new schema_1.MuStruct({
    // running state
    running: new schema_1.MuBoolean(false),
    // sync
    sync: new schema_1.MuBoolean(false),
    // Environment state
    environment: environment_schema_1.EnvironmentParamSchema,
    // Model state
    models: model_schema_1.NetModelSetSchema,
    // player display
    players: player_schema_1.PlayerDisplaySetSchema,
    // particles
    particles: particle_schema_1.ParticleReplicaSchema,
    // damage component
    damage: damage_schema_1.DamageSetSchema,
    // interactive objects
    interactive: interact_protocol_1.InteractComponentSetSchema,
    // entityName objects
    entityName: entity_name_1.EntityNameComponentSetSchema,
    // sound
    sound: sound_protocol_1.SoundReplicaSchema,
    // keyframes
    keyframes: keyframe_schema_1.KeyframeReplicaSchema,
    // entities
    entities: entity_schema_1.EntitySetSchema,
});
//# sourceMappingURL=game-replica.js.map