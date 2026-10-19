import { MuRDA, MuRDAStore } from '@box/mudb/rda';
import { MuUTF8, MuStruct, MuUnion, MuVoid, MuVarint, MuSortedArray } from '@box/mudb/schema';
import { Id } from '@box/mudb/rda/_id';
export declare const MuRDATextStateSchema: MuUTF8;
export interface MatchedIdInfo {
    id: Id;
    indexInListA: number;
    indexInListB: number;
}
/**
 * Finds matching IDs between two sorted Id arrays using a two-pointer approach.
 *
 * @param listA The first sorted array of Ids.
 * @param listB The second sorted array of Ids.
 * @returns An array of MatchedIdInfo objects for each common Id.
 */
export declare function findMatchingIdsInSortedArrays(listA: ReadonlyArray<Id>, listB: ReadonlyArray<Id>): MatchedIdInfo[];
export declare const MuRDATextActionSchema: MuUnion<{
    insertCharacter: MuStruct<{
        id: import("@box/mudb/schema").MuASCII;
        character: MuUTF8;
    }>;
    insertString: MuStruct<{
        beginId: import("@box/mudb/schema").MuASCII;
        step: MuVarint;
        string: MuUTF8;
    }>;
    insertCharacterOnTombstone: MuStruct<{
        id: import("@box/mudb/schema").MuASCII;
        character: MuUTF8;
    }>;
    insertStringOnTombstone: MuStruct<{
        beginId: import("@box/mudb/schema").MuASCII;
        step: MuVarint;
        string: MuUTF8;
    }>;
    insertStringOnTombstoneWithIds: MuStruct<{
        ids: MuSortedArray<import("@box/mudb/schema").MuASCII>;
        string: MuUTF8;
    }>;
    remove: MuSortedArray<import("@box/mudb/schema").MuASCII>;
    removeWithoutTombstone: MuSortedArray<import("@box/mudb/schema").MuASCII>;
    noop: MuVoid;
}>;
type MuRDATextAction = typeof MuRDATextActionSchema.identity;
export declare const MuRDATextStoreEntrySchema: MuStruct<{
    id: import("@box/mudb/schema").MuASCII;
    character: MuUTF8;
}>;
export declare const MuRDATextStoreSchema: MuSortedArray<MuStruct<{
    id: import("@box/mudb/schema").MuASCII;
    character: MuUTF8;
}>>;
type MuRDATextActionMeta = {
    type: 'partial';
    action: {
        type: 'table';
        table: {
            insert: {
                type: 'unit';
            };
            remove: {
                type: 'unit';
            };
        };
    };
};
type RDAType = MuRDA<typeof MuRDATextStateSchema, typeof MuRDATextActionSchema, typeof MuRDATextStoreSchema, MuRDATextActionMeta>;
export declare class TextIterator {
    private store;
    id: Id;
    constructor(store: MuRDATextStore, index?: number);
    moveTo(index: number): void;
    getIndex(targetId?: string): number;
    moveNext(): void;
    movePrev(): void;
    setStore(store: MuRDATextStore): void;
}
export declare class TextSelection {
    private store;
    begin: TextIterator;
    end: TextIterator;
    constructor(store: MuRDATextStore, begin: number, end: number);
    getRange(): {
        begin: number;
        end: number;
    };
    getText(): string;
    setRange(begin: number, end: number): void;
}
export declare class MuRDATextStore implements MuRDAStore<RDAType> {
    ids: Id[];
    characters: string[];
    private fenwickTree;
    constructor(ids: Id[], characters: string[]);
    state(): string;
    rebuildFenwickTree(): void;
    private updateFenwickTree;
    getStateIndex(index: number): number;
    getIdsIndex(index: number): number;
    private _insert;
    /**
     *
     * @param itemsToInsert
     * @param onTombStone
     * @returns true if a full rebuild of Fenwick tree is needed
     */
    private _insertMultiple;
    private _remove;
    apply(rda: RDAType, action: MuRDATextAction): boolean;
    inverse(rda: RDAType, action: MuRDATextAction): import("@box/mudb/schema/union").UnionInstance<{
        insertCharacter: MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            character: MuUTF8;
        }>;
        insertString: MuStruct<{
            beginId: import("@box/mudb/schema").MuASCII;
            step: MuVarint;
            string: MuUTF8;
        }>;
        insertCharacterOnTombstone: MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            character: MuUTF8;
        }>;
        insertStringOnTombstone: MuStruct<{
            beginId: import("@box/mudb/schema").MuASCII;
            step: MuVarint;
            string: MuUTF8;
        }>;
        insertStringOnTombstoneWithIds: MuStruct<{
            ids: MuSortedArray<import("@box/mudb/schema").MuASCII>;
            string: MuUTF8;
        }>;
        remove: MuSortedArray<import("@box/mudb/schema").MuASCII>;
        removeWithoutTombstone: MuSortedArray<import("@box/mudb/schema").MuASCII>;
        noop: MuVoid;
    }, "noop" | "remove" | "insertCharacter" | "insertString" | "insertCharacterOnTombstone" | "insertStringOnTombstone" | "insertStringOnTombstoneWithIds" | "removeWithoutTombstone">;
    serialize(rda: RDAType, out: typeof MuRDATextStoreSchema.identity): import("@box/mudb/schema/struct").Struct<{
        id: import("@box/mudb/schema").MuASCII;
        character: MuUTF8;
    }>[];
    free(): void;
    createSelection(begin: number, end: number): TextSelection;
    private startsWith;
}
export declare const MuRDAText: {
    stateSchema: MuUTF8;
    actionSchema: MuUnion<{
        insertCharacter: MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            character: MuUTF8;
        }>;
        insertString: MuStruct<{
            beginId: import("@box/mudb/schema").MuASCII;
            step: MuVarint;
            string: MuUTF8;
        }>;
        insertCharacterOnTombstone: MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            character: MuUTF8;
        }>;
        insertStringOnTombstone: MuStruct<{
            beginId: import("@box/mudb/schema").MuASCII;
            step: MuVarint;
            string: MuUTF8;
        }>;
        insertStringOnTombstoneWithIds: MuStruct<{
            ids: MuSortedArray<import("@box/mudb/schema").MuASCII>;
            string: MuUTF8;
        }>;
        remove: MuSortedArray<import("@box/mudb/schema").MuASCII>;
        removeWithoutTombstone: MuSortedArray<import("@box/mudb/schema").MuASCII>;
        noop: MuVoid;
    }>;
    storeSchema: MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuASCII;
        character: MuUTF8;
    }>>;
    emptyStore: MuRDATextStore;
    actionMeta: MuRDATextActionMeta;
    action: (store: MuRDATextStore) => {
        insert: (index: number, str: string) => import("@box/mudb/schema/union").UnionInstance<{
            insertCharacter: MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                character: MuUTF8;
            }>;
            insertString: MuStruct<{
                beginId: import("@box/mudb/schema").MuASCII;
                step: MuVarint;
                string: MuUTF8;
            }>;
            insertCharacterOnTombstone: MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                character: MuUTF8;
            }>;
            insertStringOnTombstone: MuStruct<{
                beginId: import("@box/mudb/schema").MuASCII;
                step: MuVarint;
                string: MuUTF8;
            }>;
            insertStringOnTombstoneWithIds: MuStruct<{
                ids: MuSortedArray<import("@box/mudb/schema").MuASCII>;
                string: MuUTF8;
            }>;
            remove: MuSortedArray<import("@box/mudb/schema").MuASCII>;
            removeWithoutTombstone: MuSortedArray<import("@box/mudb/schema").MuASCII>;
            noop: MuVoid;
        }, "noop" | "remove" | "insertCharacter" | "insertString" | "insertCharacterOnTombstone" | "insertStringOnTombstone" | "insertStringOnTombstoneWithIds" | "removeWithoutTombstone">;
        remove: (index: number, count?: number) => import("@box/mudb/schema/union").UnionInstance<{
            insertCharacter: MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                character: MuUTF8;
            }>;
            insertString: MuStruct<{
                beginId: import("@box/mudb/schema").MuASCII;
                step: MuVarint;
                string: MuUTF8;
            }>;
            insertCharacterOnTombstone: MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                character: MuUTF8;
            }>;
            insertStringOnTombstone: MuStruct<{
                beginId: import("@box/mudb/schema").MuASCII;
                step: MuVarint;
                string: MuUTF8;
            }>;
            insertStringOnTombstoneWithIds: MuStruct<{
                ids: MuSortedArray<import("@box/mudb/schema").MuASCII>;
                string: MuUTF8;
            }>;
            remove: MuSortedArray<import("@box/mudb/schema").MuASCII>;
            removeWithoutTombstone: MuSortedArray<import("@box/mudb/schema").MuASCII>;
            noop: MuVoid;
        }, "noop" | "remove" | "insertCharacter" | "insertString" | "insertCharacterOnTombstone" | "insertStringOnTombstone" | "insertStringOnTombstoneWithIds" | "removeWithoutTombstone">;
    };
    createStore: (state: string) => MuRDATextStore;
    parse: (store: typeof MuRDATextStoreSchema.identity) => MuRDATextStore;
};
export {};
//# sourceMappingURL=murda-text.d.ts.map