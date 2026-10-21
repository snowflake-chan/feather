import {
  connectToParent,
  AsyncMethodReturns,
  Connection,
  connectToChild,
} from 'penpal';
import type { EmitEventType, EventObject } from './event-types';
import type { Events } from './events';

interface Protocol<E extends EventObject> {
  emit: EmitEventType<E>;
  receiveHeartbeat: () => Promise<boolean>;
}

export type EmitType<T extends EventObject> = Protocol<T>['emit'];
type CurrentType = 'parent' | 'children';

export class IframeController<
  HandlerMap extends EventObject,
  EmitEventMap extends EventObject,
> {
  public isReady: boolean = false;
  public target: AsyncMethodReturns<Protocol<EmitEventMap>> | undefined;
  private connection: Connection<Protocol<EmitEventMap>> | undefined;

  constructor(private events: Events<HandlerMap>) {}

  public async connect<T extends CurrentType>(
    spec: T extends 'parent'
      ? {
          current: T;
          eventsOn?: EmitEventType<HandlerMap>;
          iframe: HTMLIFrameElement;
          timeout?: number;
        }
      : {
          current: T;
          eventsOn?: EmitEventType<HandlerMap>;
          timeout?: number;
        },
  ) {
    const { eventsOn, current, timeout } = spec;
    if (current === 'parent') {
      // 执行penpal的connectToChild， 成功表明连接成功，可以开始调用方法了
      this.connection = connectToChild<Protocol<EmitEventMap>>({
        iframe: spec.iframe,
        methods: {
          emit: <T extends keyof HandlerMap>(key: T, value: HandlerMap[T]) => {
            this.events.emit(key, value);

            eventsOn && eventsOn(key, value);
          },
        },
        timeout,
      });
      try {
        this.target = await this.connection.promise;
        this.isReady = true;
      } catch (e) {
        this.isReady = false;
        eventsOn && eventsOn('error', e);
      }
      return this.isReady;
    } else {
      this.connection = connectToParent({
        // Methods child is exposing to parent.
        methods: {
          emit: <T extends keyof HandlerMap>(key: T, value: HandlerMap[T]) => {
            this.events.emit(key, value);

            eventsOn && eventsOn(key, value);
          },
          receiveHeartbeat: () => true,
        },
        timeout,
      });
      try {
        this.target = await this.connection.promise;
        this.isReady = true;
      } catch (e) {
        eventsOn && eventsOn('error', e);
        this.isReady = false;
      }
      return this.isReady;
    }
  }

  public emitEvent: EmitType<EmitEventMap> = (key, value) => {
    if (!this.target) {
      throw Error('connection is not ready');
    }
    return this.target.emit(key, value);
  };

  public destroy() {
    this.connection?.destroy();
  }
}
