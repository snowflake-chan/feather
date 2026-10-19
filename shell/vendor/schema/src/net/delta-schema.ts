import { MuArray } from '@box/mudb/schema/array';
import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint32 } from '@box/mudb/schema/uint32';

export function DeltaListSchema<ListSchema extends MuSortedArray<any>>(
  schema: ListSchema,
) {
  return new MuStruct({
    upserts: schema,
    remove: new MuArray(new MuUint32(0), Infinity),
  });
}
export function DeltaSchema<Schema extends MuSchema<any>>(schema: Schema) {
  return new MuStruct({
    patch: schema,
    changed: new MuBoolean(false),
  });
}
