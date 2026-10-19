export interface ContentCache {
    putCache: (hash: string, data: Uint8Array, needCopy: boolean) => void;
    getCache: (hash: string) => Uint8Array | undefined;
}
export declare function copyContent(array: Uint8Array): Uint8Array;
export declare class LruContentCache implements ContentCache {
    private hashing;
    private lru;
    constructor(capacity: number);
    putCache(hash: string, data: Uint8Array, needCopy: boolean): void;
    getCache(hash: string): Uint8Array | undefined;
    purge(): void;
}
export declare const DEFAULT_CONTENT_CACHE: LruContentCache;
