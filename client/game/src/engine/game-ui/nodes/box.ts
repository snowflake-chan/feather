import { UiBox } from 'src/engine/script/ses/apis/gui/ui-box';
import { GameUIRenderable } from './renderable';

export class GameUIBox extends GameUIRenderable {
  protected ApiType = UiBox;

  public _api: InstanceType<typeof this.ApiType> | undefined;

  public api() {
    if (!this._api) {
      this._api = new this.ApiType(this);
    }

    return this._api;
  }

  public draw(context: CanvasRenderingContext2D, dpr: number): void {
    context.beginPath();

    const [r, g, b] = this.backgroundColor;

    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.backgroundOpacity})`;

    context.fillRect(
      -this.rotatePivot[0],
      -this.rotatePivot[1],
      this.absSize[0],
      this.absSize[1],
    );

    context.closePath();
  }
}
