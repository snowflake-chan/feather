import { MuStruct } from '../schema/struct';
import { MuUnion } from '../schema/union';
import { MuRDA, MuRDAStore, MuRDATypes, MuRDAActionMeta, MuRDABindableActionMeta } from './rda';
export type MuRDAStructSpec = {
    [prop: string]: MuRDA<any, any, any, any>;
};
type WrapAction<Spec extends MuRDAStructSpec, Id extends keyof Spec, Meta, Dispatch> = Meta extends {
    type: 'unit';
} ? Dispatch extends (...args: infer ArgType) => infer RetType ? (...args: ArgType) => {
    type: Id;
    data: RetType;
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
type StripBindMeta<Meta extends MuRDABindableActionMeta> = Meta extends {
    type: 'store';
    action: MuRDAActionMeta;
} ? Meta['action'] : Meta extends MuRDAActionMeta ? Meta : never;
type StripBindAndWrap<Spec extends MuRDAStructSpec, Id extends keyof Spec> = Spec[Id]['actionMeta'] extends {
    type: 'store';
    action: MuRDAActionMeta;
} ? Spec[Id]['action'] extends (store: any) => infer RetAction ? WrapAction<Spec, Id, Spec[Id]['actionMeta']['action'], RetAction> : never : WrapAction<Spec, Id, Spec[Id]['actionMeta'], Spec[Id]['action']>;
export interface MuRDAStructTypes<Spec extends MuRDAStructSpec> {
    stateSchema: MuStruct<{
        [id in keyof Spec]: Spec[id]['stateSchema'];
    }>;
    state: this['stateSchema']['identity'];
    actionSchema: MuUnion<{
        [id in keyof Spec]: Spec[id]['actionSchema'];
    }>;
    action: this['actionSchema']['identity'];
    storeSchema: MuStruct<{
        [id in keyof Spec]: Spec[id]['storeSchema'];
    }>;
    store: this['storeSchema']['identity'];
    stores: {
        [id in keyof Spec]: Spec[id]['emptyStore'];
    };
    actionMeta: {
        type: 'store';
        action: {
            type: 'table';
            table: {
                [id in keyof Spec]: StripBindMeta<Spec[id]['actionMeta']>;
            };
        };
    };
}
export declare class MuRDAStructStore<Spec extends MuRDAStructSpec, RDA extends MuRDAStruct<Spec>> implements MuRDAStore<RDA> {
    stores: MuRDAStructTypes<Spec>['stores'];
    constructor(stores: MuRDAStructTypes<Spec>['stores']);
    state(rda: RDA, out: MuRDATypes<RDA>['state']): RDA["stateSchema"]["identity"];
    apply(rda: RDA, action: MuRDATypes<RDA>['action']): boolean;
    inverse(rda: RDA, action: MuRDATypes<RDA>['action']): MuRDATypes<RDA>['action'];
    serialize(rda: RDA, out: MuRDATypes<RDA>['serializedStore']): RDA["storeSchema"]["identity"];
    free(rda: RDA): void;
}
export declare class MuRDAStruct<Spec extends {
    [prop: string]: MuRDA<any, any, any, any>;
}> implements MuRDA<MuRDAStructTypes<Spec>['stateSchema'], MuRDAStructTypes<Spec>['actionSchema'], MuRDAStructTypes<Spec>['storeSchema'], MuRDAStructTypes<Spec>['actionMeta']> {
    readonly rdas: Spec;
    readonly stateSchema: MuRDAStructTypes<Spec>['stateSchema'];
    readonly actionSchema: MuRDAStructTypes<Spec>['actionSchema'];
    readonly storeSchema: MuRDAStructTypes<Spec>['storeSchema'];
    readonly actionMeta: MuRDAStructTypes<Spec>['actionMeta'];
    readonly action: (store: MuRDAStructStore<Spec, MuRDAStruct<Spec>>) => {
        [id in keyof Spec]: StripBindAndWrap<Spec, id>;
    };
    readonly emptyStore: MuRDAStructStore<Spec, this>;
    private _saveStore;
    private _wrapDispatch;
    constructor(spec: Spec);
    createStore(state: MuRDAStructTypes<Spec>['state']): MuRDAStructStore<Spec, this>;
    parse(store: MuRDAStructTypes<Spec>['store']): MuRDAStructStore<Spec, this>;
}
export {};
//# sourceMappingURL=struct.d.ts.map