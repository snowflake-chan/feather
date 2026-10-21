import type { mat2d, vec2 } from 'gl-matrix';
import type {
  AutoLayoutFillDirection,
  AutoLayoutHorizontalAlignType,
  AutoLayoutStartCorner,
  AutoLayoutVerticalAlignType,
  UICoord2,
} from '@box/schema/project/ui-rda/defs';

/**
 * 获取context
 */
export type GetContext = () => CanvasRenderingContext2D | undefined;

/**
 * 按照UICoord2格式设置的位置、尺寸
 */
export type UITransform = {
  position: UICoord2;
  size: UICoord2;
};

export type RenderData = {
  absSize: vec2;
  layoutPosition: vec2;
  rotatePivot: vec2;
  matrixWorld: mat2d;
};

export type LayoutDataAutoLayout = {
  /**
   * 自动布局容器的尺寸
   * 一般是元素的绝对尺寸。
   * 如果是滚动框元素，是内容画布的绝对春。
   */
  containerSize: vec2;
  fillDirection: AutoLayoutFillDirection;
  startCorner: AutoLayoutStartCorner;
  /**
   * 开启自动布局时，指定的列宽（如果有）
   */
  absColumnWidth?: number;
  /**
   * 开启自动布局时，指定的行高（如果有）
   */
  absLineHeight?: number;
  /**
   * 开启自动布局时，网格间距
   */
  absCellPadding: vec2;
  /**
   * 开启自动布局时，填充方向最大数量
   */
  maxCells?: number;
  horizontalAlign: AutoLayoutHorizontalAlignType;
  verticalAlign: AutoLayoutVerticalAlignType;
};

export interface LayoutData extends RenderData {
  absScaleValue: number;
  autoLayout?: LayoutDataAutoLayout;
  /**
   * 布局坐标系下的旋转轴心
   * 等于 layoutPosition + rotatePivot
   */
  layoutPivot: vec2;
}
