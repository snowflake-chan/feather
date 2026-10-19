import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MuVarint } from '@box/mudb/schema/varint';
import { MuVoid } from '@box/mudb/schema/void';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
export declare const InteractComponentSchema: MuStruct<{
    id: MuVarint;
    radius: MuQuantizedFloat;
    hint: MuUTF8;
    color: QuantizedVec3Schema;
}>;
export type InteractComponent = typeof InteractComponentSchema.identity;
export declare const InteractComponentSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    radius: MuQuantizedFloat;
    hint: MuUTF8;
    color: QuantizedVec3Schema;
}>>;
export declare const InteractMessageSchema: MuStruct<{
    id: MuVarint;
    tick: MuQuantizedFloat;
}>;
export declare const InteractProtocol: {
    name: string;
    client: {
        acknowledgeInteract: MuVoid;
        emoteEvent: MuStruct<{
            id: MuVarint;
            emote: import("@box/mudb/schema").MuSchema<import("../animation/ik-schema").GroundEmote>;
        }>;
    };
    server: {
        interact: MuStruct<{
            id: MuVarint;
            tick: MuQuantizedFloat;
        }>;
        playEmote: import("@box/mudb/schema").MuSchema<import("../animation/ik-schema").GroundEmote>;
    };
};
