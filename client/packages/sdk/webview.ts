import type { EmitEventType, EventObject } from './event-types';
import dsbridge from '@box/dsbridge';
import { Events } from './events';

/**
 * 通信方法命名空间
 */
const NativeNamespace = 'application';

export class WebviewController<
  // 被app调用的方法
  HandlerMap extends EventObject,
  // 调用app的方法
  EmitEventMap extends EventObject,
> {
  constructor(private events: Events<HandlerMap>) {}
  public isReady: boolean = false;

  public isInRusty() {
    return process.env.RUSTY;
  }

  public isInIosWebview() {
    return (
      typeof (<any>window).webkit !== 'undefined' &&
      (<any>window).webkit.messageHandlers
    );
  }

  public isInWebviewOrRusty() {
    return this.isInIosWebview() || this.isInRusty();
  }

  public async connect(eventsOn?: EmitEventType<HandlerMap>) {
    dsbridge.registerAsyn(NativeNamespace, {
      tag: NativeNamespace,
      callEngine: <T extends keyof HandlerMap>(props: {
        name: T;
        param: HandlerMap[T];
      }) => {
        this.events.emit(props.name, props.param);

        return eventsOn && eventsOn(props.name, props.param);
      },
    });
    this.isReady = true;
    return this.isReady;
  }

  public emitEvent: EmitEventType<EmitEventMap> = (key, value, callback) => {
    if (!this.isInWebviewOrRusty()) {
      return;
    }
    return dsbridge.call(
      `${NativeNamespace}.callApp`,
      {
        name: key,
        param: value,
      },
      callback,
    );
  };
}
