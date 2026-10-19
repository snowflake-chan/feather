import {
  GameEventChannel,
  GameEventHandlerToken,
  GameEventFuture,
} from '@box/schema/api/js/api';
import {
  createScriptScheduler,
  ScriptScheduler,
} from '@box/utils/script/script-scheduler';

export let DISPATCHER_CREATE_COUNT = 0;
export let DISPATCHER_DESTROY_COUNT = 0;
export let DISPATCHER_EVENT_COUNT = 0;
export let DISPATCHER_HANDLER_COUNT = 0;
export let DISPATCHER_PROMISE_COUNT = 0;

export class ScriptDispatcher<EventType> {
  public handlers: {
    finished: boolean;
    inQueue: boolean;
    handler: (e: EventType) => void;
  }[] = [];
  public promise: {
    finished: boolean;
    filter?: (event: EventType) => boolean;
    resolve: (event: EventType) => void;
    reject: (e: any) => void;
  }[] = [];
  public destroyed = false;
  public channel: GameEventChannel<EventType>;
  public future: GameEventFuture<EventType>;
  public oneShot: boolean = false;

  private _commonDestroy() {
    DISPATCHER_DESTROY_COUNT++;
    this.destroyed = true;

    // Cancel all pending handlers
    const handlers = this.handlers;
    for (let i = 0; i < handlers.length; ++i) {
      const h = handlers[i];
      h.finished = true;
      h.inQueue = false;
    }
    DISPATCHER_HANDLER_COUNT -= handlers.length;
    handlers.length = 0;
  }

  public destroy(reason: string, scheduler: ScriptScheduler) {
    this._commonDestroy();

    // Cancel all pending promises
    const promises = this.promise;
    promises.forEach((p) => {
      if (!p.finished) {
        scheduler.scheduleAt(() => {
          p.reject(new Error(reason));
          return true;
        }, scheduler.currentMS());
      }
      p.finished = true;
    });
    DISPATCHER_PROMISE_COUNT -= promises.length;
    promises.length = 0;
  }

  public notify(ev: EventType, handleException: (e) => void) {
    let dispatched = false;

    // handle all callbacks
    const handlers = this.handlers;
    for (let i = 0; i < handlers.length; ++i) {
      if (this.destroyed) {
        break;
      }
      const h = handlers[i];
      if (h.finished) {
        continue;
      }
      dispatched = true;
      try {
        h.handler.call(null, ev);
      } catch (e) {
        handleException(e);
      }
    }

    // check for resolved promises
    const promises = this.promise;
    for (let i = 0; i < promises.length; ++i) {
      if (this.destroyed) {
        break;
      }
      const p = promises[i];
      const f = p.filter;
      if (f) {
        try {
          if (!f.call(null, ev)) {
            continue;
          }
        } catch (e) {
          handleException(e);
        }
      }
      p.finished = true;
      dispatched = true;
      try {
        p.resolve.call(null, ev);
      } catch (e) {
        handleException(e);
      }
    }

    // Have to use this flag system in case a user script cancels the event emitter while dispatching
    // clear out resolved promises
    let ptr = 0;
    for (let i = 0; i < promises.length; ++i) {
      const p = promises[i];
      if (!p.finished) {
        DISPATCHER_PROMISE_COUNT--;
        promises[ptr++] = p;
      }
    }
    promises.length = ptr;

    // clear out finished handlers
    ptr = 0;
    for (let i = 0; i < handlers.length; ++i) {
      const h = handlers[i];
      if (h.finished) {
        h.inQueue = false;
        DISPATCHER_HANDLER_COUNT--;
      } else {
        handlers[ptr++] = h;
      }
    }

    if (this.oneShot) {
      // Cancel all pending promises
      this._commonDestroy();
      promises.forEach((p) => {
        if (!p.finished) {
          Promise.resolve()
            .then(() => {
              p.reject(new Error('reason'));
            })
            .catch((err) => {
              throw err;
            });
          dispatched = true;
        }
        p.finished = true;
      });
      DISPATCHER_PROMISE_COUNT -= promises.length;
      promises.length = 0;
    }

    if (dispatched) {
      DISPATCHER_EVENT_COUNT++;
    }
    return dispatched;
  }

  constructor(oneShot?: boolean) {
    DISPATCHER_CREATE_COUNT++;
    this.oneShot = !!oneShot;
    this.channel = (handler) => {
      const record = {
        finished: false,
        inQueue: true,
        handler,
      };
      if (!this.destroyed) {
        DISPATCHER_HANDLER_COUNT++;
        this.handlers.push(record);
      }
      return new GameEventHandlerToken(
        () => {
          record.finished = true;
        },
        () => {
          if (this.destroyed) {
            return;
          }
          record.finished = false;
          if (!record.inQueue) {
            record.inQueue = true;
            this.handlers.push(record);
          }
        },
        () => !record.finished,
      );
    };
    this.future = (filter?) => {
      if (this.destroyed) {
        return Promise.reject(new Error('dispatcher destroyed'));
      }
      return new Promise((resolve, reject) => {
        if (this.destroyed) {
          reject(new Error('dispatcher destroyed'));
          return;
        }
        DISPATCHER_PROMISE_COUNT++;
        this.promise.push({
          finished: false,
          filter,
          resolve,
          reject,
        });
      });
    };
  }
}
