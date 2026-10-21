import { GUIElement } from '../element';

export class GUIImageButton extends GUIElement {
  public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const state = this.mouseActive
      ? 'active'
      : this.mouseHover
      ? 'hover'
      : 'normal';
    const cx = x + this.x;
    const cy = y + this.y;
    for (const child of this.children) {
      const childState = (child as any).state;
      if (typeof childState !== 'string' || childState === state) {
        child.draw(ctx, cx, cy);
      }
    }
  }
}
