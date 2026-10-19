import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MuVarint } from '@box/mudb/schema/varint';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
export declare const EntityNameComponentSchema: MuStruct<{
    id: MuVarint;
    radius: MuQuantizedFloat;
    name: MuUTF8;
    color: QuantizedVec3Schema;
}>;
export type EntityNameComponent = typeof EntityNameComponentSchema.identity;
export declare const EntityNameComponentSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    radius: MuQuantizedFloat;
    name: MuUTF8;
    color: QuantizedVec3Schema;
}>>;
