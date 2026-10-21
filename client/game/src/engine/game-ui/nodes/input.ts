import {
  ContentLineNodeStyle,
  GameUIText,
} from 'src/engine/game-ui/nodes/text';
import { drawRoundRect } from 'src/engine/utils/canvas';
import { vec3 } from 'gl-matrix';
import { UiInput } from 'src/engine/script/ses/apis/gui/ui-input';

export class GameUIInput extends GameUIText {
  protected ApiType = UiInput;
  public _api: InstanceType<typeof this.ApiType> | undefined;

  public api() {
    if (!this._api) {
      this._api = new this.ApiType(this);
    }

    return this._api;
  }

  public readonly placeholderColor = vec3.create();
  public placeholderOpacity = 1;
  public placeholder = '';

  private getRenderText() {
    // 编辑模式下使用文本
    // 有文本则用文本
    if (!this.renderContent || this.textContent !== '') {
      return this.textContent;
    }

    return this.placeholder;
  }

  /**
   * @override
   */
  protected updateContentSize(applyScale: boolean) {
    super.updateContentSize(applyScale, this.getRenderText());
  }

  /**
   * @override
   */
  public copy(source: GameUIInput) {
    super.copy(source);

    this.placeholder = source.placeholder;
    this.placeholderOpacity = source.placeholderOpacity;
    vec3.copy(this.placeholderColor, source.placeholderColor);

    return this;
  }

  /**
   * @override
   */
  public draw(context: CanvasRenderingContext2D): void {
    let textColor: vec3;
    let opacity: number;
    let enableStroke: boolean;
    let style: ContentLineNodeStyle | undefined;

    if (this.textContent === '') {
      textColor = this.placeholderColor;
      opacity = this.placeholderOpacity;
      enableStroke = false;
      style = {
        font: {
          size: this.textFontSize,
          color: this.placeholderColor,
        },
        stroke: {
          thickness: 0,
          color: this.placeholderColor,
          opacity: this.placeholderOpacity,
        },
      };
    } else {
      textColor = this.textColor;
      opacity = this.textOpacity;
      enableStroke = true;
    }

    context.beginPath();

    const [r, g, b] = this.backgroundColor;

    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.backgroundOpacity})`;

    const x = -this.rotatePivot[0];
    const y = -this.rotatePivot[1];
    const [w, h] = this.absSize;

    if (!this.borderRadius) {
      context.fillRect(x, y, w, h);
    } else {
      drawRoundRect(context, x, y, w, h, this.borderRadius);
      context.fill();
    }
    if (this.renderContent) {
      this.saveContextTextStyle(context);

      this.drawTextLines(context, enableStroke, style);

      this.restoreContextTextStyle(context);
    }

    context.closePath();
  }
}
