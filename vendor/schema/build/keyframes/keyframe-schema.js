"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyframeReplicaSchema = void 0;
const struct_1 = require("@box/mudb/schema/struct");
const entity_animation_1 = require("./bindings/entity-animation");
const player_animation_1 = require("./bindings/player-animation");
const world_animation_1 = require("./bindings/world-animation");
exports.KeyframeReplicaSchema = new struct_1.MuStruct({
    entity: entity_animation_1.ENTITY_ANIM_BINDING.setSchema,
    player: player_animation_1.PLAYER_ANIM_BINDING.setSchema,
    world: world_animation_1.WORLD_ANIM_BINDING.setSchema,
});
