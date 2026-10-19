import { MuArray } from '@box/mudb/schema/array';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuVarint } from '@box/mudb/schema/varint';
import { GroundEmote } from '../animation/ik-schema';
export declare const EmoteSchema: MuSchema<GroundEmote>;
export declare const EmoteEventSchema: MuStruct<{
    id: MuVarint;
    emote: MuSchema<GroundEmote>;
}>;
export declare const EmoteEventsSchema: MuArray<MuStruct<{
    id: MuVarint;
    emote: MuSchema<GroundEmote>;
}>>;
export type EmoteEvents = typeof EmoteEventsSchema.identity;
