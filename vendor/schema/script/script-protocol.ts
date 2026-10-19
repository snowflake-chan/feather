import { MuUTF8, MuStruct } from '@box/mudb/schema';

export const SciptCollisionFilterSpecSchema = new MuStruct({
  a: new MuUTF8(),
  b: new MuUTF8(),
});
