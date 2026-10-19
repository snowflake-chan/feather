import { GUIConfig } from '../../gui/types';
import { GamePlayerEntity } from './api';

export interface GameGUIEvent {
  entity: GamePlayerEntity;
  name: string;
  payload: any;
}
export interface GameGUIEventListener {
  (event: GameGUIEvent): void;
}

export class GameGUI {
  public ui: InstanceType<any>['ui'];
  constructor(
    public init: <T extends string, U extends T>(
      entity: GamePlayerEntity,
      config: GUIConfig<T, U>,
    ) => Promise<void>,
    public show: (
      entity: GamePlayerEntity,
      name: string,
      allowMultiple?: boolean,
    ) => Promise<void>,
    public remove: (
      entity: GamePlayerEntity,
      selector: string,
    ) => Promise<void>,
    public getAttribute: (
      entity: GamePlayerEntity,
      selector: string,
      name: string,
    ) => Promise<any>,
    public setAttribute: (
      entity: GamePlayerEntity,
      selector: string,
      name: string,
      value: any,
    ) => Promise<void>,
    public onMessage: (listener: GameGUIEventListener) => void,
  ) {
    this.ui = new Proxy({} as any, {
      get(_, prop) {
        return function (attributes: any, children?: any[]) {
          return { name: prop, attributes, children };
        };
      },
    });
  }
}
