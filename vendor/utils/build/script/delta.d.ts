import { MuSortedArray, MuStruct, MuArray, MuUint32, MuSchema, MuBoolean } from '@box/mudb/schema';
import { TaggedId } from '../id';
export type DeltaOutType<Schema extends MuSchema<TaggedId>> = {
    upserts: Schema['identity'][];
    remove: number[];
};
export declare function DeltaListSchema<ListSchema extends MuSortedArray<any>>(schema: ListSchema): MuStruct<{
    upserts: ListSchema;
    remove: MuArray<MuUint32>;
}>;
export declare function deltaList<Schema extends MuSchema<TaggedId>>(schema: Schema, out: {
    upserts: Schema['identity'][];
    remove: number[];
}, base: Schema['identity'][], target: Schema['identity'][]): void;
export declare function patchList<Schema extends MuSchema<TaggedId>>(schema: Schema, base: Schema['identity'][], patch: {
    upserts: Schema['identity'][];
    remove: number[];
}): void;
export declare function patchListDelta<Schema extends MuSchema<TaggedId>>(schema: Schema, base: Schema['identity'][], patch: {
    upserts: Schema['identity'][];
    remove: number[];
}): void;
export declare function DeltaSchema<Schema extends MuSchema<any>>(schema: Schema): MuStruct<{
    patch: Schema;
    changed: MuBoolean;
}>;
export declare function deltaItem<Schema extends MuSchema<any>>(schema: Schema, out: {
    patch: Schema['identity'];
    changed: boolean;
}, base: Schema['identity'], target: Schema['identity']): void;
export declare function patchItem<Schema extends MuSchema<any>>(schema: Schema, base: Schema['identity'], patch: {
    patch: Schema['identity'];
    changed: boolean;
}): any;
//# sourceMappingURL=delta.d.ts.map