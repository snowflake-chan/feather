import { GUIElement } from '../element';
import { createProxy, GetProxyType } from '../utils';
import { GUILabel } from './label';

const proxy = createProxy(GUILabel, [
  'text',
  'font',
  'fontSize',
  'color',
  'strokeSize',
  'strokeColor',
]);

export class GUICheckBox extends GUIElement<
  {
    checked: boolean;
  } & GetProxyType<typeof proxy>
> {
  protected init() {
    const label = this.root.createElement('label');
    proxy(this.attributes, label);
    this.checked = false;
    this.append(label);
    label.percentHeight = 100;
    label.right = 0;
    label.left = 20;
    this.addEventListener('click', () => {
      this.checked = !this.checked;
    });
  }

  public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const cx = x + this.x;
    const cy = y + this.y;

    ctx.font = '15px sans-serif';
    const m = ctx.measureText(this.text);
    const checkText = this.checked ? '✅' : '⬜️';
    const fontHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;

    ctx.fillStyle = 'black';
    ctx.fillText(
      checkText,
      cx,
      cy + this.height / 2 - fontHeight / 2 + m.actualBoundingBoxAscent,
    );
    super.draw(ctx, x, y);
  }
}
