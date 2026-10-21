import {
  MuStruct,
  MuUint32,
  MuBoolean,
  MuFloat32,
  MuArray,
  MuUTF8,
  MuUint8,
} from '@box/mudb/schema';
import { Vec3Schema, Vec2Schema } from '@box/schema/utils/math-schema';

// -----------------------------------------------------------
// Client specific private info
// -----------------------------------------------------------
export const GameLocalsSchema = new MuStruct({
  // camera pitch and yaw
  pitch: new MuFloat32(Math.PI * 0.4),
  yaw: new MuFloat32(0),

  // look axis
  // axis: Vec3Schema,

  // Inputs for user selection
  isLooking: new MuBoolean(false),
  lookTarget: Vec3Schema,
  lookNormal: Vec3Schema,

  // button press
  buttonPressed: Vec2Schema,

  // prevButtonState
  prevButtonState: new MuUint32(),

  prevKeyDown: new MuArray(new MuUint8(), Infinity),
});

export type GameLocals = typeof GameLocalsSchema.identity;
