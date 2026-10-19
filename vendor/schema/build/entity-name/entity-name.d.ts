import { MuStruct, MuVarint, MuSortedArray, MuUTF8, MuQuantizedFloat } from '@box/mudb/schema';
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
//# sourceMappingURL=entity-name.d.ts.map