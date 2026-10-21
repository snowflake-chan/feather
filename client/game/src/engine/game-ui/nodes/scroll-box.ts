import { vec2, vec3 } from 'gl-matrix';
import { clamp } from 'ramda';
import { nanoid } from 'nanoid/non-secure';
import {
  AutoResizeType,
  UICoord2,
  UICoord2RDA,
  UIScrollDirection,
  UIScrollbarHorizontal,
  UIScrollbarVertical,
  UIScrollbarVisibility,
} from '@box/schema/project/ui-rda/defs';
import type { BaseSpec } from './base';
import { GameUIRenderable } from './renderable';
import { EventMode } from './defs';
import { drawRoundRect } from 'src/engine/utils/canvas';
import { parseWorldLayout } from '../util';
import { UiScrollBox } from 'src/engine/script/ses/apis/gui/ui-scroll-box';

const SCROLLBAR_THUMB_RADIUS = 8;

const TEMP_VEC2: vec2 = [0, 0];

export class GameUIScrollBox extends GameUIRenderable {
  public scrollDirection: UIScrollDirection = UIScrollDirection.X;

  public scrollbarHorizontal: UIScrollbarHorizontal =
    UIScrollbarHorizontal.Right;

  public scrollbarVertical: UIScrollbarVertical = UIScrollbarVertical.Top;

  public scrollbarVisibility: UIScrollbarVisibility =
    UIScrollbarVisibility.Scrollable;

  public scrollbarThickness: number = 8;

  public scrollbarColor: vec3 = [0, 0, 0];

  public scrollbarOpacity = 1;

  public scrollCanvasAutoResize: AutoResizeType = AutoResizeType.NONE;

  public scrollCanvasSize: UICoord2 = UICoord2RDA.stateSchema.alloc();

  public scrollPosition: vec2 = [0, 0];

  public isScrollBox = true;

  /**
   * 水平方向滚动条
   */
  public readonly scrollbarX: GameUIScrollbar;
  /**
   * 垂直方向滚动条
   */
  public readonly scrollbarY: GameUIScrollbar;

  public readonly scrollCanvas: GameUIScrollCanvas;

  protected ApiType = UiScrollBox;

  public _api: InstanceType<typeof this.ApiType> | undefined;

  public api() {
    if (!this._api) {
      this._api = new this.ApiType(this);
    }

    return this._api;
  }

  constructor(spec: BaseSpec) {
    super(spec);

    this.scrollbarX = new GameUIScrollbar({ id: `${spec.id}ScrollbarX` });
    this.scrollbarX.scrollBox = this;

    this.scrollbarY = new GameUIScrollbar({ id: `${spec.id}ScrollbarY` });
    this.scrollbarY.direction = UIScrollDirection.Y;
    this.scrollbarY.scrollBox = this;

    this.scrollCanvas = new GameUIScrollCanvas({
      id: `${spec.id}ScrollCanvas`,
    });
    this.scrollCanvas.scrollBox = this;
  }

  public onAfterReflow(): void {
    vec2.sub(TEMP_VEC2, this.scrollCanvas.absSize, this.absSize);
    vec2.min(this.scrollPosition, this.scrollPosition, TEMP_VEC2);
    vec2.max(this.scrollPosition, this.scrollPosition, [0, 0]);

    if (this.scrollbarVisibility === UIScrollbarVisibility.Hidden) {
      this.scrollbarX.visible = false;
      this.scrollbarY.visible = false;

      return;
    }

    this.scrollbarX.visible =
      [UIScrollDirection.X, UIScrollDirection.XY].includes(
        this.scrollDirection,
      ) && this.absSize[0] < this.scrollCanvas.absSize[0];

    this.scrollbarX.visible && this.scrollbarX.update();

    this.scrollbarY.visible =
      [UIScrollDirection.Y, UIScrollDirection.XY].includes(
        this.scrollDirection,
      ) && this.absSize[1] < this.scrollCanvas.absSize[1];

    this.scrollbarY.visible && this.scrollbarY.update();
  }

  public draw(context: CanvasRenderingContext2D): void {
    context.beginPath();

    const [r, g, b] = this.backgroundColor;

    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.backgroundOpacity})`;

    const x = -this.rotatePivot[0];
    const y = -this.rotatePivot[1];

    const [w, h] = this.absSize;

    context.fillRect(x, y, w, h);

    context.closePath();
  }

  public copy(source: GameUIScrollBox) {
    super.copy(source);

    this.scrollDirection = source.scrollDirection;
    this.scrollbarHorizontal = source.scrollbarHorizontal;
    this.scrollbarVertical = source.scrollbarVertical;
    this.scrollbarVisibility = source.scrollbarVisibility;
    this.scrollbarThickness = source.scrollbarThickness;
    vec3.copy(this.scrollbarColor, source.scrollbarColor);
    this.scrollbarOpacity = source.scrollbarOpacity;
    this.scrollCanvasAutoResize = source.scrollCanvasAutoResize;
    UICoord2RDA.stateSchema.assign(
      this.scrollCanvasSize,
      source.scrollCanvasSize,
    );
    vec2.copy(this.scrollPosition, source.scrollPosition);

    return this;
  }

  public clone() {
    return new (this.constructor as typeof GameUIScrollBox)({
      id: nanoid(),
    }).copy(this);
  }
}

export class GameUIScrollbar extends GameUIRenderable {
  /**
   * 滚动条不需要用配置项来处理?
   */
  public customLayout: boolean = true;

  public direction: UIScrollDirection = UIScrollDirection.X;

  public scrollBox?: GameUIScrollBox;

  public isScrollbar = true;

  public update() {
    if (!this.scrollBox) {
      return;
    }

    const [mainAxsIdx, crossAxisIdx] =
      this.direction === UIScrollDirection.X ? [0, 1] : [1, 0];

    let ratio = 0;
    // 主轴方向的尺寸 = 滚动框主轴尺寸 / 内容画布尺寸
    // 要考虑为0的情况？相等的话那比例就是1
    if (
      this.scrollBox.absSize[mainAxsIdx] ===
      this.scrollBox.scrollCanvas.absSize[mainAxsIdx]
    ) {
      ratio = 1;
    } else {
      ratio =
        this.scrollBox.absSize[mainAxsIdx] /
        this.scrollBox.scrollCanvas.absSize[mainAxsIdx];
    }

    const scrollRatio = clamp(
      0,
      1,
      this.scrollBox.scrollPosition[mainAxsIdx] /
        this.scrollBox.scrollCanvas.absSize[mainAxsIdx],
    );

    this.absSize[mainAxsIdx] = this.scrollBox.absSize[mainAxsIdx] * ratio;
    this.absSize[crossAxisIdx] = this.scrollBox.scrollbarThickness;

    let mainAxisPos =
      this.scrollBox.layoutPosition[mainAxsIdx] +
      scrollRatio * this.scrollBox.absSize[mainAxsIdx];
    let crossAxisPos = this.scrollBox.layoutPosition[crossAxisIdx];

    if (
      (this.direction === UIScrollDirection.X &&
        this.scrollBox.scrollbarVertical === UIScrollbarVertical.Bottom) ||
      (this.direction === UIScrollDirection.Y &&
        this.scrollBox.scrollbarHorizontal === UIScrollbarHorizontal.Right)
    ) {
      crossAxisPos +=
        this.scrollBox.absSize[crossAxisIdx] - this.absSize[crossAxisIdx];
    }

    this.layoutPosition[mainAxsIdx] = mainAxisPos;
    this.layoutPosition[crossAxisIdx] = crossAxisPos;

    /**
     * 由于滚动条和滚动框的特殊关系，会导致每次layout后，滚动条的rotation被更新。
     * 但实际上自身不会有rotation，因此需要重新重置回0。
     */
    this.rotation = 0;
  }

  public onAfterReflow(): void {
    /**
     * 在layout计算后，滚动条会被视作滚动框的子节点，更新旋转位移信息。
     * 但实际上滚动条不是子节点，需要换算回世界坐标，视作根节点的直接子节点。
     */
    parseWorldLayout(this, this);
  }

  public draw(context: CanvasRenderingContext2D): void {
    if (!this.scrollBox) {
      return;
    }

    context.beginPath();

    const [r, g, b] = this.scrollBox.scrollbarColor;

    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.scrollBox.scrollbarOpacity})`;

    const x = -this.rotatePivot[0];
    const y = -this.rotatePivot[1];

    const [w, h] = this.absSize;

    drawRoundRect(context, x, y, w, h, SCROLLBAR_THUMB_RADIUS);

    context.closePath();

    context.fill();
  }
}

export class GameUIScrollCanvas extends GameUIRenderable {
  public eventMode: EventMode = EventMode.None;

  public scrollBox?: GameUIScrollBox;

  public isScrollCanvas = true;
}
