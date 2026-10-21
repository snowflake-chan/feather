import { EventEmitter } from './events';

export type ScreenResizeEvent = {
  screenWidth: number;
  screenHeight: number;
};

export type ScreenEvents = {
  resize: ScreenResizeEvent;
};

export class ClientScreen {
  public readonly events = new EventEmitter<ScreenEvents>();

  public onResize(evt: ScreenResizeEvent) {
    this.events.emit('resize', { ...evt });
  }
}
