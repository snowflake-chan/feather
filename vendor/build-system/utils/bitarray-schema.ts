import { MuStruct, MuVarint, MuArray, MuUint32 } from '@box/mudb/schema';

export const BitArraySchema = new MuStruct({
  size: new MuVarint(),
  data: new MuArray(new MuUint32(), Infinity),
});
