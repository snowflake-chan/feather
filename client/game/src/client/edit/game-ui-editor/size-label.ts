import { vec2, vec3 } from 'gl-matrix';
import {
  TextXAlignType,
  TextYAlignType,
} from '@box/schema/project/ui-rda/defs';
import { GameUIText, Spec } from 'src/engine/game-ui/nodes/text';
import { EventMode } from 'src/engine/game-ui/nodes/defs';
import { isRenderable } from 'src/engine/game-ui/util';

const enum PLACEMENT {
  Top,
  Bottom,
  Right,
  Left,
}

const PLACING: {
  type: PLACEMENT;
  coord: {
    ratio: vec2;
    offset: vec2;
  };
}[] = [
  // 下方
  {
    type: PLACEMENT.Bottom,
    coord: {
      ratio: [0.5, 1],
      offset: [0, 8],
    },
  },
  // 上方
  {
    type: PLACEMENT.Top,
    coord: {
      ratio: [0.5, 0],
      offset: [0, -8],
    },
  },
  // 右方
  {
    type: PLACEMENT.Right,
    coord: {
      ratio: [1, 0.5],
      offset: [8, 0],
    },
  },
  // 左
  {
    type: PLACEMENT.Left,
    coord: {
      ratio: [0, 0.5],
      offset: [-8, 0],
    },
  },
];

// 文本的水平方向padding（左 + 右）
const PADDING_X = 8;
const HEIGHT = 18;
export class SizeLabel extends GameUIText {
  public customLayout: boolean = true;

  constructor(spec: Spec) {
    super(spec);

    vec3.copy(this.backgroundColor, [255, 255, 255]);
    vec3.copy(this.textColor, [0, 0, 0]);

    this.textFontSize = 10;

    this.textXAlignment = TextXAlignType.Center;
    this.textYAlignment = TextYAlignType.Center;

    this.eventMode = EventMode.None;

    this.borderRadius = 4;
  }

  public onBeforeAbsDataUpdate() {
    const canvas = this.getContext()?.canvas;

    if (
      !canvas ||
      !this.parent ||
      !isRenderable(this.parent) ||
      !this.visible
    ) {
      return;
    }

    const { layoutPosition: parentAbsPosition, absSize: parentAbsSize } =
      this.parent;
    let { width: canvasWidth, height: canvasHeight } = canvas;
    canvasWidth = canvasWidth / devicePixelRatio;
    canvasHeight = canvasHeight / devicePixelRatio;

    this.textContent = `${Math.round(parentAbsSize[0])} x ${Math.round(
      parentAbsSize[1],
    )}`;

    this.updateContentSize(true);

    vec2.set(this.absSize, this.contentSize[0] + PADDING_X, HEIGHT);

    PLACING.some(({ type, coord }) => {
      vec2.copy(this.transform.position.offset, coord.offset);
      vec2.copy(this.transform.position.ratio, coord.ratio);

      vec2.mul(this.layoutPosition, parentAbsSize, coord.ratio);
      vec2.add(this.layoutPosition, this.layoutPosition, parentAbsPosition);
      vec2.add(this.layoutPosition, this.layoutPosition, coord.offset);

      switch (type) {
        case PLACEMENT.Bottom:
          this.layoutPosition[0] = this.layoutPosition[0] - this.absSize[0] / 2;
          break;
        case PLACEMENT.Top:
          this.layoutPosition[0] = this.layoutPosition[0] - this.absSize[0] / 2;
          this.layoutPosition[1] -= this.absSize[1];
          break;
        case PLACEMENT.Right:
          this.layoutPosition[1] -= this.absSize[1] / 2;
          break;
        case PLACEMENT.Left:
          this.layoutPosition[0] -= this.absSize[0];
          break;
      }

      if (this.layoutPosition[0] < 0 || this.layoutPosition[1] < 0) {
        return false;
      }

      if (
        this.layoutPosition[0] + this.absSize[0] > canvasWidth ||
        this.layoutPosition[1] + this.absSize[1] > canvasHeight
      ) {
        return false;
      }

      return true;
    });

    this.updateContentPosition();

    return false;
  }
}
