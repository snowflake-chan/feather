import { MuClientProtocol, MuClient } from '@box/mudb/client';
import { copyToClipboard } from '../../utils/copy2clipboard';
import { GameClientState } from '../game-client-schema';
import { GUIStage } from './components/stage';
import { GUIData, GUIElement, GUIMouseEvent } from './element';
import { GUIEvent } from './event';
import { GUIProtocol } from '@box/schema/gui/gui-protocol';
import { GUIBindDefinition, GUIConfig } from '@box/schema/gui/types';
import { updateMouseEventAttributes } from './utils';
import { XMLParser } from './xml';
import type { InputController } from '../input/input-controller';
import {
  GameElementType,
  GameTouchesEvent,
  PointerEventType,
  type GameMouseEvent,
  type IntersectElementsFun,
} from 'src/engine/input/events';
import { SerializedVec2 } from '../interfaces';
import { MouseButton } from '@box/schema/input/input-schema';

export class GUIClient {
  public protocol: MuClientProtocol<typeof GUIProtocol>;
  public stage: GUIStage;
  public ctx: CanvasRenderingContext2D | null = null;
  private state: GameClientState;
  private xmlParser = new XMLParser();
  private data: {
    [key: string]: GUIData;
  } = {} as any;
  private config: GUIConfig<string, string> = {};
  public lastClicked: GUIElement | null = null;

  public input: InputController;

  constructor(spec: {
    client: MuClient;
    state: GameClientState;
    input: InputController;
  }) {
    this.state = spec.state;
    this.input = spec.input;

    this.stage = new GUIStage('stage', 0, 0);
    this.protocol = spec.client.protocol(GUIProtocol);
    this.protocol.configure({
      message: {
        init: ({ handle, data }) => {
          try {
            this.init(JSON.parse(data));
            this.protocol.server.message.return({
              handle,
              value: '',
            });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        append: ({ handle, selector, data }) => {
          try {
            this.append(selector, JSON.parse(data));
            this.protocol.server.message.return({
              handle,
              value: '',
            });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        show: ({ handle, name, allowMultiple }) => {
          try {
            this.show(name, allowMultiple);
            this.protocol.server.message.return({
              handle,
              value: '',
            });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        remove: ({ handle, selector }) => {
          try {
            this.remove(selector);
            this.protocol.server.message.return({
              handle,
              value: '',
            });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        setAttribute: ({ handle, selector, name, value }) => {
          try {
            this.setAttribute(selector, name, JSON.parse(value));
            this.protocol.server.message.return({
              handle,
              value: '',
            });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        getAttribute: ({ handle, selector, name }) => {
          try {
            this.protocol.server.message.return({
              handle,
              value: JSON.stringify(this.getAttribute(selector, name)),
            });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        reset: () => {
          const { children } = this.stage;
          while (children.length > 0) {
            children[children.length - 1].remove();
          }
        },
      },
    });
    this.xmlParser.addSpecialAttributeParser([
      {
        parser: (x) => +x,
        names: [
          'x',
          'y',
          'zIndex',
          'strokeSize',
          'fontSize',
          'left',
          'right',
          'top',
          'bottom',
          'borderRadius',
          'borderSize',
          'verticalCenter',
          'horizontalCenter',
          'lineHeight',
        ],
      },
      {
        parser: (v) =>
          ({
            left: 0,
            top: 0,
            center: 1,
            middle: 1,
            right: 2,
            bottom: 2,
          }[v.trim().toLowerCase()]),
        names: ['verticalAlign', 'horizontalAlign'],
      },
      {
        names: ['width', 'height'],
        parser(v, k) {
          if (!v.endsWith('%')) {
            return Number(v);
          }
          const value = Number(v.substring(0, v.length - 1));
          const key = {
            width: 'percentWidth',
            height: 'percentHeight',
          }[k];
          return { key, value };
        },
      },
    ]);

    this.addListeners();
  }

  private createMouseEvent(
    mouse: SerializedVec2,
    mouseButton: MouseButton,
    type: string,
  ) {
    const event = new GUIMouseEvent(type, { bubbles: true });

    updateMouseEventAttributes(event, mouse, mouseButton);

    return event;
  }

  /**
   * mousemove中上一次指向的元素。
   * 用于判定mouseover、mouseout
   */
  private lastMouseOverElement?: GUIElement;
  private touchIdentifier?: number;
  private activeElements: GUIElement[] = [];
  private hoverElements: GUIElement[] = [];

  public intersectElements: IntersectElementsFun<GUIElement> = (
    out: GUIElement[],
    pos: SerializedVec2,
    eventType: PointerEventType,
  ) => {
    if (eventType !== 'unlockedMouseDown' && eventType !== 'touchStart') {
      return true;
    }

    const target = this.stage.findTarget(pos[0], pos[1]) || this.stage;
    for (let e = target; e; e = e.parent!) {
      out.push(e);
    }

    // 判断是否有除舞台外的元素交互
    out.shift();
    return !out.length;
  };

  private addListeners() {
    this.input.unlockedMouseDown.sub(this.onMouseDown);
    this.input.touchStart.sub(this.onTouchStart);

    this.input.unlockedMouseUp.sub(this.onMouseUp);
    this.input.touchEnd.sub(this.onTouchEnd);

    this.input.unlockedMouseMove.sub(this.onMouseMove);
    this.input.touchMove.sub(this.onTouchMove);
  }

  private onPointerMove = (mouse: SerializedVec2, mouseButton: MouseButton) => {
    const event = this.createMouseEvent(mouse, mouseButton, 'mousemove');

    let target = this.stage.findTarget(event.x, event.y) || this.stage;

    target.dispatchEvent(event);
    target = this.stage.findTarget(event.x, event.y) || this.stage;

    for (const e of this.hoverElements) {
      e.mouseHover = false;
    }

    this.hoverElements.length = 0;

    for (let e = target; e; e = e.parent!) {
      this.hoverElements.push(e);
      e.mouseHover = true;
    }
    if (target !== this.lastMouseOverElement) {
      if (target) {
        target!.dispatchEvent(
          this.createMouseEvent(mouse, mouseButton, 'mouseover'),
        );
      }
      if (this.lastMouseOverElement) {
        this.lastMouseOverElement.dispatchEvent(
          this.createMouseEvent(mouse, mouseButton, 'mouseout'),
        );
        this.lastMouseOverElement.mouseHover = false;
      }
      this.lastMouseOverElement = target;
    }
  };

  private onPointerDown = (mouse: SerializedVec2, mouseButton: MouseButton) => {
    const event = this.createMouseEvent(mouse, mouseButton, 'pointerdown');
    const target = this.stage.findTarget(event.x, event.y) || this.stage;
    target.dispatchEvent(event);
    for (let e = target; e; e = e.parent!) {
      this.activeElements.push(e);
      e.mouseActive = true;
    }
  };

  private onPointerUp = (mouse: SerializedVec2, mouseButton: MouseButton) => {
    const event = this.createMouseEvent(mouse, mouseButton, 'pointerup');
    const target = this.stage.findTarget(event.x, event.y) || this.stage;
    const { mouseActive } = target;
    target.dispatchEvent(event);

    if (mouseActive) {
      this.stage.clicked = target === this.stage;
      target.dispatchEvent(this.createMouseEvent(mouse, mouseButton, 'click'));
    }
    for (const e of this.activeElements) {
      e.mouseActive = false;
    }
    this.activeElements.length = 0;
  };

  private getGUINodes(event: GameTouchesEvent): {
    identifier?: number;
    nodes: GUIElement[];
    mouse: SerializedVec2;
  } {
    const { touches } = event;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const guiNodes = touch.targets.filter(
        (t) => t.elementType === GameElementType.GUI,
      );
      if (guiNodes.length) {
        return {
          identifier: touch.identifier,
          nodes: guiNodes as GUIElement[],
          mouse: touch.mouse,
        };
      }
    }

    return {
      nodes: [],
      mouse: [0, 0],
    };
  }

  private onMouseDown = (event: GameMouseEvent) => {
    const { targets } = event;
    if (
      !targets.length ||
      !targets.find((t) => t.elementType === GameElementType.GUI)
    ) {
      return;
    }
    this.onPointerDown(event.mouse, event.mouseButton);
  };

  private onMouseUp = (event: GameMouseEvent) => {
    this.onPointerUp(event.mouse, event.mouseButton);
  };

  private onMouseMove = (evt: GameMouseEvent) => {
    this.onPointerMove(evt.mouse, evt.mouseButton);
  };

  private onTouchStart = (event: GameTouchesEvent) => {
    const { identifier, nodes, mouse } = this.getGUINodes(event);
    if (!nodes.length) {
      return;
    }
    this.touchIdentifier = identifier;
    this.onPointerDown(mouse, MouseButton.left);
  };

  private onTouchEnd = (event: GameTouchesEvent) => {
    const touch = event.touches.find(
      (t) => t.identifier === this.touchIdentifier,
    );

    this.onPointerUp(touch?.mouse || [0, 0], MouseButton.left);

    this.touchIdentifier = undefined;
  };
  private onTouchMove = (event: GameTouchesEvent) => {
    const touch = event.touches.find(
      (t) => t.identifier === this.touchIdentifier,
    );
    if (!touch) {
      return;
    }

    this.onPointerMove(touch.mouse, MouseButton.left);
  };

  public append(selector: string, data: (string | GUIData)[]) {
    const parent = this.stage.querySelector(selector);
    if (!parent) {
      throw new Error(`can found element by selector ${selector}`);
    }
    for (const item of data) {
      const uiData =
        typeof item === 'string' ? this.xmlParser.parse(item) : item;
      parent.append(this.stage.load(uiData));
    }
  }

  public remove(selector: string) {
    const elements = this.stage.querySelectorAll(selector);
    for (const el of elements) {
      el.remove();
    }
  }

  public sendMessage(
    ev: GUIEvent,
    messageName: string,
    messageData: any[] = [],
  ) {
    const payload = {};
    for (const md of messageData) {
      const s = md.split(':');
      let ss;
      let element: GUIElement;
      let key!: string;
      let name: string;
      if (s.length == 1) {
        ss = md.split('.');
      } else {
        key = s[0];
        ss = s[1].split('.');
      }
      if (ss.length === 1) {
        element = ev.currentTarget!;
        name = ss[0];
      } else {
        element = this.stage.querySelector(ss[0]);
        name = ss[1];
      }
      payload[key || name] = element[name];
    }
    //alert('EMIT EVENT: ' + messageName + ' -> ' + JSON.stringify(payload));
    this.protocol.server.message.sendMessage({
      name: messageName,
      payload: JSON.stringify(payload),
    });
  }

  public drag(
    selector: string,
    attributes: GUIBindDefinition<string>['drag']['attributes'],
    offsetX: number,
    offsetY: number,
  ) {
    const elements = this.stage.querySelectorAll(selector);
    for (const el of elements) {
      // FIXME or not？ 并不能正常生效
      for (const name in attributes) {
        el[name] += {
          'x': offsetX,
          '-x': -offsetX,
          'y': offsetY,
          '-y': -offsetY,
        }[attributes[name]];
      }
    }
  }

  public async clipboardWrite(selector: string, attributeName: string) {
    const el = this.stage.querySelector(selector);
    if (el) {
      copyToClipboard(el[attributeName]);
    }
  }

  public setAttribute(selector: string, name: string, value: any) {
    const elements = this.stage.querySelectorAll(selector);
    for (const el of elements) {
      el[name] = value;
    }
  }

  public getAttribute(selector: string, name: string) {
    const el = this.stage.querySelector(selector);
    if (el) {
      return el[name];
    }
    return '';
  }

  public show(name: string, allowMultiple = false) {
    const { stage } = this;
    if (
      !allowMultiple &&
      stage.querySelector(`[__gui_name__=${JSON.stringify(name)}]`)
    ) {
      return;
    }
    const el = stage.append(stage.load(this.data[name]));
    el.attributes['__gui_name__'] = name;
    for (const bind of this.config[name].bindings || []) {
      const callback =
        bind.action === 'remove'
          ? () => this.remove(bind.targetSelector)
          : bind.action === 'show'
          ? () => this.show(bind.name, bind.allowMultiple)
          : bind.action === 'sendMessage'
          ? (ev: GUIEvent) =>
              this.sendMessage(ev, bind.messageName, bind.messageData)
          : bind.action === 'drag'
          ? (ev: any) =>
              this.drag(
                bind.targetSelector,
                bind.attributes,
                ev.movementX,
                ev.movementY,
              )
          : bind.action === 'clipboardWrite'
          ? (ev: any) =>
              this.clipboardWrite(bind.targetSelector, bind.attributeName)
          : () => {
              throw new Error(`cannot handle action ${(bind as any).action}`);
            };
      const targetElements = bind.selector
        ? stage.querySelectorAll(bind.selector)
        : [el];
      for (const targetEl of targetElements) {
        if (bind.event === 'click') {
          targetEl.addEventListener('click', callback);
        } else if (bind.event === 'drag') {
          stage.addEventListener('mousemove', (ev) => {
            if (targetEl.mouseActive) {
              callback(ev);
            }
          });
        }
      }
    }
    return el;
  }

  public init<T extends string, U extends T>(config: GUIConfig<T, U>) {
    const { data, stage } = this;
    this.config = config;
    for (const name in config) {
      const item = config[name];
      data[name] =
        typeof item.data === 'string'
          ? this.xmlParser.parse(item.data)
          : item.data;
      if (item.display) {
        this.show(name);
      }
    }
    return data;
  }

  public setContext(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public draw() {
    if (this.ctx) {
      const ratio = window.devicePixelRatio || 1;
      this.stage.width = this.ctx.canvas.width / ratio;
      this.stage.height = this.ctx.canvas.height / ratio;
      this.stage.layout();
      this.ctx.save();
      this.ctx.scale(ratio, ratio);
      this.stage.draw(this.ctx);
      this.ctx.restore();
    }
  }
}
