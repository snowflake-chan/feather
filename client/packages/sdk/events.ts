import type { EventObject } from './event-types';

export class Events<EventMap extends EventObject> {
  private handlers: {
    [key in keyof EventMap]?: ((value: EventMap[key]) => void)[];
  } = {};

  public addListener<EventName extends keyof EventMap>(
    eventName: EventName,
    handler: (value: EventMap[EventName]) => void,
  ) {
    let list = this.handlers[eventName];

    if (!list) {
      list = [];
      this.handlers[eventName] = list;
    }

    list.push(handler);
  }

  public removeListener<EventName extends keyof EventMap>(
    eventName: EventName,
    handler: (value: EventMap[EventName]) => void,
  ) {
    const list = this.handlers[eventName];

    if (!list) {
      return;
    }

    this.handlers[eventName] = list.filter((fn) => fn !== handler);
  }

  public emit<EventName extends keyof EventMap>(
    eventName: EventName,
    value: EventMap[EventName],
  ) {
    const list = this.handlers[eventName];

    if (!list) {
      return;
    }

    list.forEach((handler) => handler(value));
  }

  public removeAllListeners() {
    this.handlers = {};
  }
}
