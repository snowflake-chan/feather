import { TextDialogConfig } from '@box/schema/dialog/dialog-protocol';
import {
  Dialog,
  DialogType,
  InteractivePanel,
  InteractiveType,
  Spec,
} from './interface';
import {
  contentPadding,
  radiusHeight,
  drawTextLines,
  lineHeight,
} from './util';
import { GameElement, GameElementType } from '../input/events';

const arrowWidth = 9;
const arrowHeight = 4.5;
const arrowMoveDuration = 500;
const arrowAnimationTransform = 8;

export class TextDialog extends Dialog<TextDialogConfig> {
  public readonly type = DialogType.Text;
  constructor(spec: Spec) {
    super(spec);
  }
  public onClick = (targets: GameElement[]) => {
    if (
      !this.dialogSchema ||
      !targets.length ||
      targets[0].elementType !== GameElementType.GameDialog
    ) {
      return;
    }

    const interactive = targets[0] as InteractivePanel;
    if (interactive.interactiveType === InteractiveType.CloseButton) {
      this.dialogClient.cancelDialog();
      return;
    }

    if (interactive.interactiveType === InteractiveType.Content) {
      this.dialogClient.resolveDialog(this.dialogSchema.rpcId, {
        type: 'text',
        data: 'success',
      });
    }
  };

  public getContentWH = (
    context2D: CanvasRenderingContext2D,
    lines: string[],
    maxContentWidth: number,
  ) => {
    return {
      contentHeight: lines.length * lineHeight,
    };
  };

  public drawContent = (
    context2D: CanvasRenderingContext2D,
    contentX: number,
    maxContentX: number,
    contentY: number,
    contentWidth: number,
    maxContentWidth: number,
    maxLineWidth: number,
    bgHeight: number,
    lines: string[],
    contentFillStyle: string,
    contentHeight: number,
    scrollY: number,
  ) => {
    if (!this.dialogSchema) {
      return {
        clipHeight: 0,
        scrollY: 0,
        scrollbarHeight: 0,
        scrollbarPositionY: 0,
      };
    }
    const { hasArrow } = this.dialogSchema.config;
    const clipHeight = bgHeight - radiusHeight * 2 - contentPadding * 2;

    if (hasArrow) {
      let weight = this.state.clock.clock / arrowMoveDuration;
      // ease-in-out weight
      weight = -(Math.cos(Math.PI * weight) - 1) / 2;

      const arrowX = contentX + contentWidth / 2 - arrowWidth / 2;
      const arrowY =
        contentY +
        clipHeight +
        contentPadding +
        radiusHeight -
        arrowHeight -
        arrowAnimationTransform * weight;
      context2D.beginPath();
      context2D.fillStyle = '#FFFFFF';
      context2D.moveTo(arrowX, arrowY);
      context2D.lineTo(arrowX + arrowWidth, arrowY);
      context2D.lineTo(arrowX + arrowWidth / 2, arrowY + arrowHeight);
      context2D.fill();
      context2D.closePath();
    }

    return {
      clipHeight,
      ...drawTextLines(
        context2D,
        contentX,
        contentY,
        contentWidth,
        clipHeight,
        lines.length * lineHeight,
        contentFillStyle,
        lines,
        scrollY,
      ),
    };
  };
}
