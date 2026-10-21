import type * as I from '@box/script-api';
import { UiRenderable } from './ui-renderable';
import { ClientScriptContext } from '../context/const';
import { GameUIScrollBox } from 'src/engine/game-ui/nodes/scroll-box';
import { Vec2 } from '../math';

/**
 * 一个2D滚动框
 */
export class UiScrollBox extends UiRenderable {
  public readonly scrollPosition: Vec2;

  constructor(node: GameUIScrollBox) {
    super(node);

    this.scrollPosition = new Vec2(node.scrollPosition);
  }

  static create(): UiScrollBox {
    return ClientScriptContext.createRenderable('scrollBox');
  }
}
