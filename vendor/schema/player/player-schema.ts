import {
  MuStruct,
  MuUint32,
  MuUTF8,
  MuASCII,
  MuUint8,
  MuSortedArray,
  MuUint16,
  MuVarint,
  MuSchema,
  MuBoolean,
  MuArray,
  MuDictionary,
  MuQuantizedFloat,
} from '@box/mudb/schema';
import { compareId } from '@box/utils/id';
import {
  QuantizedVec3Schema,
  QuantizedVec4Schema,
} from '../utils/quantized-schema';
import { UserIdSchema } from '../permissions/permission-rda';
import { vec3, vec4, quat } from 'gl-matrix';
import { Vec3Schema } from '../utils/math-schema';

export enum PlayerLoginState {
  UNKNOWN,
  USER,
  GUEST,
  // we may need to support later:
  // ADMIN,
}

export const PlayerAttachmentSchema = new MuStruct({
  // mesh
  meshId: new MuVarint(),

  // material modifiers
  red: new MuQuantizedFloat(1 / 256, 1),
  green: new MuQuantizedFloat(1 / 256, 1),
  blue: new MuQuantizedFloat(1 / 256, 1),
  emissive: new MuQuantizedFloat(1 / 256, 0),
  shininess: new MuQuantizedFloat(1 / 256, 0),
  metalness: new MuQuantizedFloat(1 / 256, 0),

  // bind matrix
  offset: new QuantizedVec3Schema(1 / 256),
  scale: new QuantizedVec3Schema(1 / 256, vec3.fromValues(1, 1, 1)),
  orientation: <MuSchema<quat>>(
    (<any>new QuantizedVec4Schema(1 / 256, vec4.fromValues(1, 0, 0, 0)))
  ),
});

export type PlayerAttachment = typeof PlayerAttachmentSchema.identity;

export const PlayerAttachmentSetSchema = new MuArray(
  PlayerAttachmentSchema,
  Infinity,
);

export enum BodyPart {
  hips,
  torso,
  neck,
  head,
  leftShoulder,
  leftUpperArm,
  leftLowerArm,
  leftHand,
  rightShoulder,
  rightUpperArm,
  rightLowerArm,
  rightHand,
  leftUpperLeg,
  leftLowerLeg,
  leftFoot,
  rightUpperLeg,
  rightLowerLeg,
  rightFoot,
}

/**
 * 美术规定皮肤文件默认缩放值
 */
export const BODY_PART_DEFAULT_SCALE = 0.042;

/**
 * 美术规定皮肤文件默认旋转度数
 */
export const BODY_PART_DEFAULT_ROTATIONS = {
  rightHand: [0, 0, 90],
  leftHand: [0, 0, 270],
};

/**
 * skin相关的schema生成器,返回的schema中key为部件名(BodyPart)
 * @param valueSchema
 * @returns
 */
function playerSkinSchemaGenerator<T extends MuSchema<any>>(
  valueSchema: T,
): MuStruct<{
  -readonly // 去除掉enum自带的number key，并且去掉readonly修饰符
  [key in keyof typeof BodyPart as Exclude<key, number>]: T;
}> {
  return new MuStruct({
    hips: valueSchema,
    torso: valueSchema,
    neck: valueSchema,
    head: valueSchema,
    leftShoulder: valueSchema,
    leftUpperArm: valueSchema,
    leftLowerArm: valueSchema,
    leftHand: valueSchema,
    rightShoulder: valueSchema,
    rightUpperArm: valueSchema,
    rightLowerArm: valueSchema,
    rightHand: valueSchema,
    leftUpperLeg: valueSchema,
    leftLowerLeg: valueSchema,
    leftFoot: valueSchema,
    rightUpperLeg: valueSchema,
    rightLowerLeg: valueSchema,
    rightFoot: valueSchema,
  });
}

export const MeshBoundSchema = new MuStruct({
  lo: Vec3Schema,
  hi: Vec3Schema,
});
export type MeshBound = typeof MeshBoundSchema.identity;

export const PlayerMeshBoundSchema = playerSkinSchemaGenerator(MeshBoundSchema);
export type PlayerMeshBound = typeof PlayerMeshBoundSchema.identity;

// "装备"(attachment)schema, 覆盖于skin之上的部分, PlayerDisplaySchema的属性
export const PlayerAttachmentStateSchema = playerSkinSchemaGenerator(
  PlayerAttachmentSetSchema,
);

// 皮肤schema, 值为hash
export const PlayerSkinHashSchema = playerSkinSchemaGenerator(new MuASCII());
export type PlayerSkinHash = typeof PlayerSkinHashSchema['identity'];

// 皮肤schema, 值为皮肤名
export const PlayerSkinNameSchema = playerSkinSchemaGenerator(new MuASCII());
export type PlayerSkinName = typeof PlayerSkinNameSchema['identity'];

// 皮肤id schema, id为modelInfo.invSkinIndex中该部件的hash对应的id值
export const PlayerSkinIdSchema = playerSkinSchemaGenerator(new MuVarint(0));
export type PlayerSkinId = typeof PlayerSkinIdSchema['identity'];

// 控制皮肤各部分是否隐藏的schema，为true时该部件的皮肤mesh隐藏，不影响attachment的显示
export const PlayerSkinInvisibleSchema = playerSkinSchemaGenerator(
  new MuBoolean(false),
);
export type PlayerSkinInvisible = typeof PlayerSkinInvisibleSchema['identity'];

// Player input state bit fields
export enum PlayerFlyState {
  SHIFT = 0,
  BITS = 1,
  MASK = ((1 << BITS) - 1) << SHIFT,

  NOT_FLYING = 0 << SHIFT, // player is controlled by usually physics/walking controller
  FLYING = 1 << SHIFT, // player is flying
}

export enum PlayerWalkState {
  SHIFT = 2,
  BITS = 2,
  MASK = ((1 << BITS) - 1) << SHIFT,

  CROUCH = 0 << SHIFT,
  WALK = 1 << SHIFT,
  RUN = 2 << SHIFT,
}

export enum PlayerButtonState {
  NONE = 0,

  SHIFT = 4,
  BITS = 5,
  MASK = ((1 << BITS) - 1) << SHIFT,

  WALK = 1 << SHIFT,
  JUMP = 1 << (SHIFT + 1),
  CROUCH = 1 << (SHIFT + 2),
  ACTION_0 = 1 << (SHIFT + 3),
  ACTION_1 = 1 << (SHIFT + 4),
}

export enum PlayerJumpState {
  SHIFT = 9,
  BITS = 3,
  MASK = ((1 << BITS) - 1) << SHIFT,

  GROUND = 0 << SHIFT, // true if player is on ground
  SWIM = 1 << SHIFT, // true if player is swimming
  JUMP = 2 << SHIFT, // true for initial jump state
  FALL = 3 << SHIFT, // set when player releases jump but is in air
  DOUBLE_JUMP = 4 << SHIFT, // set after player presses jump a second time in the fall state
}

export function playerStateBits(
  move: PlayerFlyState,
  walk: PlayerWalkState,
  jump: PlayerJumpState,
  buttons: PlayerButtonState,
) {
  return move | walk | jump | buttons;
}

export function playerFlyState(bits: number): PlayerFlyState {
  return bits & PlayerFlyState.MASK;
}

export function playerWalkState(bits: number): PlayerWalkState {
  return bits & PlayerWalkState.MASK;
}

export function playerJumpState(bits: number): PlayerJumpState {
  return bits & PlayerJumpState.MASK;
}

export function playerButtonState(bits: number): PlayerButtonState {
  return bits & PlayerButtonState.MASK;
}

export const PlayerInputSchema = new MuStruct({
  id: new MuUint32(0),
  state: new MuUint16(
    playerStateBits(
      PlayerFlyState.NOT_FLYING,
      PlayerWalkState.WALK,
      PlayerJumpState.FALL,
      0,
    ),
  ),
  angle: new MuUint8(0), // input key/joystick angle.  rounded to increments of 255
  cameraAngle: new MuUint8(0),
  pitch: new MuUint8(0),
});

export type PlayerInput = typeof PlayerInputSchema.identity;

export const PlayerInputSetSchema = new MuSortedArray(
  PlayerInputSchema,
  Infinity,
  compareId,
);

export type PlayerInputSet = typeof PlayerInputSetSchema.identity;

export enum PlayerDisplayFlags {
  INVISIBLE = 1 << 0,
  HACKING = 1 << 1,
  DEAD = 1 << 2,
  SHOW_NAME = 1 << 3,
  SHOW_INDICATOR = 1 << 4,
}

export enum InputDirectionState {
  SWAP_DIRECTION = 1 << 0,
  REVERSE_VERTICAL = 1 << 1,
  REVERSE_HORIZONTAL = 1 << 2,
  DISABLE_VERTICAL = 1 << 3,
  DISABLE_HORIZONTAL = 1 << 4,
}

export const PlayerDisplaySchema = new MuStruct({
  id: new MuVarint(),

  // display flags
  flags: <MuSchema<PlayerDisplayFlags>>(
    new MuVarint(PlayerDisplayFlags.SHOW_NAME)
  ),

  // skin and display info
  name: new MuUTF8('player'),
  tag: new MuVarint(0),
  avatarSkin: PlayerSkinIdSchema,
  userId: UserIdSchema,
  avatar_hash: new MuASCII(),
  skinInvisible: PlayerSkinInvisibleSchema,
  mapSkin: PlayerSkinIdSchema,

  // tint
  color: new QuantizedVec3Schema(1 / 256, vec3.fromValues(1, 1, 1)),
  metalness: new MuQuantizedFloat(1 / 256, 0),
  emissive: new MuQuantizedFloat(1 / 256, 0),
  shininess: new MuQuantizedFloat(1 / 256, 0),

  // scale
  scale: new MuQuantizedFloat(1 / 256, 1),

  // attachments
  attachments: PlayerAttachmentStateSchema,
});

export type PlayerDisplay = typeof PlayerDisplaySchema.identity;

export const PlayerDisplaySetSchema = new MuSortedArray(
  PlayerDisplaySchema,
  Infinity,
  compareId,
);

export const PLAYER_CONFIG_PRECISION = 1 / 1024;

export enum PlayerFlags {
  NONE = 0,
  /**
   * 可穿墙的幽灵👻
   */
  SPECTATOR = 1 << 0,
  ALLOW_FLIGHT = 1 << 1,
  ALLOW_MOVE = 1 << 2,
  ALLOW_ACTION_0 = 1 << 3,
  ALLOW_ACTION_1 = 1 << 4,
  ALLOW_JUMP = 1 << 5,
  ALLOW_DOUBLE_JUMP = 1 << 6,
  ALLOW_CROUCH = 1 << 7,
}

// step flags
export enum PlayerOccupancyFlags {
  EDGE_BIT = 1,

  X_NEG_SHIFT = 0,
  X_POS_SHIFT = 1,
  Z_NEG_SHIFT = 2,
  Z_POS_SHIFT = 3,

  EDGE_X_NEG = EDGE_BIT << X_NEG_SHIFT,
  EDGE_X_POS = EDGE_BIT << X_POS_SHIFT,
  EDGE_Z_NEG = EDGE_BIT << Z_NEG_SHIFT,
  EDGE_Z_POS = EDGE_BIT << Z_POS_SHIFT,
}

export const PlayerSchema = new MuStruct({
  // entity id
  id: new MuVarint(),

  // contact info from physics engine
  physGround: new MuBoolean(false),
  physFluid: new MuQuantizedFloat(1 / 32, 0),

  // platform frame of reference info
  platformX: new MuQuantizedFloat(1 / 256, 0),
  platformY: new MuQuantizedFloat(1 / 256, 0),
  platformZ: new MuQuantizedFloat(1 / 256, 0),

  // adjacent occupancy flags (for climbing)
  occupancy: new MuUint8(0),

  // movement state flags
  flags: <MuSchema<PlayerFlags>>(
    new MuVarint(
      PlayerFlags.ALLOW_FLIGHT |
        PlayerFlags.ALLOW_ACTION_0 |
        PlayerFlags.ALLOW_ACTION_1 |
        PlayerFlags.ALLOW_JUMP |
        PlayerFlags.ALLOW_DOUBLE_JUMP |
        PlayerFlags.ALLOW_CROUCH |
        PlayerFlags.ALLOW_MOVE,
    )
  ),

  // server authoritative movement parameters
  walkSpeed: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.22),
  walkAcceleration: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.19),
  runSpeed: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.4),
  runAcceleration: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.35),
  crouchSpeed: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.1),
  crouchAcceleration: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.09),
  swimSpeed: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.4),
  swimAcceleration: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.1),
  flySpeed: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 2),
  flyAcceleration: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 2),
  jumpSpeedFactor: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.85),
  jumpAccelerationFactor: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.55),
  jumpPower: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.96),
  doubleJumpPower: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 0.9),

  freezedForwardAngle: new MuUint16(0),
  inputDirectionState: new MuUint8(0),

  // step height
  stepHeight: new MuQuantizedFloat(PLAYER_CONFIG_PRECISION, 1.25),
});

export type Player = typeof PlayerSchema.identity;

export const PlayerSetSchema = new MuSortedArray(
  PlayerSchema,
  Infinity,
  compareId,
);

export type PlayerSet = typeof PlayerSetSchema.identity;

export const PlayerIndexSchema = new MuDictionary(new MuVarint(), Infinity);
