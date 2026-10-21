import { GUIElement } from '../element';

export class GUIGroup extends GUIElement<{
  borderSize: number;
  backgroundColor: string;
}> {
  protected init() {
    this.borderSize = 2;
    this.backgroundColor = '';
  }

  public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (this.backgroundColor) {
      const cx = x + this.x;
      const cy = y + this.y;
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(cx, cy, this.width, this.height);
    }
    super.draw(ctx, x, y);
  }
}
