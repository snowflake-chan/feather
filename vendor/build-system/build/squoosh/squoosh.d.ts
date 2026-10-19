import { PreprocessorName, PreprocessorOption, CodecName, CodecOption } from './codecs';
import { ContentServer } from '@box/content-server';
export declare function preprocessImage<P extends PreprocessorName>(spec: {
    content: ContentServer;
    data: Uint8ClampedArray;
    width: number;
    height: number;
    preprocessor: P;
    options?: Partial<PreprocessorOption[P]>;
}): Promise<import("./image_data").default>;
export declare function decodeImage(spec: {
    content: ContentServer;
    hash: string;
}): Promise<import("./image_data").default | null>;
export declare function encodeImage<C extends CodecName>(spec: {
    content: ContentServer;
    data: Uint8ClampedArray;
    width: number;
    height: number;
    codec: C;
    options?: Partial<CodecOption[C]>;
}): Promise<string>;
//# sourceMappingURL=squoosh.d.ts.map