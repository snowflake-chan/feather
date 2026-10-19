import { MuStruct, MuVarint } from '@box/mudb/schema';

export const ScriptPerfCounterSchema = new MuStruct({
  // scheduler
  pqAllocCount: new MuVarint(),
  pqFreeCount: new MuVarint(),
  pqScheduled: new MuVarint(),
  pqTimeouts: new MuVarint(),
});

export type ScriptPerfCounter = typeof ScriptPerfCounterSchema.identity;
