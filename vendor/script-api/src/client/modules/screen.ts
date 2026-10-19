import { EventEmitter } from './events';

export type ScreenResizeEvent = {
  screenWidth: number;
  screenHeight: number;
};

export type ScreenEvents = {
  resize: ScreenResizeEvent;
};

export declare class ClientScreen {
  public readonly events: EventEmitter<ScreenEvents>;

  public onResize(evt: ScreenResizeEvent): void;
}

export declare const screen: ClientScreen;
