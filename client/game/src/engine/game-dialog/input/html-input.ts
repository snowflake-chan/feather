import type { GameClientState } from '../../game-client-schema';
import type {
  GetInputDialogConfig,
  GetInputDialogValue,
  SetInputDialogValue,
  IDialogInputController,
  IDialogInputControllerSpec,
} from './interface';
import type { HitArea } from '../../input/events';
import styles from './style.module.scss';

export const contentPadding = 16;

const clearBtnSize = 22;
const clearBtnScale = 0.72;

export class HTMLInputController implements IDialogInputController {
  private state: GameClientState;
  private getConfig: GetInputDialogConfig;
  private getValue: GetInputDialogValue;
  private setValue: SetInputDialogValue;

  public inputElement?: HTMLInputElement;
  public clearElement?: HTMLDivElement;

  constructor(spec: IDialogInputControllerSpec) {
    const { state, getConfig, getValue, setValue } = spec;

    this.state = state;
    this.getConfig = getConfig;
    this.getValue = getValue;
    this.setValue = setValue;
  }

  public open(area: HitArea) {
    const element = this.state.dom.element;

    if (!element) {
      return;
    }

    const config = this.getConfig();
    const currValue = this.getValue();

    const react = element.getBoundingClientRect();
    this.inputElement = document.createElement('input');
    this.inputElement.placeholder = config?.placeholder || '';
    this.inputElement.defaultValue = currValue || '';

    this.inputElement.className = styles.input;
    this.inputElement.style.left = `${area.x + react.left}px`;
    this.inputElement.style.top = `${area.y + react.top}px`;
    this.inputElement.style.width = `${area.w}px`;

    const showClearBtn = () => {
      if (!this.clearElement) {
        this.clearElement = this.createClearElement(area, react);
        element.appendChild(this.clearElement);
      }
    };
    const removeClearBtn = () => {
      if (this.clearElement) {
        this.clearElement.remove();
        this.clearElement = undefined;
      }
    };

    currValue && showClearBtn();

    this.inputElement.addEventListener('input', () => {
      this.setValue(this.inputElement?.value);

      /**
       * 根据当前文本内容决定是否显示删除按钮
       *
       * 重新调用方法取值，毕竟不知道setValue是否会有额外的操作
       */
      this.getValue() ? showClearBtn() : removeClearBtn();
    });
    this.inputElement.addEventListener('blur', this.close);
    element.appendChild(this.inputElement);
  }

  private createClearElement(area: HitArea, react: DOMRect) {
    const clearBtn = document.createElement('div');
    clearBtn.className = styles.clearBtn;
    clearBtn.style.left = `${
      area.x +
      area.w +
      react.left -
      clearBtnSize * clearBtnScale -
      contentPadding
    }px`;
    clearBtn.style.top = `${
      area.y + react.top + (area.h - clearBtnSize) / 2
    }px`;

    clearBtn.addEventListener('pointerdown', () => {
      if (this.inputElement) {
        this.inputElement.value = '';
        this.setValue(undefined);
      }

      if (this.clearElement) {
        this.clearElement.remove();
        this.clearElement = undefined;
      }
    });
    return clearBtn;
  }

  public close = () => {
    if (this.inputElement) {
      this.setValue(this.inputElement.value);
      this.inputElement.remove();
      this.inputElement = undefined;
    }

    if (this.clearElement) {
      this.clearElement.remove();
      this.clearElement = undefined;
    }
  };
}
