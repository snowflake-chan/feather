import { AutoResizeType } from '@box/schema/project/ui-rda/defs';
import type * as I from '@box/script-api';
import { Coord2, Vec2, Vec3 } from '../math';
import { UiNode } from './ui-node';
import { GameUIRenderable } from 'src/engine/game-ui/nodes/renderable';
import { ClientScriptContext } from '../context/const';
import {
  DEGREES_TO_RAD,
  normalizeRotation,
  validatePointerEventBehavior,
} from 'src/engine/game-ui/util';

export class UiRenderable extends UiNode implements I.UiRenderable {
  readonly anchor: Vec2;
  readonly backgroundColor: Vec3;
  readonly backgroundOpacity!: number;
  readonly position: Coord2;
  readonly size: Coord2;
  readonly zIndex!: number;
  readonly autoResize!: 'NONE' | 'X' | 'Y' | 'XY';
  readonly visible!: boolean;
  readonly pointerEventBehavior: I.PointerEventBehavior;
  readonly rotation!: number;
  constructor(node: GameUIRenderable) {
    super(node);
    this.anchor = new Vec2(node.anchor);
    this.position = new Coord2(node.transform.position);
    this.backgroundColor = new Vec3(node.backgroundColor);
    this.size = new Coord2(node.transform.size);

    this.pointerEventBehavior = node.pointerEventBehavior;

    Object.defineProperties(this, {
      backgroundOpacity: {
        get() {
          return node.backgroundOpacity;
        },
        set(backgroundOpacity: number) {
          node.backgroundOpacity = backgroundOpacity;
        },
      },
      zIndex: {
        get() {
          return node.zIndex;
        },
        set(zIndex: number) {
          node.zIndex = zIndex;
        },
      },
      autoResize: {
        get() {
          switch (node.autoResize) {
            case AutoResizeType.NONE:
              return 'NONE';
            case AutoResizeType.X:
              return 'X';
            case AutoResizeType.Y:
              return 'Y';
            case AutoResizeType.XY:
              return 'XY';
            default:
              throw new Error(`Unknown autoResize type: ${node.autoResize}`);
          }
        },
        set(autoResize: 'NONE' | 'X' | 'Y' | 'XY') {
          node.autoResize = AutoResizeType[autoResize];
        },
      },
      visible: {
        get() {
          return node.visible;
        },
        set(visible: boolean) {
          node.visible = visible;
        },
      },
      pointerEventBehavior: {
        get() {
          return node.pointerEventBehavior;
        },
        set(behavior: I.PointerEventBehavior) {
          if (!validatePointerEventBehavior(behavior)) {
            ClientScriptContext.scriptConsole?.warn('Behavior is invalid');
            return;
          }

          node.pointerEventBehavior = behavior;
        },
      },
      rotation: {
        get() {
          return node.rotation / DEGREES_TO_RAD;
        },
        set(rotation: number) {
          node.rotation = normalizeRotation(rotation) * DEGREES_TO_RAD;
        },
      },
    });
  }
}
