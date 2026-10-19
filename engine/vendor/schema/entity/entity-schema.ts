import {
  MuSortedArray,
  MuUint32,
  MuStruct,
  MuVarint,
  MuDictionary,
  MuBoolean,
} from '@box/mudb/schema';

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
