import { MuStruct } from '@box/mudb/schema/struct';
import { MuUTF8 } from '@box/mudb/schema/utf8';

export const SciptCollisionFilterSpecSchema = new MuStruct({
  a: new MuUTF8(),
  b: new MuUTF8(),
});
