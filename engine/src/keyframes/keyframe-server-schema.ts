import { MuFloat64, MuStruct } from '@box/mudb/schema';
import { ENTITY_ANIM_BINDING } from '@box/schema/keyframes/bindings/entity-animation';
import { PLAYER_ANIM_BINDING } from '@box/schema/keyframes/bindings/player-animation';
import { WORLD_ANIM_BINDING } from '@box/schema/keyframes/bindings/world-animation';

export const KeyframeServerStateSchema = new MuStruct({
  prevTick: new MuFloat64(),
  entityIndex: ENTITY_ANIM_BINDING.indexSchema,
  playerIndex: PLAYER_ANIM_BINDING.indexSchema,
  worldIndex: WORLD_ANIM_BINDING.indexSchema,
});
