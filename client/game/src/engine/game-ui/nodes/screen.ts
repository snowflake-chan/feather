import { nanoid } from 'nanoid/non-secure';
import { GameUINode } from './base';
import { EventMode, GameUINodeType } from './defs';
import { UiScreen } from 'src/engine/script/ses/apis/gui/ui-screen';

export class GameUIScreen extends GameUINode {
  protected ApiType = UiScreen;

  public _api: InstanceType<typeof this.ApiType> | undefined;

  public api() {
    if (!this._api) {
      this._api = new this.ApiType(this);
    }

    return this._api;
  }

  public nodeType = GameUINodeType.Screen;

  public eventMode = EventMode.Passive;

  public clone() {
    return new (this.constructor as typeof GameUIScreen)({
      id: nanoid(),
    }).copy(this);
  }
}
