import { MuRDA, MuRDAStore, MuRDATypes } from '@box/mudb/rda';
import { MuRDAActionMeta, MuRDABindableActionMeta } from '@box/mudb/rda/rda';
import { MuArray, MuASCII, MuBoolean, MuDictionary, MuOption, MuSchema, MuSortedArray, MuStruct, MuUTF8 } from '@box/mudb/schema';
declare class MuRDATreeStore<ValueRDA extends MuRDA<any, any, any, any>> implements MuRDAStore<MuRDATree<ValueRDA>> {
    keyIndex: {
        [key: string]: MuRDATreeStoreElement<MuRDATree<ValueRDA>>;
    };
    constructor(elements: MuRDATreeStoreElement<MuRDATree<ValueRDA>>[]);
    state(rda: MuRDATree<ValueRDA>, out: MuRDATypes<MuRDATree<ValueRDA>>['state']): import("@box/mudb/schema/dictionary").Dictionary<MuStruct<{
        id: MuASCII;
        type: MuSchema<TreeNodeType>;
        name: MuUTF8;
        parentId: MuASCII;
        childrenIds: MuArray<MuASCII>;
        value: MuOption<ValueRDA["stateSchema"]>;
    }>>;
    private isDeleted;
    apply(rda: MuRDATree<ValueRDA>, action: MuRDATypes<MuRDATree<ValueRDA>>['action']): boolean;
    private disconnect;
    private connect;
    inverse(rda: MuRDATree<ValueRDA>, action: MuRDATypes<MuRDATree<ValueRDA>>['action']): MuRDATypes<MuRDATree<ValueRDA>>['action'];
    private generateInsertChild;
    serialize(rda: MuRDATree<ValueRDA>, out: MuRDATypes<MuRDATree<ValueRDA>>['serializedStore']): MuRDATypes<MuRDATree<ValueRDA>>['serializedStore'];
    free(rda: MuRDATree<ValueRDA>): void;
}
export declare class MuRDATreeStoreElement<MapRDA extends MuRDATree<any>> {
    deleted: boolean;
    id: string;
    type: TreeNodeType;
    name: string;
    parentId: string;
    children: StoreTypes<MapRDA['valueRDA']>['childrenElementSchema']['identity'];
    value: MuRDATypes<MapRDA['valueRDA']>['store'] | undefined;
    constructor(deleted: boolean, id: string, type: TreeNodeType, name: string, parentId: string, children: StoreTypes<MapRDA['valueRDA']>['childrenElementSchema']['identity'], value: MuRDATypes<MapRDA['valueRDA']>['store'] | undefined);
}
type StripBindMeta<Meta extends MuRDABindableActionMeta> = Meta extends {
    type: 'store';
    action: MuRDAActionMeta;
} ? Meta['action'] : Meta extends MuRDAActionMeta ? Meta : never;
type WrapAction<Meta, Dispatch> = Meta extends {
    type: 'unit';
} ? Dispatch extends (...args: infer ArgType) => infer RetType ? (...args: ArgType) => {
    add: MuArray<StoreTypes<any>['storeElementSchema']>['identity'];
    rename: {
        id: string;
        newName: string;
    }[];
    insert: {
        parentId: string;
        element: {
            sequence: string;
            value: string;
        };
    }[];
    deleteIds: string[];
    undeleteIds: string[];
    updateNodes: {
        id: string;
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
type StripBindAndWrap<ValueRDA extends MuRDA<any, any, any, any>> = ValueRDA['actionMeta'] extends {
    type: 'store';
    action: MuRDAActionMeta;
} ? ValueRDA['action'] extends (store: any) => infer RetAction ? WrapAction<ValueRDA['actionMeta']['action'], RetAction> : never : WrapAction<ValueRDA['actionMeta'], ValueRDA['action']>;
type MuRDATreeMeta<ValueRDA extends MuRDA<any, any, any, any>> = {
    type: 'store';
    action: {
        type: 'table';
        table: {
            add: {
                type: 'unit';
            };
            release: {
                type: 'unit';
            };
            remove: {
                type: 'unit';
            };
            copy: {
                type: 'unit';
            };
            move: {
                type: 'unit';
            };
            rename: {
                type: 'unit';
            };
            update: {
                type: 'partial';
                action: StripBindMeta<ValueRDA['actionMeta']>;
            };
        };
    };
};
export declare enum TreeNodeType {
    root = 0,
    leaf = 1,
    node = 2
}
export interface TreeStructTypes<ValueRDA extends MuRDA<any, any, any, any>> {
    node: MuStruct<{
        id: MuASCII;
        type: MuSchema<TreeNodeType>;
        name: MuUTF8;
        parentId: MuASCII;
        childrenIds: MuArray<MuASCII>;
        value: MuOption<ValueRDA['stateSchema']>;
    }>;
    treeNodes: MuDictionary<TreeStructTypes<ValueRDA>['node']>;
}
export interface InsertType {
    id: string;
    type: 'before' | 'after';
}
interface ActionTypes<ValueRDA extends MuRDA<any, any, any, any>> {
    renameElement: MuStruct<{
        id: MuASCII;
        newName: MuUTF8;
    }>;
    insertChild: MuStruct<{
        parentId: MuASCII;
        element: StoreTypes<ValueRDA>['childElementSchema'];
    }>;
    insertChildren: MuArray<ActionTypes<ValueRDA>['insertChild']>;
    ids: MuArray<MuASCII>;
    updateSchema: MuStruct<{
        id: MuASCII;
        action: ValueRDA['actionSchema'];
    }>;
    actionSchema: MuStruct<{
        add: MuArray<StoreTypes<ValueRDA>['storeElementSchema']>;
        rename: MuArray<ActionTypes<ValueRDA>['renameElement']>;
        insert: ActionTypes<ValueRDA>['insertChildren'];
        deleteIds: ActionTypes<ValueRDA>['ids'];
        undeleteIds: ActionTypes<ValueRDA>['ids'];
        updateNodes: MuArray<ActionTypes<ValueRDA>['updateSchema']>;
    }>;
}
interface StoreTypes<ValueRDA extends MuRDA<any, any, any, any>> {
    childElementSchema: MuStruct<{
        sequence: MuASCII;
        value: MuASCII;
    }>;
    childrenElementSchema: MuSortedArray<StoreTypes<ValueRDA>['childElementSchema']>;
    storeElementSchema: MuStruct<{
        deleted: MuBoolean;
        id: MuASCII;
        type: MuSchema<TreeNodeType>;
        name: MuUTF8;
        parentId: MuASCII;
        children: StoreTypes<ValueRDA>['childrenElementSchema'];
        value: MuOption<ValueRDA['storeSchema']>;
    }>;
    storeSchema: MuArray<StoreTypes<ValueRDA>['storeElementSchema']>;
}
export declare const ROOT_ID = "ROOT_ID";
export declare const ROOT_NAME = "Root";
export declare class MuRDATree<ValueRDA extends MuRDA<any, any, any, any>> implements MuRDA<TreeStructTypes<ValueRDA>['treeNodes'], ActionTypes<ValueRDA>['actionSchema'], StoreTypes<ValueRDA>['storeSchema'], MuRDATreeMeta<ValueRDA>> {
    readonly valueStateSchema: MuOption<ValueRDA['stateSchema']>;
    readonly nodeSchema: TreeStructTypes<ValueRDA>['node'];
    readonly valueRDA: ValueRDA;
    readonly childElementSchema: StoreTypes<ValueRDA>['childElementSchema'];
    readonly childrenElementSchema: StoreTypes<ValueRDA>['childrenElementSchema'];
    readonly storeElementSchema: StoreTypes<ValueRDA>['storeElementSchema'];
    private _savedStore;
    private _savedElement;
    private _savedAction;
    private _savedUpdate;
    private _updateDispatcher;
    readonly renameElement: ActionTypes<ValueRDA>['renameElement'];
    readonly insertChild: ActionTypes<ValueRDA>['insertChild'];
    readonly insertChildren: ActionTypes<ValueRDA>['insertChildren'];
    readonly ids: ActionTypes<ValueRDA>['ids'];
    readonly updateSchema: ActionTypes<ValueRDA>['updateSchema'];
    constructor(valueRDA: ValueRDA, identity?: TreeStructTypes<ValueRDA>['treeNodes']['identity']);
    readonly stateSchema: TreeStructTypes<ValueRDA>['treeNodes'];
    readonly actionSchema: ActionTypes<ValueRDA>['actionSchema'];
    readonly storeSchema: StoreTypes<ValueRDA>['storeSchema'];
    readonly actionMeta: MuRDATreeMeta<ValueRDA>;
    readonly action: (store: MuRDATreeStore<ValueRDA>) => {
        add: (node: TreeStructTypes<ValueRDA>["node"]["identity"]) => import("@box/mudb/schema/struct").Struct<{
            add: MuArray<MuStruct<{
                deleted: MuBoolean;
                id: MuASCII;
                type: MuSchema<TreeNodeType>;
                name: MuUTF8;
                parentId: MuASCII;
                children: StoreTypes<ValueRDA_1>["childrenElementSchema"];
                value: MuOption<ValueRDA["storeSchema"]>;
            }>>;
            rename: MuArray<ActionTypes<ValueRDA_2>["renameElement"]>;
            insert: MuArray<MuStruct<{
                parentId: MuASCII;
                element: StoreTypes<ValueRDA_2>["childElementSchema"];
            }>>;
            deleteIds: ActionTypes<ValueRDA_2>["ids"];
            undeleteIds: ActionTypes<ValueRDA_2>["ids"];
            updateNodes: MuArray<MuStruct<{
                id: MuASCII;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        release: (nodeId: string) => import("@box/mudb/schema/struct").Struct<{
            add: MuArray<MuStruct<{
                deleted: MuBoolean;
                id: MuASCII;
                type: MuSchema<TreeNodeType>;
                name: MuUTF8;
                parentId: MuASCII;
                children: StoreTypes<ValueRDA_1>["childrenElementSchema"];
                value: MuOption<ValueRDA["storeSchema"]>;
            }>>;
            rename: MuArray<ActionTypes<ValueRDA_2>["renameElement"]>;
            insert: MuArray<MuStruct<{
                parentId: MuASCII;
                element: StoreTypes<ValueRDA_2>["childElementSchema"];
            }>>;
            deleteIds: ActionTypes<ValueRDA_2>["ids"];
            undeleteIds: ActionTypes<ValueRDA_2>["ids"];
            updateNodes: MuArray<MuStruct<{
                id: MuASCII;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        remove: (nodeIds: string[]) => import("@box/mudb/schema/struct").Struct<{
            add: MuArray<MuStruct<{
                deleted: MuBoolean;
                id: MuASCII;
                type: MuSchema<TreeNodeType>;
                name: MuUTF8;
                parentId: MuASCII;
                children: StoreTypes<ValueRDA_1>["childrenElementSchema"];
                value: MuOption<ValueRDA["storeSchema"]>;
            }>>;
            rename: MuArray<ActionTypes<ValueRDA_2>["renameElement"]>;
            insert: MuArray<MuStruct<{
                parentId: MuASCII;
                element: StoreTypes<ValueRDA_2>["childElementSchema"];
            }>>;
            deleteIds: ActionTypes<ValueRDA_2>["ids"];
            undeleteIds: ActionTypes<ValueRDA_2>["ids"];
            updateNodes: MuArray<MuStruct<{
                id: MuASCII;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        copy: (data: {
            sourceNodeId: string;
            newNode: TreeStructTypes<ValueRDA>["node"]["identity"];
            newChildrenNodes: TreeStructTypes<ValueRDA>["node"]["identity"][];
        }[]) => import("@box/mudb/schema/struct").Struct<{
            add: MuArray<MuStruct<{
                deleted: MuBoolean;
                id: MuASCII;
                type: MuSchema<TreeNodeType>;
                name: MuUTF8;
                parentId: MuASCII;
                children: StoreTypes<ValueRDA_1>["childrenElementSchema"];
                value: MuOption<ValueRDA["storeSchema"]>;
            }>>;
            rename: MuArray<ActionTypes<ValueRDA_2>["renameElement"]>;
            insert: MuArray<MuStruct<{
                parentId: MuASCII;
                element: StoreTypes<ValueRDA_2>["childElementSchema"];
            }>>;
            deleteIds: ActionTypes<ValueRDA_2>["ids"];
            undeleteIds: ActionTypes<ValueRDA_2>["ids"];
            updateNodes: MuArray<MuStruct<{
                id: MuASCII;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        move: (data: {
            moveIds: string[];
            insertParentId: string;
            insert?: InsertType;
        }) => import("@box/mudb/schema/struct").Struct<{
            add: MuArray<MuStruct<{
                deleted: MuBoolean;
                id: MuASCII;
                type: MuSchema<TreeNodeType>;
                name: MuUTF8;
                parentId: MuASCII;
                children: StoreTypes<ValueRDA_1>["childrenElementSchema"];
                value: MuOption<ValueRDA["storeSchema"]>;
            }>>;
            rename: MuArray<ActionTypes<ValueRDA_2>["renameElement"]>;
            insert: MuArray<MuStruct<{
                parentId: MuASCII;
                element: StoreTypes<ValueRDA_2>["childElementSchema"];
            }>>;
            deleteIds: ActionTypes<ValueRDA_2>["ids"];
            undeleteIds: ActionTypes<ValueRDA_2>["ids"];
            updateNodes: MuArray<MuStruct<{
                id: MuASCII;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        rename: (data: {
            nodeId: string;
            newName: string;
        }[]) => import("@box/mudb/schema/struct").Struct<{
            add: MuArray<MuStruct<{
                deleted: MuBoolean;
                id: MuASCII;
                type: MuSchema<TreeNodeType>;
                name: MuUTF8;
                parentId: MuASCII;
                children: StoreTypes<ValueRDA_1>["childrenElementSchema"];
                value: MuOption<ValueRDA["storeSchema"]>;
            }>>;
            rename: MuArray<ActionTypes<ValueRDA_2>["renameElement"]>;
            insert: MuArray<MuStruct<{
                parentId: MuASCII;
                element: StoreTypes<ValueRDA_2>["childElementSchema"];
            }>>;
            deleteIds: ActionTypes<ValueRDA_2>["ids"];
            undeleteIds: ActionTypes<ValueRDA_2>["ids"];
            updateNodes: MuArray<MuStruct<{
                id: MuASCII;
                action: ValueRDA["actionSchema"];
            }>>;
        }>;
        update: (nodeId: string) => import("@box/mudb/schema/struct").Struct<{
            add: MuArray<MuStruct<{
                deleted: MuBoolean;
                id: MuASCII;
                type: MuSchema<TreeNodeType>;
                name: MuUTF8;
                parentId: MuASCII;
                children: StoreTypes<ValueRDA_1>["childrenElementSchema"];
                value: MuOption<ValueRDA["storeSchema"]>;
            }>>;
            rename: MuArray<ActionTypes<ValueRDA_2>["renameElement"]>;
            insert: MuArray<MuStruct<{
                parentId: MuASCII;
                element: StoreTypes<ValueRDA_2>["childElementSchema"];
            }>>;
            deleteIds: ActionTypes<ValueRDA_2>["ids"];
            undeleteIds: ActionTypes<ValueRDA_2>["ids"];
            updateNodes: MuArray<MuStruct<{
                id: MuASCII;
                action: ValueRDA["actionSchema"];
            }>>;
        }> | StripBindAndWrap<ValueRDA>;
    };
    readonly emptyStore: MuRDATreeStore<ValueRDA>;
    getEmptyAction(): import("@box/mudb/schema/struct").Struct<{
        add: MuArray<MuStruct<{
            deleted: MuBoolean;
            id: MuASCII;
            type: MuSchema<TreeNodeType>;
            name: MuUTF8;
            parentId: MuASCII;
            children: StoreTypes<ValueRDA_1>["childrenElementSchema"];
            value: MuOption<ValueRDA["storeSchema"]>;
        }>>;
        rename: MuArray<ActionTypes<ValueRDA_2>["renameElement"]>;
        insert: MuArray<MuStruct<{
            parentId: MuASCII;
            element: StoreTypes<ValueRDA_2>["childElementSchema"];
        }>>;
        deleteIds: ActionTypes<ValueRDA_2>["ids"];
        undeleteIds: ActionTypes<ValueRDA_2>["ids"];
        updateNodes: MuArray<MuStruct<{
            id: MuASCII;
            action: ValueRDA["actionSchema"];
        }>>;
    }>;
    private parseNodeToSerializeStoreEle;
    private parseNodeChildrenIdsToEle;
    private _constructUpdateDispatcher;
    findChildElement(parent: StoreTypes<ValueRDA>['storeElementSchema']['identity'], childId: string): {
        index: number;
        data: import("@box/mudb/schema/struct").Struct<{
            sequence: MuASCII;
            value: MuASCII;
        }>;
    } | undefined;
    generateSequences(parent: MuRDATree<ValueRDA>['storeElementSchema']['identity'], count: number, insert?: InsertType): string[] | undefined;
    createStore(initialState: MuRDATree<ValueRDA>['stateSchema']['identity']): MuRDATreeStore<ValueRDA>;
    parse(store: MuRDATree<ValueRDA>['storeSchema']['identity']): MuRDATreeStore<ValueRDA>;
}
export {};
//# sourceMappingURL=murda-tree.d.ts.map