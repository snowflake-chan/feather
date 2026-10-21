import { EventBus } from '@box/utils/event';
import { MuSchema, MuStruct } from '@box/mudb/schema';

export type FrameSchemaType = {
  [key: string]: MuSchema<any>;
};
export type ReactEventsType<T extends FrameSchemaType> = {
  [k in keyof T]: EventBus<T[k]['identity']>;
};
export type ReactStateType<T extends FrameSchemaType> = {
  [k in keyof T]: T[k]['identity'];
};

export class ReactEvents<T extends FrameSchemaType> {
  private prevState: ReactStateType<T>;
  private schemas: T;
  public listeners: ReactEventsType<T> = {} as ReactEventsType<T>;

  constructor(schemas: T) {
    this.schemas = schemas;
    const StateSchema = new MuStruct(schemas);
    this.prevState = StateSchema.clone(StateSchema.identity);
    for (const key in schemas) {
      this.listeners[key] = new EventBus();
    }
  }

  public frameState(state: ReactStateType<T>) {
    for (const key in this.schemas) {
      const schema = this.schemas[key];
      // 引擎数据的监听和通知
      if (!schema.equal(state[key], this.prevState[key])) {
        this.listeners[key].notify(schema.clone(state[key]));
        schema.assign(this.prevState[key], state[key]);
      }
    }
  }
}
