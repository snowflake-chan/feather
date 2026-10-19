import { MuStruct, MuVarint } from '@box/mudb/schema';

export const IntBoundsSchema = new MuStruct({
  lox: new MuVarint(),
  loy: new MuVarint(),
  loz: new MuVarint(),

  hix: new MuVarint(),
  hiy: new MuVarint(),
  hiz: new MuVarint(),
});
