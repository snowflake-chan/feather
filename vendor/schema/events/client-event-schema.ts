import { MuStruct, MuArray, MuUint8 } from '@box/mudb/schema';
import { Vec2Schema } from '../utils/math-schema';
import { initArray } from '@box/utils/init-array';
import { GameKeys } from '../input/input-schema';
import { AnimationEventSchema } from './animation-event-schema';
import { ChatEventSchema } from './chat-event-schema';
import { VoxelEventSchema } from './voxel-event-schema';
import { DamageEventSchema } from './damage-event-schema';
import {
  PlayerInputEventSchema,
  PlayerEventSchema,
} from './player-event-schema';
import { EmoteEventsSchema } from './emote-event-schema';

export const ClientEventSchema = new MuStruct({
  // voxel events
  voxel: VoxelEventSchema,

  // animation events
  animation: AnimationEventSchema,

  // chat events
  chat: ChatEventSchema,

  // damage
  damage: DamageEventSchema,

  // players emote events
  emote: EmoteEventsSchema,

  // input stuff
  lookAxisMovement: Vec2Schema,
  keyTap: new MuArray(
    new MuUint8(0),
    Infinity,
    initArray(GameKeys.KEY_COUNT, () => 0),
  ),

  // player inputs
  playerInput: new MuArray(PlayerInputEventSchema, Infinity),

  // player events
  playerJoin: new MuArray(PlayerEventSchema, Infinity),
  playerLeave: new MuArray(PlayerEventSchema, Infinity),
});

export type ClientEvents = typeof ClientEventSchema.identity;
