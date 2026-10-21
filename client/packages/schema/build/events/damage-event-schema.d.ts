import { MuStruct, MuArray, MuVarint } from '@box/mudb/schema';
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
//# sourceMappingURL=damage-event-schema.d.ts.map