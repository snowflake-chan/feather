import { MuStruct, MuArray, MuUTF8, MuSchema } from '@box/mudb/schema';
import { MuSessionId } from '@box/mudb/socket/socket';
import { PhysicsEventSchema } from './physics-event-schema';
import { ChatEventSchema } from './chat-event-schema';
import { VoxelEventSchema } from './voxel-event-schema';
import { ScriptNetInputSetSchema } from './net-events';
import { ClientKeyboardEventsSchema } from './client-keyboard-event-schema';

export const ServerEventSchema = new MuStruct({
  // voxel events
  voxel: VoxelEventSchema,

  // chat events
  chat: ChatEventSchema,

  // physics events
  physics: PhysicsEventSchema,

  // Network events
  net: ScriptNetInputSetSchema,

  // player state events
  connect: new MuArray(<MuSchema<MuSessionId>>new MuUTF8(), Infinity),
  join: new MuArray(<MuSchema<MuSessionId>>new MuUTF8(), Infinity),
  disconnect: new MuArray(<MuSchema<MuSessionId>>new MuUTF8(), Infinity),
  keyboard: ClientKeyboardEventsSchema,
});
