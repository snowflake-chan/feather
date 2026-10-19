import { MuSchema } from '../schema/schema';
import { MuRDA, MuRDAStore, MuRDATypes } from './rda';
export declare class MuRDARegisterStore<RDA extends MuRDARegister<any>> implements MuRDAStore<RDA> {
    value: MuRDATypes<RDA>['state'];
    constructor(initial: MuRDATypes<RDA>['state']);
    state(rda: RDA, out: MuRDATypes<RDA>['state']): any;
    inverse(rda: RDA): any;
    free(rda: RDA): void;
    apply(rda: RDA, action: MuRDATypes<RDA>['action']): boolean;
    serialize(rda: RDA, out: MuRDATypes<RDA>['serializedStore']): MuRDATypes<RDA>['serializedStore'];
}
type MuRDARegisterMeta = {
    type: 'unit';
};
export declare class MuRDARegister<StateSchema extends MuSchema<any>> implements MuRDA<StateSchema, StateSchema, StateSchema, MuRDARegisterMeta> {
    readonly stateSchema: StateSchema;
    readonly actionSchema: StateSchema;
    readonly storeSchema: StateSchema;
    readonly actionMeta: MuRDARegisterMeta;
    action: (value: StateSchema["identity"]) => StateSchema["identity"];
    readonly emptyStore: MuRDARegisterStore<this>;
    constrain: (value: StateSchema['identity']) => StateSchema['identity'];
    constructor(stateSchema: StateSchema, constrain?: (value: StateSchema['identity']) => StateSchema['identity']);
    createStore(initialState: StateSchema['identity']): MuRDARegisterStore<this>;
    parse(store: StateSchema['identity']): MuRDARegisterStore<this>;
}
export {};
//# sourceMappingURL=register.d.ts.map