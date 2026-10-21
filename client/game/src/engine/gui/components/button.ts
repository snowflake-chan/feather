import { GUIElement } from '../element';
import { createProxy, GetProxyType, roundRect } from '../utils';
import { LabelHorizontalAlign, GUILabel } from './label';

const proxy = createProxy(
  GUILabel,
  ['text', 'font', 'fontSize', 'color', 'strokeSize', 'strokeColor'],
  {
    color: 'fontColor' as 'fontColor',
  },
);

export class GUIButton extends GUIElement<
  {
    activeColor: string;
    hoverColor: string;
    color: string;
  } & GetProxyType<typeof proxy>
> {
  protected init() {
    const label = new GUILabel('button_label', this.root, this);
    proxy(this.attributes, label);
    this.activeColor = '#009883';
    this.hoverColor = '#29c0aa';
    this.color = '#22d6bc';
    this.append(label);
    label.percentWidth = 100;
    label.percentHeight = 100;
    label.horizontalAlign = LabelHorizontalAlign.CENTER;
    this.fontColor = 'white';
    this.fontSize = 20;
  }

  public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (this.mouseActive) {
      ctx.fillStyle = this.activeColor;
    } else if (this.mouseHover) {
      ctx.fillStyle = this.hoverColor;
    } else {
      ctx.fillStyle = this.color;
    }
    const cx = x + this.x;
    const cy = y + this.y;
    roundRect.call(ctx, cx, cy, this.width, this.height, 7).fill();
    ctx.fill();
    ctx.strokeStyle = 'white';
    roundRect.call(ctx, cx, cy, this.width, this.height, 7).fill();
    ctx.stroke();
    super.draw(ctx, x, y);
  }
}
