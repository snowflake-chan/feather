import { MuStruct } from '@box/mudb/schema/struct';
export declare const ScriptSentEventSchema: MuStruct<{
    damage: MuStruct<{
        hurt: import("@box/mudb/schema").MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            damage: import("@box/mudb/schema").MuVarint;
        }>>;
        respawn: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        die: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
    }>;
}>;
