import {
  PlayerFlyState,
  PlayerWalkState,
  PlayerJumpState,
  PlayerButtonState,
  BodyPart,
} from '@box/schema/player/player-schema';
import { AvatarBodyPart } from '@box/apis';

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

export const AvatarBodyPartMap: {
  [key in AvatarBodyPart]: keyof typeof BodyPart;
} = {
  [AvatarBodyPart.head]: 'head',
  [AvatarBodyPart.hips]: 'hips',
  [AvatarBodyPart.leftFoot]: 'leftFoot',
  [AvatarBodyPart.leftHand]: 'leftHand',
  [AvatarBodyPart.leftLowerArm]: 'leftLowerArm',
  [AvatarBodyPart.leftLowerLeg]: 'leftLowerLeg',
  [AvatarBodyPart.leftShoulder]: 'leftShoulder',
  [AvatarBodyPart.leftUpperArm]: 'leftUpperArm',
  [AvatarBodyPart.leftUpperLeg]: 'leftUpperLeg',
  [AvatarBodyPart.neck]: 'neck',
  [AvatarBodyPart.rightFoot]: 'rightFoot',
  [AvatarBodyPart.rightHand]: 'rightHand',
  [AvatarBodyPart.rightLowerArm]: 'rightLowerArm',
  [AvatarBodyPart.rightLowerLeg]: 'rightLowerLeg',
  [AvatarBodyPart.rightShoulder]: 'rightShoulder',
  [AvatarBodyPart.rightUpperArm]: 'rightUpperArm',
  [AvatarBodyPart.rightUpperLeg]: 'rightUpperLeg',
  [AvatarBodyPart.torso]: 'torso',
};
