import type * as I from '@box/script-api';
import { GameUIBox } from 'src/engine/game-ui/nodes/box';
import { UiRenderable } from './ui-renderable';
import { ClientScriptContext } from '../context/const';

/**
 * 一个2D方形
 */
export class UiBox extends UiRenderable implements I.UiBox {
  constructor(node: GameUIBox) {
    super(node);
  }

  static create(): UiBox {
    return ClientScriptContext.createRenderable('box');
  }
}
