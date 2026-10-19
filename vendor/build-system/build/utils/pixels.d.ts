export interface NDArrayLikeImage {
    data: Uint8Array;
    shape: number[];
    stride: number[];
    offset: number;
}
export declare function alloc(w: any, h: any): NDArrayLikeImage;
export declare function readPixels(imgPath: string): Promise<void | NDArrayLikeImage>;
export declare function writePixels(imgPath: string, pixels: NDArrayLikeImage): void;
//# sourceMappingURL=pixels.d.ts.map