import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuVarint } from '@box/mudb/schema/varint';
export declare const DamageSchema: MuStruct<{
    id: MuVarint;
    showHealthBar: MuBoolean;
    hp: MuQuantizedFloat;
    maxHp: MuQuantizedFloat;
}>;
export type Damage = typeof DamageSchema.identity;
export declare const DamageSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    showHealthBar: MuBoolean;
    hp: MuQuantizedFloat;
    maxHp: MuQuantizedFloat;
}>>;
export type DamageSet = typeof DamageSetSchema.identity;
