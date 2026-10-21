import { MuUTF8, MuStruct, MuDictionary, MuFloat32, MuBoolean, MuVarint } from '@box/mudb/schema';
import { MuRDAStruct, MuRDARegister, MuRDAMap } from '@box/mudb/rda';
export declare const FileRDA: MuRDAStruct<{
    fileId: MuRDARegister<MuUTF8>;
    name: MuRDARegister<MuUTF8>;
    text: {
        stateSchema: MuUTF8;
        actionSchema: import("@box/mudb/schema").MuUnion<{
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
                ids: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                string: MuUTF8;
            }>;
            remove: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
            removeWithoutTombstone: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
            noop: import("@box/mudb/schema").MuVoid;
        }>;
        storeSchema: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            character: MuUTF8;
        }>>;
        emptyStore: import("./murda-text").MuRDATextStore;
        actionMeta: {
            type: "partial";
            action: {
                type: "table";
                table: {
                    insert: {
                        type: "unit";
                    };
                    remove: {
                        type: "unit";
                    };
                };
            };
        };
        action: (store: import("./murda-text").MuRDATextStore) => {
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
                    ids: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                    string: MuUTF8;
                }>;
                remove: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                removeWithoutTombstone: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                noop: import("@box/mudb/schema").MuVoid;
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
                    ids: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                    string: MuUTF8;
                }>;
                remove: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                removeWithoutTombstone: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                noop: import("@box/mudb/schema").MuVoid;
            }, "noop" | "remove" | "insertCharacter" | "insertString" | "insertCharacterOnTombstone" | "insertStringOnTombstone" | "insertStringOnTombstoneWithIds" | "removeWithoutTombstone">;
        };
        createStore: (state: string) => import("./murda-text").MuRDATextStore;
        parse: (store: import("@box/mudb/schema/struct").Struct<{
            id: import("@box/mudb/schema").MuASCII;
            character: MuUTF8;
        }>[]) => import("./murda-text").MuRDATextStore;
    };
    order: MuRDARegister<MuFloat32>;
    isClient: MuRDARegister<MuBoolean>;
    isShare: MuRDARegister<MuBoolean>;
    isUploading: MuRDARegister<MuBoolean>;
    lockedMapTitle: MuRDARegister<MuUTF8>;
    lockedMapId: MuRDARegister<MuVarint>;
    size: MuRDARegister<MuVarint>;
}>;
export declare const FileDictRDA: MuRDAMap<MuUTF8, MuRDAStruct<{
    fileId: MuRDARegister<MuUTF8>;
    name: MuRDARegister<MuUTF8>;
    text: {
        stateSchema: MuUTF8;
        actionSchema: import("@box/mudb/schema").MuUnion<{
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
                ids: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                string: MuUTF8;
            }>;
            remove: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
            removeWithoutTombstone: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
            noop: import("@box/mudb/schema").MuVoid;
        }>;
        storeSchema: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            character: MuUTF8;
        }>>;
        emptyStore: import("./murda-text").MuRDATextStore;
        actionMeta: {
            type: "partial";
            action: {
                type: "table";
                table: {
                    insert: {
                        type: "unit";
                    };
                    remove: {
                        type: "unit";
                    };
                };
            };
        };
        action: (store: import("./murda-text").MuRDATextStore) => {
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
                    ids: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                    string: MuUTF8;
                }>;
                remove: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                removeWithoutTombstone: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                noop: import("@box/mudb/schema").MuVoid;
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
                    ids: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                    string: MuUTF8;
                }>;
                remove: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                removeWithoutTombstone: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuASCII>;
                noop: import("@box/mudb/schema").MuVoid;
            }, "noop" | "remove" | "insertCharacter" | "insertString" | "insertCharacterOnTombstone" | "insertStringOnTombstone" | "insertStringOnTombstoneWithIds" | "removeWithoutTombstone">;
        };
        createStore: (state: string) => import("./murda-text").MuRDATextStore;
        parse: (store: import("@box/mudb/schema/struct").Struct<{
            id: import("@box/mudb/schema").MuASCII;
            character: MuUTF8;
        }>[]) => import("./murda-text").MuRDATextStore;
    };
    order: MuRDARegister<MuFloat32>;
    isClient: MuRDARegister<MuBoolean>;
    isShare: MuRDARegister<MuBoolean>;
    isUploading: MuRDARegister<MuBoolean>;
    lockedMapTitle: MuRDARegister<MuUTF8>;
    lockedMapId: MuRDARegister<MuVarint>;
    size: MuRDARegister<MuVarint>;
}>>;
export declare const FileSchema: MuStruct<{
    fileId: MuUTF8;
    name: MuUTF8;
    text: MuUTF8;
    order: MuFloat32;
    isClient: MuBoolean;
    isShare: MuBoolean;
    isUploading: MuBoolean;
    lockedMapTitle: MuUTF8;
    lockedMapId: MuVarint;
    size: MuVarint;
}>;
export type FileState = typeof FileSchema.identity;
export declare const FileDictSchema: MuDictionary<MuStruct<{
    fileId: MuUTF8;
    name: MuUTF8;
    text: MuUTF8;
    order: MuFloat32;
    isClient: MuBoolean;
    isShare: MuBoolean;
    isUploading: MuBoolean;
    lockedMapTitle: MuUTF8;
    lockedMapId: MuVarint;
    size: MuVarint;
}>>;
export type FileDictState = typeof FileDictSchema.identity;
export declare const CursorSchema: MuStruct<{
    sessionId: MuUTF8;
    name: MuUTF8;
    fileId: MuUTF8;
    startPosId: MuUTF8;
    endPosId: MuUTF8;
}>;
export type CursorState = typeof CursorSchema.identity;
export declare const CursorDictSchema: MuDictionary<MuStruct<{
    sessionId: MuUTF8;
    name: MuUTF8;
    fileId: MuUTF8;
    startPosId: MuUTF8;
    endPosId: MuUTF8;
}>>;
export type CursorDictState = typeof CursorDictSchema.identity;
//# sourceMappingURL=code-editor-common-state.d.ts.map