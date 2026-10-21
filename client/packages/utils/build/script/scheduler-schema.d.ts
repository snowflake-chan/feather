import { MuStruct, MuVarint } from '@box/mudb/schema';
export declare const ScriptPerfCounterSchema: MuStruct<{
    pqAllocCount: MuVarint;
    pqFreeCount: MuVarint;
    pqScheduled: MuVarint;
    pqTimeouts: MuVarint;
}>;
export type ScriptPerfCounter = typeof ScriptPerfCounterSchema.identity;
//# sourceMappingURL=scheduler-schema.d.ts.map