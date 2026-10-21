import { IREWGPUTexture, TextureDescriptor, REWGPUType, TextureData, CubeDescriptor, IREWGPUCube, CubeData } from './interface';
export declare class TextureManager {
    private device;
    constructor(device: GPUDevice);
    private textureCount;
    private textureSet;
    private cubeCount;
    private cubeSet;
    create(descriptor: TextureDescriptor): REWGPUTexture;
    createCube(descriptor: CubeDescriptor): REWGPUCube;
    destroy(): void;
}
declare class REWGPUTexture implements IREWGPUTexture {
    private device;
    private cache;
    id: number;
    texture?: GPUTexture | undefined;
    readonly type = REWGPUType.Texture;
    constructor(device: GPUDevice, cache: Map<number, REWGPUTexture>, id: number, texture?: GPUTexture | undefined);
    update(data: TextureData, options?: {
        size?: GPUExtent3DStrict;
        dataLayout?: GPUImageDataLayout;
        origin?: GPUOrigin3D;
        mipLevel?: GPUIntegerCoordinate;
    }): void;
    destroy(): void;
}
declare class REWGPUCube implements IREWGPUCube {
    private device;
    private cache;
    id: number;
    texture?: GPUTexture | undefined;
    readonly type = REWGPUType.Cube;
    constructor(device: GPUDevice, cache: Map<number, REWGPUCube>, id: number, texture?: GPUTexture | undefined);
    update(data: CubeData, options?: {
        size?: GPUExtent3DStrict;
        dataLayout?: GPUImageDataLayout;
        mipLevel?: GPUIntegerCoordinate;
    }): void;
    destroy(): void;
}
export {};
