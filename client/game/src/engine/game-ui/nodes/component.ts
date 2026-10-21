import { UiComponent } from 'src/engine/script/ses/apis/gui/ui-component';
import { GameUIComponentType } from './defs';

export abstract class GameUIComponent {
  public abstract componentType: GameUIComponentType;

  protected ApiType = UiComponent;

  public _api: InstanceType<typeof this.ApiType> | undefined;

  public api() {
    if (!this._api) {
      this._api = new this.ApiType(this);
    }

    return this._api;
  }

  public resetApi() {
    delete this._api;
  }

  public copy(component: GameUIComponent) {
    return this;
  }

  abstract clone(): GameUIComponent;
}
