import type * as I from '@box/script-api';
import { GameUIScale } from 'src/engine/game-ui/nodes/scale';
import { ClientScriptContext } from '../context/const';
import { validateScaleValue } from 'src/engine/game-ui/util';
import { UiComponent } from './ui-component';

export class UiScale extends UiComponent implements I.UiScale {
  public scale: number;

  constructor(node: GameUIScale) {
    super(node);

    this.scale = node.scale;

    Object.defineProperties(this, {
      scale: {
        get: () => node.scale,
        set: (scale: number) => {
          if (!validateScaleValue(scale)) {
            ClientScriptContext.scriptConsole?.warn(
              'Scale should be a number larger than 0.',
            );
            return;
          }
          node.scale = scale;
        },
      },
    });
  }

  static create() {
    return ClientScriptContext.createComponent('scale');
  }
}
