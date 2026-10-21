import { vec2 } from 'gl-matrix';
import { ARROW_IMG, GamepadButtons } from './const';
import { GamepadBtn, Spec } from './interface';
import { drawCircleBackground, getJoystickSize } from './util';
import { SerializedVec2 } from '../interfaces';
import { setTransformByScale } from '../utils/canvas';
import { getDevicePixelRatio } from '../utils/device';

export class Joystick extends GamepadBtn {
  constructor(spec: Spec) {
    super(spec);
  }
  public name: GamepadButtons = GamepadButtons.Joystick;
  public getHitArea = (screenWidth: number, screenHeight: number) => {
    const { hotHeight, hotWidth } = getJoystickSize();
    return {
      x: 0,
      y: screenHeight - hotHeight,
      w: hotWidth,
      h: hotHeight,
    };
  };
  private startPos: [number, number] | undefined = undefined;
  private totalDiff: [number, number] = [0, 0];
  private offset: [number, number] = [0, 0];
  private currBg?: HTMLImageElement | ImageBitmap;
  private currCtrl?: HTMLImageElement | ImageBitmap;

  private getJoystick() {
    const gamepadConfig = this.state.replica.running
      ? this.state.secret.replica.gamepad
      : {
          joystickBackground:
            this.getGamepadHash?.('joystick', 'background') || '',
          joystickController:
            this.getGamepadHash?.('joystick', 'controller') || '',
        };
    return {
      background: gamepadConfig.joystickBackground,
      controller: gamepadConfig.joystickController,
    };
  }

  public draw = (
    context2D: CanvasRenderingContext2D,
    screenWidth: number,
    screenHeight: number,
  ) => {
    const { left, bottom, radius } = getJoystickSize();
    const joystick = this.getJoystick();
    const x = this.startPos?.[0] || left + radius;
    const y = this.startPos?.[1] || screenHeight - bottom - radius;
    const ratio = getDevicePixelRatio();

    // 大圆盘背景
    context2D.filter = this.active ? 'opacity(80%)' : 'none';

    setTransformByScale(context2D, ratio);

    this.currBg = this.getDrawImage(joystick.background, this.currBg);
    if (this.currBg) {
      context2D.drawImage(
        this.currBg,
        x - radius,
        y - radius,
        radius * 2,
        radius * 2,
      );
    } else {
      drawCircleBackground(context2D, x, y, radius);

      const img = ARROW_IMG.image;

      if (img) {
        // 上下左右四个箭头
        const arrowSize = radius * 0.36;
        const arrowRadius = arrowSize / 2;
        const arrowPadding = radius * 2 * 0.09;

        // 上箭头
        setTransformByScale(context2D, ratio);
        context2D.translate(x, y - radius + arrowPadding + arrowRadius);
        context2D.drawImage(
          img,
          -arrowRadius,
          -arrowRadius,
          arrowSize,
          arrowSize,
        );

        // 下箭头
        setTransformByScale(context2D, ratio);
        context2D.translate(x, y + radius - arrowPadding - arrowRadius);
        context2D.rotate(Math.PI);
        context2D.drawImage(
          img,
          -arrowRadius,
          -arrowRadius,
          arrowSize,
          arrowSize,
        );

        // 左箭头
        setTransformByScale(context2D, ratio);
        context2D.translate(x - radius + arrowPadding + arrowRadius, y);
        context2D.rotate(-Math.PI / 2);
        context2D.drawImage(
          img,
          -arrowRadius,
          -arrowRadius,
          arrowSize,
          arrowSize,
        );

        // 右箭头
        setTransformByScale(context2D, ratio);
        context2D.translate(x + radius - arrowPadding - arrowRadius, y);
        context2D.rotate(Math.PI / 2);
        context2D.drawImage(
          img,
          -arrowRadius,
          -arrowRadius,
          arrowSize,
          arrowSize,
        );
      }
    }

    // 圆盘内圈操纵点
    const scale = this.active ? 1.1 : 1;
    context2D.filter = this.active ? 'brightness(120%)' : 'none';
    const innerRadius = radius * 0.27;

    setTransformByScale(context2D, ratio);
    this.currCtrl = this.getDrawImage(joystick.controller, this.currCtrl);
    if (this.currCtrl) {
      context2D.drawImage(
        this.currCtrl,
        x + this.offset[0] - innerRadius * scale,
        y + this.offset[1] - innerRadius * scale,
        innerRadius * 2 * scale,
        innerRadius * 2 * scale,
      );
    } else {
      context2D.beginPath();
      context2D.fillStyle = 'rgba(255, 255, 255, 0.8)';
      context2D.arc(
        x + this.offset[0],
        y + this.offset[1],
        innerRadius * scale,
        0,
        2 * Math.PI,
      );
      context2D.fill();
      context2D.closePath();
    }

    context2D.filter = 'none';
  };

  public onTouchStart = (pos: SerializedVec2) => {
    if (this.active) {
      return;
    }
    this.active = true;
    this.state.input.joystickEnabled = true;
    this.startPos = [pos[0], pos[1]];
    vec2.set(this.totalDiff, 0, 0);
    vec2.set(this.offset, 0, 0);
  };
  public onTouchEnd = () => {
    this.active = false;
    if (this.state.input.joystickEnabled) {
      this.state.input.joystickEnabled = false;
      this.startPos = undefined;
      vec2.set(this.totalDiff, 0, 0);
      vec2.set(this.offset, 0, 0);
      vec2.set(this.state.input.joystick, 0, 0);
    }
  };
  public onTouchMove = (diff: SerializedVec2) => {
    if (!this.state.input.joystickEnabled || !this.startPos) {
      return;
    }
    vec2.add(this.totalDiff, this.totalDiff, diff);

    vec2.copy(this.offset, this.totalDiff);
    const len = vec2.len(this.offset);
    const { radius } = getJoystickSize();
    if (len > radius) {
      vec2.normalize(this.offset, this.offset);
      vec2.mul(this.offset, this.offset, [radius, radius]);
    }
    vec2.copy(this.state.input.joystick, this.offset);
  };
}
