import { MuArray } from '@box/mudb/schema/array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuVarint } from '@box/mudb/schema/varint';
export declare const HurtEventSchema: MuStruct<{
    id: MuVarint;
    damage: MuVarint;
}>;
export declare const HurtEventSetSchema: MuArray<MuStruct<{
    id: MuVarint;
    damage: MuVarint;
}>>;
export declare const RespawnEventSchema: MuStruct<{
    tick: MuVarint;
    id: MuVarint;
}>;
export declare const RespawnEventSetSchema: MuArray<MuStruct<{
    tick: MuVarint;
    id: MuVarint;
}>>;
export declare const DamageEventSchema: MuStruct<{
    hurt: MuArray<MuStruct<{
        id: MuVarint;
        damage: MuVarint;
    }>>;
    respawn: MuArray<MuVarint>;
    die: MuArray<MuVarint>;
}>;
