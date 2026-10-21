import type * as I from '@box/script-api';
import type { GameUIComponent } from 'src/engine/game-ui/nodes/component';

/**
 * api的UI组件和GameUI组件的映射，方便反向查找
 * 用weakMap不用担心需要清理
 */
export const COMPONENT_TO_GAME_UI = new WeakMap<
  I.UiComponent,
  GameUIComponent
>();

/**
 * 组件
 */
export class UiComponent implements I.UiComponent {
  public readonly clone: () => I.UiComponent;

  constructor(component: GameUIComponent) {
    COMPONENT_TO_GAME_UI.set(this, component);

    this.clone = () => {
      return component.clone().api();
    };
  }
}
