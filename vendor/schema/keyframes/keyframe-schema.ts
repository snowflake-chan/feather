import { MuStruct } from '@box/mudb/schema';
import { ENTITY_ANIM_BINDING } from './bindings/entity-animation';
import { PLAYER_ANIM_BINDING } from './bindings/player-animation';
import { WORLD_ANIM_BINDING } from './bindings/world-animation';

export const KeyframeReplicaSchema = new MuStruct({
  entity: ENTITY_ANIM_BINDING.setSchema,
  player: PLAYER_ANIM_BINDING.setSchema,
  world: WORLD_ANIM_BINDING.setSchema,
});
