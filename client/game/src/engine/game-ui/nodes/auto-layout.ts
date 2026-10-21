import {
  AutoLayoutFillDirection,
  AutoLayoutHorizontalAlignType,
  AutoLayoutStartCorner,
  AutoLayoutVerticalAlignType,
  UIAutoLayoutRDA,
  UICoord2,
  UICoord2RDA,
} from '@box/schema/project/ui-rda/defs';
import { GameUIComponent } from './component';
import { GameUIComponentType } from './defs';

const IDENTITY_UI_COORD2: UICoord2 = {
  offset: [0, 0],
  ratio: [0, 0],
};

export class GameUIAutoLayout extends GameUIComponent {
  public componentType = GameUIComponentType.AutoLayout;

  public cellSize: UICoord2 =
    UICoord2RDA.stateSchema.fromJSON(IDENTITY_UI_COORD2);

  public lineHeightEnabled = false;
  public columnWidthEnabled = false;

  /**
   * 填充的起始角落
   */
  public startCorner: AutoLayoutStartCorner = AutoLayoutStartCorner.TopLeft;

  /**
   * 填充的方向
   */
  public fillDirection: AutoLayoutFillDirection =
    AutoLayoutFillDirection.Horizontal;

  /**
   * 填充方向上的数量限制
   */
  public maxCells: number = 1;
  /**
   * 是否启用填充方向数量限制
   */
  public maxCellsEnabled: boolean = true;

  public cellPadding: UICoord2 =
    UICoord2RDA.stateSchema.fromJSON(IDENTITY_UI_COORD2);

  /**
   * 每一行的水平方向对齐方式
   */
  public horizontalAlignment: AutoLayoutHorizontalAlignType =
    AutoLayoutHorizontalAlignType.Center;

  /**
   * 每一列的垂直方向对齐方式
   */
  public verticalAlignment: AutoLayoutVerticalAlignType =
    AutoLayoutVerticalAlignType.Center;

  public copy(source: GameUIAutoLayout) {
    UIAutoLayoutRDA.stateSchema.assign(this, source);

    return this;
  }

  public clone() {
    return new (this.constructor as typeof GameUIAutoLayout)().copy(this);
  }
}
