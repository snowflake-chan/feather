import { SelectDialogConfig } from '@box/schema/dialog/dialog-protocol';
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
  hitTest,
} from './util';
import {
  drawRoundRect,
  getTextBoxWidth,
  nowrapEllipsisText,
  wrapTextBreakAll,
} from '../utils/canvas';
import { SerializedVec2 } from '../interfaces';
import { GameElement, GameElementType } from '../input/events';

enum OptionType {
  None,
  Single,
  Twice,
  Multi,
}
interface OptionBase {
  type: OptionType;
}

interface NoneOption extends OptionBase {
  type: OptionType.None;
}

interface SingleOption extends OptionBase {
  type: OptionType.Single;
  id: number;
  option: string;
  text: string;
  textLen: number;
}

interface TwiceOption extends OptionBase {
  type: OptionType.Twice;
  options: string[];
}

interface MultiOption extends OptionBase {
  type: OptionType.Multi;
  optionsContent: { option: string; lines: string[]; height: number }[];
  optionsHeight: number;
}

type Options = NoneOption | SingleOption | TwiceOption | MultiOption;

class InteractiveOption extends InteractivePanel {
  public interactiveType: InteractiveType = InteractiveType.Option;
  constructor(public idx: number, public option: string) {
    super();
  }
}

const optionPaddingLR = 16;
const optionPaddingTB = 8;
const optionMarginY = 8;
const optionRadius = 20;

const minSingleContentHeight = 200 - 96;
const singleOptionHeight = lineHeight + optionPaddingTB * 2 + contentPadding;

export class SelectDialog extends Dialog<SelectDialogConfig> {
  public readonly type = DialogType.Select;

  private parsedOptions?: Options;

  private interactiveOptions: InteractiveOption[] = [];

  private hoveringOptionIdx?: number;

  constructor(spec: Spec) {
    super(spec);
  }

  public intersect = (out: GameElement[], pos: SerializedVec2) => {
    for (const o of this.interactiveOptions) {
      if (hitTest(pos, o.getHitArea())) {
        out.push(o);
        return;
      }
    }
  };

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

    if (interactive.interactiveType === InteractiveType.Option) {
      const interactiveOption = interactive as InteractiveOption;
      this.dialogClient.resolveDialog(this.dialogSchema.rpcId, {
        type: 'select',
        data: {
          index: interactiveOption.idx,
          value: interactiveOption.option,
        },
      });
      return;
    }

    // 如果是空选项，点击到文本区域视为选中了不存在的第0项
    if (
      this.parsedOptions?.type === OptionType.None &&
      interactive.interactiveType === InteractiveType.Content
    ) {
      this.dialogClient.resolveDialog(this.dialogSchema.rpcId, {
        type: 'select',
        data: { index: 0, value: '' },
      });
    }
  };

  public onMove = (targets: GameElement[]) => {
    const interactive = targets[0] as InteractiveOption;
    if (interactive && interactive.interactiveType === InteractiveType.Option) {
      this.hoveringOptionIdx = interactive.idx;
    } else {
      this.hoveringOptionIdx = undefined;
    }
  };

  private parseOptions(
    context2D: CanvasRenderingContext2D,
    options: string[],
    maxContentWidth: number,
  ): Options {
    if (!options.length) {
      return {
        type: OptionType.None,
      };
    }

    if (options.length === 1) {
      const res = nowrapEllipsisText(context2D, options[0], maxContentWidth);
      return {
        type: OptionType.Single,
        id: 0,
        option: options[0],
        text: res.text,
        textLen: res.textLen,
      };
    }

    if (options.length === 2) {
      const oneOptionLen =
        (maxContentWidth - contentPadding) / 2 - optionPaddingLR * 2;

      let useTwice = true;
      for (let i = 0; i < options.length; i++) {
        const optionWidth = getTextBoxWidth(context2D.measureText(options[i]));
        if (optionWidth > oneOptionLen) {
          useTwice = false;
          break;
        }
      }

      if (useTwice) {
        return {
          type: OptionType.Twice,
          options: [...options],
        };
      }
    }

    const multiOption: MultiOption = {
      type: OptionType.Multi,
      optionsContent: [],
      optionsHeight: 0,
    };

    options.forEach((opt, idx) => {
      const lines = wrapTextBreakAll(
        context2D,
        opt,
        maxContentWidth - optionPaddingLR * 2,
      ).lines;
      const height = lines.length * lineHeight + optionPaddingTB * 2;
      multiOption.optionsContent.push({
        option: opt,
        lines,
        height,
      });
      if (idx) {
        multiOption.optionsHeight += optionMarginY;
      }
      multiOption.optionsHeight += height;
    });
    return multiOption;
  }

  public getContentWH = (
    context2D: CanvasRenderingContext2D,
    lines: string[],
    maxContentWidth: number,
  ) => {
    if (!this.dialogSchema) {
      return {
        contentHeight: 0,
      };
    }

    this.parsedOptions = this.parseOptions(
      context2D,
      this.dialogSchema.config.options,
      maxContentWidth,
    );

    switch (this.parsedOptions.type) {
      case OptionType.None:
        return {
          contentHeight: lineHeight * lines.length,
        };
      case OptionType.Single:
      case OptionType.Twice:
        return {
          contentHeight:
            Math.max(minSingleContentHeight, lineHeight * lines.length) +
            singleOptionHeight,
          minContentHeight: minSingleContentHeight + singleOptionHeight,
        };
      case OptionType.Multi:
        return {
          contentHeight:
            lineHeight * lines.length +
            this.parsedOptions.optionsHeight +
            contentPadding,
          contentWidth: maxContentWidth,
        };
    }
  };

  private getOptionFillStyle(idx: number) {
    return `rgba(0, 0, 0, ${this.hoveringOptionIdx === idx ? '0.56' : '0.24'})`;
  }

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
    this.interactiveOptions.length = 0;

    if (!this.parsedOptions) {
      return {
        clipHeight: 0,
        scrollY: 0,
        scrollbarHeight: 0,
        scrollbarPositionY: 0,
      };
    }
    const option = this.parsedOptions;

    switch (option.type) {
      case OptionType.None: {
        const clipHeight = bgHeight - radiusHeight * 2 - contentPadding * 2;
        return {
          clipHeight,
          ...drawTextLines(
            context2D,
            contentX,
            contentY,
            contentWidth,
            clipHeight,
            lineHeight * lines.length,
            contentFillStyle,
            lines,
            scrollY,
          ),
        };
      }
      case OptionType.Single: {
        const clipHeight =
          bgHeight - radiusHeight * 2 - contentPadding * 2 - singleOptionHeight;

        // 先绘制单个按钮
        context2D.textAlign = 'center';
        context2D.fillStyle = this.getOptionFillStyle(option.id);
        const textX = maxContentX + maxContentWidth / 2;
        const buttonX = textX - option.textLen / 2 - optionPaddingLR;
        const buttonY = contentY + clipHeight + contentPadding;
        const textY = buttonY + optionPaddingTB + lineHeight / 2;
        const buttonWidth = option.textLen + optionPaddingLR * 2;
        const buttonHeight = lineHeight + optionPaddingTB * 2;

        drawRoundRect(
          context2D,
          buttonX,
          buttonY,
          buttonWidth,
          buttonHeight,
          optionRadius,
        );
        context2D.fill();

        context2D.fillStyle = contentFillStyle;
        context2D.fillText(option.text, textX, textY);

        context2D.textAlign = 'left';

        const interactive = new InteractiveOption(option.id, option.option);
        interactive.setHitArea({
          x: buttonX,
          y: buttonY,
          w: buttonWidth,
          h: buttonHeight,
        });
        this.interactiveOptions.push(interactive);

        // 绘制上方文本
        return {
          clipHeight,
          ...drawTextLines(
            context2D,
            contentX,
            contentY,
            contentWidth,
            clipHeight,
            lineHeight * lines.length,
            contentFillStyle,
            lines,
            scrollY,
          ),
        };
      }
      case OptionType.Twice: {
        const clipHeight =
          bgHeight - radiusHeight * 2 - contentPadding * 2 - singleOptionHeight;
        // 先绘制两个按钮
        context2D.textAlign = 'center';
        const buttonY = contentY + clipHeight + contentPadding;
        const textY = buttonY + optionPaddingTB + lineHeight / 2;

        const oneButtonWidth = (maxContentWidth - contentPadding) / 2;
        const oneButtonHeight = lineHeight + optionPaddingTB * 2;

        context2D.fillStyle = this.getOptionFillStyle(0);
        // 左侧按钮背景
        drawRoundRect(
          context2D,
          maxContentX,
          buttonY,
          oneButtonWidth,
          oneButtonHeight,
          optionRadius,
        );
        context2D.fill();

        const leftInteractive = new InteractiveOption(0, option.options[0]);
        leftInteractive.setHitArea({
          x: maxContentX,
          y: buttonY,
          w: oneButtonWidth,
          h: oneButtonHeight,
        });
        this.interactiveOptions.push(leftInteractive);

        context2D.fillStyle = this.getOptionFillStyle(1);
        // 右侧按钮背景
        drawRoundRect(
          context2D,
          maxContentX + oneButtonWidth + contentPadding,
          buttonY,
          oneButtonWidth,
          oneButtonHeight,
          optionRadius,
        );
        context2D.fill();

        const rightInteractive = new InteractiveOption(1, option.options[1]);
        rightInteractive.setHitArea({
          x: maxContentX + oneButtonWidth + contentPadding,
          y: buttonY,
          w: oneButtonWidth,
          h: oneButtonHeight,
        });
        this.interactiveOptions.push(rightInteractive);

        context2D.fillStyle = contentFillStyle;
        context2D.fillText(
          option.options[0],
          maxContentX + oneButtonWidth / 2,
          textY,
        );
        context2D.fillText(
          option.options[1],
          maxContentX + oneButtonWidth + contentPadding + oneButtonWidth / 2,
          textY,
        );

        context2D.textAlign = 'left';

        // 绘制上方文本
        return {
          clipHeight,
          ...drawTextLines(
            context2D,
            contentX,
            contentY,
            contentWidth,
            clipHeight,
            lineHeight * lines.length,
            contentFillStyle,
            lines,
            scrollY,
          ),
        };
      }
      case OptionType.Multi: {
        const clipHeight = bgHeight - radiusHeight * 2 - contentPadding * 2;

        // 按钮们跟文本们画在一起，一起滚

        // 多个按钮时需要重新计算文本部分的最小宽度
        // 如果最小宽度小于滚动区域的最小宽度，需要文本居中
        // 滚动区域依然是撑满整个文本区域maxContentWidth
        const textWidth = Math.min(maxLineWidth, maxContentWidth);
        return {
          clipHeight,
          ...drawTextLines(
            context2D,
            contentX +
              (maxContentWidth - Math.min(textWidth, maxContentWidth)) / 2,
            contentY,
            textWidth,
            clipHeight,
            contentHeight,
            contentFillStyle,
            lines,
            scrollY,
            contentX,
            maxContentWidth,
            (y) => {
              context2D.textAlign = 'center';
              option.optionsContent.forEach(
                ({ option, lines, height }, idx) => {
                  context2D.fillStyle = this.getOptionFillStyle(idx);
                  drawRoundRect(
                    context2D,
                    contentX,
                    y,
                    maxContentWidth,
                    height,
                    optionRadius,
                  );
                  context2D.fill();

                  // 在content框剪裁的可视范围内
                  if (y + height > contentY && y < contentY + clipHeight) {
                    const interactive = new InteractiveOption(idx, option);
                    interactive.setHitArea({
                      x: contentX,
                      y: y,
                      w: maxContentWidth,
                      h: height,
                    });
                    this.interactiveOptions.push(interactive);
                  }

                  context2D.fillStyle = contentFillStyle;
                  const textY = y + optionPaddingTB + lineHeight / 2;
                  lines.forEach((text, idx) => {
                    context2D.fillText(
                      text,
                      contentX + maxContentWidth / 2,
                      textY + lineHeight * idx,
                    );
                  });
                  y += height + optionMarginY;
                },
              );
              context2D.textAlign = 'left';
            },
          ),
        };
      }
    }
  };
}
