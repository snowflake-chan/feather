import { PlayerFlags } from '@box/schema/player/player-schema';
import { ImageAssetSource, createCanvas2DImageSource } from '../utils/image';

import arrow from 'src/assets/gamepad/arrow.png';
import jump from 'src/assets/gamepad/jump.png';
import A from 'src/assets/gamepad/A.png';
import B from 'src/assets/gamepad/B.png';
import crouch from 'src/assets/gamepad/crouch.png';
import fly from 'src/assets/gamepad/fly.png';
import flyReversed from 'src/assets/gamepad/fly-reversed.png';

export enum GamepadButtons {
  Joystick = 'joystick',
  Jump = 'jump',
  ActionA = 'actionA',
  ActionB = 'actionB',
  Crouch = 'crouch',
  Fly = 'fly',
}
export const gamepadButtonsPlayerFlagsMap = {
  [GamepadButtons.Jump]: PlayerFlags.ALLOW_JUMP,
  [GamepadButtons.ActionA]: PlayerFlags.ALLOW_ACTION_0,
  [GamepadButtons.ActionB]: PlayerFlags.ALLOW_ACTION_1,
  [GamepadButtons.Crouch]: PlayerFlags.ALLOW_CROUCH,
  [GamepadButtons.Fly]: PlayerFlags.ALLOW_FLIGHT | PlayerFlags.SPECTATOR,
};
export const TAP_TIME = 200;

export const ARROW_IMG: ImageAssetSource = createCanvas2DImageSource(arrow);
export const JUMP_IMG: ImageAssetSource = createCanvas2DImageSource(jump);
export const A_IMG: ImageAssetSource = createCanvas2DImageSource(A);
export const B_IMG: ImageAssetSource = createCanvas2DImageSource(B);
export const CROUCH_IMG: ImageAssetSource = createCanvas2DImageSource(crouch);
export const FLY_IMG: ImageAssetSource = createCanvas2DImageSource(fly);
export const FLY_REVERSED_IMG = createCanvas2DImageSource(flyReversed);
