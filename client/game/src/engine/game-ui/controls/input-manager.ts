import EventEmitter from 'events';
import { mat2d, vec2 } from 'gl-matrix';
import { InputPauseFlags } from '@box/schema/input/input-schema';
import type { InputController } from 'src/engine/input/input-controller';
import type { TextTransformUpdateCallback } from 'src/engine/game-ui/nodes/text';
import type { GameUIRenderable } from 'src/engine/game-ui/nodes/renderable';
import { GameUIText, TEXT_ALIGN_MAP } from 'src/engine/game-ui/nodes/text';
import { GameUIInput } from 'src/engine/game-ui/nodes/input';
import { getTextFont, positionReverseRotation } from '../util';
import styles from './style.module.scss';

export type Spec = {
  getTextareaContainer: () => HTMLElement | undefined;
  inputController: InputController;
};

export type GameUIInputEvents = { target: GameUIInput };
type EventMap = {
  focus: GameUIInputEvents;
  blur: GameUIInputEvents;
};

const TEMP_VEC2: vec2 = [0, 0];
const TEMP_MAT2D = mat2d.create();

export class InputManager extends EventEmitter {
  public inputController: InputController;
  protected getTextareaContainer: Spec['getTextareaContainer'];

  public attached?: GameUIText;

  protected textarea?: HTMLTextAreaElement;
  protected rustyInput?: RustyInputElement;

  protected elementRect?: DOMRect;

  /**
   * attach时，缓存节点是否开启富文本，detach时进行恢复。
   * 因为编辑时只会展示原文本，而不是富文本，而textarea依赖文本节点计算尺寸、定位。
   */
  private attachedRichText = false;

  public addListener<K extends keyof EventMap>(
    type: K,
    listener: (e: EventMap[K]) => void,
  ) {
    return super.addListener(type, listener);
  }

  public removeListener<K extends keyof EventMap>(
    type: K,
    listener: (e: EventMap[K]) => void,
  ) {
    return super.removeListener(type, listener);
  }

  public emit<K extends keyof EventMap>(type: K, data: EventMap[K]) {
    return super.emit(type, data);
  }

  constructor(spec: Spec) {
    const { getTextareaContainer, inputController } = spec;
    super();
    this.getTextareaContainer = getTextareaContainer;
    this.inputController = inputController;

    this.detach = this.detach.bind(this);
  }

  public attach(node: GameUIRenderable) {
    if (!(node instanceof GameUIText)) {
      return;
    }

    this.detach();

    if (typeof document !== 'undefined') {
      this.attachTextarea(node);

      return;
    }

    this.attachRustyInput(node);
  }

  private attachTextarea(node: GameUIText) {
    this.attached = node;
    this.attached.renderContent = false;
    this.attached.transformUpdateCallback = this.updateInputStyle;

    this.attachedRichText = this.attached.richText;
    this.attached.richText = false;

    this.createInput();

    if (!this.textarea) {
      return;
    }

    const height = `${this.attached.contentSize[1]}px`;

    const [r, g, b] = this.attached.textColor;

    Object.assign<CSSStyleDeclaration, Partial<CSSStyleDeclaration>>(
      this.textarea.style,
      {
        wordBreak: 'break-all',
        textAlign: TEXT_ALIGN_MAP[this.attached.textXAlignment],
        font: getTextFont(
          this.attached.textFontSize,
          this.attached.textFontFamily,
        ),
        color: `rgba(${r}, ${g}, ${b}, ${this.attached.textOpacity})`,
        caretColor: `rgba(${r}, ${g}, ${b}, ${this.attached.textOpacity})`,
        height,
        lineHeight: `${
          this.attached.textFontSize * this.attached.textLineHeight
        }px`,
      },
    );

    this.textarea.value = this.attached.textContent;

    const element = this.getTextareaContainer();

    if (element) {
      element.appendChild(this.textarea);

      this.elementRect = element.getBoundingClientRect();
    }

    this.inputController.pauseChange(
      InputPauseFlags.RELEASE,
      InputPauseFlags.KEYBOARD,
    );

    this.textarea.focus({ preventScroll: true });

    if (this.attached instanceof GameUIInput) {
      this.emit('focus', {
        target: this.attached,
      });
    } else {
      // 输入框不需要全部选中
      this.textarea.select();
    }
  }

  public detach() {
    if (!this.attached) {
      return;
    }

    const attached = this.attached;
    this.attached = undefined;

    this.detachTextarea(attached);

    if (this.rustyInput) {
      this.detachRusty();
    }

    if (attached instanceof GameUIInput) {
      // 触发事件
      this.emit('blur', {
        target: attached,
      });
    }
  }

  private detachTextarea(attached: GameUIText) {
    if (!this.textarea) {
      return;
    }

    const { value: newContent } = this.textarea;

    attached.textContent = newContent;
    attached.renderContent = true;

    attached.richText = this.attachedRichText;

    attached.transformUpdateCallback = undefined;
    this.elementRect = undefined;

    this.textarea.remove();
    this.textarea = undefined;

    this.inputController.pauseChange(
      InputPauseFlags.KEYBOARD,
      InputPauseFlags.RELEASE,
    );
  }

  protected createInput() {
    this.textarea = document.createElement('textarea');

    this.textarea.className = styles.textarea;

    this.textarea.addEventListener('input', this.onInput);
    this.textarea.addEventListener('blur', this.detach);
    this.textarea.addEventListener('keydown', this.onKeyDown);
  }

  protected updateInputStyle: TextTransformUpdateCallback = (textNode) => {
    if (!this.textarea) {
      return;
    }

    const {
      contentPosition,
      contentSize: [contentWidth],
      matrixWorld,
    } = textNode;

    /**
     * 这里复用positionReverseRotation函数，计算无旋转的情况下，内容位置的世界坐标
     * 由于positionReverseRotation第三个参数是入参旋转轴心rotatePivot，而contentPos是相当于旋转轴心的坐标
     * 因此取反处理
     */
    vec2.negate(TEMP_VEC2, contentPosition);
    positionReverseRotation(TEMP_VEC2, matrixWorld, TEMP_VEC2);

    const [x, y] = TEMP_VEC2;

    this.textarea.style.left = `${x + (this.elementRect?.left || 0)}px`;
    this.textarea.style.top = `${y + (this.elementRect?.top || 0)}px`;
    // 总是让input等于内容宽度，留一个最小宽度，否则内容为空时，看不到游标
    this.textarea.style.width = `${Math.max(contentWidth, 1)}px`;
    // textarea 动态高度
    this.textarea.style.height = this.textarea.scrollHeight + 'px';
  };

  private onInput = () => {
    if (!this.textarea || !this.attached) {
      return;
    }
    // 需要实时同步回文本节点，文本内容变化触发文本尺寸变化、定位变化
    this.attached.textContent = this.textarea.value;
  };

  private onKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') {
      const element = evt.currentTarget;
      //  alt+enter换行
      if (evt.altKey && element instanceof HTMLTextAreaElement) {
        evt.preventDefault();
        const cursorPosition = element.selectionStart;
        const value =
          element.value.substring(0, cursorPosition) +
          '\n' +
          element.value.substring(cursorPosition);
        element.value = value;
        element.selectionStart = cursorPosition + 1;
        element.selectionEnd = cursorPosition + 1;
        if (this.attached) {
          this.attached.textContent = value;
        }
        return;
      }
      this.detach();
    }
  };

  private attachRustyInput(node: GameUIText) {
    if (!window.RustyInputElement) {
      return;
    }

    this.attached = node;

    const rustyInput = new window.RustyInputElement();

    this.rustyInput = rustyInput;

    const placeholder = node instanceof GameUIInput ? node.placeholder : '';

    this.rustyInput.open(node.textContent, placeholder, false);

    this.rustyInput.addEventListener('change', () => {
      node.textContent = rustyInput.value;
      this.detach();
    });

    this.rustyInput.addEventListener('cancel', this.detach);
  }

  private detachRusty() {
    if (!this.rustyInput) {
      return;
    }

    this.rustyInput.close();
    this.rustyInput = undefined;
  }
}
