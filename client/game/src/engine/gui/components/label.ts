import { GUIElement } from '../element';

export enum LabelHorizontalAlign {
  LEFT = 0,
  CENTER = 1,
  RIGHT = 2,
}

export enum LabelVerticalAlign {
  TOP = 0,
  MIDDLE = 1,
  BOTTOM = 2,
}

const defaultState = {
  text: '',
  font: 'sans-serif',
  fontSize: 14,
  color: 'black',
  strokeSize: 0,
  strokeColor: 'gray',
  textWidth: 0,
  textHeight: 0,
  lineHeight: 0,
  horizontalAlign: LabelHorizontalAlign.LEFT,
  verticalAlign: LabelVerticalAlign.MIDDLE,
};

export class GUILabel extends GUIElement<typeof defaultState> {
  public init() {
    Object.assign(this, defaultState);
  }

  public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.font = `${this.fontSize}px ${this.font}`;
    ctx.fillStyle = this.color;
    ctx.textAlign = 'left';
    const m = ctx.measureText(this.text);
    let cx = x + this.x;
    let cy = y + this.y + m.actualBoundingBoxAscent;
    this.textWidth = m.width;
    this.textHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const lines: string[] = [];
    let maxWidth = 0;
    for (let line of this.text.split('\n')) {
      while (true) {
        const lineMeasure = ctx.measureText(line);
        if (lineMeasure.width <= this.width) {
          lines.push(line);
          maxWidth = Math.max(maxWidth, lineMeasure.width);
          break;
        }
        const initLen =
          Math.floor((this.width / lineMeasure.width) * line.length) || 1;
        const initWidth = ctx.measureText(line.substring(0, initLen)).width;
        const step = initWidth > this.width ? -1 : 1;
        let lastWidth = initWidth;
        for (let i = step; ; i += step) {
          const s = line.substring(0, initLen + i);
          const currentWidth = ctx.measureText(s).width;
          if (step === -1 && (initLen === 0 || currentWidth < this.width)) {
            lines.push(s);
            line = line.substring(s.length);
            maxWidth = Math.max(maxWidth, currentWidth);
            break;
          } else if (step === 1 && currentWidth > this.width) {
            lines.push(s.substring(0, s.length - 1));
            line = line.substring(s.length - 1);
            maxWidth = Math.max(maxWidth, lastWidth);
            lastWidth = currentWidth;
            break;
          }
        }
      }
    }

    if (this.horizontalAlign === LabelHorizontalAlign.CENTER) {
      cx += this.width / 2 - maxWidth / 2;
    } else if (this.horizontalAlign === LabelHorizontalAlign.RIGHT) {
      cx += this.width - maxWidth;
    }
    const totalHeight =
      this.textHeight * lines.length + this.lineHeight * (lines.length - 1);
    if (this.verticalAlign === LabelVerticalAlign.MIDDLE) {
      cy += this.height / 2 - totalHeight / 2;
    } else if (this.verticalAlign === LabelVerticalAlign.BOTTOM) {
      cy += this.height - totalHeight;
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const textY = cy + i * (this.textHeight + this.lineHeight);
      if (this.strokeSize < 0) {
        ctx.lineWidth = -this.strokeSize;
        ctx.strokeStyle = this.strokeColor;
        ctx.strokeText(line, cx, textY);
      }
      ctx.fillText(line, cx, textY);
      if (this.strokeSize > 0) {
        ctx.lineWidth = this.strokeSize;
        ctx.strokeStyle = this.strokeColor;
        ctx.strokeText(line, cx, textY);
      }
    }

    super.draw(ctx, x, y);
  }
}
