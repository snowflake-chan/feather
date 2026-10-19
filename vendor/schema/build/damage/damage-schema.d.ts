import { MuStruct, MuVarint, MuBoolean, MuSortedArray, MuQuantizedFloat } from '@box/mudb/schema';
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
//# sourceMappingURL=damage-schema.d.ts.map