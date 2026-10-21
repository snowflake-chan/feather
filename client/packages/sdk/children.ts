import { IframeController, EmitType } from './iframe';
import {
  EmitEventType,
  EventOnType,
  EventObject,
  CallAsyncType,
} from './event-types';
import { Events } from './events';
import { WebviewController } from './webview';

// iframe或webview下会执行相关方法，否则将无事发生
export class Children<K extends EventObject, E extends EventObject> {
  private events: Events<K>;

  public iframe: IframeController<K, E>;
  public webview: WebviewController<K, E>;

  constructor() {
    this.events = new Events<K>();

    this.iframe = new IframeController(this.events);
    this.webview = new WebviewController(this.events);
  }

  public async connect(eventsOn?: EmitEventType<K>) {
    if (this.isInIframe()) {
      return this.iframe.connect({ current: 'children', eventsOn });
    }
    if (this.isInWebviewOrRusty()) {
      return this.webview.connect(eventsOn);
    }
    return false;
  }

  public emitEvent: EmitType<E> = (key, value) => {
    if (this.isInIframe()) {
      return this.iframe.emitEvent(key, value);
    }
    if (this.isInWebviewOrRusty()) {
      return this.webview.emitEvent(key, value);
    }
  };

  public callAsync: CallAsyncType<E> = async (key, value) => {
    return new Promise<unknown>((resolve) => {
      if (this.isInIframe()) {
        this.iframe.emitEvent(key, value);
        resolve(undefined);
        return;
      }

      this.webview.emitEvent(key, value, (res) => {
        resolve(res);
      });
    });
  };

  public destroy() {
    if (this.isInIframe()) {
      this.iframe.destroy();
    }
    this.events.removeAllListeners();
  }

  public isInIframe() {
    return window.self !== window.top;
  }

  public isInWebviewOrRusty() {
    return this.webview.isInWebviewOrRusty();
  }

  public isInIosWebview() {
    return this.webview.isInIosWebview();
  }

  public eventOn: EventOnType<K> = (key, handler) => {
    this.events.addListener(key, handler);
  };

  public eventOff: EventOnType<K> = (key, handler) => {
    this.events.removeListener(key, handler);
  };
}
