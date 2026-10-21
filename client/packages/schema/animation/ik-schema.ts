import {
  MuStruct,
  MuFloat32,
  MuArray,
  MuUint32,
  MuBoolean,
  MuUint8,
  MuSortedArray,
  MuFloat64,
} from '@box/mudb/schema';
import {
  Vec3Schema,
  QuatSchema,
  Mat4Schema,
  Vec2Schema,
} from '../utils/math-schema';
import { compareId } from '@box/utils/id';
import { PlayerMeshBoundSchema } from '../player/player-schema';
import { MS_PER_TICK } from '../clock/clock-schema';

export enum GroundEmote {
  none = 0,
  dead,
  wave,
  thomas,
  swing,
  cheer,
  collapse,
  applaud,
}

export const SpringStateSchema = new MuStruct({
  x: new MuFloat32(),
  dx: new MuFloat32(),
});
export type SpringState = typeof SpringStateSchema['identity'];

export const SpringParametersSchema = new MuStruct({
  stiffness: new MuFloat32(0.05),
  damping: new MuFloat32(2.09),
});
export type SpringParameters = typeof SpringParametersSchema['identity'];

export const IKRigSchema = new MuStruct({
  footLength: new MuFloat32(),
  hipWidth: new MuFloat32(),
  neckLength: new MuFloat32(),
  shoulderWidth: new MuFloat32(),
  upperTorsoLength: new MuFloat32(),
  lowerTorsoLength: new MuFloat32(),
  upperLegLength: new MuFloat32(),
  lowerLegLength: new MuFloat32(),
  upperArmLength: new MuFloat32(),
  lowerArmLength: new MuFloat32(),
});
export type IKRig = typeof IKRigSchema['identity'];

export const IKPoseSchema = new MuStruct({
  // left leg
  leftPlant: new MuFloat32(0),
  leftFootPosition: Vec3Schema,
  leftToePosition: Vec3Schema,
  leftKneeDirection: Vec3Schema,

  // right leg
  rightPlant: new MuFloat32(0),
  rightFootPosition: Vec3Schema,
  rightToePosition: Vec3Schema,
  rightKneeDirection: Vec3Schema,

  // left arm
  leftHandPosition: Vec3Schema,
  leftHandOrientation: QuatSchema,
  leftElbowDirection: Vec3Schema,
  leftShoulderPosition: Vec3Schema,

  // right arm
  rightHandPosition: Vec3Schema,
  rightHandOrientation: QuatSchema,
  rightElbowDirection: Vec3Schema,
  rightShoulderPosition: Vec3Schema,

  // torso and hips
  hipPosition: Vec3Schema,
  hipOrientation: QuatSchema,
  spineDirection: Vec3Schema,

  // head
  headPosition: Vec3Schema,
  headOrientation: QuatSchema,
});
export const IKPoseArraySchema = new MuArray(IKPoseSchema, Infinity);
export type IKPose = typeof IKPoseSchema['identity'];
export type IKPoseArray = typeof IKPoseArraySchema['identity'];

export const IKPointSchema = new MuStruct({
  leftHip: Vec3Schema,
  leftKnee: Vec3Schema,
  leftFoot: Vec3Schema,
  leftToe: Vec3Schema,

  rightHip: Vec3Schema,
  rightKnee: Vec3Schema,
  rightFoot: Vec3Schema,
  rightToe: Vec3Schema,

  leftShoulder: Vec3Schema,
  leftElbow: Vec3Schema,
  leftHand: Vec3Schema,

  rightShoulder: Vec3Schema,
  rightElbow: Vec3Schema,
  rightHand: Vec3Schema,

  hips: Vec3Schema,

  spine: Vec3Schema,
  neck: Vec3Schema,

  head: Vec3Schema,
});
export type IKPoints = typeof IKPointSchema['identity'];

export const IKConfigurationSchema = new MuStruct({
  hips: Mat4Schema,
  torso: Mat4Schema,
  neck: Mat4Schema,
  head: Mat4Schema,
  leftShoulder: Mat4Schema,
  leftUpperArm: Mat4Schema,
  leftLowerArm: Mat4Schema,
  leftHand: Mat4Schema,
  rightShoulder: Mat4Schema,
  rightUpperArm: Mat4Schema,
  rightLowerArm: Mat4Schema,
  rightHand: Mat4Schema,
  leftUpperLeg: Mat4Schema,
  leftLowerLeg: Mat4Schema,
  leftFoot: Mat4Schema,
  rightUpperLeg: Mat4Schema,
  rightLowerLeg: Mat4Schema,
  rightFoot: Mat4Schema,
});
export type IKConfiguration = typeof IKConfigurationSchema['identity'];

export function getTicksBySecond(second: number) {
  return (second * 1000) / MS_PER_TICK;
}

export function rateKey(motionName: string) {
  return `${motionName}Rate`;
}

export function cycleKey(motionName: string) {
  return `${motionName}Cycle`;
}

export const IKPaletteSchema = new MuStruct({
  skeleton: IKRigSchema,

  idle: IKPoseSchema,
  crouchIdle: IKPoseSchema,

  // walk cycles
  walk: IKPoseArraySchema,
  walkStride: new MuFloat32(4.36),
  walkCycle: new MuFloat32(13.45),
  walkVelocity: new MuFloat32(0.324),

  run: IKPoseArraySchema,
  runStride: new MuFloat32(4.06),
  runCycle: new MuFloat32(5.75),
  runVelocity: new MuFloat32(0.706),

  // falling and jumping
  jump: IKPoseSchema,
  fall: IKPoseSchema,
  land: IKPoseSchema,
  roll: IKPoseSchema,
  fly: IKPoseSchema,
  landRate: new MuFloat32(0.12),
  rollRate: new MuFloat32(0.15),

  // swim
  swimIdle: IKPoseArraySchema,
  swimIdleCycle: new MuFloat32(0.0625),

  // swim movement cycle
  swim: IKPoseArraySchema,
  swimStride: new MuFloat32(9.63),
  swimCycle: new MuFloat32(1),

  // emotes
  dead: IKPoseArraySchema,
  deadRate: new MuFloat32(0.1),

  wave: IKPoseArraySchema,
  waveRate: new MuFloat32(1 / getTicksBySecond(2)),

  thomas: IKPoseArraySchema,
  thomasRate: new MuFloat32(1 / getTicksBySecond(1)),
  // 托马斯动画重复播放3次
  thomasCycle: new MuFloat32(3),

  swing: IKPoseArraySchema,
  swingRate: new MuFloat32(1 / getTicksBySecond(3)),

  cheer: IKPoseArraySchema,
  cheerRate: new MuFloat32(1 / getTicksBySecond(0.6)),
  // 欢呼动画重复播放4次
  cheerCycle: new MuFloat32(4),

  collapse: IKPoseArraySchema,
  collapseRate: new MuFloat32(1 / getTicksBySecond(0.7)),
  // 倒地动画播放完成后在最后一帧停留3秒
  collapsePause: new MuFloat32(3),

  applaud: IKPoseArraySchema,
  applaudRate: new MuFloat32(1 / getTicksBySecond(1.2)),

  // squash/stretch damping factor
  stretchSpring: SpringParametersSchema,

  // interpolation
  interpolateStiffness: new MuFloat32(37.5),

  // acceleration weights
  accelerationDecay: new MuFloat32(1),
  accelerationScale: new MuFloat32(0.77),
  accelerationCap: new MuFloat32(0.1),

  // minimum velocity for walking to play
  walkThreshold: new MuFloat32(0.1),

  // foot offset
  footOffset: new MuFloat32(0.02),

  // foot correction weight
  turnCorrection: new MuFloat32(0.125),

  // turn rate
  turnStiffness: new MuFloat32(4),

  // breathing
  breathRate: new MuFloat32(0.05),
  breathMagnitude: new MuFloat32(0.005),

  // hand movement in the air
  jitterScale: new MuFloat32(0.02),
  jitterRate: new MuFloat32(0.1),

  // minimum y velocity for land animation
  landThreshold: new MuFloat32(0.7),
});
export type IKPalette = typeof IKPaletteSchema['identity'];

export const IKStateSchema = new MuStruct({
  id: new MuUint32(),

  // tick accumulator
  tickAccumulator: new MuFloat64(),
  priorityAccumulator: new MuFloat64(),

  // animation state
  pose: IKPoseSchema,
  points: IKPointSchema,
  configuration: IKConfigurationSchema,
  meshBound: PlayerMeshBoundSchema,

  // if crouching set
  crouch: new MuBoolean(),
  swimming: new MuBoolean(),
  flying: new MuBoolean(),

  // x/z facing vector for player
  facing: Vec2Schema,

  walkPhase: new MuFloat32(),
  swimPhase: new MuFloat32(),
  breathPhase: new MuFloat32(),
  jitterPhase: new MuFloat32(),
  rollPhase: new MuFloat32(),
  landPhase: new MuFloat32(),
  groundEmotePhase: new MuFloat32(),
  pushPhase: new MuFloat32(),
  leftHandStick: Vec3Schema,
  rightHandStick: Vec3Schema,
  hitBound: new MuStruct({
    lo: Vec3Schema,
    hi: Vec3Schema,
  }),
  hitVector: Vec3Schema,

  // pain animation modifiers
  damageTwitch: Vec3Schema,
  hurtFlash: new MuFloat32(0),

  turnCorrection: new MuFloat32(0),
  hipCorrection: new MuFloat32(0),

  stretchSpring: SpringStateSchema,

  ground: new MuFloat32(0),
  groundEmote: new MuUint8(GroundEmote.none),

  // dynamics variables
  position: Vec3Schema,
  velocity: Vec3Schema,
  acceleration: Vec3Schema,
  landVelocity: new MuFloat32(0),
});
export type IKState = typeof IKStateSchema['identity'];

export const IKInputSchema = new MuStruct({
  // rig
  rig: IKRigSchema,

  // scale
  scale: new MuFloat64(1),

  // rigid body bounds
  bounds: Vec3Schema,

  // input stuff
  inputAxis: Vec3Schema,
  inputState: new MuUint8(0),

  // physics parameters
  position: Vec3Schema,
  velocity: Vec3Schema,

  // moving platform info
  platformVelocity: Vec3Schema,

  // state parameters
  crouch: new MuBoolean(false),
  ground: new MuBoolean(true),
  water: new MuBoolean(false),
  fly: new MuBoolean(false),
  dead: new MuBoolean(false),
  jumpState: new MuUint8(0),
  hitVector: Vec3Schema,
  hitBound: new MuStruct({
    lo: Vec3Schema,
    hi: Vec3Schema,
  }),
});
export type IKInput = typeof IKInputSchema['identity'];

export const IKAnimationListSchema = new MuSortedArray(
  IKStateSchema,
  Infinity,
  compareId,
);

export type IKAnimationList = typeof IKAnimationListSchema.identity;
