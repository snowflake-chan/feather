import {
  MuStruct,
  MuUint32,
  MuUint16,
  MuUint8,
  MuSchema,
  MuArray,
  MuVarint,
  MuFloat32,
} from '@box/mudb/schema';
import { Vec3Schema } from '../utils/math-schema';

export enum FootType {
  LEFT,
  RIGHT,
}

export const FootStepEventSchema = new MuStruct({
  id: new MuUint32(),
  blockType: new MuUint16(),
  position: Vec3Schema,
  foot: <MuSchema<FootType>>new MuUint8(FootType.LEFT),
});

export const JumpEventSchema = new MuStruct({
  id: new MuVarint(),
  position: Vec3Schema,
  scale: new MuFloat32(1),
});

export const DoubleJumpEventSchema = new MuStruct({
  id: new MuVarint(),
  position: Vec3Schema,
  scale: new MuFloat32(1),
});

export const LandEventSchema = new MuStruct({
  id: new MuVarint(),
  position: Vec3Schema,
});

export const SwimStrokeEventSchema = new MuStruct({
  id: new MuVarint(),
  position: Vec3Schema,
});

export const EnterWaterEventSchema = new MuStruct({
  id: new MuVarint(),
  position: Vec3Schema,
});

export const LeaveWaterEventSchema = new MuStruct({
  id: new MuVarint(),
  position: Vec3Schema,
});

export const CrouchEventSchema = new MuStruct({
  id: new MuVarint(),
  position: Vec3Schema,
});

export const FlyEventSchema = new MuStruct({
  id: new MuVarint(),
  position: Vec3Schema,
});

export const AnimationEventSchema = new MuStruct({
  footStep: new MuArray(FootStepEventSchema, Infinity),
  jump: new MuArray(JumpEventSchema, Infinity),
  doubleJump: new MuArray(DoubleJumpEventSchema, Infinity),
  land: new MuArray(LandEventSchema, Infinity),
  swim: new MuArray(SwimStrokeEventSchema, Infinity),
  enterWater: new MuArray(EnterWaterEventSchema, Infinity),
  leaveWater: new MuArray(LeaveWaterEventSchema, Infinity),
  crouch: new MuArray(CrouchEventSchema, Infinity),
  startFly: new MuArray(FlyEventSchema, Infinity),
  stopFly: new MuArray(FlyEventSchema, Infinity),
});

export type AnimationEvent = typeof AnimationEventSchema.identity;
