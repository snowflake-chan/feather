import { mat2d, vec2, vec3 } from 'gl-matrix';
import {
  TextXAlignType,
  TextYAlignType,
} from '@box/schema/project/ui-rda/defs';
import { GameUINode } from 'src/engine/game-ui/nodes/base';
import { GameUIBox } from 'src/engine/game-ui/nodes/box';
import { EventMode } from 'src/engine/game-ui/nodes/defs';
import type { GetContext } from 'src/engine/game-ui/nodes/interface';
import {
  GameUIText,
  LoadTextFontFace,
  Spec as TextSpec,
} from 'src/engine/game-ui/nodes/text';
import { store } from 'src/redux/edit';
import { SELECT_BOX_BORDER_WIDTH } from './outline';
import { drawRoundRect, setTransformByScale } from 'src/engine/utils/canvas';
import { GameUIRenderable } from 'src/engine/game-ui/nodes/renderable';
import type { GetParentLayoutData } from 'src/engine/game-ui/interfaces';
import type { GetRenderableNode } from './defs';
import { isRenderable } from 'src/engine/game-ui/util';
import type { RichTextParser } from 'src/engine/game-ui/nodes/rich-text-parser';

type Spec = {
  id: string;
  getContext: GetContext;
  getRenderableNode: GetRenderableNode;
  getParentLayoutData: GetParentLayoutData;
  loadTextFontFace: LoadTextFontFace;
  richTextParser: RichTextParser;
};

const TEMP_VEC2 = vec2.create();
const TEMP_POS = vec2.create();

export class MeasureTool extends GameUIRenderable {
  private getContext: GetContext;
  private getRenderableNode: GetRenderableNode;
  private getParentLayoutData: GetParentLayoutData;

  private lineLeft: Line;
  private lineRight: Line;
  private lineTop: Line;
  private lineBottom: Line;
  private labelLeft: Label;
  private labelRight: Label;
  private labelTop: Label;
  private labelBottom: Label;

  /**
   * 默认为false，由gameUIEditor控制
   */
  public visible = false;

  public customLayout: boolean = true;

  constructor(spec: Spec) {
    const {
      getContext,
      getRenderableNode,
      getParentLayoutData,
      loadTextFontFace,
      richTextParser,
      ...base
    } = spec;

    super(base);

    this.getContext = getContext;
    this.getRenderableNode = getRenderableNode;
    this.getParentLayoutData = getParentLayoutData;

    this.eventMode = EventMode.None;

    this.lineLeft = new Line({ id: 'measureLineLeft' });
    this.lineRight = new Line({ id: 'measureLineRight' });
    this.lineTop = new Line({ id: 'measureLineTop' });
    this.lineBottom = new Line({ id: 'measureLineBottom' });

    this.labelLeft = new Label({
      id: 'measureLabelLeft',
      getContext,
      getParentLayoutData: this.getParentLayoutData,
      loadTextFontFace,
      richTextParser,
    });
    this.labelRight = new Label({
      id: 'measureLabelRight',
      getContext,
      getParentLayoutData: this.getParentLayoutData,
      loadTextFontFace,
      richTextParser,
    });
    this.labelTop = new Label({
      id: 'measureLabelTop',
      getContext,
      getParentLayoutData: this.getParentLayoutData,
      loadTextFontFace,
      richTextParser,
    });
    this.labelBottom = new Label({
      id: 'measureLabelBottom',
      getContext,
      getParentLayoutData: this.getParentLayoutData,
      loadTextFontFace,
      richTextParser,
    });

    this.add(
      this.lineLeft,
      this.lineRight,
      this.lineTop,
      this.lineBottom,
      this.labelLeft,
      this.labelRight,
      this.labelTop,
      this.labelBottom,
    );
  }

  public onBeforeAbsDataUpdate() {
    vec2.zero(this.layoutPosition);

    const canvas = this.getContext()?.canvas;

    const [nodeId] = store.getState().gameUI.selectedIds;

    const node = this.getRenderableNode(nodeId);

    if (
      !canvas ||
      !this.parent ||
      !isRenderable(this.parent) ||
      !node ||
      !node.parent
    ) {
      this.hideChildren();
      return;
    }

    const { absSize: selectBoxAbsSize, layoutPosition: selectBoxLayoutPos } =
      this.parent;

    // 计算元素中心点是否在父节点以外
    vec2.scale(TEMP_VEC2, selectBoxAbsSize, 0.5);
    vec2.add(TEMP_POS, TEMP_VEC2, selectBoxLayoutPos);

    const { layoutPosition: parentLayoutPos, absSize: parentAbsSize } =
      this.getParentLayoutData(node);

    if (
      TEMP_POS[0] < parentLayoutPos[0] ||
      TEMP_POS[1] < parentLayoutPos[1] ||
      TEMP_POS[0] > parentLayoutPos[0] + parentAbsSize[0] ||
      TEMP_POS[1] > parentLayoutPos[1] + parentAbsSize[1]
    ) {
      this.hideChildren();
      return;
    }

    vec2.sub(TEMP_POS, selectBoxLayoutPos, parentLayoutPos);

    const [left, top] = TEMP_POS;

    // left line + left label
    if (left > 0) {
      this.lineLeft.visible = true;
      this.lineLeft.absSize[0] = left - SELECT_BOX_BORDER_WIDTH;
      vec2.set(
        this.lineLeft.layoutPosition,
        parentLayoutPos[0],
        selectBoxLayoutPos[1] + TEMP_VEC2[1],
      );

      this.labelLeft.visible = true;
      this.labelLeft.attachedNode = node;
      this.labelLeft.textContent = Math.round(left).toString();
      vec2.set(
        this.labelLeft.layoutPosition,
        this.lineLeft.layoutPosition[0] + left / 2,
        this.lineLeft.layoutPosition[1],
      );
    } else {
      this.lineLeft.visible = false;
      this.labelLeft.visible = false;
      this.labelLeft.attachedNode = undefined;
    }

    // top line + top label
    if (top > 0) {
      this.lineTop.visible = true;
      this.lineTop.absSize[1] = top - SELECT_BOX_BORDER_WIDTH;
      vec2.set(
        this.lineTop.layoutPosition,
        selectBoxLayoutPos[0] + TEMP_VEC2[0],
        parentLayoutPos[1],
      );

      this.labelTop.visible = true;
      this.labelTop.attachedNode = node;
      this.labelTop.textContent = Math.round(top).toString();
      vec2.set(
        this.labelTop.layoutPosition,
        this.lineTop.layoutPosition[0],
        this.lineTop.layoutPosition[1] + TEMP_POS[1] / 2,
      );
    } else {
      this.lineTop.visible = false;
      this.labelTop.visible = false;
      this.labelTop.attachedNode = undefined;
    }

    vec2.add(TEMP_POS, parentLayoutPos, parentAbsSize);
    vec2.sub(TEMP_POS, TEMP_POS, selectBoxLayoutPos);
    vec2.sub(TEMP_POS, TEMP_POS, selectBoxAbsSize);

    // right line + right label
    if (TEMP_POS[0] > 0 && TEMP_POS[0] !== left) {
      this.lineRight.visible = true;
      this.lineRight.absSize[0] = TEMP_POS[0] - SELECT_BOX_BORDER_WIDTH;
      vec2.set(
        this.lineRight.layoutPosition,
        selectBoxLayoutPos[0] + selectBoxAbsSize[0] + SELECT_BOX_BORDER_WIDTH,
        selectBoxLayoutPos[1] + TEMP_VEC2[1],
      );

      this.labelRight.visible = true;
      this.labelRight.attachedNode = node;
      this.labelRight.textContent = Math.round(TEMP_POS[0]).toString();
      vec2.set(
        this.labelRight.layoutPosition,
        this.lineRight.layoutPosition[0] + TEMP_POS[0] / 2,
        this.lineRight.layoutPosition[1],
      );
    } else {
      this.lineRight.visible = false;
      this.labelRight.visible = false;
      this.labelRight.attachedNode = undefined;
    }

    if (TEMP_POS[1] > 0 && TEMP_POS[1] !== top) {
      this.lineBottom.visible = true;
      this.lineBottom.absSize[1] = TEMP_POS[1] - SELECT_BOX_BORDER_WIDTH;
      vec2.set(
        this.lineBottom.layoutPosition,
        selectBoxLayoutPos[0] + TEMP_VEC2[0],
        selectBoxLayoutPos[1] + selectBoxAbsSize[1] + SELECT_BOX_BORDER_WIDTH,
      );

      this.labelBottom.visible = true;
      this.labelBottom.attachedNode = node;
      this.labelBottom.textContent = Math.round(TEMP_POS[1]).toString();
      vec2.set(
        this.labelBottom.layoutPosition,
        this.lineBottom.layoutPosition[0],
        this.lineBottom.layoutPosition[1] + TEMP_POS[1] / 2,
      );
    } else {
      this.lineBottom.visible = false;
      this.labelBottom.visible = false;
      this.labelBottom.attachedNode = undefined;
    }

    return;
  }

  /**
   * 设置子节点不可见，并且清除attachedParent
   */
  private hideChildren() {
    this.children.forEach((child) => {
      child.visible = false;

      if (child instanceof Label) {
        child.attachedNode = undefined;
      }
    });
  }
}

// #F65252
const MAIN_COLOR: vec3 = [255, 82, 82];
const BORDER_RADIUS = 4;

class Line extends GameUIBox {
  public customLayout: boolean = true;

  public draw(context: CanvasRenderingContext2D, dpr: number): void {
    setTransformByScale(context, dpr);

    context.beginPath();

    context.strokeStyle = `rgb(${MAIN_COLOR[0]}, ${MAIN_COLOR[1]}, ${MAIN_COLOR[2]})`;
    context.lineWidth = 1;

    context.moveTo(this.layoutPosition[0], this.layoutPosition[1]);
    context.lineTo(
      this.layoutPosition[0] + this.absSize[0],
      this.layoutPosition[1] + this.absSize[1],
    );

    context.stroke();

    context.closePath();
  }
}

const PADDING_X = 8;

interface LabelSpec extends TextSpec {
  getParentLayoutData: GetParentLayoutData;
}

class Label extends GameUIText {
  private getParentLayoutData: GetParentLayoutData;

  public attachedNode?: GameUINode;

  public borderRadius: number;

  public customLayout: boolean = true;

  constructor({
    getParentLayoutData: getParentLayoutData,
    ...spec
  }: LabelSpec) {
    super(spec);

    this.getParentLayoutData = getParentLayoutData;

    vec2.set(this.anchor, 0.5, 0.5);
    vec2.set(this.absSize, 4, 18);

    vec3.copy(this.backgroundColor, MAIN_COLOR);
    this.borderRadius = 4;

    vec3.set(this.textColor, 255, 255, 255);
    this.textFontSize = 10;
    this.textXAlignment = TextXAlignType.Center;
    this.textYAlignment = TextYAlignType.Center;

    this.eventMode = EventMode.None;
  }

  public onBeforeAbsDataUpdate() {
    this.updateContentSize(false);

    this.absSize[0] = Math.max(20, this.contentSize[0] + PADDING_X);
    vec2.mul(this.position, this.absSize, this.anchor);
    vec2.sub(this.layoutPosition, this.layoutPosition, this.position);
  }

  public draw(context: CanvasRenderingContext2D, dpr: number): void {
    if (!this.attachedNode) {
      return;
    }

    const attachedNodeData = this.getParentLayoutData(this.attachedNode);

    setTransformByScale(context, dpr);

    context.beginPath();

    const [r, g, b] = this.backgroundColor;

    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.backgroundOpacity})`;

    let [x, y] = this.layoutPosition;
    let [w, h] = this.absSize;

    const [parentX, parentY] = attachedNodeData.layoutPosition;
    const [parentW, parentH] = attachedNodeData.absSize;

    // 贴边 - 左
    if (x <= parentX) {
      x = parentX;

      // 左上
      context.moveTo(x, y);

      // 右上圆弧起点
      context.lineTo(x + w - BORDER_RADIUS, y);

      // 右上圆弧终点
      context.arcTo(x + w, y, x + w, y + BORDER_RADIUS, BORDER_RADIUS);

      // 右下圆弧起点
      context.lineTo(x + w, y + h - BORDER_RADIUS);

      // 右下圆弧终点
      context.arcTo(x + w, y + h, x + w - BORDER_RADIUS, y + h, BORDER_RADIUS);

      // 左下
      context.lineTo(x, y + h);

      // 左上
      context.lineTo(x, y);

      context.fill();
    } else if (x + w >= parentX + parentW) {
      // 贴边 - 右
      x = parentX + parentW - w;

      // 左上圆弧终点
      context.moveTo(x + BORDER_RADIUS, y);

      // 右上
      context.lineTo(x + w, y);

      // 右下
      context.lineTo(x + w, y + h);

      // 左下圆弧起点
      context.lineTo(x + BORDER_RADIUS, y + h);

      // 左下圆弧终点
      context.arcTo(x, y + h, x, y + h - BORDER_RADIUS, BORDER_RADIUS);

      // 左上圆弧起点
      context.lineTo(x, y + BORDER_RADIUS);

      // 左上
      context.arcTo(x, y, x + BORDER_RADIUS, y, BORDER_RADIUS);

      context.fill();
    } else if (y <= parentY) {
      y = parentY;

      // 左上
      context.moveTo(x, y);

      // 右上
      context.lineTo(x + w, y);

      // 右下圆弧起点
      context.lineTo(x + w, y + h - BORDER_RADIUS);

      // 右下圆弧终点
      context.arcTo(x + w, y + h, x + w - BORDER_RADIUS, y + h, BORDER_RADIUS);

      // 左下圆弧起点
      context.lineTo(x + BORDER_RADIUS, y + h);

      // 左下圆弧终点
      context.arcTo(x, y + h, x, y + h - BORDER_RADIUS, BORDER_RADIUS);

      // 左上
      context.lineTo(x, y);

      context.fill();
    } else if (y + h >= parentY + parentH) {
      y = parentY + parentH - h;

      // 左上圆弧终点
      context.moveTo(x + BORDER_RADIUS, y);

      // 右上圆弧起点
      context.moveTo(x + w - BORDER_RADIUS, y);

      // 右上圆弧终点
      context.arcTo(x + w, y, x + w, y + BORDER_RADIUS, BORDER_RADIUS);

      // 右下
      context.lineTo(x + w, y + h);

      // 左下
      context.lineTo(x, y + h);

      // 左上圆弧起点
      context.lineTo(x, y + BORDER_RADIUS);

      // 左上圆弧终点
      context.arcTo(x, y, x + BORDER_RADIUS, y, BORDER_RADIUS);

      context.fill();
    } else {
      drawRoundRect(context, x, y, w, h, this.borderRadius);

      context.fill();
    }

    if (this.renderContent) {
      this.saveContextTextStyle(context);

      const [r, g, b] = this.textColor;

      context.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.textOpacity})`;

      this.setContextTextStyle(context, this.textFontSize);
      context.textBaseline = 'middle';

      context.fillText(this.textContent, x + w / 2, y + h / 2);

      this.restoreContextTextStyle(context);
    }

    context.closePath();
  }
}
