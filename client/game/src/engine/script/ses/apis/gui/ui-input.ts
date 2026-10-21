import type * as I from '@box/script-api';
import { Vec3 } from '../math';
import { ClientScriptContext } from '../context/const';
import { UiText } from 'src/engine/script/ses/apis/gui/ui-text';
import { GameUIInput } from 'src/engine/game-ui/nodes/input';
import { EventEmitter } from 'src/engine/script/ses/apis/events';

export class UiInput extends UiText implements I.UiInput {
  placeholder!: string;
  readonly placeholderColor!: Vec3;
  readonly placeholderOpacity!: number;
  isFocus!: boolean;
  focus!: () => void;
  blur!: () => string;

  public readonly events: I.EventEmitter<I.UiInputEvents>;
  /**
   * @deprecated 用 events
   */
  public readonly event: UiInput['events'];

  constructor(node: GameUIInput) {
    super(node);

    this.placeholderColor = new Vec3(node.placeholderColor);

    this.focus = () => {
      ClientScriptContext.inputManager?.attach(node);
    };
    this.blur = () => {
      if (ClientScriptContext.inputManager?.attached?.id === node.id) {
        ClientScriptContext.inputManager?.detach();
      }
      return node.textContent;
    };

    Object.defineProperties(this, {
      placeholder: {
        get() {
          return node.placeholder;
        },
        set(placeholder: string) {
          if (typeof placeholder !== 'string') {
            ClientScriptContext.scriptConsole?.warn(
              'Placeholder should be a string.',
            );
            return;
          }
          node.placeholder = placeholder;
        },
      },
      isFocus: {
        get() {
          return ClientScriptContext.inputManager?.attached?.id === node.id;
        },
      },
      // “输入框”不能设置富文本，重写getter和setter屏蔽
      richText: {
        get() {},
        set() {},
      },
    });
    this.events = new EventEmitter();
    this.event = this.events;
  }

  static create() {
    return ClientScriptContext.createRenderable('input');
  }
}
