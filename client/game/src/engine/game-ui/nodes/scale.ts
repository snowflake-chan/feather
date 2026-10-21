import { UiScale } from 'src/engine/script/ses/apis/gui/ui-scale';
import { GameUIComponent } from './component';
import { GameUIComponentType } from './defs';

export class GameUIScale extends GameUIComponent {
  public componentType = GameUIComponentType.Scale;

  public scale = 1;

  protected ApiType = UiScale;

  public _api: InstanceType<typeof this.ApiType> | undefined;

  public api() {
    if (!this._api) {
      this._api = new this.ApiType(this);
    }

    return this._api;
  }

  public copy(scale: GameUIScale) {
    this.scale = scale.scale;

    return this;
  }

  public clone() {
    return new (this.constructor as typeof GameUIScale)().copy(this);
  }
}
