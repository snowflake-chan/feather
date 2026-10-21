import { GUIElement } from '../element';
import { createProxy, GetProxyType, PropertyProxy, RenameType } from '../utils';

type Proxy = PropertyProxy<
  HTMLImageElement,
  RenameType<Pick<HTMLImageElement, 'src'>, {}>
>;
let proxy: Proxy | undefined;
if (!process.env.RUSTY) {
  proxy = createProxy(HTMLImageElement, ['src']);
}

const defaultAttributes = {
  positionX: 0,
  positionY: 0,
  sizeWidth: NaN,
  sizeHeight: NaN,
  sizePercentWidth: NaN,
  sizePercentHeight: NaN,
};

export class GUIImage extends GUIElement<
  GetProxyType<Proxy> & typeof defaultAttributes
> {
  private image!: HTMLImageElement;

  protected init() {
    this.image = new Image();
    Object.assign(this, defaultAttributes);
    proxy?.(this.attributes, this.image);
  }

  public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const width = Math.min(
      this.width,
      this.sizeWidth || this.sizePercentWidth * 0.01 * this.width || Infinity,
    );
    const height = Math.min(
      this.height,
      this.sizeHeight ||
        this.sizePercentHeight * 0.01 * this.height ||
        Infinity,
    );
    ctx.drawImage(
      this.image,
      this.positionX,
      this.positionY,
      width,
      height,
      this.x + x,
      this.y + y,
      this.width,
      this.height,
    );
    super.draw(ctx, x, y);
  }
}
