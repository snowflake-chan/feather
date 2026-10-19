import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuDictionary } from '@box/mudb/schema/dictionary';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint32 } from '@box/mudb/schema/uint32';
import { MuVarint } from '@box/mudb/schema/varint';
export declare const EntitySetSchema: MuSortedArray<MuVarint>;
export declare const DeletedEntitiesSchema: MuDictionary<MuBoolean>;
export declare const EntityStateSchema: MuStruct<{
    counter: MuUint32;
    entities: MuSortedArray<MuVarint>;
    pendingDelete: MuSortedArray<MuVarint>;
    deletedEntities: MuDictionary<MuBoolean>;
}>;
