import { ContentCache } from './content-cache';
export declare const DEFAULT_ARENA_DATA_BYTES: number;
export declare const DEFAULT_ARENA_ENTRIES = 16384;
export interface SharedArenaSpec {
    data: SharedArrayBuffer;
    index: SharedArrayBuffer;
    control: SharedArrayBuffer;
}
export interface SharedArenaUsage {
    usedBytes: number;
    capacityBytes: number;
    entries: number;
    entryCapacity: number;
    rejected: number;
}
export interface SharedArenaStats extends SharedArenaUsage {
    localEntries: number;
}
export declare function createSharedArenaSpec(options?: {
    dataBytes?: number;
    entries?: number;
}): SharedArenaSpec;
export declare function readSharedArenaUsage(spec: SharedArenaSpec): SharedArenaUsage;
export declare class SharedArenaContentCache implements ContentCache {
    private readonly _spec;
    private readonly _data;
    private readonly _ctrl;
    private readonly _words;
    private readonly _bytes;
    private readonly _entryCapacity;
    private readonly _local;
    constructor(spec: SharedArenaSpec);
    putCache(hash: string, data: Uint8Array, _needCopy?: boolean): void;
    getCache(hash: string): Uint8Array | undefined;
    stats(): SharedArenaStats;
    private _view;
    private _findInShared;
    private _reserve;
    private _claimSlot;
}
export declare function installSharedContentArena(spec: SharedArenaSpec): SharedArenaContentCache;
