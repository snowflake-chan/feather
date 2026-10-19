import { MuUnion, MuVoid } from '@box/mudb/schema';
import type { MuRDA } from '@box/mudb/rda';
import type { MuRDAActionMeta, MuRDABindableActionMeta, MuRDAStore, MuRDATypes } from '@box/mudb/rda/rda';
export type MuRDAUnionSpec = {
    [type: string]: MuRDA<any, any, any, any>;
};
type WrapAction<Spec extends MuRDAUnionSpec, Id extends keyof Spec, Meta, Dispatch> = Meta extends {
    type: 'unit';
} ? Dispatch extends (...args: infer ArgType) => infer RetType ? (...args: ArgType) => {
    type: 'update';
    data: {
        type: Id;
        data: RetType;
    };
} : never : Meta extends {
    action: MuRDAActionMeta;
} ? Dispatch extends (...args: infer ArgType) => infer RetType ? (...args: ArgType) => WrapAction<Spec, Id, Meta['action'], RetType> : never : Meta extends {
    table: {
        [id in keyof Dispatch]: MuRDAActionMeta;
    };
} ? Dispatch extends {
    [id in keyof Meta['table']]: any;
} ? {
    [id in keyof Meta['table']]: WrapAction<Spec, Id, Meta['table'][id], Dispatch[id]>;
} : never : never;
type StripBindAndWrap<Spec extends MuRDAUnionSpec, Id extends keyof Spec> = Spec[Id]['actionMeta'] extends {
    type: 'store';
    action: MuRDAActionMeta;
} ? Spec[Id]['action'] extends (store: any) => infer RetAction ? WrapAction<Spec, Id, Spec[Id]['actionMeta']['action'], RetAction> : never : WrapAction<Spec, Id, Spec[Id]['actionMeta'], Spec[Id]['action']>;
type StripBindMeta<Meta extends MuRDABindableActionMeta> = Meta extends {
    type: 'store';
    action: MuRDAActionMeta;
} ? Meta['action'] : Meta extends MuRDAActionMeta ? Meta : never;
export interface MuRDAUnionTypes<Spec extends MuRDAUnionSpec> {
    storeSchema: MuUnion<{
        [type in keyof Spec]: Spec[type]['storeSchema'];
    }>;
    store: this['storeSchema']['identity'];
    stateSchema: MuUnion<{
        [type in keyof Spec]: Spec[type]['stateSchema'];
    }>;
    state: this['stateSchema']['identity'];
    updateSchema: MuUnion<{
        [type in keyof Spec]: Spec[type]['actionSchema'];
    }>;
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
    unionStore: this['storeSchema']['identity'];
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
export declare class MuRDAUnionStore<Spec extends MuRDAUnionSpec, RDA extends MuRDAUnion<Spec, keyof Spec>> implements MuRDAStore<RDA> {
    unionStore: MuRDAUnionTypes<Spec>['unionStore'];
    constructor(unionStore: MuRDAUnionTypes<Spec>['unionStore']);
    state(rda: RDA, out: RDA['stateSchema']['identity']): RDA['stateSchema']['identity'];
    apply(rda: RDA, action: RDA['actionSchema']['identity']): boolean;
    inverse(rda: RDA, action: RDA['actionSchema']['identity']): RDA['actionSchema']['identity'];
    serialize(rda: RDA, out: MuRDATypes<RDA>['serializedStore']): MuRDATypes<RDA>['serializedStore'];
    free(rda: RDA): void;
}
export declare class MuRDAUnion<Spec extends MuRDAUnionSpec, SubTypes extends keyof Spec> implements MuRDA<MuRDAUnionTypes<Spec>['stateSchema'], MuRDAUnionTypes<Spec>['actionSchema'], MuRDAUnionTypes<Spec>['storeSchema'], MuRDAUnionTypes<Spec>['actionMeta']> {
    readonly storeSchema: MuRDAUnionTypes<Spec>['storeSchema'];
    readonly stateSchema: MuRDAUnionTypes<Spec>['stateSchema'];
    readonly actionSchema: MuRDAUnionTypes<Spec>['actionSchema'];
    /**
     * 所有子类型的RDA
     */
    readonly rdas: Spec;
    readonly emptyStore: MuRDAUnionStore<Spec, this>;
    readonly actionMeta: MuRDAUnionTypes<Spec>['actionMeta'];
    readonly updateSchema: MuRDAUnionTypes<Spec>['updateSchema'];
    private readonly setSchema;
    private _updateDispatcher;
    private _noopDispatcher;
    private _savedStore;
    /**
     * 缓存当前的store数据（store.unionStore.data）
     * wrapDispatch生成的函数会使用该属性
     */
    private _savedElement;
    private _savedAction;
    private _savedUpdate;
    constructor(specs: Spec, identityType?: SubTypes);
    action: (store: MuRDAUnionStore<Spec, this>) => {
        set: (newState: this["stateSchema"]["identity"]) => import("@box/mudb/schema/union").UnionInstance<{
            /**
             * 全量设置当前数据
             */
            set: MuUnion<{ [type in keyof Spec]: Spec[type]["storeSchema"]; }>;
            /**
             * 更新某种类型的数据
             */
            update: MuUnion<{ [type_1 in keyof Spec]: Spec[type_1]["actionSchema"]; }>;
            /**
             * 无操作
             */
            noop: MuVoid;
        }, "update" | "noop" | "set">;
        update: () => { [type in keyof Spec]: StripBindAndWrap<Spec, type>; };
    };
    createStore(initialState: MuRDAUnionTypes<Spec>['state']): MuRDAUnionStore<Spec, MuRDAUnion<Spec, keyof Spec>>;
    private _constructUpdateDispatcher;
    private _constructNoopDispatcher;
    parse(store: MuRDAUnionTypes<Spec>['store']): MuRDAUnionStore<Spec, this>;
}
export {};
//# sourceMappingURL=murda-union.d.ts.map