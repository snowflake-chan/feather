import { MuArray } from '../schema/array';
import { MuStruct } from '../schema/struct';
import { MuSortedArray } from '../schema/sorted-array';
import { MuVarint, MuASCII, MuBoolean } from '../schema';
import { MuRDA, MuRDATypes, MuRDAStore, MuRDAActionMeta } from './rda';
export interface MuRDAListTypes<RDA extends MuRDA<any, any, any, any>> {
    stateSchema: MuArray<RDA['stateSchema']>;
    state: MuRDAListTypes<RDA>['stateSchema']['identity'];
    storeElementSchema: MuStruct<{
        id: MuVarint;
        deleted: MuBoolean;
        key: MuASCII;
        value: RDA['storeSchema'];
    }>;
    storeSchema: MuSortedArray<MuRDAListTypes<RDA>['storeElementSchema']>;
    store: MuRDAListTypes<RDA>['storeSchema']['identity'];
    moveActionSchema: MuStruct<{
        id: MuVarint;
        key: MuASCII;
    }>;
    updateActionSchema: MuStruct<{
        id: MuVarint;
        action: RDA['actionSchema'];
    }>;
    actionSchema: MuStruct<{
        upserts: MuRDAListTypes<RDA>['storeSchema'];
        deletes: MuSortedArray<MuVarint>;
        undeletes: MuSortedArray<MuVarint>;
        moves: MuArray<MuRDAListTypes<RDA>['moveActionSchema']>;
        updates: MuArray<MuRDAListTypes<RDA>['updateActionSchema']>;
    }>;
    action: MuRDAListTypes<RDA>['actionSchema']['identity'];
    actionMeta: {
        type: 'store';
        action: {
            type: 'table';
            table: {
                push: {
                    type: 'unit';
                };
                pop: {
                    type: 'unit';
                };
                shift: {
                    type: 'unit';
                };
                unshift: {
                    type: 'unit';
                };
                splice: {
                    type: 'unit';
                };
                clear: {
                    type: 'unit';
                };
                reset: {
                    type: 'unit';
                };
                swap: {
                    type: 'unit';
                };
                reverse: {
                    type: 'unit';
                };
                sort: {
                    type: 'unit';
                };
                update: {
                    type: 'partial';
                    action: RDA['actionMeta'] extends {
                        type: 'store';
                        action: MuRDAActionMeta;
                    } ? RDA['actionMeta']['action'] : RDA['actionMeta'];
                };
            };
        };
    };
}
export declare class MuRDAListStoreElement<ListRDA extends MuRDAList<any>> {
    id: number;
    deleted: boolean;
    key: string;
    value: MuRDATypes<ListRDA['valueRDA']>['store'];
    constructor(id: number, deleted: boolean, key: string, value: MuRDATypes<ListRDA['valueRDA']>['store']);
}
export declare class MuRDAListStore<ListRDA extends MuRDAList<any>> implements MuRDAStore<ListRDA> {
    idIndex: {
        [id: string]: MuRDAListStoreElement<ListRDA>;
    };
    listIndex: MuRDAListStoreElement<ListRDA>[];
    private _rebuildListIndex;
    constructor(elements: MuRDAListStoreElement<ListRDA>[]);
    state(rda: ListRDA, out: MuRDATypes<ListRDA>['state']): MuRDATypes<ListRDA>['state'];
    apply(rda: ListRDA, action: ListRDA['actionSchema']['identity']): boolean;
    inverse(rda: ListRDA, action: ListRDA['actionSchema']['identity']): MuRDATypes<ListRDA>['action'];
    serialize(rda: ListRDA, out: MuRDATypes<ListRDA>['serializedStore']): MuRDATypes<ListRDA>['serializedStore'];
    free(rda: ListRDA): void;
    genId(upserts: ListRDA['storeSchema']['identity']): number;
}
type WrapAction<Meta, Dispatch> = Meta extends {
    type: 'unit';
} ? Dispatch extends (...args: infer ArgType) => infer RetType ? (...args: ArgType) => {
    upserts: {
        id: number;
        key: string;
        deleted: boolean;
        value: any;
    }[];
    deletes: number[];
    undeletes: number[];
    moves: {
        id: number;
        key: string;
    }[];
    updates: {
        id: number;
        action: RetType;
    }[];
} : never : Meta extends {
    action: MuRDAActionMeta;
} ? Dispatch extends (...args: infer ArgType) => infer RetType ? (...args: ArgType) => WrapAction<Meta['action'], RetType> : never : Meta extends {
    table: {
        [id in keyof Dispatch]: MuRDAActionMeta;
    };
} ? Dispatch extends {
    [id in keyof Meta['table']]: any;
} ? {
    [id in keyof Meta['table']]: WrapAction<Meta['table'][id], Dispatch[id]>;
} : never : never;
type StripStoreThenWrapAction<ValueRDA extends MuRDA<any, any, any, any>> = ValueRDA['actionMeta'] extends {
    type: 'store';
    action: MuRDAActionMeta;
} ? ValueRDA['action'] extends (store: any) => infer RetAction ? WrapAction<ValueRDA['actionMeta']['action'], RetAction> : never : WrapAction<ValueRDA['actionMeta'], ValueRDA['action']>;
export declare class MuRDAList<ValueRDA extends MuRDA<any, any, any, any>> implements MuRDA<MuRDAListTypes<ValueRDA>['stateSchema'], MuRDAListTypes<ValueRDA>['actionSchema'], MuRDAListTypes<ValueRDA>['storeSchema'], MuRDAListTypes<ValueRDA>['actionMeta']> {
    readonly valueRDA: ValueRDA;
    readonly stateSchema: MuRDAListTypes<ValueRDA>['stateSchema'];
    readonly storeElementSchema: MuRDAListTypes<ValueRDA>['storeElementSchema'];
    readonly storeSchema: MuRDAListTypes<ValueRDA>['storeSchema'];
    readonly moveActionSchema: MuRDAListTypes<ValueRDA>['moveActionSchema'];
    readonly updateActionSchema: MuRDAListTypes<ValueRDA>['updateActionSchema'];
    readonly actionSchema: MuRDAListTypes<ValueRDA>['actionSchema'];
    readonly actionMeta: MuRDAListTypes<ValueRDA>['actionMeta'];
    readonly emptyStore: MuRDAListStore<this>;
    private _savedStore;
    private _savedElement;
    private _savedAction;
    private _savedUpdate;
    private _updateDispatcher;
    private _noopDispatcher;
    private _dispatchSplice;
    private _dispatchers;
    constructor(valueRDA: ValueRDA);
    readonly action: (store: MuRDAListStore<this>) => {
        update: (index: number) => StripStoreThenWrapAction<ValueRDA>;
        push: (...elements: ValueRDA["stateSchema"]["identity"][]) => import("../schema/struct").Struct<{
            upserts: MuSortedArray<MuStruct<{
                id: MuVarint;
                deleted: MuBoolean;
                key: MuASCII;
                value: ValueRDA["storeSchema"];
            }>>;
            deletes: MuSortedArray<MuVarint>;
            undeletes: MuSortedArray<MuVarint>;
            moves: MuArray<MuRDAListTypes<RDA>["moveActionSchema"]>;
            updates: MuArray<MuStruct<{
                id: MuVarint;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        pop: (count?: number) => import("../schema/struct").Struct<{
            upserts: MuSortedArray<MuStruct<{
                id: MuVarint;
                deleted: MuBoolean;
                key: MuASCII;
                value: ValueRDA["storeSchema"];
            }>>;
            deletes: MuSortedArray<MuVarint>;
            undeletes: MuSortedArray<MuVarint>;
            moves: MuArray<MuRDAListTypes<RDA>["moveActionSchema"]>;
            updates: MuArray<MuStruct<{
                id: MuVarint;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        unshift: (...elements: ValueRDA["stateSchema"]["identity"][]) => import("../schema/struct").Struct<{
            upserts: MuSortedArray<MuStruct<{
                id: MuVarint;
                deleted: MuBoolean;
                key: MuASCII;
                value: ValueRDA["storeSchema"];
            }>>;
            deletes: MuSortedArray<MuVarint>;
            undeletes: MuSortedArray<MuVarint>;
            moves: MuArray<MuRDAListTypes<RDA>["moveActionSchema"]>;
            updates: MuArray<MuStruct<{
                id: MuVarint;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        shift: (count?: number) => import("../schema/struct").Struct<{
            upserts: MuSortedArray<MuStruct<{
                id: MuVarint;
                deleted: MuBoolean;
                key: MuASCII;
                value: ValueRDA["storeSchema"];
            }>>;
            deletes: MuSortedArray<MuVarint>;
            undeletes: MuSortedArray<MuVarint>;
            moves: MuArray<MuRDAListTypes<RDA>["moveActionSchema"]>;
            updates: MuArray<MuStruct<{
                id: MuVarint;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        splice: (start: number, deleteCount?: number, ...elements: ValueRDA["stateSchema"]["identity"][]) => import("../schema/struct").Struct<{
            upserts: MuSortedArray<MuStruct<{
                id: MuVarint;
                deleted: MuBoolean;
                key: MuASCII;
                value: ValueRDA["storeSchema"];
            }>>;
            deletes: MuSortedArray<MuVarint>;
            undeletes: MuSortedArray<MuVarint>;
            moves: MuArray<MuRDAListTypes<RDA>["moveActionSchema"]>;
            updates: MuArray<MuStruct<{
                id: MuVarint;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        clear: () => import("../schema/struct").Struct<{
            upserts: MuSortedArray<MuStruct<{
                id: MuVarint;
                deleted: MuBoolean;
                key: MuASCII;
                value: ValueRDA["storeSchema"];
            }>>;
            deletes: MuSortedArray<MuVarint>;
            undeletes: MuSortedArray<MuVarint>;
            moves: MuArray<MuRDAListTypes<RDA>["moveActionSchema"]>;
            updates: MuArray<MuStruct<{
                id: MuVarint;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        reset: (elements: ValueRDA["stateSchema"]["identity"][]) => import("../schema/struct").Struct<{
            upserts: MuSortedArray<MuStruct<{
                id: MuVarint;
                deleted: MuBoolean;
                key: MuASCII;
                value: ValueRDA["storeSchema"];
            }>>;
            deletes: MuSortedArray<MuVarint>;
            undeletes: MuSortedArray<MuVarint>;
            moves: MuArray<MuRDAListTypes<RDA>["moveActionSchema"]>;
            updates: MuArray<MuStruct<{
                id: MuVarint;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        swap: (...cycle: number[]) => import("../schema/struct").Struct<{
            upserts: MuSortedArray<MuStruct<{
                id: MuVarint;
                deleted: MuBoolean;
                key: MuASCII;
                value: ValueRDA["storeSchema"];
            }>>;
            deletes: MuSortedArray<MuVarint>;
            undeletes: MuSortedArray<MuVarint>;
            moves: MuArray<MuRDAListTypes<RDA>["moveActionSchema"]>;
            updates: MuArray<MuStruct<{
                id: MuVarint;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        reverse: () => import("../schema/struct").Struct<{
            upserts: MuSortedArray<MuStruct<{
                id: MuVarint;
                deleted: MuBoolean;
                key: MuASCII;
                value: ValueRDA["storeSchema"];
            }>>;
            deletes: MuSortedArray<MuVarint>;
            undeletes: MuSortedArray<MuVarint>;
            moves: MuArray<MuRDAListTypes<RDA>["moveActionSchema"]>;
            updates: MuArray<MuStruct<{
                id: MuVarint;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        sort: (compare: (a: ValueRDA["stateSchema"]["identity"], b: ValueRDA["stateSchema"]["identity"]) => number) => import("../schema/struct").Struct<{
            upserts: MuSortedArray<MuStruct<{
                id: MuVarint;
                deleted: MuBoolean;
                key: MuASCII;
                value: ValueRDA["storeSchema"];
            }>>;
            deletes: MuSortedArray<MuVarint>;
            undeletes: MuSortedArray<MuVarint>;
            moves: MuArray<MuRDAListTypes<RDA>["moveActionSchema"]>;
            updates: MuArray<MuStruct<{
                id: MuVarint;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
    };
    createStore(initialState: MuRDAListTypes<ValueRDA>['state']): MuRDAListStore<this>;
    parse(store: MuRDAListTypes<ValueRDA>['store']): MuRDAListStore<this>;
}
export {};
//# sourceMappingURL=list.d.ts.map