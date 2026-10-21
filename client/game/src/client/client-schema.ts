import { MuSchema, MuArray } from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';

export const getMuRef = <T>() => {
  const ClientSchema = <MuSchema<T>>new MuRefSchema<T>();
  return ClientSchema.clone(ClientSchema.identity);
};
