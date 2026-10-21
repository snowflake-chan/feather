import { EventEmitter } from 'events';
import { vec2 } from 'gl-matrix';
import { UIScrollDirection } from '@box/schema/project/ui-rda/defs';
import type { UIDragEvent, UIWheelEvent } from './drag';
import {
  isScrollBox,
  isScrollbar,
  rotationFromMat2d,
  safeVec2Div,
} from '../util';
import type { GameUIScrollBox, GameUIScrollbar } from '../nodes/scroll-box';

const VEC2_IDENTITY: vec2 = [0, 0];
const TEMP_VEC2: vec2 = [0, 0];

type EventMap = {
  dragScroll: GameUIScrollBox;
  dragScrollEnd: GameUIScrollBox;
  wheelScroll: GameUIScrollBox;
};

export interface IScrollControls {
  emit<K extends keyof EventMap>(
    type: K,
    data: Omit<EventMap[K], 'type'>,
  ): boolean;
  addListener<K extends keyof EventMap>(
    type: K,
    listener: (e: Omit<EventMap[K], 'type'>) => void,
  ): this;
  removeListener<K extends keyof EventMap>(
    type: K,
    listener: (e: Omit<EventMap[K], 'type'>) => void,
  ): this;
}

export class ScrollControls extends EventEmitter {
  /**
   * 在滚动框开始滚
   * 动时，记录初始滚动位置
   * 在过程中，当前滚动位置 = 初始位置 + 偏移量
   */
  private scrollElementStartScroll: vec2 = [0, 0];

  /**
   * 在滚动框开始滚动时，鼠标的起始位置
   */
  private dragStartMouse: vec2 = [0, 0];

  /**
   * 根据滚动框的可滚动，确定偏移量是否应用
   */
  private scrollOffsetFactor: vec2 = [0, 0];

  /**
   * 当前拖拽滚动的元素
   */
  private dragScrollElement?: GameUIScrollBox;

  /**
   * 当前拖拽滚动元素的世界坐标下的旋转
   */
  private dragScrollElementRotation = 0;

  /**
   * 最大滚动偏移量
   */
  private maxScrollOffset: vec2 = [0, 0];

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

  public dragScrollStart = (evt: UIDragEvent): boolean => {
    if (evt.nodes.length === 0) {
      return false;
    }

    let scrollBox: GameUIScrollBox | undefined;
    let scrollbar: GameUIScrollbar | undefined;

    evt.nodes.find((node) => {
      if (isScrollBox(node)) {
        scrollBox = node;
        return true;
      }

      if (isScrollbar(node)) {
        scrollbar = node;

        scrollBox = scrollbar.scrollBox;

        return true;
      }

      return false;
    });

    if (!scrollBox) {
      return false;
    }

    this.dragScrollElement = scrollBox;

    this.getDragOffsetFactor(
      this.scrollOffsetFactor,
      this.dragScrollElement,
      scrollbar,
    );

    vec2.copy(this.dragStartMouse, evt.mouse);

    vec2.copy(
      this.scrollElementStartScroll,
      this.dragScrollElement.scrollPosition,
    );

    vec2.sub(
      this.maxScrollOffset,
      this.dragScrollElement.scrollCanvas.absSize,
      this.dragScrollElement.absSize,
    );

    vec2.max(this.maxScrollOffset, this.maxScrollOffset, VEC2_IDENTITY);

    this.dragScrollElementRotation = rotationFromMat2d(
      this.dragScrollElement.matrixWorld,
    );

    return true;
  };

  public dragScroll = (evt: UIDragEvent) => {
    if (!this.dragScrollElement) {
      return;
    }

    vec2.sub(
      this.dragScrollElement.scrollPosition,
      evt.mouse,
      this.dragStartMouse,
    );

    // 把旋转应用到偏移量上
    vec2.rotate(
      this.dragScrollElement.scrollPosition,
      this.dragScrollElement.scrollPosition,
      [0, 0],
      -this.dragScrollElementRotation,
    );

    vec2.mul(
      this.dragScrollElement.scrollPosition,
      this.dragScrollElement.scrollPosition,
      this.scrollOffsetFactor,
    );

    vec2.add(
      this.dragScrollElement.scrollPosition,
      this.dragScrollElement.scrollPosition,
      this.scrollElementStartScroll,
    );

    vec2.min(
      this.dragScrollElement.scrollPosition,
      this.dragScrollElement.scrollPosition,
      this.maxScrollOffset,
    );
    vec2.max(
      this.dragScrollElement.scrollPosition,
      this.dragScrollElement.scrollPosition,
      VEC2_IDENTITY,
    );

    this.emit('dragScroll', this.dragScrollElement);
  };

  public dragScrollEnd = () => {
    if (!this.dragScrollElement) {
      return;
    }

    const scrollBox = this.dragScrollElement;

    this.dragScrollElement = undefined;

    vec2.zero(this.scrollElementStartScroll);
    vec2.zero(this.maxScrollOffset);
    vec2.zero(this.dragStartMouse);

    this.emit('dragScrollEnd', scrollBox);
  };

  private getDragOffsetFactor(
    out: vec2,
    scrollBox: GameUIScrollBox,
    scrollbar?: GameUIScrollbar,
  ) {
    if (!scrollbar) {
      this.getDirectionFactor(out, scrollBox.scrollDirection);

      vec2.negate(out, out);
    } else {
      this.getDirectionFactor(out, scrollbar.direction);

      safeVec2Div(TEMP_VEC2, scrollBox.scrollCanvas.absSize, scrollBox.absSize);

      vec2.mul(out, out, TEMP_VEC2);
    }
  }

  private getDirectionFactor(out: vec2, direction: UIScrollDirection) {
    switch (direction) {
      case UIScrollDirection.X:
        out[0] = 1;
        out[1] = 0;
        break;
      case UIScrollDirection.Y:
        out[0] = 0;
        out[1] = 1;
        break;
      case UIScrollDirection.XY:
        out[0] = 1;
        out[1] = 1;
        break;
    }
  }

  /**
   * 滚轮滚动
   * @param scrollBox 要滚动的滚动框
   * @param evt
   * @returns
   */
  public wheelScroll = (scrollBox: GameUIScrollBox, evt: UIWheelEvent) => {
    this.getDirectionFactor(this.scrollOffsetFactor, scrollBox.scrollDirection);

    const { deltaX, deltaY } = evt.event;

    switch (scrollBox.scrollDirection) {
      case UIScrollDirection.X:
        vec2.set(TEMP_VEC2, deltaX === 0 ? deltaY : deltaX, 0);
        break;
      case UIScrollDirection.Y:
        vec2.set(TEMP_VEC2, 0, deltaY === 0 ? deltaX : deltaY);
        break;
      default:
        /**
         * 双向滚动时，如果按下shift，应该触发横向滚动，如果deltaX为0，则取deltaY
         *
         * - 在mac上，shift + 滚轮，会自动转为deltaX
         * - 在windows上，shift + 滚轮，还是deltaY
         * - 不做平台检测，仅从交互设计角度来看，保证shift + 滚轮触发横向滚动
         */
        if (evt.event.shiftKey && deltaX === 0) {
          vec2.set(TEMP_VEC2, deltaY, 0);
        } else {
          vec2.set(TEMP_VEC2, deltaX, deltaY);
        }
        break;
    }

    vec2.mul(TEMP_VEC2, TEMP_VEC2, this.scrollOffsetFactor);

    vec2.add(scrollBox.scrollPosition, scrollBox.scrollPosition, TEMP_VEC2);

    vec2.sub(TEMP_VEC2, scrollBox.scrollCanvas.absSize, scrollBox.absSize);

    vec2.min(scrollBox.scrollPosition, scrollBox.scrollPosition, TEMP_VEC2);
    vec2.max(scrollBox.scrollPosition, scrollBox.scrollPosition, [0, 0]);

    this.emit('wheelScroll', scrollBox);

    return;
  };
}
