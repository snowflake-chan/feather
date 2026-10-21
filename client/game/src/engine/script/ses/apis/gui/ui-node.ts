import type * as I from '@box/script-api';
import type { GameUINode } from 'src/engine/game-ui/nodes/base';
import { EventEmitter } from '../events';
import { COMPONENT_TO_GAME_UI } from './ui-component';
import { isComponentScale, isScreen } from 'src/engine/game-ui/util';
import { ClientScriptContext } from '../context/const';

/**
 * api的UI节点和GameUI节点的映射，方便反向查找
 * 用weakMap不用担心需要清理
 */
const UI_TO_GAME_UI = new WeakMap<I.UiNode, GameUINode>();

export class UiNode implements I.UiNode {
  public name!: string;

  public readonly children!: ReadonlyArray<UiNode>;

  public parent: I.UiNode | undefined;

  public readonly findChildByName: (name: string) => UiNode | undefined;

  public readonly events: I.EventEmitter<I.UiNodeEvents>;

  /**
   * @deprecated 用 events
   */
  public readonly event: UiNode['events'];

  public uiScale: I.UiScale | undefined;

  public readonly clone: () => this;

  constructor(node: GameUINode) {
    UI_TO_GAME_UI.set(this, node);

    let parentDescriptor: PropertyDescriptor;

    // 屏幕节点不能设置parent
    if (isScreen(node)) {
      parentDescriptor = {
        set: () => undefined,
        get: undefined,
      };
    } else {
      parentDescriptor = {
        get() {
          return node.parent?.api();
        },
        set(parent: I.UiNode) {
          if (parent === undefined || parent === null) {
            node.parent?.remove(node);
            node.parent = parent;
            return;
          }

          const parentNode = UI_TO_GAME_UI.get(parent);

          if (parentNode) {
            if (parentNode !== node.parent) {
              node.parent?.remove(node);

              parentNode.addChildAt(node, 0);
            }
            return;
          }

          ClientScriptContext.scriptConsole?.warn(
            'Parameter parent is invalid.',
          );
        },
      };
    }

    Object.defineProperties(this, {
      name: {
        get() {
          return node.name;
        },
        set(name: string) {
          node.name = name;
        },
      },
      parent: parentDescriptor,
      children: {
        get() {
          return node.children.map((child) => child.api());
        },
      },
      uiScale: {
        get() {
          return node.components.uiScale?.api();
        },
        set(uiScale: I.UiScale) {
          if (uiScale === undefined || uiScale === null) {
            node.components.uiScale = uiScale;

            return;
          }

          const mayBeScale = COMPONENT_TO_GAME_UI.get(uiScale);

          if (mayBeScale && isComponentScale(mayBeScale)) {
            node.components.uiScale = mayBeScale;
            return;
          }

          ClientScriptContext.scriptConsole?.warn(
            'Parameter uiScale is invalid.',
          );
        },
      },
    });

    this.findChildByName = (name: string) => {
      const child = node.children.find((child) => child.name === name);
      if (!child) {
        return;
      }
      return child.api();
    };

    /**
     * 由于调用的是GameUINode.api()，无法满足this约束。
     * 用as this特殊处理。
     */
    this.clone = () => {
      const newNode = node.clone();

      node.parent?.add(newNode);

      return newNode.api() as this;
    };

    this.events = new EventEmitter();
    this.event = this.events;
  }
}
