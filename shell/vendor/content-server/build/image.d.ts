export declare function getImageExtension(filename: string): string;
export declare function isBase64(b64: string): boolean;
export declare function getB64Type(b64: string): string;
export declare function fetchImageBitmap(input: RequestInfo, init?: RequestInit): Promise<ImageBitmap>;
export interface ImageRequest {
    image: HTMLImageElement | ImageBitmap | null;
    loaded: boolean;
    error: boolean;
}
export type RetrieveImageFunction = (out: ImageRequest, url: string) => Promise<ImageRequest>;
export declare function retrieveImage(out: ImageRequest, url: string): Promise<ImageRequest>;
export declare function retrieveWithImage(out: ImageRequest, url: string): Promise<ImageRequest>;
