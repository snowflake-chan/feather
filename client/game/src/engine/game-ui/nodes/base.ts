import { EventMode, GameUINodeType } from './defs';
import { UiNode } from 'src/engine/script/ses/apis/gui/ui-node';
import { GameUIScale } from './scale';
import type { GameUIComponent } from './component';
import { GameUIAutoLayout } from './auto-layout';
import { GameElement, GameElementType } from 'src/engine/input/events';

export type BaseSpec = {
  id: string;
  name?: string;
};

/**
 * GameUIComponents继承该类型，确保字典key-value是字符串-组件
 */
type ComponentsRecord = Record<string, GameUIComponent | undefined>;
export interface GameUIComponents extends ComponentsRecord {
  uiScale?: GameUIScale;
  uiAutoLayout?: GameUIAutoLayout;
}

export abstract class GameUINode implements GameElement {
  public elementType: GameElementType = GameElementType.GameUI;

  public abstract nodeType: GameUINodeType;

  protected ApiType = UiNode;

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

  public readonly id: string;

  public name?: string;

  public parent?: GameUINode;

  /**
   * children顺序与UITreeRDA的children顺序保持一致。
   * 但是渲染的层级是越靠前的层级越高。
   * 在canvas-render时综合zIndex进行排序。
   */
  public readonly children: GameUINode[] = [];

  public visible = true;

  public zIndex = 1;

  /**
   * 事件检测 - 捕获，控制自身是否可交互，子节点是否可交互
   */
  public eventMode = EventMode.Interactive;

  /**
   * 记录组件的字典
   */
  public components: GameUIComponents = {};

  /**
   * 绝对缩放系数
   * 父元素的缩放系数 * 自身的缩放系数
   */
  public absScaleValue = 1;

  constructor(spec: BaseSpec) {
    const { id, name } = spec;

    this.id = id;
    this.name = name;
  }

  /**
   * 添加子节点到指定位置上
   * 如果此node节点已经在当前父节点上，会先断开，再按照入参idx位置插入
   * @param node
   * @param idx
   * @returns
   */
  public addChildAt(node: GameUINode, idx: number) {
    if (node === this) {
      return;
    }

    node.parent?.remove(node);

    this.children.splice(idx, 0, node);

    node.parent = this;
  }

  /**
   * 添加子节点，会unshift的方式添加
   */
  public add(...nodes: GameUINode[]) {
    nodes.forEach((node) => {
      if (node === this || node.parent === this) {
        return;
      }

      node.parent?.remove(node);

      this.children.unshift(node);

      node.parent = this;
    });
  }

  public remove(...nodes: GameUINode[]) {
    nodes.forEach((node) => {
      if (node.parent === this) {
        const idx = this.children.indexOf(node);

        this.children.splice(idx, 1);

        node.parent = undefined;
      }
    });
  }

  public clear() {
    this.children.forEach((child) => {
      this.remove(child);
    });
  }

  public copy(source: GameUINode) {
    /**
     * 基础属性，复制
     */
    this.name = source.name;
    this.zIndex = source.zIndex;
    this.visible = source.visible;
    this.eventMode = source.eventMode;

    // 克隆组件
    for (const componentName in source.components) {
      const component = source.components[componentName];

      if (component) {
        this.components[componentName] = component.clone();
      }
    }

    /**
     * 克隆子节点
     * 由于add方法是unshift操作，所以反向遍历
     */
    for (let i = source.children.length - 1; i >= 0; i--) {
      this.add(source.children[i].clone());
    }

    return this;
  }

  public abstract clone(): GameUINode;
}
