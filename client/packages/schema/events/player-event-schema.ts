import { MuStruct, MuVarint, MuBoolean } from '@box/mudb/schema';
import { Vec3Schema } from '../utils/math-schema';

export const PlayerInputEventSchema = new MuStruct({
  id: new MuVarint(),
  button: new MuVarint(),
  press: new MuBoolean(),
  position: Vec3Schema,
});

export const PlayerEventSchema = new MuStruct({
  id: new MuVarint(),
  position: Vec3Schema,
});
