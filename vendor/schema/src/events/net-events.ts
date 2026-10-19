import { NetInputEventSchema } from '../net/net-schema';
import { MuArray } from '@box/mudb/schema/array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuVarint } from '@box/mudb/schema/varint';

export const ScriptNetInputSchema = new MuStruct({
  id: new MuVarint(0),
  ...NetInputEventSchema.muData,
});
export type ScriptNetInput = typeof ScriptNetInputSchema;
export const ScriptNetInputSetSchema = new MuArray(
  ScriptNetInputSchema,
  Infinity,
);
