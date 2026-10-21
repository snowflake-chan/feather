import type * as I from '@box/script-api';
import { UiNode } from './ui-node';
import { ClientScriptContext } from 'src/engine/script/ses/apis/context/const';
import { GameUIScreen } from 'src/engine/game-ui/nodes/screen';

export class UiScreen extends UiNode implements I.UiScreen {
  zIndex!: number;
  visible!: boolean;

  static getAllScreen(): UiScreen[] {
    return ClientScriptContext.getAllScreen();
  }

  static create(): UiScreen {
    return ClientScriptContext.createScreen();
  }

  constructor(node: GameUIScreen) {
    super(node);

    Object.defineProperties(this, {
      zIndex: {
        get() {
          return node.zIndex;
        },
        set(zIndex: number) {
          if (typeof zIndex !== 'number') {
            ClientScriptContext.scriptConsole?.warn(
              'UiScreen.zIndex should be a number.',
            );
            return;
          }
          node.zIndex = zIndex;
        },
      },

      visible: {
        get() {
          return node.visible;
        },
        set(visible: boolean) {
          node.visible = visible;
        },
      },
    });
  }
}
