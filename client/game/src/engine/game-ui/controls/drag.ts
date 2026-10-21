import { vec2 } from 'gl-matrix';
import { MouseButton } from '@box/schema/input/input-schema';
import EventEmitter from 'events';
import type { GameUINode } from '../nodes/base';
import {
  GameElementType,
  GameTouchesEvent,
  PointerEventType,
  type GameMouseEvent,
  type GameWheelEvent,
  type IntersectElementsFun,
} from 'src/engine/input/events';
import {
  getHitArea,
  getSortedChildNodes,
  hitTest,
  isRenderable,
} from '../util';
import { EventMode } from '../nodes/defs';
import type { GetRoot } from '../interfaces';
import type { GameUIRenderable } from '../nodes/renderable';
import type { InputController } from 'src/engine/input/input-controller';
import { SerializedVec2 } from 'src/engine/interfaces';

type Spec = {
  getRoot: GetRoot;
  inputController: InputController;
};

enum DragState {
  Release,
  Start,
  Dragging,
}

export type UIHoverEvent = {
  node: GameUIRenderable;
};

export type UIPointerEvent = {
  mouse: SerializedVec2;
  nodes: GameUIRenderable[];
};

export type UIDragEvent = UIPointerEvent;

export type UISelectEvent = {
  mouse: SerializedVec2;
  mouseButton?: MouseButton;
  clientPosition?: SerializedVec2;
  nativeEvent?: MouseEvent | TouchEvent;
  node?: GameUIRenderable;
};

export type UIWheelEvent = {
  event: GameWheelEvent;
  nodes: GameUIRenderable[];
};

interface EventMap {
  hoverOn: UIHoverEvent;
  hoverOff: UIHoverEvent;
  pointerDown: UIPointerEvent;
  pointerUp: UIPointerEvent;
  selected: UISelectEvent;
  dragStart: UIDragEvent;
  drag: UIDragEvent;
  dragEnd: UIDragEvent;
  doubleClick: UIPointerEvent;
  wheel: UIWheelEvent;
}

export interface IDragControls {
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

/**
 * 判定是否进入拖拽交互的距离
 * pointermove事件中，对比当前鼠标位置和pointerdown的鼠标位置的距离是否大于等于该值。
 */
const DRAG_OFFSET_THRESHOLD = 10;

export class DragControls extends EventEmitter implements IDragControls {
  /**
   * 是否点击穿透
   * 默认是
   */
  public propagation = true;

  private enabled = false;

  /**
   * 是否检测hover。默认关闭。
   */
  private hoverEnabled = false;
  private hoveringNode?: GameUIRenderable;

  /**
   * pointerDown时选中的最上层节点，即为选中节点
   */
  private selectedNodes: GameUIRenderable[] = [];

  /**
   * 是否触发过mousedown、touchstart
   * inputController的逻辑是mousedown时会检测event.target。
   * 但mouseup不会。
   * 因此需要自行判断是否触发过mousedown，来决定是否响应mouseup。
   */
  private hasPointerDown = false;
  private pointerDownPos = vec2.create();
  private touchIdentifier?: number;

  private getRoot: GetRoot;

  private inputController: InputController;

  private dragState = DragState.Release;

  constructor(spec: Spec) {
    super();

    const { getRoot, inputController } = spec;

    this.getRoot = getRoot;
    this.inputController = inputController;
  }

  public enable() {
    if (this.enabled) {
      return;
    }

    this.enabled = true;
  }

  public disable() {
    if (!this.enabled) {
      return;
    }

    this.enabled = false;
  }

  /**
   * 添加事件监听
   */
  public addListeners() {
    this.inputController.unlockedMouseDown.sub(this.onMouseDown);
    this.inputController.unlockedMouseUp.sub(this.onMouseUp);
    this.inputController.unlockedMouseMove.sub(this.onMouseMove);
    this.inputController.touchStart.sub(this.onTouchStart);
    this.inputController.touchEnd.sub(this.onTouchEnd);
    this.inputController.touchMove.sub(this.onTouchMove);
    this.inputController.unlockedDoubleClick.sub(this.onDoubleClick);
    this.inputController.unlockedWheel.sub(this.onWheel);
  }

  /**
   * 移除事件监听
   */
  public removeListeners() {
    this.inputController.unlockedMouseDown.unsub(this.onMouseDown);
    this.inputController.unlockedMouseUp.unsub(this.onMouseUp);
    this.inputController.unlockedMouseMove.unsub(this.onMouseMove);
    this.inputController.touchStart.unsub(this.onTouchStart);
    this.inputController.touchEnd.unsub(this.onTouchEnd);
    this.inputController.touchMove.unsub(this.onTouchMove);
    this.inputController.unlockedDoubleClick.unsub(this.onDoubleClick);
    this.inputController.unlockedWheel.unsub(this.onWheel);
  }

  private onPointerDown = (
    targets: GameUIRenderable[],
    mouse: SerializedVec2,
  ) => {
    if (!this.enabled) {
      return;
    }

    this.selectedNodes.push(...targets);

    this.hasPointerDown = true;

    vec2.copy(this.pointerDownPos, mouse);

    this.emit('pointerDown', {
      mouse,
      nodes: this.selectedNodes,
    });
  };

  private onPointerUp = (
    mouse: SerializedVec2,
    nativeEvent?: MouseEvent | TouchEvent,
    mouseButton?: MouseButton,
    clientPosition?: SerializedVec2,
  ) => {
    if (!this.enabled || !this.hasPointerDown) {
      return;
    }

    if (this.dragState !== DragState.Release) {
      this.dragState = DragState.Release;

      this.emit('dragEnd', {
        mouse,
        nodes: this.selectedNodes,
      });
    } else {
      const dist = vec2.dist(mouse, this.pointerDownPos);

      if (dist < DRAG_OFFSET_THRESHOLD) {
        this.emit('selected', {
          mouse,
          node: this.selectedNodes[0],
          nativeEvent,
          mouseButton,
          clientPosition,
        });
      }
    }

    this.emit('pointerUp', {
      mouse,
      nodes: this.selectedNodes,
    });

    this.selectedNodes.length = 0;
    this.hasPointerDown = false;
  };

  private onPointerMove = (
    targets: GameUIRenderable[],
    mouse: SerializedVec2,
    mouseButton: MouseButton,
  ) => {
    if (!this.enabled) {
      return;
    }

    if (mouseButton === MouseButton.left) {
      if (this.dragState === DragState.Release) {
        const dist = vec2.dist(mouse, this.pointerDownPos);

        if (dist < DRAG_OFFSET_THRESHOLD) {
          return;
        }

        this.dragState = DragState.Start;

        if (this.hoveringNode) {
          this.emit('hoverOff', {
            node: this.hoveringNode,
          });

          this.hoveringNode = undefined;
        }

        this.emit('dragStart', {
          mouse,
          nodes: this.selectedNodes,
        });

        return;
      }

      if (this.dragState === DragState.Start) {
        this.dragState = DragState.Dragging;
      }

      this.emit('drag', {
        mouse,
        nodes: this.selectedNodes,
      });
      return;
    }

    // 检测hover
    if (this.hoverEnabled) {
      if (this.hoveringNode && this.hoveringNode !== targets[0]) {
        this.emit('hoverOff', {
          node: this.hoveringNode,
        });
      }

      this.hoveringNode = targets.find(
        (t) => t.elementType === GameElementType.GameUI,
      );

      if (this.hoveringNode) {
        this.emit('hoverOn', {
          node: this.hoveringNode,
        });
      }
    }
  };

  private onMouseDown = (event: GameMouseEvent) => {
    const { mouse, targets } = event;
    const nodes = targets.filter(
      (t) => t.elementType === GameElementType.GameUI,
    );
    this.onPointerDown(nodes as GameUIRenderable[], mouse);
    return;
  };

  private onMouseUp = (event: GameMouseEvent) => {
    this.onPointerUp(
      event.mouse,
      event.nativeEvent,
      event.mouseButton,
      event.clientPosition,
    );
    return;
  };

  private onMouseMove = (evt: GameMouseEvent) => {
    this.onPointerMove(
      evt.targets as GameUIRenderable[],
      evt.mouse,
      evt.mouseButton,
    );
    return;
  };

  private getGameUINodes(event: GameTouchesEvent): {
    identifier?: number;
    nodes: GameUIRenderable[];
    mouse: SerializedVec2;
  } {
    const { touches } = event;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const gameUINodes = touch.targets.filter(
        (t) => t.elementType === GameElementType.GameUI,
      );
      if (gameUINodes.length) {
        return {
          identifier: touch.identifier,
          nodes: gameUINodes as GameUIRenderable[],
          mouse: touch.mouse,
        };
      }
    }

    return {
      nodes: [],
      mouse: [0, 0],
    };
  }

  private onTouchStart = (event: GameTouchesEvent) => {
    const { identifier, nodes, mouse } = this.getGameUINodes(event);
    this.touchIdentifier = identifier;
    this.onPointerDown(nodes, mouse);
  };

  private onTouchEnd = (event: GameTouchesEvent) => {
    const touch = event.touches.find(
      (t) => t.identifier === this.touchIdentifier,
    );

    this.onPointerUp(
      touch?.mouse || [0, 0],
      event.nativeEvent,
      MouseButton.left,
    );

    this.touchIdentifier = undefined;
  };
  private onTouchMove = (event: GameTouchesEvent) => {
    const touch = event.touches.find(
      (t) => t.identifier === this.touchIdentifier,
    );
    if (!touch) {
      return;
    }

    const { nodes } = this.getGameUINodes(event);
    this.onPointerMove(nodes, touch.mouse, MouseButton.left);
  };

  public intersectElements: IntersectElementsFun<GameUIRenderable> = (
    out: GameUIRenderable[],
    pos: vec2,
    eventType: PointerEventType,
  ) => {
    if (!this.enabled) {
      return true;
    }

    let propagation: boolean;
    switch (eventType) {
      case 'unlockedMouseDown':
      case 'touchStart':
        propagation = this.propagation;
        break;
      case 'unlockedWheel':
        propagation = true;
        break;
      default:
        propagation = false;
        break;
    }

    this.intersectNodes(out, pos, this.getRoot(), propagation);
    return !out.length;
  };

  /**
   * 递归查找目标节点
   * - 查找pointer位置触碰的节点
   * - 查找层级最高的节点（深度优先）
   * - 不可见节点不做检测
   * - 不可交互节点不做检测
   * - 仅传递的节点会检测其子节点，自身不做检测
   *
   * - hitTest
   *   - 如果有hitArea，检测hitArea
   *   - 如果没有，则计算节点的全局坐标和尺寸
   */
  private intersectNodes(
    out: GameUIRenderable[],
    pos: vec2,
    node: GameUINode,
    propagation: boolean,
  ) {
    if (!node.visible || node.eventMode === EventMode.None) {
      return;
    }

    let hit = false;

    // 如果考虑裁剪的效果，那么得先击中父元素，才能进入子元素的检测
    if (isRenderable(node) && node.clipsDescendants) {
      if (!hitTest(pos, getHitArea(node))) {
        return;
      }

      hit = true;
    }

    const sorted = getSortedChildNodes(node);

    for (let i = 0; i < sorted.length; i++) {
      this.intersectNodes(out, pos, sorted[i], propagation);
      // 不冒泡就找到一个node就return
      if (!propagation && out.length) {
        return;
      }
    }

    /**
     * 检测节点自身是否击中，击中则存入数组
     * 如果前面裁剪效果时已经检测过，复用结果就好
     */
    if (
      node.eventMode === EventMode.Interactive &&
      isRenderable(node) &&
      (hit || hitTest(pos, getHitArea(node)))
    ) {
      out.push(node);

      return;
    }
  }

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

  public setHoverEnabled(enabled: boolean) {
    if (enabled === this.hoverEnabled) {
      return;
    }

    if (!enabled && this.hoveringNode) {
      this.emit('hoverOff', {
        node: this.hoveringNode,
      });

      this.hoveringNode = undefined;
    }

    this.hoverEnabled = enabled;
  }

  private onDoubleClick = (evt: GameMouseEvent) => {
    const { targets } = evt;

    const nodes = targets.filter(
      (t) => t.elementType === GameElementType.GameUI,
    );

    this.emit('doubleClick', {
      mouse: evt.mouse,
      nodes: nodes as GameUIRenderable[],
    });
  };

  private onWheel = (evt: GameWheelEvent) => {
    const { targets } = evt;
    const nodes = targets.filter(
      (t) => t.elementType === GameElementType.GameUI,
    );

    this.emit('wheel', {
      event: evt,
      nodes: nodes as GameUIRenderable[],
    });
  };
}
