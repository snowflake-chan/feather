import {
  MuSortedArray,
  MuStruct,
  MuArray,
  MuUint32,
  MuSchema,
  MuBoolean,
} from '@box/mudb/schema';

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
