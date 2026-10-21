import { vec2 } from 'gl-matrix';

type OutlineSpec = {
  color: string;
  width: number;
  offset: number;
};

export const SELECT_BOX_BORDER_WIDTH = 1.5;

const OUTLINE_SPECS: OutlineSpec[] = [
  /**
   * 外层边框
   */
  {
    color: '#FFFFFF',
    /**
     * 外层边框宽度应为0.5。
     */
    width: 0.5,
    offset: 1,
  },
  /**
   * 内层边框
   */
  {
    color: '#00C2FF',
    width: 1,
    offset: 0,
  },
];

/**
 * 绘制通用的外边框，外层0.5px的白色边框，内层1px的蓝色边框
 */
export function drawWhiteBlueOutline(spec: {
  context: CanvasRenderingContext2D;
  pivot: vec2;
  size: vec2;
}) {
  OUTLINE_SPECS.forEach((outline) => {
    drawOutline({
      context: spec.context,
      pivot: spec.pivot,
      size: spec.size,
      outline,
    });
  });
}

export function drawOutline(spec: {
  context: CanvasRenderingContext2D;
  pivot: vec2;
  size: vec2;
  outline: OutlineSpec;
}) {
  const { context, pivot, size, outline } = spec;

  const [x, y] = pivot;
  const [w, h] = size;
  const { color, width, offset } = outline;

  // 由于canvas绘制线的方式是在像素格子的中间，需要按线宽的一半做偏移
  const halfWidth = width / 2;

  /**
   * 四条边分别绘制矩形
   * 绘制顺序
   * 上 - 右 - 下 - 左
   */
  const left = -x - width - offset + halfWidth;
  const top = -y - width - offset + halfWidth;
  const sizeW = w + width + offset * 2 - halfWidth;
  const sizeH = h + width + offset * 2 - halfWidth;

  context.strokeStyle = color;
  context.lineWidth = width;

  context.strokeStyle = color;
  context.beginPath();

  context.moveTo(left, top);
  context.lineTo(left + sizeW, top);

  context.lineTo(left + sizeW, top + sizeH);

  context.lineTo(left, top + sizeH);

  context.lineTo(left, top);

  context.stroke();

  context.closePath();
}
