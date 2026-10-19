import { MuSchema } from '../schema/schema';
import { MuDictionary } from '../schema/dictionary';
import { MuStruct } from '../schema/struct';
import { MuUnion } from '../schema/union';
import { MuSortedArray } from '../schema/sorted-array';
import { MuVoid } from '../schema/void';
import { MuVarint } from '../schema/varint';
import { MuBoolean } from '../schema/boolean';
import { MuRDA, MuRDAActionMeta, MuRDABindableActionMeta, MuRDAStore, MuRDATypes } from './rda';
import { MuArray } from '../schema';
type StripBindMeta<Meta extends MuRDABindableActionMeta> = Meta extends {
    type: 'store';
    action: MuRDAActionMeta;
} ? Meta['action'] : Meta extends MuRDAActionMeta ? Meta : never;
export interface MuRDAMapTypes<KeySchema extends MuSchema<string>, ValueRDA extends MuRDA<any, any, any, any>> {
    value: ValueRDA['stateSchema']['identity'];
    stateSchema: MuDictionary<ValueRDA['stateSchema']>;
    state: MuRDAMapTypes<KeySchema, ValueRDA>['stateSchema']['identity'];
    storeElementSchema: MuStruct<{
        id: MuVarint;
        sequence: MuVarint;
        deleted: MuBoolean;
        key: KeySchema;
        value: ValueRDA['storeSchema'];
    }>;
    storeSchema: MuSortedArray<MuRDAMapTypes<KeySchema, ValueRDA>['storeElementSchema']>;
    store: MuRDAMapTypes<KeySchema, ValueRDA>['storeSchema']['identity'];
    upsertActionSchema: MuRDAMapTypes<KeySchema, ValueRDA>['storeElementSchema'];
    resetActionSchema: MuStruct<{
        upserts: MuRDAMapTypes<KeySchema, ValueRDA>['storeSchema'];
        deletes: MuSortedArray<MuVarint>;
        undeletes: MuSortedArray<MuVarint>;
        sequenceIds: MuArray<MuVarint>;
        sequenceVals: MuArray<MuVarint>;
    }>;
    updateActionSchema: MuStruct<{
        id: MuVarint;
        action: ValueRDA['actionSchema'];
    }>;
    moveActionSchema: MuStruct<{
        id: MuVarint;
        sequence: MuVarint;
        key: KeySchema;
    }>;
    setDeletedActionSchema: MuStruct<{
        id: MuVarint;
        sequence: MuVarint;
        deleted: MuBoolean;
    }>;
    actionSchema: MuUnion<{
        reset: MuRDAMapTypes<KeySchema, ValueRDA>['resetActionSchema'];
        upsert: MuRDAMapTypes<KeySchema, ValueRDA>['upsertActionSchema'];
        update: MuRDAMapTypes<KeySchema, ValueRDA>['updateActionSchema'];
        move: MuRDAMapTypes<KeySchema, ValueRDA>['moveActionSchema'];
        setDeleted: MuRDAMapTypes<KeySchema, ValueRDA>['setDeletedActionSchema'];
        noop: MuVoid;
    }>;
    action: MuRDAMapTypes<KeySchema, ValueRDA>['actionSchema']['identity'];
    resetAction: {
        type: 'reset';
        data: MuRDAMapTypes<KeySchema, ValueRDA>['resetActionSchema']['identity'];
    };
    upsertAction: {
        type: 'upsert';
        data: MuRDAMapTypes<KeySchema, ValueRDA>['upsertActionSchema']['identity'];
    };
    updateAction: {
        type: 'update';
        data: MuRDAMapTypes<KeySchema, ValueRDA>['updateActionSchema']['identity'];
    };
    moveAction: {
        type: 'move';
        data: MuRDAMapTypes<KeySchema, ValueRDA>['moveActionSchema']['identity'];
    };
    setDeletedAction: {
        type: 'setDeleted';
        data: MuRDAMapTypes<KeySchema, ValueRDA>['setDeletedActionSchema']['identity'];
    };
    noopAction: {
        type: 'noop';
        data: undefined;
    };
    actionMeta: {
        type: 'store';
        action: {
            type: 'table';
            table: {
                set: {
                    type: 'unit';
                };
                remove: {
                    type: 'unit';
                };
                clear: {
                    type: 'unit';
                };
                reset: {
                    type: 'unit';
                };
                move: {
                    type: 'unit';
                };
                update: {
                    type: 'partial';
                    action: StripBindMeta<ValueRDA['actionMeta']>;
                };
            };
        };
    };
}
export declare class MuRDAMapStoreElement<MapRDA extends MuRDAMap<any, any>> {
    id: number;
    sequence: number;
    deleted: boolean;
    key: MapRDA['keySchema']['identity'];
    value: MuRDATypes<MapRDA['valueRDA']>['store'];
    constructor(id: number, sequence: number, deleted: boolean, key: MapRDA['keySchema']['identity'], value: MuRDATypes<MapRDA['valueRDA']>['store']);
    next: this | null;
    prev: this | null;
}
export declare class MuRDAMapStore<MapRDA extends MuRDAMap<any, any>> implements MuRDAStore<MapRDA> {
    keyIndex: {
        [key: string]: MuRDAMapStoreElement<MapRDA>;
    };
    idIndex: {
        [id: string]: MuRDAMapStoreElement<MapRDA>;
    };
    constructor(elements: MuRDAMapStoreElement<MapRDA>[]);
    state(rda: MapRDA, out: MuRDATypes<MapRDA>['state']): MuRDATypes<MapRDA>['state'];
    private _moveElement;
    private _insertElement;
    private _applyUpsert;
    apply(rda: MapRDA, action: MuRDATypes<MapRDA>['action']): boolean;
    inverse(rda: MapRDA, action: MuRDATypes<MapRDA>['action']): any;
    serialize(rda: MapRDA, result: MuRDATypes<MapRDA>['serializedStore']): MuRDATypes<MapRDA>['serializedStore'];
    free(rda: MapRDA): void;
    genId(): number;
}
type WrapAction<Key, Meta, Dispatch> = Meta extends {
    type: 'unit';
} ? Dispatch extends (...args: infer ArgType) => infer RetType ? (...args: ArgType) => {
    type: 'noop';
    data: MuVoid['identity'];
} | {
    type: 'update';
    data: {
        id: number;
        action: RetType;
    };
} : never : Meta extends {
    action: MuRDAActionMeta;
} ? Dispatch extends (...args: infer ArgType) => infer RetType ? (...args: ArgType) => WrapAction<Key, Meta['action'], RetType> : never : Meta extends {
    table: {
        [id in keyof Dispatch]: MuRDAActionMeta;
    };
} ? Dispatch extends {
    [id in keyof Meta['table']]: any;
} ? {
    [id in keyof Meta['table']]: WrapAction<Key, Meta['table'][id], Dispatch[id]>;
} : never : never;
type StripBindAndWrap<Key, ValueRDA extends MuRDA<any, any, any, any>> = ValueRDA['actionMeta'] extends {
    type: 'store';
    action: MuRDAActionMeta;
} ? ValueRDA['action'] extends (store: any) => infer RetAction ? WrapAction<Key, ValueRDA['actionMeta']['action'], RetAction> : never : WrapAction<Key, ValueRDA['actionMeta'], ValueRDA['action']>;
export declare class MuRDAMap<KeySchema extends MuSchema<any>, ValueRDA extends MuRDA<any, any, any, any>> implements MuRDA<MuRDAMapTypes<KeySchema, ValueRDA>['stateSchema'], MuRDAMapTypes<KeySchema, ValueRDA>['actionSchema'], MuRDAMapTypes<KeySchema, ValueRDA>['storeSchema'], MuRDAMapTypes<KeySchema, ValueRDA>['actionMeta']> {
    readonly keySchema: KeySchema;
    readonly valueRDA: ValueRDA;
    readonly resetActionSchema: MuRDAMapTypes<KeySchema, ValueRDA>['resetActionSchema'];
    readonly upsertActionSchema: MuRDAMapTypes<KeySchema, ValueRDA>['upsertActionSchema'];
    readonly updateActionSchema: MuRDAMapTypes<KeySchema, ValueRDA>['updateActionSchema'];
    readonly moveActionSchema: MuRDAMapTypes<KeySchema, ValueRDA>['moveActionSchema'];
    readonly setDeletedActionSchema: MuRDAMapTypes<KeySchema, ValueRDA>['setDeletedActionSchema'];
    readonly stateSchema: MuRDAMapTypes<KeySchema, ValueRDA>['stateSchema'];
    readonly actionSchema: MuRDAMapTypes<KeySchema, ValueRDA>['actionSchema'];
    readonly storeElementSchema: MuRDAMapTypes<KeySchema, ValueRDA>['storeElementSchema'];
    readonly storeSchema: MuRDAMapTypes<KeySchema, ValueRDA>['storeSchema'];
    readonly actionMeta: MuRDAMapTypes<KeySchema, ValueRDA>['actionMeta'];
    readonly emptyStore: MuRDAMapStore<this>;
    private _savedStore;
    private _savedElement;
    private _savedAction;
    private _savedUpdate;
    private _updateDispatcher;
    private _noopDispatcher;
    private _actionDispatchers;
    readonly action: (store: MuRDAMapStore<this>) => {
        set: (key: KeySchema['identity'], value: ValueRDA['stateSchema']['identity']) => MuRDAMapTypes<KeySchema, ValueRDA>['upsertAction'];
        remove: (key: KeySchema['identity']) => MuRDAMapTypes<KeySchema, ValueRDA>['setDeletedAction'];
        update: (key: KeySchema['identity']) => StripBindAndWrap<KeySchema['identity'], ValueRDA>;
        move: (from: KeySchema['identity'], to: KeySchema['identity']) => MuRDAMapTypes<KeySchema, ValueRDA>['moveAction'];
        clear: () => MuRDAMapTypes<KeySchema, ValueRDA>['resetAction'];
        reset: (state: MuRDAMapTypes<KeySchema, ValueRDA>['state']) => MuRDAMapTypes<KeySchema, ValueRDA>['resetAction'];
    };
    private _constructUpdateDispatcher;
    private _constructNoopDispatcher;
    constructor(keySchema: KeySchema, valueRDA: ValueRDA);
    createStore(initialState: MuRDAMapTypes<KeySchema, ValueRDA>['state']): MuRDAMapStore<this>;
    parse(store: MuRDAMapTypes<KeySchema, ValueRDA>['store']): MuRDAMapStore<this>;
}
export {};
//# sourceMappingURL=map.d.ts.map