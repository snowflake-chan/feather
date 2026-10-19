import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuDictionary } from '@box/mudb/schema/dictionary';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint32 } from '@box/mudb/schema/uint32';
import { MuVarint } from '@box/mudb/schema/varint';

export const EntitySetSchema = new MuSortedArray(
  new MuVarint(),
  Infinity,
  (a, b) => a - b,
);

export const DeletedEntitiesSchema = new MuDictionary(
  new MuBoolean(false),
  Infinity,
);

export const EntityStateSchema = new MuStruct({
  counter: new MuUint32(1),
  entities: EntitySetSchema,
  pendingDelete: EntitySetSchema,

  deletedEntities: DeletedEntitiesSchema,
});
