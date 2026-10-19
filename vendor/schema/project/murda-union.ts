import { MuUnion, MuVoid } from '@box/mudb/schema';
import type { MuRDA } from '@box/mudb/rda';
import type {
  MuRDAActionMeta,
  MuRDABindableActionMeta,
  MuRDAStore,
  MuRDATypes,
} from '@box/mudb/rda/rda';

export type MuRDAUnionSpec = { [type: string]: MuRDA<any, any, any, any> };

type WrapAction<
  Spec extends MuRDAUnionSpec,
  Id extends keyof Spec,
  Meta,
  Dispatch,
> = Meta extends { type: 'unit' }
  ? Dispatch extends (...args: infer ArgType) => infer RetType
    ? (...args: ArgType) => {
        // MuRDAUnion的子级unit action都会承载于update之下，所以需要多一个层级的type-data
        type: 'update';
        data: {
          type: Id;
          data: RetType;
        };
      }
    : never
  : Meta extends { action: MuRDAActionMeta }
  ? Dispatch extends (...args: infer ArgType) => infer RetType
    ? (...args: ArgType) => WrapAction<Spec, Id, Meta['action'], RetType>
    : never
  : Meta extends { table: { [id in keyof Dispatch]: MuRDAActionMeta } }
  ? Dispatch extends { [id in keyof Meta['table']]: any }
    ? {
        [id in keyof Meta['table']]: WrapAction<
          Spec,
          Id,
          Meta['table'][id],
          Dispatch[id]
        >;
      }
    : never
  : never;

type StripBindAndWrap<
  Spec extends MuRDAUnionSpec,
  Id extends keyof Spec,
> = Spec[Id]['actionMeta'] extends { type: 'store'; action: MuRDAActionMeta }
  ? Spec[Id]['action'] extends (store) => infer RetAction
    ? WrapAction<Spec, Id, Spec[Id]['actionMeta']['action'], RetAction>
    : never
  : WrapAction<Spec, Id, Spec[Id]['actionMeta'], Spec[Id]['action']>;

type StripBindMeta<Meta extends MuRDABindableActionMeta> = Meta extends {
  type: 'store';
  action: MuRDAActionMeta;
}
  ? Meta['action']
  : Meta extends MuRDAActionMeta
  ? Meta
  : never;

export interface MuRDAUnionTypes<Spec extends MuRDAUnionSpec> {
  storeSchema: MuUnion<{ [type in keyof Spec]: Spec[type]['storeSchema'] }>;
  store: this['storeSchema']['identity'];

  stateSchema: MuUnion<{ [type in keyof Spec]: Spec[type]['stateSchema'] }>;
  state: this['stateSchema']['identity'];

  updateSchema: MuUnion<{ [type in keyof Spec]: Spec[type]['actionSchema'] }>;

  actionSchema: MuUnion<{
    /**
     * 全量设置当前数据
     */
    set: MuRDAUnionTypes<Spec>['storeSchema'];
    /**
     * 更新某种类型的数据
     */
    update: MuRDAUnionTypes<Spec>['updateSchema'];
    /**
     * 无操作
     */
    noop: MuVoid;
  }>;

  // 当前store的类型，只会是Union中的其中一种
  unionStore: this['storeSchema']['identity'];

  // 单独存储update结构
  actionMeta: {
    type: 'store';
    action: {
      type: 'table';
      table: {
        /**
         * 全量设置的action
         */
        set: {
          type: 'unit';
        };
        /**
         * update.action.table是动态生成的
         */
        update: {
          type: 'partial';
          action: {
            type: 'table';
            table: {
              [id in keyof Spec]: StripBindMeta<Spec[id]['actionMeta']>;
            };
          };
        };
      };
    };
  };
}

export class MuRDAUnionStore<
  Spec extends MuRDAUnionSpec,
  RDA extends MuRDAUnion<Spec, keyof Spec>,
> implements MuRDAStore<RDA>
{
  public unionStore: MuRDAUnionTypes<Spec>['unionStore'];

  constructor(unionStore: MuRDAUnionTypes<Spec>['unionStore']) {
    this.unionStore = unionStore;
  }

  public state(
    rda: RDA,
    out: RDA['stateSchema']['identity'],
  ): RDA['stateSchema']['identity'] {
    const { type: currentType, data: currentStore } = this.unionStore;

    const currentRDA = rda.rdas[currentType];

    /**
     * out的type与当前store的记录的type不同，先free原有的数据，
     * 再创建当前RDA的stateSchema数据
     */
    if (out.type !== currentType) {
      const originRDA = rda.rdas[out.type];

      originRDA?.stateSchema.free(out.data);

      out.type = currentType;
      out.data = currentRDA?.stateSchema.alloc();
    }

    if (currentRDA && currentStore) {
      out.data = currentStore.state(currentRDA, out.data);
    }

    return out;
  }

  public apply(rda: RDA, action: RDA['actionSchema']['identity']): boolean {
    if (action.type === 'noop') {
      return true;
    }

    // set是全量设置额，设置类型相同时，直接应用。类型不同时，生成新的store。
    if (action.type === 'set' && action.data) {
      const { type, data } = action.data;

      if (!type && !data) {
        this.free(rda);

        this.unionStore.type = type;
        this.unionStore.data = undefined;
      } else {
        const targetRDA = rda.rdas[type];

        if (!targetRDA) {
          return false;
        }

        this.free(rda);

        this.unionStore.type = type;
        this.unionStore.data = targetRDA.parse(data);
      }

      return true;
    }

    if (
      action.type === 'update' &&
      action.data &&
      action.data.type === this.unionStore.type
    ) {
      const targetRDA = rda.rdas[this.unionStore.type];

      if (!targetRDA) {
        return false;
      }

      return this.unionStore.data.apply(targetRDA, action.data.data);
    }

    return false;
  }

  public inverse(
    rda: RDA,
    action: RDA['actionSchema']['identity'],
  ): RDA['actionSchema']['identity'] {
    const result = rda.actionSchema.alloc();

    result.type = 'noop';
    result.data = undefined;

    if (action.type === 'set' && action.data) {
      result.type = 'set';
      result.data = this.serialize(rda, rda.storeSchema.alloc());

      return result;
    }

    if (action.type === 'update') {
      const currentRDA = rda.rdas[this.unionStore.type];

      if (
        !currentRDA ||
        !action.data ||
        action.data.type !== this.unionStore.type
      ) {
        return result;
      }

      result.type = 'update';

      const updateData = rda.updateSchema.alloc();

      updateData.type = action.data.type;
      updateData.data = this.unionStore.data.inverse(
        currentRDA,
        action.data.data,
      );

      result.data = updateData;

      return result;
    }

    return result;
  }

  public serialize(
    rda: RDA,
    out: MuRDATypes<RDA>['serializedStore'],
  ): MuRDATypes<RDA>['serializedStore'] {
    const { type: currentType, data: currentStore } = this.unionStore;

    const currentRDA = rda.rdas[currentType];

    /**
     * out的type与当前store的记录的type不同，先free原有的数据，
     * 再创建当前RDA的storeSchema数据
     */
    if (out.type !== currentType) {
      const originRDA = rda.rdas[out.type];

      originRDA?.storeSchema.free(out.data);

      out.type = currentType;
      out.data = currentRDA?.storeSchema.alloc();
    }

    if (currentRDA && currentStore) {
      out.data = currentStore.serialize(currentRDA, out.data);
    }

    return out;
  }

  public free(rda: RDA) {
    const { type: currentType, data: currentStore } = this.unionStore;

    const currentRDA = rda.rdas[currentType];

    if (currentStore && currentRDA) {
      currentStore.free(currentRDA);
    }
  }
}

export class MuRDAUnion<
  Spec extends MuRDAUnionSpec,
  SubTypes extends keyof Spec,
> implements
    MuRDA<
      MuRDAUnionTypes<Spec>['stateSchema'],
      MuRDAUnionTypes<Spec>['actionSchema'],
      MuRDAUnionTypes<Spec>['storeSchema'],
      MuRDAUnionTypes<Spec>['actionMeta']
    >
{
  public readonly storeSchema: MuRDAUnionTypes<Spec>['storeSchema'];
  public readonly stateSchema: MuRDAUnionTypes<Spec>['stateSchema'];
  public readonly actionSchema: MuRDAUnionTypes<Spec>['actionSchema'];

  /**
   * 所有子类型的RDA
   */
  public readonly rdas: Spec;

  public readonly emptyStore: MuRDAUnionStore<Spec, this>;

  public readonly actionMeta: MuRDAUnionTypes<Spec>['actionMeta'];

  public readonly updateSchema: MuRDAUnionTypes<Spec>['updateSchema'];

  private readonly setSchema: MuRDATypes<this>['serializedStoreSchema'];

  private _updateDispatcher: {
    [type in keyof Spec]: StripBindAndWrap<Spec, type>;
  };
  private _noopDispatcher: {
    [type in keyof Spec]: StripBindAndWrap<Spec, type>;
  };

  private _savedStore: MuRDAUnionStore<Spec, this>;
  /**
   * 缓存当前的store数据（store.unionStore.data）
   * wrapDispatch生成的函数会使用该属性
   */
  private _savedElement: Spec[keyof Spec]['storeSchema'] = null;
  private _savedAction: MuRDAUnionTypes<Spec>['actionSchema']['identity'];
  private _savedUpdate: MuRDAUnionTypes<Spec>['updateSchema']['identity'];

  constructor(specs: Spec, identityType?: SubTypes) {
    const storeSpecs: { [type in keyof Spec]: Spec[type]['storeSchema'] } =
      {} as any;
    const stateSpecs: { [type in keyof Spec]: Spec[type]['stateSchema'] } =
      {} as any;
    const actionSpecs: { [type in keyof Spec]: Spec[type]['actionSchema'] } =
      {} as any;

    this.rdas = {} as any;
    this._updateDispatcher = {} as any;
    this._noopDispatcher = {} as any;
    this.actionMeta = {
      type: 'store',
      action: {
        type: 'table',
        table: {
          set: {
            type: 'unit',
          },
          update: {
            type: 'partial',
            action: {
              type: 'table',
              table: {} as any,
            },
          },
        },
      },
    };

    for (const key in specs) {
      const rda = specs[key];

      this.rdas[key] = rda;

      const { storeSchema, stateSchema, actionSchema } = rda;

      storeSpecs[key] = storeSchema;
      stateSpecs[key] = stateSchema;
      actionSpecs[key] = actionSchema;

      this._updateDispatcher[key] = this._constructUpdateDispatcher(key, rda);
      this._noopDispatcher[key] = this._constructNoopDispatcher(rda);
    }

    this.storeSchema = new MuUnion(storeSpecs, identityType);
    this.stateSchema = new MuUnion(stateSpecs, identityType);

    this.updateSchema = new MuUnion(actionSpecs);
    this.setSchema = this.storeSchema;

    this.actionSchema = new MuUnion({
      set: this.setSchema,
      update: this.updateSchema,
      noop: new MuVoid(),
    });

    this.emptyStore = new MuRDAUnionStore(this.storeSchema.identity);
    this._savedStore = this.emptyStore;

    this._savedAction = this.actionSchema.alloc();
    this._savedUpdate = this.updateSchema.alloc();
  }

  public action = (store: MuRDAUnionStore<Spec, this>) => {
    this._savedStore = store;

    return {
      set: (newState: this['stateSchema']['identity']) => {
        const result = this.actionSchema.alloc();

        result.type = 'set';

        const setData = this.setSchema.alloc();

        result.data = setData;

        // 重置回空状态，可能是inverse set生成的action
        if (!newState.type && !newState.data) {
          setData.type = '';
          setData.data = undefined;

          return result;
        }

        const rda = this.rdas[newState.type];

        // 没有对应的rda，则free setData，并修改action为noop
        if (!rda) {
          this.setSchema.free(setData);

          result.type = 'noop';
          result.data = undefined;

          return result;
        }

        // 有对应的rda，通过临时创建的rda的store，来获取serializedStore。
        setData.type = newState.type;
        setData.data = rda.storeSchema.alloc();

        const tempStore = rda.createStore(newState.data);

        setData.data = tempStore.serialize(rda, setData.data);

        tempStore.free(rda);

        return result;
      },
      update: () => {
        this._savedAction = this.actionSchema.alloc();

        /**
         * 先把action标记为'update'，如果后续调用到noopDispatcher，
         * 会在noopDispatcher内重新标记为'noop'。
         */
        this._savedAction.type = 'update';
        this._savedElement = this._savedStore.unionStore.data;
        this._savedUpdate = this.updateSchema.alloc();

        // 根据当前unionStore类型生成最终的dispatcher
        const dynamicDispatcher = Object.keys(this._updateDispatcher).reduce(
          (dynamicDispatcher, key: keyof Spec) => {
            if (key === this._savedStore.unionStore.type) {
              dynamicDispatcher[key] = this._updateDispatcher[key];
            } else {
              dynamicDispatcher[key] = this._noopDispatcher[key];
            }
            return dynamicDispatcher;
          },
          {} as {
            [type in keyof Spec]: StripBindAndWrap<Spec, type>;
          },
        );

        this._savedAction.data = this._savedUpdate;

        return dynamicDispatcher;
      },
    };
  };

  public createStore(initialState: MuRDAUnionTypes<Spec>['state']) {
    const { type, data } = initialState;

    const targetRDA = this.rdas[type];

    if (!targetRDA) {
      return new MuRDAUnionStore(this.stateSchema.clone(initialState));
    }

    const targetStore = targetRDA.createStore(data);

    return new MuRDAUnionStore({
      type,
      data: targetStore,
    });
  }

  private _constructUpdateDispatcher<Key extends keyof Spec>(
    key: Key,
    rda: Spec[Key],
  ): StripBindAndWrap<Spec, Key> {
    const self = this;

    const id = key.toString();

    function wrapPartial(root: MuRDAActionMeta, dispatch) {
      const savedPartial = { data: <any>null };

      function wrapPartialRec(meta: MuRDAActionMeta, index: string) {
        if (meta.type === 'unit') {
          return new Function(
            'rda',
            'partial',
            `/* ${id}:${index} */ return function() {var result = rda._savedUpdate; result.type = "${id}"; result.data = partial.data${index}.apply(null, arguments); return rda._savedAction; }`,
          )(self, savedPartial);
        } else if (meta.type === 'table') {
          const result: any = {};
          const keys = Object.keys(meta.table);
          for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            result[key] = wrapPartialRec(meta.table[key], `${index}["${key}"]`);
          }
          return result;
        } else if (meta.type === 'partial') {
          return wrapPartial(
            meta.action,
            new Function(
              'partial',
              `/* ${id}:${index} */ return function () {return partial.data${index}.apply(null, arguments); }`,
            )(savedPartial),
          );
        }
        return {};
      }

      return new Function(
        'dispatch',
        'partial',
        'wrappedDispatch',
        `/* ${id} */ return function () {partial.data = dispatch.apply(null, arguments); return wrappedDispatch; }`,
      )(dispatch, savedPartial, wrapPartialRec(root, ''));
    }

    function wrapAction(meta: MuRDAActionMeta, dispatcher: any) {
      if (meta.type === 'unit') {
        return function (...args) {
          self._savedUpdate.data = dispatcher.apply(null, args);
          return self._savedAction;
        };
      } else if (meta.type === 'table') {
        const result: any = {};
        const ids = Object.keys(meta.table);
        for (let i = 0; i < ids.length; ++i) {
          const key = ids[i];
          result[key] = wrapAction(meta.table[key], dispatcher[key]);
        }
        return result;
      } else if (meta.type === 'partial') {
        return wrapPartial(meta.action, dispatcher);
      }
      return {};
    }

    function wrapStore(meta: MuRDAActionMeta, index: string) {
      if (meta.type === 'unit') {
        return new Function(
          'rda',
          'dispatch',
          `/* ${id}:${index} */ return function() {var result = rda._savedUpdate; result.type = "${id}"; result.data = dispatch(rda._savedElement)${index}.apply(null, arguments); return rda._savedAction; }`,
        )(self, rda.action);
      } else if (meta.type === 'table') {
        const result: any = {};
        const ids = Object.keys(meta.table);
        for (let i = 0; i < ids.length; ++i) {
          const key = ids[i];
          result[key] = wrapStore(meta.table[key], `${index}["${key}"]`);
        }
        return result;
      } else if (meta.type === 'partial') {
        return wrapPartial(
          meta.action,
          new Function(
            'rda',
            'dispatch',
            `/* ${id}:${index} */ return function() {return dispatch(rda._savedElement)${index}.apply(null, arguments); }`,
          )(self, rda.action),
        );
      }
      return {};
    }

    if (rda.actionMeta.type !== 'store') {
      this.actionMeta.action.table.update.action.table[key] = rda.actionMeta;
      return wrapAction(rda.actionMeta, rda.action);
    } else {
      this.actionMeta.action.table.update.action.table[key] =
        rda.actionMeta.action;
      return wrapStore(rda.actionMeta.action, '');
    }
  }

  private _constructNoopDispatcher<Key extends keyof Spec>(
    rda: Spec[Key],
  ): StripBindAndWrap<Spec, Key> {
    const self = this;
    function mockDispatcher(meta) {
      if (meta.type === 'unit') {
        return function () {
          self._savedAction.type = 'noop';
          self._savedAction.data = undefined;
          return self._savedAction;
        };
      } else if (meta.type === 'partial') {
        const child = mockDispatcher(meta.action);
        return function () {
          return child;
        };
      } else if (meta.type === 'table') {
        const result: any = {};
        const keys = Object.keys(meta.table);
        for (let i = 0; i < keys.length; ++i) {
          const key = keys[i];
          result[key] = mockDispatcher(meta.table[key]);
        }
        return result;
      }
      return {};
    }
    if (rda.actionMeta.type === 'store') {
      return mockDispatcher(rda.actionMeta.action);
    } else {
      return mockDispatcher(rda.actionMeta);
    }
  }

  public parse(
    store: MuRDAUnionTypes<Spec>['store'],
  ): MuRDAUnionStore<Spec, this> {
    const { type, data } = store;

    return new MuRDAUnionStore({
      type,
      data: this.rdas[type]?.parse(data),
    });
  }
}
