import { GameKeys } from '@box/schema/input/input-schema';
import {
  A_IMG,
  B_IMG,
  JUMP_IMG,
  CROUCH_IMG,
  TAP_TIME,
  GamepadButtons,
} from './const';
import { GamepadBtn, Spec } from './interface';
import {
  drawCircleBackground,
  calcJumpXY,
  getJumpSize,
  getButtonSize,
  getActionAOffset,
  getActionBOffset,
  getCrouchOffset,
} from './util';
import type { ImageAssetSource } from '../utils/image';

export class JumpBtn extends GamepadBtn {
  constructor(spec: Spec) {
    super(spec);
  }

  public name: GamepadButtons = GamepadButtons.Jump;
  private currJump?: HTMLImageElement | ImageBitmap;

  public getHitArea = (screenWidth: number, screenHeight: number) => {
    const { right, bottom, radius } = getJumpSize();
    return {
      x: screenWidth - right - radius * 2,
      y: screenHeight - bottom - radius * 2,
      w: radius * 2,
      h: radius * 2,
    };
  };
  public draw = (
    context2D: CanvasRenderingContext2D,
    screenWidth: number,
    screenHeight: number,
  ) => {
    if (this.active) {
      context2D.filter = 'brightness(120%)';
    }
    const { jumpX, jumpY } = calcJumpXY(screenWidth, screenHeight);
    const { radius, iconSize } = getJumpSize();
    const scale = this.active ? 1.1 : 1;
    let jump = this.state.replica.running
      ? this.state.secret.replica.gamepad.jump
      : this.getGamepadHash?.('buttons', 'jump') || '';
    this.currJump = this.getDrawImage(jump, this.currJump);
    if (this.currJump) {
      context2D.drawImage(
        this.currJump,
        jumpX - radius * scale,
        jumpY - radius * scale,
        radius * 2 * scale,
        radius * 2 * scale,
      );
    } else {
      drawCircleBackground(context2D, jumpX, jumpY, radius * scale);

      JUMP_IMG.image &&
        context2D.drawImage(
          JUMP_IMG.image,
          jumpX - (iconSize / 2) * scale,
          jumpY - (iconSize / 2) * scale,
          iconSize * scale,
          iconSize * scale,
        );
    }
    context2D.filter = 'none';
  };

  private jumpBtnClickTime: number = 0;

  public onTouchStart = () => {
    if (this.active) {
      return;
    }
    this.active = true;
    const now = Date.now();
    if (now - this.jumpBtnClickTime > TAP_TIME) {
      this.jumpBtnClickTime = now;
      this.input.onTouch(GameKeys.JUMP);
    }
  };
  public onTouchEnd = () => {
    this.active = false;
    this.input.unTouch(GameKeys.JUMP);
  };
}

abstract class CommonButton extends GamepadBtn {
  constructor(
    spec: Spec,
    public icon: ImageAssetSource,
    public calcXY: (
      screenWidth: number,
      screenHeight: number,
    ) => { x: number; y: number },
    public onStart: () => void,
    public onEnd: () => void,
  ) {
    super(spec);
  }
  private currBtn?: HTMLImageElement | ImageBitmap;

  public getHitArea = (screenWidth: number, screenHeight: number) => {
    const { radius } = getButtonSize();
    const { x, y } = this.calcXY(screenWidth, screenHeight);
    return {
      x: x - radius,
      y: y - radius,
      w: radius * 2,
      h: radius * 2,
    };
  };
  public draw = (
    context2D: CanvasRenderingContext2D,
    screenWidth: number,
    screenHeight: number,
  ) => {
    if (this.active) {
      context2D.filter = 'brightness(120%)';
    }
    const { x, y } = this.calcXY(screenWidth, screenHeight);
    const scale = this.active ? 1.1 : 1;
    const { radius, iconRadius, iconSize } = getButtonSize();
    let button = this.state.replica.running
      ? this.state.secret.replica.gamepad[this.name]
      : this.getGamepadHash?.('buttons', this.name) || '';

    this.currBtn = this.getDrawImage(button, this.currBtn);
    if (this.currBtn) {
      context2D.drawImage(
        this.currBtn,
        x - radius * scale,
        y - radius * scale,
        radius * 2 * scale,
        radius * 2 * scale,
      );
    } else {
      drawCircleBackground(context2D, x, y, radius * scale);
      this.icon.image &&
        context2D.drawImage(
          this.icon.image,
          x - iconRadius * scale,
          y - iconRadius * scale,
          iconSize * scale,
          iconSize * scale,
        );
    }
    context2D.filter = 'none';
  };
  public onTouchStart = () => {
    if (this.active) {
      return;
    }
    this.active = true;
    this.onStart();
  };
  public onTouchEnd = () => {
    this.active = false;
    this.onEnd();
  };
}

export class ActionABtn extends CommonButton {
  public name: GamepadButtons = GamepadButtons.ActionA;
  constructor(spec: Spec) {
    super(
      spec,
      A_IMG,
      (screenWidth: number, screenHeight: number) => {
        const { jumpX, jumpY, jumpRadius } = calcJumpXY(
          screenWidth,
          screenHeight,
        );
        const { radius } = getButtonSize();
        const { left, bottom } = getActionAOffset();
        return {
          x: jumpX - radius - jumpRadius + left,
          y: jumpY + bottom,
        };
      },
      () => this.input.onTouch(GameKeys.ACTION_0),
      () => this.input.unTouch(GameKeys.ACTION_0),
    );
  }
}

export class ActionBBtn extends CommonButton {
  public name: GamepadButtons = GamepadButtons.ActionB;
  constructor(spec: Spec) {
    super(
      spec,
      B_IMG,
      (screenWidth: number, screenHeight: number) => {
        const { jumpX, jumpY, jumpRadius } = calcJumpXY(
          screenWidth,
          screenHeight,
        );
        const { radius } = getButtonSize();
        const { left, bottom } = getActionBOffset();
        return {
          x: jumpX - radius - jumpRadius + left,
          y: jumpY + radius + jumpRadius + bottom,
        };
      },
      () => this.input.onTouch(GameKeys.ACTION_1),
      () => this.input.unTouch(GameKeys.ACTION_1),
    );
  }
}

export class CrouchBtn extends CommonButton {
  public name: GamepadButtons = GamepadButtons.Crouch;
  constructor(spec: Spec) {
    super(
      spec,
      CROUCH_IMG,
      (screenWidth: number, screenHeight: number) => {
        const { jumpX, jumpY, jumpRadius } = calcJumpXY(
          screenWidth,
          screenHeight,
        );
        const { radius } = getButtonSize();
        const { left, bottom } = getCrouchOffset();
        return {
          x: jumpX - radius - jumpRadius + left,
          y: jumpY - radius - jumpRadius + bottom,
        };
      },
      () => this.input.onTouch(GameKeys.CROUCH),
      () => this.input.unTouch(GameKeys.CROUCH),
    );
  }
}
