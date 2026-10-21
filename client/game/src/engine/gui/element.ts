import { roundRect } from './utils';
import { GUIEvent, GUIEventPhase } from './event';
import { GameElement, GameElementType } from '../input/events';

export interface GUIEventCallback<E> {
  (event: E): void;
}

export interface GUIData {
  name: string;
  attributes?: {
    [name: string]: string | number;
  };
  children?: GUIData[];
}

export interface GUIEventListenerOptions {
  once: boolean;
  capture: boolean;
}

export interface GUIEventListener<E> extends GUIEventListenerOptions {
  type: string;
  callback: GUIEventCallback<E>;
}

export class GUIMouseEvent extends GUIEvent {
  public x = 0;
  public y = 0;
  public ctrlKey = false;
  public altKey = false;
  public shiftKey = false;
  public metaKey = false;
  public button = 0;
  public buttons = 0;
  public movementX = 0;
  public movementY = 0;
}

export type CoreEventMap = {
  click: GUIMouseEvent;
  mouseup: GUIMouseEvent;
  mousedown: GUIMouseEvent;
  mousemove: GUIMouseEvent;
};

const coreAttributes = {
  id: '',
  x: 0,
  y: 0,
  width: NaN,
  height: NaN,
  percentWidth: NaN,
  percentHeight: NaN,
  left: NaN,
  top: NaN,
  right: NaN,
  bottom: NaN,
  horizontalCenter: NaN,
  verticalCenter: NaN,
  mouseActive: false,
  mouseHover: false,
  zIndex: 0,
  borderColor: 'black',
  borderSize: 0,
  borderRadius: 0,
  display: '',
};
export type CoreAttributes = typeof coreAttributes;

type GenericState = { [name: string]: any };
type GenericEvent = { [name: string]: GUIEvent };

type GUIAttributes<T extends GenericState> = CoreAttributes & {
  [name in keyof T]: T[name];
};

// @ts-ignore
export interface GUIElement<T extends GenericState>
  extends T,
    CoreAttributes,
    GameElement {}

export class GUIElement<
  T extends GenericState = any,
  U extends GenericEvent = any,
  E = U & CoreEventMap,
> {
  public readonly elementType = GameElementType.GUI;
  protected root: GUIElement;
  private listeners: GUIEventListener<any>[] = [];
  private staticIndex = 0;
  private static counter = 0;
  public attributes: GUIAttributes<T> = <GUIAttributes<T>>{
    ...coreAttributes,
  };
  public children: GUIElement[] = [];

  // public layout:Layout = AbsoluteLayout;
  constructor(
    public name: string,
    root?: GUIElement,
    public parent?: GUIElement,
  ) {
    this.root = (root as any) || this;
    this.staticIndex = GUIElement.counter++;
    const el = new Proxy(this, {
      get(target, prop) {
        if (prop in target) {
          return target[prop as string];
        }
        return target.attributes[prop as string];
      },
      set(target, prop, value) {
        if (prop in target) {
          target[prop as string] = value;
        } else {
          (target.attributes as any)[prop] = value as number;
        }
        return true;
      },
    });
    el.init();
    return el;
  }

  protected mount() {
    for (const c of this.children) {
      c.mount();
    }
  }

  protected unmount() {
    for (const c of this.children) {
      c.unmount();
    }
  }

  protected init() {}

  private less(c: GUIElement) {
    if (this.attributes.zIndex === c.attributes.zIndex) {
      return this.staticIndex < c.staticIndex;
    }
    return this.attributes.zIndex < c.attributes.zIndex;
  }

  public remove() {
    const siblings = this.parent!.children;
    for (let i = 0; i < siblings.length; i++) {
      if (siblings[i] === this) {
        siblings.splice(i, 1);
        this.unmount();
        break;
      }
    }
  }

  public append(c: GUIElement) {
    let i = 0;
    for (; i < this.children.length; i++) {
      if (c.less(this.children[i])) {
        break;
      }
    }
    c.parent = this;
    this.children.splice(i, 0, c);
    c.mount();
    return c;
  }

  public hitTest(x: number, y: number) {
    return (
      x >= this.x &&
      y >= this.y &&
      this.x + this.width >= x &&
      this.y + this.height >= y
    );
  }

  public addEventListener<X extends keyof E>(
    type: X,
    callback: GUIEventCallback<E[X]>,
    options: GUIEventListenerOptions,
  ): boolean;
  public addEventListener<X extends keyof E>(
    type: X,
    callback: GUIEventCallback<E[X]>,
    useCapture?: boolean,
  ): boolean;
  public addEventListener<X extends keyof E>(
    type: X,
    callback: GUIEventCallback<E[X]>,
    options: GUIEventListenerOptions | boolean = false,
  ) {
    const { index, listener } = this.createEventListener(
      type,
      callback,
      options,
    );
    if (index === -1) {
      this.listeners.push(listener as any);
      return true;
    }
    return false;
  }
  public removeEventListener<X extends keyof E>(
    type: X,
    callback: GUIEventCallback<E[X]>,
    options: GUIEventListenerOptions,
  ): boolean;
  public removeEventListener<X extends keyof E>(
    type: X,
    callback: GUIEventCallback<E[X]>,
    useCapture?: boolean,
  ): boolean;
  public removeEventListener<X extends keyof E>(
    type: X,
    callback: GUIEventCallback<E[X]>,
    options: GUIEventListenerOptions | boolean = false,
  ) {
    const { index } = this.createEventListener(type, callback, options);
    if (index >= 0) {
      this.listeners.splice(index, 1);
      return true;
    }
    return false;
  }
  private createEventListener<X extends keyof E>(
    type: X,
    callback: GUIEventCallback<E[X]>,
    options: GUIEventListenerOptions | boolean = false,
  ) {
    let once = false;
    let capture = false;
    if (typeof options === 'boolean') {
      capture = options;
    } else {
      once = options.once || once;
      capture = options.capture || capture;
    }
    let index = -1;
    for (let i = 0; i < this.listeners.length; i++) {
      const l = this.listeners[i];
      if (
        l.type === type &&
        l.callback === callback &&
        l.once === once &&
        l.capture === capture
      ) {
        index = i;
        break;
      }
    }
    return {
      index,
      listener: {
        type,
        callback,
        once,
        capture,
      },
    };
  }
  public dispatchEvent(event: GUIEvent) {
    event.target = this;
    if (!event.bubbles) {
      return this.notifyListener(event);
    }
    const { path } = event;
    for (let node: GUIElement | undefined = this; node; node = node.parent) {
      path.push(node);
    }
    event.eventPhase = GUIEventPhase.CAPTURING_PHASE;
    for (let i = path.length - 1; i > 0; i--) {
      path[i].notifyListener(event);
    }
    event.eventPhase = GUIEventPhase.AT_TARGET;
    this.notifyListener(event);
    event.eventPhase = GUIEventPhase.BUBBLING_PHASE;
    for (let i = 1; i < path.length; i++) {
      path[i].notifyListener(event);
    }
  }

  private notifyListener(event: GUIEvent) {
    event.currentTarget = this;
    for (let i = 0; i < this.listeners.length; ) {
      const listener = this.listeners[i];
      if (
        listener.type === event.type &&
        (event.eventPhase === GUIEventPhase.AT_TARGET ||
          (event.eventPhase === GUIEventPhase.CAPTURING_PHASE) ===
            listener.capture)
      ) {
        listener.callback(event);
        if (listener.once) {
          this.listeners.splice(i, 1);
        } else {
          i++;
        }
      } else {
        i++;
      }
    }
  }

  public findTarget(x: number, y: number): GUIElement | null {
    if (!this.hitTest(x, y)) {
      return null;
    }
    x -= this.x;
    y -= this.y;
    for (let i = this.children.length - 1; i >= 0; i--) {
      const target = this.children[i].findTarget(x, y);
      if (target) {
        return target;
      }
    }
    return this;
  }

  public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const cx = x + this.x;
    const cy = y + this.y;
    for (const child of this.children) {
      if (child.display !== 'none' && child.width > 0 && child.height > 0) {
        child.draw(ctx, cx, cy);
      }
    }
    if (this.borderSize > 0) {
      ctx.lineWidth = this.borderSize;
      ctx.strokeStyle = this.borderColor;
      if (this.borderRadius > 0) {
        roundRect.call(ctx, cx, cy, this.width, this.height, this.borderRadius);
        ctx.stroke();
      } else {
        ctx.strokeRect(cx, cy, this.width, this.height);
      }
    }
  }

  public layout() {
    const width = this.width;
    const height = this.height;
    for (const child of this.children) {
      child.width = Math.max(
        0,
        width - child.left - child.right ||
          child.percentWidth * 0.01 * width ||
          child.width ||
          0,
      );

      child.height = Math.max(
        0,
        height - child.top - child.bottom ||
          child.percentHeight * 0.01 * height ||
          child.height ||
          0,
      );
      if (!isNaN(child.left)) {
        child.x = child.left;
      } else if (!isNaN(child.right)) {
        child.x = width - child.right - child.width;
      }
      if (!isNaN(child.top)) {
        child.y = child.top;
      } else if (!isNaN(child.bottom)) {
        child.y = height - child.bottom - child.height;
      }
      if (!isNaN(child.horizontalCenter)) {
        child.x = (width - child.width) * 0.5 + child.horizontalCenter;
      }
      if (!isNaN(child.verticalCenter)) {
        child.y = (height - child.height) * 0.5 + child.verticalCenter;
      }
      child.layout();
    }
  }
}
