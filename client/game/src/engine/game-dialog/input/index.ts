import { InputDialogConfig } from '@box/schema/dialog/dialog-protocol';
import {
  Dialog,
  DialogType,
  InteractivePanel,
  InteractiveType,
  Spec,
} from '../interface';
import {
  contentPadding,
  radiusHeight,
  drawTextLines,
  fontSize,
  lineHeight,
  hitTest,
} from '../util';
import { drawRoundRect, nowrapEllipsisText } from '../../utils/canvas';
import { GameElement, GameElementType } from '../../input/events';
import { SerializedVec2 } from '../../interfaces';
import { intlMessage } from 'src/utils/i18n';
import { HTMLInputController } from './html-input';
import { RustyInputController } from './rusty-input';
import type {
  GetInputDialogConfig,
  GetInputDialogValue,
  SetInputDialogValue,
} from './interface';

const inputFontSize = 12;
const inputLineHeight = inputFontSize * 1.2;
const inputPaddingLR = 16;
const inputPaddingTB = 8;
const inputRadius = 8;

const confirmHeight = 40;
const confirmMinWidth = 96;

const minContentHeight = 200 - 130;
const inputPanelHeight =
  contentPadding +
  inputLineHeight +
  inputPaddingTB * 2 +
  contentPadding +
  confirmHeight;

class ConfirmButton extends InteractivePanel {
  public interactiveType: InteractiveType = InteractiveType.Confirm;
}

class InputCanvas extends InteractivePanel {
  public interactiveType: InteractiveType = InteractiveType.Input;
}

export class InputDialog extends Dialog<InputDialogConfig> {
  public readonly type = DialogType.Input;

  private inputCanvas = new InputCanvas();
  private confirmButton = new ConfirmButton();

  private currValue?: string;

  private hoveringConfirm: boolean = false;

  /**
   * 在浏览器环境时，启用DOM版本的输入元素控制
   */
  private dialogInputController?: HTMLInputController | RustyInputController;

  constructor(spec: Spec) {
    super(spec);

    if (typeof document !== 'undefined') {
      this.dialogInputController = new HTMLInputController({
        state: spec.state,
        getConfig: this.getConfig,
        getValue: this.getValue,
        setValue: this.setValue,
      });
    } else if (window.RustyInputElement) {
      this.dialogInputController = new RustyInputController({
        state: spec.state,
        getConfig: this.getConfig,
        getValue: this.getValue,
        setValue: this.setValue,
      });
    }
  }

  private getConfig: GetInputDialogConfig = () => this.dialogSchema?.config;
  private getValue: GetInputDialogValue = () => this.currValue;
  private setValue: SetInputDialogValue = (value) => {
    this.currValue = value;
  };

  public destroy() {
    super.destroy();
    this.dialogInputController?.close();
    this.currValue = undefined;
  }

  public onMove = (targets: GameElement[]) => {
    const interactive = targets[0] as InteractivePanel;
    this.hoveringConfirm =
      interactive && interactive.interactiveType === InteractiveType.Confirm;
  };

  public onClick = (targets: GameElement[]) => {
    if (
      !targets.length ||
      targets[0].elementType !== GameElementType.GameDialog
    ) {
      return;
    }

    const interactive = targets[0] as InteractivePanel;

    switch (interactive.interactiveType) {
      case InteractiveType.CloseButton:
        this.onCloseBtnClick();
        break;
      case InteractiveType.Input:
        this.onInputClick(interactive);
        break;
      case InteractiveType.Confirm:
        this.onConfirmClick();
        break;
    }
  };

  private onCloseBtnClick() {
    /**
     * 如果正在使用DOM输入，不会主动触发关闭对话框，而是在失焦（onBlur）中关闭对话框
     */
    if (this.dialogInputController && this.dialogInputController.inputElement) {
      return;
    }

    this.dialogClient.cancelDialog();

    this.currValue = undefined;
  }

  private onInputClick(interactivePanel: InteractivePanel) {
    if (
      this.dialogInputController &&
      !this.dialogInputController.inputElement
    ) {
      const hitArea = interactivePanel.getHitArea();

      hitArea && this.dialogInputController.open(hitArea);
      return;
    }
  }

  private onConfirmClick() {
    if (!this.dialogSchema || !this.currValue) {
      return;
    }

    this.dialogClient.resolveDialog(this.dialogSchema.rpcId, {
      type: 'input',
      data: this.currValue,
    });

    this.currValue = undefined;
  }

  public intersect = (out: GameElement[], pos: SerializedVec2) => {
    if (hitTest(pos, this.inputCanvas.getHitArea())) {
      out.push(this.inputCanvas);
      return;
    }

    if (hitTest(pos, this.confirmButton.getHitArea())) {
      out.push(this.confirmButton);
    }
  };

  public getContentWH = (
    context2D: CanvasRenderingContext2D,
    lines: string[],
    maxContentWidth: number,
  ) => {
    return {
      contentHeight:
        Math.max(minContentHeight, lineHeight * lines.length) +
        inputPanelHeight,
      minContentHeight: minContentHeight + inputPanelHeight,
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
    this.inputCanvas.destroy();
    this.confirmButton.destroy();

    if (!this.dialogSchema) {
      return {
        clipHeight: 0,
        scrollY: 0,
        scrollbarHeight: 0,
        scrollbarPositionY: 0,
      };
    }
    const clipHeight =
      bgHeight - radiusHeight * 2 - contentPadding * 2 - inputPanelHeight;

    context2D.save();
    const { confirmText, placeholder } = this.dialogSchema.config;
    const inputY = contentY + clipHeight + contentPadding;
    const inputHeight = inputLineHeight + inputPaddingTB * 2;
    /**
     * input框背景
     * 原本的值是rgba(0.07, 0.07, 0.07, 1)，
     * 但安卓未适配小数，所以换成整数值，直接用0就好了
     */
    context2D.fillStyle = 'rgba(0, 0, 0, 1)';
    drawRoundRect(
      context2D,
      maxContentX + 1,
      inputY + 1,
      maxContentWidth,
      inputHeight,
      inputRadius,
    );
    context2D.fill();
    // input框描边
    context2D.strokeStyle = 'rgb(255, 255, 255, 0.3)';
    context2D.lineWidth = 1;
    drawRoundRect(
      context2D,
      maxContentX,
      inputY,
      maxContentWidth + 2,
      inputHeight + 2,
      inputRadius,
    );
    context2D.stroke();

    this.inputCanvas.setHitArea({
      x: maxContentX,
      y: inputY,
      w: maxContentWidth + 2,
      h: inputHeight + 2,
    });

    // input框placeholder/value
    context2D.font = `${inputFontSize}px Rubik, MiSans, Montserrat-Regular`;
    context2D.textAlign = 'left';
    context2D.fillStyle = this.currValue ? '#ffffff' : '#808080';
    const placeholderWidth = maxContentWidth - inputPaddingLR * 2;
    context2D.fillText(
      nowrapEllipsisText(
        context2D,
        this.currValue || placeholder,
        placeholderWidth,
      ).text || intlMessage('inputPlaceholder'),
      maxContentX + inputPaddingLR,
      inputY + inputHeight / 2 + 1,
    );

    // confirm按键
    const confirmY = inputY + inputHeight + contentPadding;
    context2D.font = `${fontSize}px Rubik, MiSans, Montserrat-Regular`;
    context2D.textAlign = 'center';
    const res = nowrapEllipsisText(
      context2D,
      confirmText,
      maxContentWidth - contentPadding * 2,
    );
    const confirmWidth = Math.max(
      confirmMinWidth,
      res.textLen + contentPadding * 2,
    );
    const confirmX = maxContentX + maxContentWidth / 2 - confirmWidth / 2;

    // confirm按键背景
    context2D.fillStyle = '#fc8308';
    /**
     * 安卓未适配小数，因此换成百分比
     */
    if (!this.currValue) {
      context2D.filter = 'brightness(56%)';
    } else if (this.hoveringConfirm) {
      context2D.filter = 'brightness(110%)';
    }

    drawRoundRect(
      context2D,
      confirmX,
      confirmY,
      confirmWidth,
      confirmHeight,
      confirmHeight / 2,
    );
    context2D.fill();

    this.confirmButton.setHitArea({
      x: confirmX,
      y: confirmY,
      w: confirmWidth,
      h: confirmHeight,
    });

    // confirm按键文本
    context2D.fillStyle = '#FFFFFF';
    context2D.fillText(
      res.text || intlMessage('confirm'),
      maxContentX + maxContentWidth / 2,
      confirmY + confirmHeight / 2,
    );

    context2D.restore();

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
  };
}
