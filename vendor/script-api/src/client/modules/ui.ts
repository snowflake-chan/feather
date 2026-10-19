import type { Coord2, Vec2, Vec3 } from './math';
import type { EventEmitter } from './events';

export interface UiEvent {
  target: UiNode;
}

export interface UiInputEvent {
  target: UiInput;
}

export interface UiImageEvent {
  target: UiImage;
}

export type UiNodeEvents = {
  pointerdown: UiEvent;
  pointerup: UiEvent;
};

export type UiInputEvents = UiNodeEvents & {
  focus: UiInputEvent;
  blur: UiInputEvent;
};

export type UiImageEvents = UiNodeEvents & {
  load: UiImageEvent;
};

/**
 * 基础节点
 */
export declare class UiNode {
  name: string;
  readonly children: ReadonlyArray<UiNode>;
  parent: UiNode | undefined;
  /**
   * @ignore
   */
  constructor(...args: any);
  findChildByName: (name: string) => UiNode | undefined;
  /**
   * 管理节点相关的事件
   */
  events: EventEmitter<UiNodeEvents>;
  /**
   * 对节点进行缩放
   */
  uiScale: UiScale | undefined;
  /**
   * 克隆节点
   */
  clone: () => this;
}

export declare class UiRenderable extends UiNode {
  readonly anchor: Vec2;
  readonly position: Coord2;
  readonly backgroundColor: Vec3;
  backgroundOpacity: number;
  readonly size: Coord2;
  zIndex: number;
  autoResize: 'NONE' | 'X' | 'Y' | 'XY';
  visible: boolean;
  pointerEventBehavior: PointerEventBehavior;
  /**
   * 旋转（角度）
   */
  rotation: number;
}

export declare class UiBox extends UiRenderable {
  /**
   * @ignore
   */
  constructor(...args: any);
  static create(): UiBox;
}

export declare enum UITextFontFamily {
  /**
   * 默认字体
   */
  Default = 0,
  /**
   * 粗圆体
   */
  BoldRound = 1,
  /**
   * Code New Roman Bold
   */
  CodeNewRomanBold = 2,
  /**
   * EN-Serif
   */
  ENSerif = 3,
}

declare class BaseUiText extends UiRenderable {
  textContent: string;
  textFontSize: number;
  readonly textColor: Vec3;
  textXAlignment: 'Center' | 'Left' | 'Right';
  textYAlignment: 'Center' | 'Top' | 'Bottom';
  autoWordWrap: boolean;
  textLineHeight: number;
  readonly textStrokeColor: Vec3;
  textStrokeOpacity: number;
  textStrokeThickness: number;
  textFontFamily: UITextFontFamily;
}

export declare class UiText extends BaseUiText {
  richText: boolean;
  static create(): UiText;
}

export declare class UiInput extends BaseUiText {
  placeholder: string;
  readonly placeholderColor: Vec3;
  readonly placeholderOpacity: number;
  readonly isFocus: boolean;
  readonly focus: () => void;
  readonly blur: () => string;
  static create(): UiInput;
}

export declare class UiScreen extends UiNode {
  visible: boolean;
  zIndex: number;
  static create(): UiScreen;
  /**
   * @version 2024.22
   */
  static getAllScreen(): UiScreen[];
}

export declare class UiImage extends UiRenderable {
  image: string;
  imageOpacity: number;
  imageDisplayMode: ImageDisplayMode;
  readonly complete: boolean;
  static create(): UiImage;
}

/**
 * 图片展示方式
 */
export declare enum ImageDisplayMode {
  /**
   * 铺满：（默认）适配元素外框长宽拉伸铺满展示，图片可能会变形
   */
  Fill = 0,
  /**
   * 等比铺满：等比缩放保证图片完整展示在外框内
   */
  Contain = 1,
  /**
   * 等比截取：等比缩放图片使图片填满外框，超出部分将被裁剪（隐藏显示）
   */
  Cover = 2,
  /**
   * 无：按图片正常尺寸与外框中心对齐展示，不对图片进行任何缩放调整，但是超出元素框部分会被裁剪（隐藏显示）
   */
  None = 3,
}

/**
 * 滚动框
 */
export declare class UiScrollBox extends UiRenderable {
  /**
   * 滚动的位置，设置后，会受到当前可滚动范围约束
   */
  readonly scrollPosition: Vec2;
  static create(): UiScrollBox;
}

export declare class UiComponent {
  /**
   * @ignore
   */
  constructor(...args: any);
}

export declare class UiScale extends UiComponent {
  scale: number;
  static create(): UiScale;
}

/**
 * 指针事件行为
 */
export declare enum PointerEventBehavior {
  /**
   * 不响应，且不允许位于元素后方的其他元素响应。
   */
  DISABLE_AND_BLOCK_PASS_THROUGH = 0,
  /**
   * 不响应。
   */
  DISABLE = 1,
  /**
   * 不允许位于元素后方的其他元素响应。
   */
  BLOCK_PASS_THROUGH = 2,
  /**
   * 正常响应。
   */
  ENABLE = 3,
}

/**
 * 游戏屏幕的宽度，取决于玩家进入游戏时的屏幕大小。
 */
export declare const screenWidth: number;

/**
 * 游戏屏幕的高度，取决于玩家进入游戏时的屏幕大小。
 */
export declare const screenHeight: number;

/**
 * @deprecated
 */
export declare const ui: UiNode;
