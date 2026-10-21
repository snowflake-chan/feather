import { GUIElement } from './element';

export enum GUIEventPhase {
  NONE = 0,
  CAPTURING_PHASE = 1,
  AT_TARGET = 2,
  BUBBLING_PHASE = 3,
}

export interface GUIEventOptions {
  bubbles: boolean;
}

export class GUIEvent implements GUIEventOptions {
  public bubbles = false;
  public target!: GUIElement;
  public currentTarget!: GUIElement;
  public path: GUIElement[] = [];
  public eventPhase: GUIEventPhase = GUIEventPhase.NONE;
  public data: any;
  constructor(public type: string, options?: GUIEventOptions) {
    this.type = type;
    if (options) {
      Object.assign(this, options);
    }
  }
}
