import { ContentServer, OssCdnPath } from '.';
import { MuSchema } from '@box/mudb/schema';
import { ImageRequest, RetrieveImageFunction } from './image';
import { DataRequest } from './data';
import { LoadingController } from '@box/utils/loading/loading-controller';
export declare function isAbsoluteContentURL(hashOrURL: string): boolean;
export declare function resolveContentURL(hashOrURL: string, urlPrefix: string): string;
export type PrefetchCachesType = {
    xhr: {
        [hash: string]: DataRequest;
    };
    images: {
        [hash: string]: ImageRequest;
    };
};
export declare class ContentResolver {
    private _contentServer?;
    private _ossContentServer?;
    private _content;
    private _ossContent;
    private _images;
    private _cacheIPFS;
    private _urlPrefix;
    cdnPath: string;
    ossCdnURL: string;
    avatarCdnURL?: string;
    loadingController: LoadingController | null;
    constructor(spec: {
        cacheIPFS: boolean;
        cdnPath: string;
        ossCdnURL: string;
        avatarCdnURL?: string;
        contentServer?: ContentServer;
        ossContentServer?: ContentServer;
        loadingController?: LoadingController;
    });
    setPrefetchCaches(prefetchCache: Partial<PrefetchCachesType>): void;
    private _createRequest;
    retrieve(hash: string): Promise<Uint8Array | void>;
    retrieveFromS3(hashOrURL: string, options?: {
        ossCdnPath?: OssCdnPath;
    }): Promise<Uint8Array | void>;
    fetchSchema<T>(schema: MuSchema<T>, hash: string): Promise<T | void>;
    fetchImage(hashOrURL: string, retrieveFunction?: RetrieveImageFunction): ImageRequest;
    removeImageCache(hashOrURL: string): void;
    storeImageBuffer: (raw: ArrayBuffer, extension: string) => Promise<string>;
    storeProjectDataDirectly: (prjectDataJSON: string) => Promise<string>;
    storeImageFile: (file: File) => Promise<string>;
    store(raw: Uint8Array): Promise<string>;
    destroy(): void;
}
