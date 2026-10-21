import { mat2d, vec2, vec3 } from 'gl-matrix';
import { nanoid } from 'nanoid/non-secure';
import {
  AutoResizeType,
  PointerEventBehavior,
  UICoord2RDA,
} from '@box/schema/project/ui-rda/defs';
import type { UITransform } from './interface';
import type { HitArea } from '../util';
import { EventMode, GameUINodeType } from './defs';
import { BaseSpec, GameUINode } from './base';
import { UiRenderable } from 'src/engine/script/ses/apis/gui/ui-renderable';

export class GameUIRenderable extends GameUINode {
  public nodeType = GameUINodeType.Renderable;

  protected ApiType = UiRenderable;

  public _api: InstanceType<typeof this.ApiType> | undefined;

  public api() {
    if (!this._api) {
      this._api = new this.ApiType(this);
    }

    return this._api;
  }

  public resetApi() {
    delete this._api;
  }

  public readonly anchor = vec2.create();

  public readonly position = vec2.create();

  public readonly absSize = vec2.create();

  /**
   * 节点左上角的布局坐标
   * 自身以及祖先元素都 未应用旋转 时的坐标
   */
  public readonly layoutPosition = vec2.create();

  /**
   * 节点左上角的绝对坐标
   * 自身以及祖先元素都 应用旋转 时的坐标
   */
  public readonly absPosition: vec2 = [0, 0];

  public rotation = 0;

  /**
   * 旋转的轴心，相对于本地坐标左上角的距离
   * 目前总是以“几何中心”为旋转轴心
   */
  public readonly rotatePivot: vec2 = [0, 0];
  /**
   * 围绕旋转轴心的本地旋转位移矩阵
   */
  public readonly matrix = mat2d.create();
  /**
   * 围绕旋转轴心的世界旋转位移矩阵
   */
  public readonly matrixWorld = mat2d.create();

  public autoResize = AutoResizeType.NONE;

  public readonly backgroundColor = vec3.create();

  public backgroundOpacity = 1;

  /**
   * 事件检测 - 捕获，控制自身是否可交互，子节点是否可交互
   */
  public eventMode = EventMode.Interactive;

  /**
   * 指针事件检测 - 冒泡（穿透版），控制自身是否可交互，后方的节点是否可交互
   * 只影响运行时的指针事件派发
   */
  public pointerEventBehavior = PointerEventBehavior.ENABLE;

  /**
   * 交互热区
   * 如果有交互热区，按照交互热区检测。
   * 如果没有，则按照节点本身的全局坐标和尺寸检测。
   */
  public hitArea?: HitArea;

  /**
   * 节点的位移、尺寸属性
   */
  public transform: UITransform = {
    position: {
      offset: vec2.create(),
      ratio: vec2.create(),
    },
    size: {
      offset: vec2.create(),
      ratio: vec2.create(),
    },
  };

  public layoutOrder: number = 1;

  /**
   * 自定义布局时的计算方式
   *
   * 如果为true，则布局时，不会用统一方式计算。
   */
  public customLayout = false;

  /**
   * 是否开启裁剪
   */
  public clipsDescendants = false;

  /**
   * 使用canvas绘制
   * 需要绘制的元素需要重写该方法
   */
  public draw(context: CanvasRenderingContext2D, dpr: number): void {}

  public copy(source: GameUIRenderable) {
    super.copy(source);

    // 基础属性 - 复制
    vec2.copy(this.anchor, source.anchor);
    this.autoResize = source.autoResize;
    vec3.copy(this.backgroundColor, source.backgroundColor);
    this.backgroundOpacity = source.backgroundOpacity;
    this.pointerEventBehavior = PointerEventBehavior.ENABLE;
    if (source.hitArea) {
      if (!this.hitArea) {
        this.hitArea = {
          size: [0, 0],
          matrixWorld: mat2d.create(),
          rotatePivot: [0, 0],
        };
      }

      mat2d.copy(this.hitArea.matrixWorld, source.hitArea.matrixWorld);
      vec2.copy(this.rotatePivot, source.rotatePivot);
    }
    UICoord2RDA.stateSchema.assign(
      this.transform.position,
      source.transform.position,
    );
    UICoord2RDA.stateSchema.assign(this.transform.size, source.transform.size);

    this.layoutOrder = source.layoutOrder;
    this.clipsDescendants = source.clipsDescendants;

    return this;
  }

  public clone() {
    return new (this.constructor as typeof GameUIRenderable)({
      id: nanoid(),
    }).copy(this);
  }

  /**
   * 在计算自适应时，被子元素撑大时的钩子函数。
   *
   * 由于有的元素可能有其他影响自适应的计算，但内容不属于子元素，需要有个时机计算。
   * 比如文本元素的文本内容。
   */
  public onExpandByChildren(): void {}

  /**
   * 在计算完布局坐标数据，准备更新绝对坐标数据之前
   */
  public onBeforeAbsDataUpdate(): void {}

  /**
   * 在计算布局的重排阶段，最后刚更新节点位置、尺寸的阶段
   * 如果节点开启了自定义布局重排（customReflow为true），则不会触发该钩子
   */
  public onAfterReflow() {}
}
