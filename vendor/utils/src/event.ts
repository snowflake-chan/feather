export class EventBus<EventT> {
  public handlers: ((e: EventT) => void)[] = [];
  public nextHandlers: ((e: EventT) => void)[] = [];

  public notify(e: EventT) {
    for (let i = 0; i < this.handlers.length; ++i) {
      this.handlers[i](e);
    }
    for (let i = 0; i < this.nextHandlers.length; ++i) {
      this.nextHandlers[i](e);
    }
    this.nextHandlers.length = 0;
  }

  public sub(handler: (e: EventT) => void) {
    this.handlers.push(handler);
  }

  public unsub(handler: (e: EventT) => void) {
    const idx = this.handlers.indexOf(handler);
    if (idx >= 0) {
      this.handlers[idx] = this.handlers[this.handlers.length - 1];
      this.handlers.pop();
    }
  }

  public unsubAll() {
    this.handlers.length = 0;
  }

  public next(handler: (e: EventT) => void) {
    this.nextHandlers.push(handler);
  }
}
