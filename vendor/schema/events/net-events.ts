import { NetInputEventSchema } from '../net/net-schema';
import { MuStruct, MuVarint, MuArray } from '@box/mudb/schema';

export const ScriptNetInputSchema = new MuStruct({
  id: new MuVarint(0),
  ...NetInputEventSchema.muData,
});
export type ScriptNetInput = typeof ScriptNetInputSchema;
export const ScriptNetInputSetSchema = new MuArray(
  ScriptNetInputSchema,
  Infinity,
);
