import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MuVarint } from '@box/mudb/schema/varint';
import { MuVoid } from '@box/mudb/schema/void';
import { compareId } from '@box/utils/id';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
import { vec3 } from 'gl-matrix';
import { EmoteEventSchema, EmoteSchema } from '../events/emote-event-schema';

export const InteractComponentSchema = new MuStruct({
  id: new MuVarint(),
  radius: new MuQuantizedFloat(1 / 16, 16),
  hint: new MuUTF8(),
  color: new QuantizedVec3Schema(1 / 256, vec3.fromValues(1, 1, 1)),
});
export type InteractComponent = typeof InteractComponentSchema.identity;

export const InteractComponentSetSchema = new MuSortedArray(
  InteractComponentSchema,
  Infinity,
  compareId,
);

export const InteractMessageSchema = new MuStruct({
  id: new MuVarint(),
  tick: new MuQuantizedFloat(1 / 16),
});

export const InteractProtocol = {
  name: 'entity-interact',
  client: {
    acknowledgeInteract: new MuVoid(),
    emoteEvent: EmoteEventSchema,
  },
  server: {
    interact: InteractMessageSchema,
    playEmote: EmoteSchema,
  },
};
