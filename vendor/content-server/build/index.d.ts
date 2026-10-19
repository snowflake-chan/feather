import { MuASCII } from '@box/mudb/schema';
export declare const HashSchema: MuASCII;
export type Hash = typeof HashSchema.identity;
export interface ContentServer {
    init(): Promise<void>;
    store(content: Uint8Array, options?: {
        ossStoreType?: OssStoreType;
    }): Promise<Hash>;
    retrieve(hash: Hash, options?: {
        ossCdnPath?: OssCdnPath;
    }): Promise<Uint8Array | undefined>;
}
export type OssCdnPath = '/engine/m/' | '/avatar/m/' | '/engine/s/' | '/tmp/' | '/engine/rusty/';
export declare const DEFAULT_OSS_CDN_PATH: OssCdnPath;
export declare const SCRIPT_OSS_CDN_PATH: OssCdnPath;
export declare const TEMP_OSS_CDN_PATH: OssCdnPath;
export declare const RUSTY_OSS_CDN_PATH: OssCdnPath;
export declare enum OssStoreType {
    Script = "script",
    Model = "model",
    Temp = "tmp",
    Rusty = "rusty"
}
