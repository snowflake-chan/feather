import {
  MuArray,
  MuSchema,
  MuStruct,
  MuUint8,
  MuVarint,
} from '@box/mudb/schema';
import { GroundEmote } from '../animation/ik-schema';

export const EmoteSchema = <MuSchema<GroundEmote>>new MuUint8(GroundEmote.none);

export const EmoteEventSchema = new MuStruct({
  id: new MuVarint(),
  emote: EmoteSchema,
});

export const EmoteEventsSchema = new MuArray(EmoteEventSchema, Infinity);

export type EmoteEvents = typeof EmoteEventsSchema.identity;
