import { MuArray, MuSchema, MuStruct, MuVarint } from '@box/mudb/schema';
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
//# sourceMappingURL=emote-event-schema.d.ts.map