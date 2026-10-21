import { MuSortedArray, MuStruct, MuArray, MuUint32, MuSchema, MuBoolean } from '@box/mudb/schema';
export declare function DeltaListSchema<ListSchema extends MuSortedArray<any>>(schema: ListSchema): MuStruct<{
    upserts: ListSchema;
    remove: MuArray<MuUint32>;
}>;
export declare function DeltaSchema<Schema extends MuSchema<any>>(schema: Schema): MuStruct<{
    patch: Schema;
    changed: MuBoolean;
}>;
//# sourceMappingURL=delta-schema.d.ts.map