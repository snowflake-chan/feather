import { MuSortedArray, MuUint32, MuStruct, MuVarint, MuDictionary, MuBoolean } from '@box/mudb/schema';
export declare const EntitySetSchema: MuSortedArray<MuVarint>;
export declare const DeletedEntitiesSchema: MuDictionary<MuBoolean>;
export declare const EntityStateSchema: MuStruct<{
    counter: MuUint32;
    entities: MuSortedArray<MuVarint>;
    pendingDelete: MuSortedArray<MuVarint>;
    deletedEntities: MuDictionary<MuBoolean>;
}>;
//# sourceMappingURL=entity-schema.d.ts.map