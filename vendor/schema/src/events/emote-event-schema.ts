import { MuArray } from '@box/mudb/schema/array';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint8 } from '@box/mudb/schema/uint8';
import { MuVarint } from '@box/mudb/schema/varint';
import { GroundEmote } from '../animation/ik-schema';

export const EmoteSchema = <MuSchema<GroundEmote>>new MuUint8(GroundEmote.none);

export const EmoteEventSchema = new MuStruct({
  id: new MuVarint(),
  emote: EmoteSchema,
});

export const EmoteEventsSchema = new MuArray(EmoteEventSchema, Infinity);

export type EmoteEvents = typeof EmoteEventsSchema.identity;
