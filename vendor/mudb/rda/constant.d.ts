import { MuSchema } from '../schema/schema';
import { MuVoid } from '../schema/void';
import { MuRDA, MuRDAStore, MuRDATypes } from './rda';
export declare class MuRDAConstantStore<RDA extends MuRDAConstant<MuSchema<any>>> implements MuRDAStore<RDA> {
    value: MuRDATypes<RDA>['state'];
    constructor(initial: MuRDATypes<RDA>['state']);
    state(rda: RDA, out: MuRDATypes<RDA>['state']): any;
    apply(): boolean;
    inverse(): void;
    serialize(rda: RDA, out: MuRDATypes<RDA>['serializedStore']): MuRDATypes<RDA>['serializedStore'];
    free(rda: RDA): void;
}
type MuRDAConstantMeta = {
    type: 'table';
    table: {};
};
export declare class MuRDAConstant<StateSchema extends MuSchema<any>> implements MuRDA<StateSchema, MuVoid, StateSchema, MuRDAConstantMeta> {
    readonly stateSchema: StateSchema;
    readonly actionSchema: MuVoid;
    readonly storeSchema: StateSchema;
    readonly actionMeta: MuRDAConstantMeta;
    readonly action: {};
    readonly emptyStore: MuRDAConstantStore<this>;
    constructor(stateSchema: StateSchema);
    createStore(initialState: StateSchema['identity']): MuRDAConstantStore<this>;
    parse(store: StateSchema['identity']): MuRDAConstantStore<this>;
}
export {};
//# sourceMappingURL=constant.d.ts.map