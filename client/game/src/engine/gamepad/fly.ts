import { GameKeys } from '@box/schema/input/input-schema';
import { FLY_REVERSED_IMG, FLY_IMG, GamepadButtons, TAP_TIME } from './const';
import { GamepadBtn, Spec } from './interface';
import {
  calcJumpXY,
  drawFlyBackground,
  drawCircleBackground,
  getButtonSize,
  getFlyOffset,
} from './util';
import { SerializedVec2 } from '../interfaces';

export class FlyBtn extends GamepadBtn {
  constructor(spec: Spec, public getIsFlying: () => boolean) {
    super(spec);
  }

  public name: GamepadButtons = GamepadButtons.Fly;
  private currBtn?: HTMLImageElement | ImageBitmap;
  private currBg?: HTMLImageElement | ImageBitmap;

  private calcFlyXY = (screenWidth: number, screenHeight: number) => {
    const { jumpX, jumpY, jumpRadius } = calcJumpXY(screenWidth, screenHeight);
    const { radius, iconRadius, iconSize } = getButtonSize();
    const { left, bottom } = getFlyOffset();
    return {
      flyX: jumpX + left,
      flyY: jumpY - jumpRadius - radius + bottom,
      flyRadius: radius,
      iconRadius,
      iconSize,
    };
  };

  public getHitArea = (screenWidth: number, screenHeight: number) => {
    const { flyX, flyY, flyRadius } = this.calcFlyXY(screenWidth, screenHeight);
    return {
      x: flyX - flyRadius,
      y: flyY - flyRadius,
      w: flyRadius * 2,
      h: flyRadius * 2,
    };
  };

  private dy: number = 0;
  private touchStartTime: number = 0;

  private getFly() {
    const gamepadConfig = this.state.replica.running
      ? this.state.secret.replica.gamepad
      : {
          flyButton: this.getGamepadHash?.('fly', 'button') || '',
          flyingBackground:
            this.getGamepadHash?.('fly', 'flyingBackground') || '',
          flyingController:
            this.getGamepadHash?.('fly', 'flyingController') || '',
        };

    return {
      button: gamepadConfig.flyButton,
      flyingBackground: gamepadConfig.flyingBackground,
      flyingController: gamepadConfig.flyingController,
    };
  }

  public draw = (
    context2D: CanvasRenderingContext2D,
    screenWidth: number,
    screenHeight: number,
  ) => {
    const { flyX, flyY, flyRadius, iconRadius, iconSize } = this.calcFlyXY(
      screenWidth,
      screenHeight,
    );
    const isFlying = this.getIsFlying();
    const { button, flyingBackground, flyingController } = this.getFly();
    const scale = this.active ? 1.1 : 1;
    if (isFlying) {
      context2D.filter = this.active ? 'opacity(80%)' : 'none';
      const { radius } = getButtonSize();
      const flyBgWidth = radius;
      const flyBgHeight = radius * 2 * 2.2;
      this.currBg = this.getDrawImage(flyingBackground, this.currBg);
      if (this.currBg) {
        context2D.drawImage(
          this.currBg,
          flyX - flyBgWidth / 2,
          flyY - flyBgHeight / 2,
          flyBgWidth,
          flyBgHeight,
        );
      } else {
        drawFlyBackground(context2D, flyX, flyY, flyBgWidth, flyBgHeight);
      }
    }

    const maxMove = flyRadius * 1.2;
    const offsetY = Math.max(-maxMove, Math.min(this.dy, maxMove));

    context2D.filter = this.active ? 'brightness(120%)' : 'none';

    const btnHash = isFlying ? flyingController : button;
    this.currBtn = this.getDrawImage(btnHash, this.currBtn);
    if (this.currBtn) {
      context2D.drawImage(
        this.currBtn,
        flyX - flyRadius * scale,
        flyY + offsetY - flyRadius * scale,
        flyRadius * 2 * scale,
        flyRadius * 2 * scale,
      );
    } else {
      drawCircleBackground(
        context2D,
        flyX,
        flyY + offsetY,
        flyRadius * scale,
        isFlying ? 'rgba(255, 255, 255, 0.8)' : undefined,
      );
      const img = isFlying ? FLY_REVERSED_IMG.image : FLY_IMG.image;
      img &&
        context2D.drawImage(
          img,
          flyX - iconRadius * scale,
          flyY - iconRadius * scale + offsetY,
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
    this.touchStartTime = this.state.clock.clock;

    if (!this.getIsFlying()) {
      return;
    }
    this.dy = 0;
  };

  public onTouchEnd = () => {
    this.active = false;

    if (
      this.touchStartTime &&
      this.state.clock.clock - this.touchStartTime < TAP_TIME
    ) {
      this.input.onTouch(GameKeys.JUMP);
      this.input.unTouch(GameKeys.JUMP);
      this.input.onTouch(GameKeys.JUMP);
      this.input.unTouch(GameKeys.JUMP);
    }

    this.touchStartTime = 0;

    if (!this.getIsFlying()) {
      return;
    }
    this.dy = 0;
    this.input.unTouch(GameKeys.CROUCH);
    this.input.unTouch(GameKeys.JUMP);
  };

  public onTouchMove = (diff: SerializedVec2) => {
    if (!this.getIsFlying()) {
      return;
    }
    this.dy += diff[1];

    if (this.dy > 5) {
      this.input.unTouch(GameKeys.JUMP);
      this.input.onTouch(GameKeys.CROUCH);
    } else if (this.dy < -5) {
      this.input.unTouch(GameKeys.CROUCH);
      this.input.onTouch(GameKeys.JUMP);
    } else {
      this.input.unTouch(GameKeys.CROUCH);
      this.input.unTouch(GameKeys.JUMP);
    }
  };
}
