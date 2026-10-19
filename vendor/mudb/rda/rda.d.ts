import { MuSchema } from '../schema/schema';
export interface MuRDATypes<RDA extends MuRDA<any, any, any, any>> {
    stateSchema: RDA['stateSchema'];
    state: this['stateSchema']['identity'];
    actionSchema: RDA['actionSchema'];
    action: this['actionSchema']['identity'];
    serializedStoreSchema: RDA['storeSchema'];
    serializedStore: this['serializedStoreSchema']['identity'];
    store: RDA['emptyStore'];
    meta: RDA['actionMeta'];
    dispatcher: RDA['action'];
}
export interface MuRDA<StateSchema extends MuSchema<any>, ActionSchema extends MuSchema<any>, StoreSchema extends MuSchema<any>, Meta extends MuRDABindableActionMeta> {
    readonly stateSchema: StateSchema;
    readonly actionSchema: ActionSchema;
    readonly storeSchema: StoreSchema;
    readonly emptyStore: MuRDAStore<this>;
    createStore(initialState: StateSchema['identity']): this['emptyStore'];
    parse(inp: StoreSchema['identity']): this['emptyStore'];
    actionMeta: Meta;
    action: any;
}
export interface MuRDAStore<RDA extends MuRDA<any, any, any, any>> {
    state(rda: RDA, out: MuRDATypes<RDA>['state']): MuRDATypes<RDA>['state'];
    apply(rda: RDA, action: MuRDATypes<RDA>['action']): boolean;
    inverse(rda: RDA, action: MuRDATypes<RDA>['action']): MuRDATypes<RDA>['action'];
    serialize(rda: RDA, out: MuRDATypes<RDA>['serializedStore']): MuRDATypes<RDA>['serializedStore'];
    free(rda: RDA): any;
}
export type MuRDAActionMeta = {
    type: 'unit';
} | {
    type: 'partial';
    action: MuRDAActionMeta;
} | {
    type: 'table';
    table: {
        [id: string]: MuRDAActionMeta;
    };
};
export type MuRDAAction<Action, Meta extends MuRDAActionMeta> = Meta extends {
    type: 'unit';
} ? (...args: any[]) => Action : Meta extends {
    type: 'partial';
    action: MuRDAActionMeta;
} ? (...args: any[]) => MuRDAAction<Action, Meta['action']> : Meta extends {
    type: 'table';
    table: {
        [id: string]: MuRDAActionMeta;
    };
} ? {
    [id in keyof Meta['table']]: MuRDAAction<Action, Meta['table'][id]>;
} : never;
export type MuRDABindableActionMeta = {
    type: 'store';
    action: MuRDAActionMeta;
} | MuRDAActionMeta;
export type MuRDABindableAction<Action, Meta extends MuRDABindableActionMeta> = Meta extends {
    type: 'store';
    action: MuRDAActionMeta;
} ? (store: any) => MuRDAAction<Action, Meta['action']> : Meta extends MuRDAActionMeta ? MuRDAAction<Action, Meta> : never;
//# sourceMappingURL=rda.d.ts.map