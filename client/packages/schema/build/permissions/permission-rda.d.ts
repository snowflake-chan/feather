import { MuStruct, MuBoolean, MuASCII, MuArray, MuUTF8, MuVarint, MuDate, MuSchema } from '@box/mudb/schema';
import { MuRDAConstant, MuRDAStruct, MuRDAMap, MuRDARegister, MuRDAList } from '@box/mudb/rda';
export declare const UserIdSchema: MuUTF8;
export declare const PermissionGroupMemberRDA: MuRDAStruct<{
    addedAt: MuRDAConstant<MuDate>;
}>;
export declare const PermissionMemberRDA: MuRDAMap<MuUTF8, MuRDAStruct<{
    addedAt: MuRDAConstant<MuDate>;
}>>;
export declare const PermissionSetRDA: MuRDAStruct<{
    publish: MuRDARegister<MuBoolean>;
    playButton: MuRDARegister<MuBoolean>;
    debugger: MuRDARegister<MuBoolean>;
    editScripts: MuRDARegister<MuBoolean>;
    editProject: MuRDARegister<MuBoolean>;
    editModel: MuRDARegister<MuBoolean>;
    editScene: MuRDARegister<MuBoolean>;
    editFile: MuRDARegister<MuBoolean>;
    editHierarchy: MuRDARegister<MuBoolean>;
    editVoxels: MuRDARegister<MuBoolean>;
    editPermissions: MuRDARegister<MuBoolean>;
    versionControl: MuRDARegister<MuBoolean>;
    /**
     * @deprecated 暂时无用，待删
     */
    chatEnabled: MuRDARegister<MuBoolean>;
    /**
     * 平台权限
     */
    editMarket: MuRDARegister<MuBoolean>;
    editStatisticsData: MuRDARegister<MuBoolean>;
    editPublish: MuRDARegister<MuBoolean>;
    /** 玩家模块权限: 每个地图独立控制 */
    editPlayer: MuRDARegister<MuBoolean>;
}>;
export declare const PermissionGroupRDA: MuRDAStruct<{
    permissions: MuRDAStruct<{
        publish: MuRDARegister<MuBoolean>;
        playButton: MuRDARegister<MuBoolean>;
        debugger: MuRDARegister<MuBoolean>;
        editScripts: MuRDARegister<MuBoolean>;
        editProject: MuRDARegister<MuBoolean>;
        editModel: MuRDARegister<MuBoolean>;
        editScene: MuRDARegister<MuBoolean>;
        editFile: MuRDARegister<MuBoolean>;
        editHierarchy: MuRDARegister<MuBoolean>;
        editVoxels: MuRDARegister<MuBoolean>;
        editPermissions: MuRDARegister<MuBoolean>;
        versionControl: MuRDARegister<MuBoolean>;
        /**
         * @deprecated 暂时无用，待删
         */
        chatEnabled: MuRDARegister<MuBoolean>;
        /**
         * 平台权限
         */
        editMarket: MuRDARegister<MuBoolean>;
        editStatisticsData: MuRDARegister<MuBoolean>;
        editPublish: MuRDARegister<MuBoolean>;
        /** 玩家模块权限: 每个地图独立控制 */
        editPlayer: MuRDARegister<MuBoolean>;
    }>;
    members: MuRDAMap<MuUTF8, MuRDAStruct<{
        addedAt: MuRDAConstant<MuDate>;
    }>>;
    defaultGroup: MuRDARegister<MuBoolean>;
}>;
export declare const PermissionSetSchema: MuStruct<{
    publish: MuBoolean;
    playButton: MuBoolean;
    debugger: MuBoolean;
    editScripts: MuBoolean;
    editProject: MuBoolean;
    editModel: MuBoolean;
    editScene: MuBoolean;
    editFile: MuBoolean;
    editHierarchy: MuBoolean;
    editVoxels: MuBoolean;
    editPermissions: MuBoolean;
    versionControl: MuBoolean;
    chatEnabled: MuBoolean;
    editMarket: MuBoolean;
    editStatisticsData: MuBoolean;
    editPublish: MuBoolean;
    editPlayer: MuBoolean;
}>;
export type PermissionSet = typeof PermissionSetSchema.identity;
export declare const PermissionUserRDA: MuRDAStruct<{
    createdAt: MuRDAConstant<MuDate>;
}>;
export declare const BanRDA: MuRDAConstant<MuStruct<{
    reason: MuUTF8;
    bannedBy: MuUTF8;
}>>;
export declare const VersionControlBranchesRDA: MuRDAMap<MuUTF8, MuRDAStruct<{
    name: MuRDARegister<MuUTF8>;
    headHash: MuRDARegister<MuASCII>;
}>>;
export declare const VersionControlBranchesSchema: import("@box/mudb/schema").MuDictionary<MuStruct<{
    name: MuUTF8;
    headHash: MuASCII;
}>>;
export type VersionControlBranches = typeof VersionControlBranchesSchema.identity;
export declare const VersionControlRDA: MuRDAStruct<{
    branches: MuRDAMap<MuUTF8, MuRDAStruct<{
        name: MuRDARegister<MuUTF8>;
        headHash: MuRDARegister<MuASCII>;
    }>>;
    currentBranch: MuRDARegister<MuUTF8>;
}>;
export type BranchTable = typeof VersionControlRDA.stateSchema;
export declare enum PermissionAccessLevel {
    REGISTERED_ONLY = 1,// any registered users can access
    INVITED_ONLY = 2,// only invited can access
    PRIVATE = 3,// only owner can access
    SCRIPT_VIEW_ONLY = 4
}
export declare const PermissionRDA: MuRDAStruct<{
    type: MuRDAConstant<MuUTF8>;
    version: MuRDAConstant<MuASCII>;
    prevHash: MuRDARegister<MuASCII>;
    timestamp: MuRDARegister<MuDate>;
    versionControl: MuRDAStruct<{
        branches: MuRDAMap<MuUTF8, MuRDAStruct<{
            name: MuRDARegister<MuUTF8>;
            headHash: MuRDARegister<MuASCII>;
        }>>;
        currentBranch: MuRDARegister<MuUTF8>;
    }>;
    groups: MuRDAMap<MuUTF8, MuRDAStruct<{
        permissions: MuRDAStruct<{
            publish: MuRDARegister<MuBoolean>;
            playButton: MuRDARegister<MuBoolean>;
            debugger: MuRDARegister<MuBoolean>;
            editScripts: MuRDARegister<MuBoolean>;
            editProject: MuRDARegister<MuBoolean>;
            editModel: MuRDARegister<MuBoolean>;
            editScene: MuRDARegister<MuBoolean>;
            editFile: MuRDARegister<MuBoolean>;
            editHierarchy: MuRDARegister<MuBoolean>;
            editVoxels: MuRDARegister<MuBoolean>;
            editPermissions: MuRDARegister<MuBoolean>;
            versionControl: MuRDARegister<MuBoolean>;
            /**
             * @deprecated 暂时无用，待删
             */
            chatEnabled: MuRDARegister<MuBoolean>;
            /**
             * 平台权限
             */
            editMarket: MuRDARegister<MuBoolean>;
            editStatisticsData: MuRDARegister<MuBoolean>;
            editPublish: MuRDARegister<MuBoolean>;
            /** 玩家模块权限: 每个地图独立控制 */
            editPlayer: MuRDARegister<MuBoolean>;
        }>;
        members: MuRDAMap<MuUTF8, MuRDAStruct<{
            addedAt: MuRDAConstant<MuDate>;
        }>>;
        defaultGroup: MuRDARegister<MuBoolean>;
    }>>;
    users: MuRDAMap<MuUTF8, MuRDAStruct<{
        createdAt: MuRDAConstant<MuDate>;
    }>>;
    collaborators: MuRDAList<MuRDAConstant<MuUTF8>>;
    owner: MuRDAConstant<MuUTF8>;
    accessLevel: MuRDARegister<MuSchema<PermissionAccessLevel>>;
    banned: MuRDAMap<MuUTF8, MuRDAConstant<MuStruct<{
        reason: MuUTF8;
        bannedBy: MuUTF8;
    }>>>;
}>;
export declare const PermissionsSchema: MuStruct<{
    type: MuUTF8;
    version: MuASCII;
    prevHash: MuASCII;
    timestamp: MuDate;
    versionControl: MuStruct<{
        branches: import("@box/mudb/schema").MuDictionary<MuStruct<{
            name: MuUTF8;
            headHash: MuASCII;
        }>>;
        currentBranch: MuUTF8;
    }>;
    groups: import("@box/mudb/schema").MuDictionary<MuStruct<{
        permissions: MuStruct<{
            publish: MuBoolean;
            playButton: MuBoolean;
            debugger: MuBoolean;
            editScripts: MuBoolean;
            editProject: MuBoolean;
            editModel: MuBoolean;
            editScene: MuBoolean;
            editFile: MuBoolean;
            editHierarchy: MuBoolean;
            editVoxels: MuBoolean;
            editPermissions: MuBoolean;
            versionControl: MuBoolean;
            chatEnabled: MuBoolean;
            editMarket: MuBoolean;
            editStatisticsData: MuBoolean;
            editPublish: MuBoolean;
            editPlayer: MuBoolean;
        }>;
        members: import("@box/mudb/schema").MuDictionary<MuStruct<{
            addedAt: MuDate;
        }>>;
        defaultGroup: MuBoolean;
    }>>;
    users: import("@box/mudb/schema").MuDictionary<MuStruct<{
        createdAt: MuDate;
    }>>;
    collaborators: MuArray<MuUTF8>;
    owner: MuUTF8;
    accessLevel: MuSchema<PermissionAccessLevel>;
    banned: import("@box/mudb/schema").MuDictionary<MuStruct<{
        reason: MuUTF8;
        bannedBy: MuUTF8;
    }>>;
}>;
export declare const PermissionActionSchema: import("@box/mudb/schema").MuUnion<{
    type: import("@box/mudb/schema").MuVoid;
    version: import("@box/mudb/schema").MuVoid;
    prevHash: MuASCII;
    timestamp: MuDate;
    versionControl: import("@box/mudb/schema").MuUnion<{
        branches: import("@box/mudb/schema").MuUnion<{
            reset: MuStruct<{
                upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                    id: MuVarint;
                    sequence: MuVarint;
                    deleted: MuBoolean;
                    key: MuUTF8;
                    value: MuStruct<{
                        name: MuUTF8;
                        headHash: MuASCII;
                    }>;
                }>>;
                deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
                undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
                sequenceIds: MuArray<MuVarint>;
                sequenceVals: MuArray<MuVarint>;
            }>;
            upsert: MuStruct<{
                id: MuVarint;
                sequence: MuVarint;
                deleted: MuBoolean;
                key: MuUTF8;
                value: MuStruct<{
                    name: MuUTF8;
                    headHash: MuASCII;
                }>;
            }>;
            update: MuStruct<{
                id: MuVarint;
                action: import("@box/mudb/schema").MuUnion<{
                    name: MuUTF8;
                    headHash: MuASCII;
                }>;
            }>;
            move: MuStruct<{
                id: MuVarint;
                sequence: MuVarint;
                key: MuUTF8;
            }>;
            setDeleted: import("@box/mudb/rda/map").MuRDAMapTypes<KeySchema, ValueRDA>["setDeletedActionSchema"];
            noop: import("@box/mudb/schema").MuVoid;
        }>;
        currentBranch: MuUTF8;
    }>;
    groups: import("@box/mudb/schema").MuUnion<{
        reset: MuStruct<{
            upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                id: MuVarint;
                sequence: MuVarint;
                deleted: MuBoolean;
                key: MuUTF8;
                value: MuStruct<{
                    permissions: MuStruct<{
                        publish: MuBoolean;
                        playButton: MuBoolean;
                        debugger: MuBoolean;
                        editScripts: MuBoolean;
                        editProject: MuBoolean;
                        editModel: MuBoolean;
                        editScene: MuBoolean;
                        editFile: MuBoolean;
                        editHierarchy: MuBoolean;
                        editVoxels: MuBoolean;
                        editPermissions: MuBoolean;
                        versionControl: MuBoolean;
                        chatEnabled: MuBoolean;
                        editMarket: MuBoolean;
                        editStatisticsData: MuBoolean;
                        editPublish: MuBoolean;
                        editPlayer: MuBoolean;
                    }>;
                    members: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                        id: MuVarint;
                        sequence: MuVarint;
                        deleted: MuBoolean;
                        key: MuUTF8;
                        value: MuStruct<{
                            addedAt: MuDate;
                        }>;
                    }>>;
                    defaultGroup: MuBoolean;
                }>;
            }>>;
            deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            sequenceIds: MuArray<MuVarint>;
            sequenceVals: MuArray<MuVarint>;
        }>;
        upsert: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            deleted: MuBoolean;
            key: MuUTF8;
            value: MuStruct<{
                permissions: MuStruct<{
                    publish: MuBoolean;
                    playButton: MuBoolean;
                    debugger: MuBoolean;
                    editScripts: MuBoolean;
                    editProject: MuBoolean;
                    editModel: MuBoolean;
                    editScene: MuBoolean;
                    editFile: MuBoolean;
                    editHierarchy: MuBoolean;
                    editVoxels: MuBoolean;
                    editPermissions: MuBoolean;
                    versionControl: MuBoolean;
                    chatEnabled: MuBoolean;
                    editMarket: MuBoolean;
                    editStatisticsData: MuBoolean;
                    editPublish: MuBoolean;
                    editPlayer: MuBoolean;
                }>;
                members: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                    id: MuVarint;
                    sequence: MuVarint;
                    deleted: MuBoolean;
                    key: MuUTF8;
                    value: MuStruct<{
                        addedAt: MuDate;
                    }>;
                }>>;
                defaultGroup: MuBoolean;
            }>;
        }>;
        update: MuStruct<{
            id: MuVarint;
            action: import("@box/mudb/schema").MuUnion<{
                permissions: import("@box/mudb/schema").MuUnion<{
                    publish: MuBoolean;
                    playButton: MuBoolean;
                    debugger: MuBoolean;
                    editScripts: MuBoolean;
                    editProject: MuBoolean;
                    editModel: MuBoolean;
                    editScene: MuBoolean;
                    editFile: MuBoolean;
                    editHierarchy: MuBoolean;
                    editVoxels: MuBoolean;
                    editPermissions: MuBoolean;
                    versionControl: MuBoolean;
                    chatEnabled: MuBoolean;
                    editMarket: MuBoolean;
                    editStatisticsData: MuBoolean;
                    editPublish: MuBoolean;
                    editPlayer: MuBoolean;
                }>;
                members: import("@box/mudb/schema").MuUnion<{
                    reset: MuStruct<{
                        upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                            id: MuVarint;
                            sequence: MuVarint;
                            deleted: MuBoolean;
                            key: MuUTF8;
                            value: MuStruct<{
                                addedAt: MuDate;
                            }>;
                        }>>;
                        deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
                        undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
                        sequenceIds: MuArray<MuVarint>;
                        sequenceVals: MuArray<MuVarint>;
                    }>;
                    upsert: MuStruct<{
                        id: MuVarint;
                        sequence: MuVarint;
                        deleted: MuBoolean;
                        key: MuUTF8;
                        value: MuStruct<{
                            addedAt: MuDate;
                        }>;
                    }>;
                    update: MuStruct<{
                        id: MuVarint;
                        action: import("@box/mudb/schema").MuUnion<{
                            addedAt: import("@box/mudb/schema").MuVoid;
                        }>;
                    }>;
                    move: MuStruct<{
                        id: MuVarint;
                        sequence: MuVarint;
                        key: MuUTF8;
                    }>;
                    setDeleted: import("@box/mudb/rda/map").MuRDAMapTypes<KeySchema, ValueRDA>["setDeletedActionSchema"];
                    noop: import("@box/mudb/schema").MuVoid;
                }>;
                defaultGroup: MuBoolean;
            }>;
        }>;
        move: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            key: MuUTF8;
        }>;
        setDeleted: import("@box/mudb/rda/map").MuRDAMapTypes<KeySchema, ValueRDA>["setDeletedActionSchema"];
        noop: import("@box/mudb/schema").MuVoid;
    }>;
    users: import("@box/mudb/schema").MuUnion<{
        reset: MuStruct<{
            upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                id: MuVarint;
                sequence: MuVarint;
                deleted: MuBoolean;
                key: MuUTF8;
                value: MuStruct<{
                    createdAt: MuDate;
                }>;
            }>>;
            deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            sequenceIds: MuArray<MuVarint>;
            sequenceVals: MuArray<MuVarint>;
        }>;
        upsert: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            deleted: MuBoolean;
            key: MuUTF8;
            value: MuStruct<{
                createdAt: MuDate;
            }>;
        }>;
        update: MuStruct<{
            id: MuVarint;
            action: import("@box/mudb/schema").MuUnion<{
                createdAt: import("@box/mudb/schema").MuVoid;
            }>;
        }>;
        move: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            key: MuUTF8;
        }>;
        setDeleted: import("@box/mudb/rda/map").MuRDAMapTypes<KeySchema, ValueRDA>["setDeletedActionSchema"];
        noop: import("@box/mudb/schema").MuVoid;
    }>;
    collaborators: MuStruct<{
        upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            id: MuVarint;
            deleted: MuBoolean;
            key: MuASCII;
            value: MuUTF8;
        }>>;
        deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
        undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
        moves: MuArray<import("@box/mudb/rda/list").MuRDAListTypes<RDA>["moveActionSchema"]>;
        updates: MuArray<MuStruct<{
            id: MuVarint;
            action: import("@box/mudb/schema").MuVoid;
        }>>;
    }>;
    owner: import("@box/mudb/schema").MuVoid;
    accessLevel: MuSchema<PermissionAccessLevel>;
    banned: import("@box/mudb/schema").MuUnion<{
        reset: MuStruct<{
            upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                id: MuVarint;
                sequence: MuVarint;
                deleted: MuBoolean;
                key: MuUTF8;
                value: MuStruct<{
                    reason: MuUTF8;
                    bannedBy: MuUTF8;
                }>;
            }>>;
            deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            sequenceIds: MuArray<MuVarint>;
            sequenceVals: MuArray<MuVarint>;
        }>;
        upsert: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            deleted: MuBoolean;
            key: MuUTF8;
            value: MuStruct<{
                reason: MuUTF8;
                bannedBy: MuUTF8;
            }>;
        }>;
        update: MuStruct<{
            id: MuVarint;
            action: import("@box/mudb/schema").MuVoid;
        }>;
        move: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            key: MuUTF8;
        }>;
        setDeleted: import("@box/mudb/rda/map").MuRDAMapTypes<KeySchema, ValueRDA>["setDeletedActionSchema"];
        noop: import("@box/mudb/schema").MuVoid;
    }>;
}>;
export declare const PermissionStoreSchema: MuStruct<{
    type: MuUTF8;
    version: MuASCII;
    prevHash: MuASCII;
    timestamp: MuDate;
    versionControl: MuStruct<{
        branches: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            deleted: MuBoolean;
            key: MuUTF8;
            value: MuStruct<{
                name: MuUTF8;
                headHash: MuASCII;
            }>;
        }>>;
        currentBranch: MuUTF8;
    }>;
    groups: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: MuVarint;
        sequence: MuVarint;
        deleted: MuBoolean;
        key: MuUTF8;
        value: MuStruct<{
            permissions: MuStruct<{
                publish: MuBoolean;
                playButton: MuBoolean;
                debugger: MuBoolean;
                editScripts: MuBoolean;
                editProject: MuBoolean;
                editModel: MuBoolean;
                editScene: MuBoolean;
                editFile: MuBoolean;
                editHierarchy: MuBoolean;
                editVoxels: MuBoolean;
                editPermissions: MuBoolean;
                versionControl: MuBoolean;
                chatEnabled: MuBoolean;
                editMarket: MuBoolean;
                editStatisticsData: MuBoolean;
                editPublish: MuBoolean;
                editPlayer: MuBoolean;
            }>;
            members: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                id: MuVarint;
                sequence: MuVarint;
                deleted: MuBoolean;
                key: MuUTF8;
                value: MuStruct<{
                    addedAt: MuDate;
                }>;
            }>>;
            defaultGroup: MuBoolean;
        }>;
    }>>;
    users: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: MuVarint;
        sequence: MuVarint;
        deleted: MuBoolean;
        key: MuUTF8;
        value: MuStruct<{
            createdAt: MuDate;
        }>;
    }>>;
    collaborators: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: MuVarint;
        deleted: MuBoolean;
        key: MuASCII;
        value: MuUTF8;
    }>>;
    owner: MuUTF8;
    accessLevel: MuSchema<PermissionAccessLevel>;
    banned: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: MuVarint;
        sequence: MuVarint;
        deleted: MuBoolean;
        key: MuUTF8;
        value: MuStruct<{
            reason: MuUTF8;
            bannedBy: MuUTF8;
        }>;
    }>>;
}>;
export declare const PermissionActionSequenceSchema: MuArray<import("@box/mudb/schema").MuUnion<{
    type: import("@box/mudb/schema").MuVoid;
    version: import("@box/mudb/schema").MuVoid;
    prevHash: MuASCII;
    timestamp: MuDate;
    versionControl: import("@box/mudb/schema").MuUnion<{
        branches: import("@box/mudb/schema").MuUnion<{
            reset: MuStruct<{
                upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                    id: MuVarint;
                    sequence: MuVarint;
                    deleted: MuBoolean;
                    key: MuUTF8;
                    value: MuStruct<{
                        name: MuUTF8;
                        headHash: MuASCII;
                    }>;
                }>>;
                deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
                undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
                sequenceIds: MuArray<MuVarint>;
                sequenceVals: MuArray<MuVarint>;
            }>;
            upsert: MuStruct<{
                id: MuVarint;
                sequence: MuVarint;
                deleted: MuBoolean;
                key: MuUTF8;
                value: MuStruct<{
                    name: MuUTF8;
                    headHash: MuASCII;
                }>;
            }>;
            update: MuStruct<{
                id: MuVarint;
                action: import("@box/mudb/schema").MuUnion<{
                    name: MuUTF8;
                    headHash: MuASCII;
                }>;
            }>;
            move: MuStruct<{
                id: MuVarint;
                sequence: MuVarint;
                key: MuUTF8;
            }>;
            setDeleted: import("@box/mudb/rda/map").MuRDAMapTypes<KeySchema, ValueRDA>["setDeletedActionSchema"];
            noop: import("@box/mudb/schema").MuVoid;
        }>;
        currentBranch: MuUTF8;
    }>;
    groups: import("@box/mudb/schema").MuUnion<{
        reset: MuStruct<{
            upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                id: MuVarint;
                sequence: MuVarint;
                deleted: MuBoolean;
                key: MuUTF8;
                value: MuStruct<{
                    permissions: MuStruct<{
                        publish: MuBoolean;
                        playButton: MuBoolean;
                        debugger: MuBoolean;
                        editScripts: MuBoolean;
                        editProject: MuBoolean;
                        editModel: MuBoolean;
                        editScene: MuBoolean;
                        editFile: MuBoolean;
                        editHierarchy: MuBoolean;
                        editVoxels: MuBoolean;
                        editPermissions: MuBoolean;
                        versionControl: MuBoolean;
                        chatEnabled: MuBoolean;
                        editMarket: MuBoolean;
                        editStatisticsData: MuBoolean;
                        editPublish: MuBoolean;
                        editPlayer: MuBoolean;
                    }>;
                    members: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                        id: MuVarint;
                        sequence: MuVarint;
                        deleted: MuBoolean;
                        key: MuUTF8;
                        value: MuStruct<{
                            addedAt: MuDate;
                        }>;
                    }>>;
                    defaultGroup: MuBoolean;
                }>;
            }>>;
            deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            sequenceIds: MuArray<MuVarint>;
            sequenceVals: MuArray<MuVarint>;
        }>;
        upsert: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            deleted: MuBoolean;
            key: MuUTF8;
            value: MuStruct<{
                permissions: MuStruct<{
                    publish: MuBoolean;
                    playButton: MuBoolean;
                    debugger: MuBoolean;
                    editScripts: MuBoolean;
                    editProject: MuBoolean;
                    editModel: MuBoolean;
                    editScene: MuBoolean;
                    editFile: MuBoolean;
                    editHierarchy: MuBoolean;
                    editVoxels: MuBoolean;
                    editPermissions: MuBoolean;
                    versionControl: MuBoolean;
                    chatEnabled: MuBoolean;
                    editMarket: MuBoolean;
                    editStatisticsData: MuBoolean;
                    editPublish: MuBoolean;
                    editPlayer: MuBoolean;
                }>;
                members: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                    id: MuVarint;
                    sequence: MuVarint;
                    deleted: MuBoolean;
                    key: MuUTF8;
                    value: MuStruct<{
                        addedAt: MuDate;
                    }>;
                }>>;
                defaultGroup: MuBoolean;
            }>;
        }>;
        update: MuStruct<{
            id: MuVarint;
            action: import("@box/mudb/schema").MuUnion<{
                permissions: import("@box/mudb/schema").MuUnion<{
                    publish: MuBoolean;
                    playButton: MuBoolean;
                    debugger: MuBoolean;
                    editScripts: MuBoolean;
                    editProject: MuBoolean;
                    editModel: MuBoolean;
                    editScene: MuBoolean;
                    editFile: MuBoolean;
                    editHierarchy: MuBoolean;
                    editVoxels: MuBoolean;
                    editPermissions: MuBoolean;
                    versionControl: MuBoolean;
                    chatEnabled: MuBoolean;
                    editMarket: MuBoolean;
                    editStatisticsData: MuBoolean;
                    editPublish: MuBoolean;
                    editPlayer: MuBoolean;
                }>;
                members: import("@box/mudb/schema").MuUnion<{
                    reset: MuStruct<{
                        upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                            id: MuVarint;
                            sequence: MuVarint;
                            deleted: MuBoolean;
                            key: MuUTF8;
                            value: MuStruct<{
                                addedAt: MuDate;
                            }>;
                        }>>;
                        deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
                        undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
                        sequenceIds: MuArray<MuVarint>;
                        sequenceVals: MuArray<MuVarint>;
                    }>;
                    upsert: MuStruct<{
                        id: MuVarint;
                        sequence: MuVarint;
                        deleted: MuBoolean;
                        key: MuUTF8;
                        value: MuStruct<{
                            addedAt: MuDate;
                        }>;
                    }>;
                    update: MuStruct<{
                        id: MuVarint;
                        action: import("@box/mudb/schema").MuUnion<{
                            addedAt: import("@box/mudb/schema").MuVoid;
                        }>;
                    }>;
                    move: MuStruct<{
                        id: MuVarint;
                        sequence: MuVarint;
                        key: MuUTF8;
                    }>;
                    setDeleted: import("@box/mudb/rda/map").MuRDAMapTypes<KeySchema, ValueRDA>["setDeletedActionSchema"];
                    noop: import("@box/mudb/schema").MuVoid;
                }>;
                defaultGroup: MuBoolean;
            }>;
        }>;
        move: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            key: MuUTF8;
        }>;
        setDeleted: import("@box/mudb/rda/map").MuRDAMapTypes<KeySchema, ValueRDA>["setDeletedActionSchema"];
        noop: import("@box/mudb/schema").MuVoid;
    }>;
    users: import("@box/mudb/schema").MuUnion<{
        reset: MuStruct<{
            upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                id: MuVarint;
                sequence: MuVarint;
                deleted: MuBoolean;
                key: MuUTF8;
                value: MuStruct<{
                    createdAt: MuDate;
                }>;
            }>>;
            deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            sequenceIds: MuArray<MuVarint>;
            sequenceVals: MuArray<MuVarint>;
        }>;
        upsert: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            deleted: MuBoolean;
            key: MuUTF8;
            value: MuStruct<{
                createdAt: MuDate;
            }>;
        }>;
        update: MuStruct<{
            id: MuVarint;
            action: import("@box/mudb/schema").MuUnion<{
                createdAt: import("@box/mudb/schema").MuVoid;
            }>;
        }>;
        move: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            key: MuUTF8;
        }>;
        setDeleted: import("@box/mudb/rda/map").MuRDAMapTypes<KeySchema, ValueRDA>["setDeletedActionSchema"];
        noop: import("@box/mudb/schema").MuVoid;
    }>;
    collaborators: MuStruct<{
        upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            id: MuVarint;
            deleted: MuBoolean;
            key: MuASCII;
            value: MuUTF8;
        }>>;
        deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
        undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
        moves: MuArray<import("@box/mudb/rda/list").MuRDAListTypes<RDA>["moveActionSchema"]>;
        updates: MuArray<MuStruct<{
            id: MuVarint;
            action: import("@box/mudb/schema").MuVoid;
        }>>;
    }>;
    owner: import("@box/mudb/schema").MuVoid;
    accessLevel: MuSchema<PermissionAccessLevel>;
    banned: import("@box/mudb/schema").MuUnion<{
        reset: MuStruct<{
            upserts: import("@box/mudb/schema").MuSortedArray<MuStruct<{
                id: MuVarint;
                sequence: MuVarint;
                deleted: MuBoolean;
                key: MuUTF8;
                value: MuStruct<{
                    reason: MuUTF8;
                    bannedBy: MuUTF8;
                }>;
            }>>;
            deletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            undeletes: import("@box/mudb/schema").MuSortedArray<MuVarint>;
            sequenceIds: MuArray<MuVarint>;
            sequenceVals: MuArray<MuVarint>;
        }>;
        upsert: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            deleted: MuBoolean;
            key: MuUTF8;
            value: MuStruct<{
                reason: MuUTF8;
                bannedBy: MuUTF8;
            }>;
        }>;
        update: MuStruct<{
            id: MuVarint;
            action: import("@box/mudb/schema").MuVoid;
        }>;
        move: MuStruct<{
            id: MuVarint;
            sequence: MuVarint;
            key: MuUTF8;
        }>;
        setDeleted: import("@box/mudb/rda/map").MuRDAMapTypes<KeySchema, ValueRDA>["setDeletedActionSchema"];
        noop: import("@box/mudb/schema").MuVoid;
    }>;
}>>;
export type Permissions = typeof PermissionsSchema.identity;
export type PermissionAction = typeof PermissionActionSchema.identity;
export declare const PermissionTokenSchema: MuStruct<{
    expireAt: MuDate;
    group: MuUTF8;
}>;
export type PermissionToken = typeof PermissionTokenSchema.identity;
export declare function combinePermissionSet(target: PermissionSet, other: PermissionSet): void;
export declare const OWNER_PERMISSIONS: import("@box/mudb/schema/struct").Struct<{
    publish: MuBoolean;
    playButton: MuBoolean;
    debugger: MuBoolean;
    editScripts: MuBoolean;
    editProject: MuBoolean;
    editModel: MuBoolean;
    editScene: MuBoolean;
    editFile: MuBoolean;
    editHierarchy: MuBoolean;
    editVoxels: MuBoolean;
    editPermissions: MuBoolean;
    versionControl: MuBoolean;
    chatEnabled: MuBoolean;
    editMarket: MuBoolean;
    editStatisticsData: MuBoolean;
    editPublish: MuBoolean;
    editPlayer: MuBoolean;
}>;
//# sourceMappingURL=permission-rda.d.ts.map