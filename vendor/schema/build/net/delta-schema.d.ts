import { MuArray } from '@box/mudb/schema/array';
import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint32 } from '@box/mudb/schema/uint32';
export declare function DeltaListSchema<ListSchema extends MuSortedArray<any>>(schema: ListSchema): MuStruct<{
    upserts: ListSchema;
    remove: MuArray<MuUint32>;
}>;
export declare function DeltaSchema<Schema extends MuSchema<any>>(schema: Schema): MuStruct<{
    patch: Schema;
    changed: MuBoolean;
}>;
