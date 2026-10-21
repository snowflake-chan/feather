import { isPortrait, isTablet } from 'src/utils/mobile';
import { drawRoundRect } from '../utils/canvas';
import { JoystickSize, JumpSize, ButtonSize, Offset } from './interface';

const JOYSTICK_LEFT = 56;
const JOYSTICK_BOTTOM = 50;
const JOYSTICK_RADIUS = 88 / 2;
const JOYSTICK_HOT_WIDTH = 180;
const JOYSTICK_HOT_HEIGHT = 140;

const JUMP_RIGHT = 40;
const JUMP_BOTTOM = 72;
const JUMP_RADIUS = 56 / 2;
const JUMP_ICON_SIZE = 35;

const ACTION_BTN_RADIUS = 40 / 2;
const ACTION_ICON_SIZE = 20;
const ACTION_ICON_RADIUS = ACTION_ICON_SIZE / 2;

const ACTION_A_LEFT = -24;
const ACTION_A_BOTTOM = 0;
const ACTION_B_LEFT = 0;
const ACTION_B_BOTTOM = 0;
const CROUCH_LEFT = 0;
const CROUCH_BOTTOM = 0;
const FLY_LEFT = 2;
const FLY_BOTTOM = -22;

const TABLET_JOYSTICK_LEFT = 80;
const TABLET_JOYSTICK_BOTTOM = 80;
const TABLET_JOYSTICK_RADIUS = 190 / 2;
const TABLET_JOYSTICK_HOT_WIDTH = 300;
const TABLET_JOYSTICK_HOT_HEIGHT = 240;

const TABLET_JUMP_RIGHT = 60;
const TABLET_JUMP_BOTTOM = 60;
const TABLET_JUMP_RADIUS = 118 / 2;
const TABLET_JUMP_ICON_SIZE = 58;

const TABLET_ACTION_BTN_RADIUS = 72 / 2;
const TABLET_ACTION_ICON_SIZE = 38;
const TABLET_ACTION_ICON_RADIUS = TABLET_ACTION_ICON_SIZE / 2;

const TABLET_ACTION_A_LEFT = -17;
const TABLET_ACTION_A_BOTTOM = -46;
const TABLET_ACTION_B_LEFT = -33;
const TABLET_ACTION_B_BOTTOM = -53;
const TABLET_CROUCH_LEFT = 43;
const TABLET_CROUCH_BOTTOM = -23;
const TABLET_FLY_LEFT = 36;
const TABLET_FLY_BOTTOM = -36;

const PHONE_PORTRAIT_JOYSTICK_LEFT = 32;
const PHONE_PORTRAIT_JOYSTICK_BOTTOM = 99;

const PHONE_PORTRAIT_JUMP_RIGHT = 36;
const PHONE_PORTRAIT_JUMP_BOTTOM = 99;

export function getJoystickSize(): JoystickSize {
  if (isTablet()) {
    return {
      left: TABLET_JOYSTICK_LEFT,
      bottom: TABLET_JOYSTICK_BOTTOM,
      radius: TABLET_JOYSTICK_RADIUS,
      hotHeight: TABLET_JOYSTICK_HOT_HEIGHT,
      hotWidth: TABLET_JOYSTICK_HOT_WIDTH,
    };
  }

  if (isPortrait()) {
    return {
      left: PHONE_PORTRAIT_JOYSTICK_LEFT,
      bottom: PHONE_PORTRAIT_JOYSTICK_BOTTOM,
      radius: JOYSTICK_RADIUS,
      hotHeight: JOYSTICK_HOT_HEIGHT,
      hotWidth: JOYSTICK_HOT_WIDTH,
    };
  }

  return {
    left: JOYSTICK_LEFT,
    bottom: JOYSTICK_BOTTOM,
    radius: JOYSTICK_RADIUS,
    hotHeight: JOYSTICK_HOT_HEIGHT,
    hotWidth: JOYSTICK_HOT_WIDTH,
  };
}

export function getJumpSize(): JumpSize {
  if (isTablet()) {
    return {
      right: TABLET_JUMP_RIGHT,
      bottom: TABLET_JUMP_BOTTOM,
      radius: TABLET_JUMP_RADIUS,
      iconSize: TABLET_JUMP_ICON_SIZE,
    };
  }

  if (isPortrait()) {
    return {
      right: PHONE_PORTRAIT_JUMP_RIGHT,
      bottom: PHONE_PORTRAIT_JUMP_BOTTOM,
      radius: JUMP_RADIUS,
      iconSize: JUMP_ICON_SIZE,
    };
  }
  return {
    right: JUMP_RIGHT,
    bottom: JUMP_BOTTOM,
    radius: JUMP_RADIUS,
    iconSize: JUMP_ICON_SIZE,
  };
}

export function getButtonSize(): ButtonSize {
  if (isTablet()) {
    return {
      radius: TABLET_ACTION_BTN_RADIUS,
      iconSize: TABLET_ACTION_ICON_SIZE,
      iconRadius: TABLET_ACTION_ICON_RADIUS,
    };
  }

  return {
    radius: ACTION_BTN_RADIUS,
    iconSize: ACTION_ICON_SIZE,
    iconRadius: ACTION_ICON_RADIUS,
  };
}

export function getActionAOffset(): Offset {
  if (isTablet()) {
    return {
      left: TABLET_ACTION_A_LEFT,
      bottom: TABLET_ACTION_A_BOTTOM,
    };
  }
  return {
    left: ACTION_A_LEFT,
    bottom: ACTION_A_BOTTOM,
  };
}

export function getActionBOffset(): Offset {
  if (isTablet()) {
    return {
      left: TABLET_ACTION_B_LEFT,
      bottom: TABLET_ACTION_B_BOTTOM,
    };
  }
  return {
    left: ACTION_B_LEFT,
    bottom: ACTION_B_BOTTOM,
  };
}

export function getCrouchOffset(): Offset {
  if (isTablet()) {
    return {
      left: TABLET_CROUCH_LEFT,
      bottom: TABLET_CROUCH_BOTTOM,
    };
  }
  return {
    left: CROUCH_LEFT,
    bottom: CROUCH_BOTTOM,
  };
}

export function getFlyOffset(): Offset {
  if (isTablet()) {
    return {
      left: TABLET_FLY_LEFT,
      bottom: TABLET_FLY_BOTTOM,
    };
  }
  return {
    left: FLY_LEFT,
    bottom: FLY_BOTTOM,
  };
}

export function calcJumpXY(screenWidth: number, screenHeight: number) {
  const { right, bottom, radius } = getJumpSize();
  return {
    jumpX: screenWidth - right - radius,
    jumpY: screenHeight - bottom - radius,
    jumpRadius: radius,
  };
}

export function drawCircleBackground(
  context2D: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fillStyle?: string | CanvasGradient | CanvasPattern,
) {
  // 圆盘外圈
  context2D.beginPath();
  context2D.lineWidth = 1;
  context2D.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  context2D.shadowColor = 'rgba(255, 255, 255, 0.6)';
  context2D.shadowBlur = 2;
  context2D.arc(x, y, radius, 0, 2 * Math.PI);
  context2D.stroke();
  context2D.closePath();

  // 圆盘渐变色背景
  context2D.beginPath();
  const gradient = context2D.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  context2D.fillStyle = fillStyle || gradient;
  context2D.shadowBlur = 0;
  context2D.arc(x, y, radius, 0, 2 * Math.PI);
  context2D.fill();
  context2D.closePath();
}

export function drawFlyBackground(
  context2D: CanvasRenderingContext2D,
  flyX: number,
  flyY: number,
  flyBgWidth: number,
  flyBgHeight: number,
) {
  const flyBgX = flyX - flyBgWidth / 2;
  const flyBgY = flyY - flyBgHeight / 2;

  // 飞行的小圆柱背景边框
  context2D.lineWidth = 1;
  context2D.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  context2D.shadowColor = 'rgba(255, 255, 255, 0.8)';
  context2D.shadowBlur = 2;
  drawRoundRect(
    context2D,
    flyBgX,
    flyBgY,
    flyBgWidth,
    flyBgHeight,
    flyBgWidth / 2,
  );
  context2D.stroke();

  // 小圆柱渐变背景
  const gradient = context2D.createLinearGradient(
    flyBgX,
    flyBgY,
    flyBgX,
    flyBgY + flyBgHeight,
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  context2D.fillStyle = gradient;
  context2D.shadowBlur = 0;
  drawRoundRect(
    context2D,
    flyBgX,
    flyBgY,
    flyBgWidth,
    flyBgHeight,
    flyBgWidth / 2,
  );
  context2D.fill();

  // 画上下六个小三角指示
  const arrowLen = flyBgWidth * 0.4;
  const arrowPadding = arrowLen / Math.SQRT2;
  const flyArrowPadding = 5;
  const alphas = [1, 0.6, 0.3];

  const flyArrowLeftX = flyBgX + (flyBgWidth - arrowLen) / 2;
  const flyArrowMiddleX = flyBgX + flyBgWidth / 2;
  const flyArrowRightX = flyBgX + (flyBgWidth + arrowLen) / 2;

  const flyArrowBottomY = flyBgY + flyBgHeight - flyArrowPadding;
  const flyArrowTopY = flyBgY + flyArrowPadding;

  for (let i = 0; i < 3; i++) {
    context2D.beginPath();
    context2D.strokeStyle = `rgba(255, 255, 255, ${alphas[i]})`;
    context2D.moveTo(
      flyArrowLeftX,
      flyArrowBottomY - arrowLen / 2 - arrowPadding * i,
    );
    context2D.lineTo(flyArrowMiddleX, flyArrowBottomY - arrowPadding * i);
    context2D.lineTo(
      flyArrowRightX,
      flyArrowBottomY - arrowLen / 2 - arrowPadding * i,
    );
    context2D.stroke();
    context2D.closePath();
  }

  for (let i = 0; i < 3; i++) {
    context2D.beginPath();
    context2D.strokeStyle = `rgba(255, 255, 255, ${alphas[i]})`;
    context2D.moveTo(
      flyArrowLeftX,
      flyArrowTopY + arrowLen / 2 + arrowPadding * i,
    );
    context2D.lineTo(flyArrowMiddleX, flyArrowTopY + arrowPadding * i);
    context2D.lineTo(
      flyArrowRightX,
      flyArrowTopY + arrowLen / 2 + arrowPadding * i,
    );
    context2D.stroke();
    context2D.closePath();
  }
}
