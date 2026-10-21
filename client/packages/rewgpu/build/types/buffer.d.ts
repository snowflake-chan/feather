import { BufferDescriptor, IREWGPUBuffer, REWGPUType } from './interface';
export declare class BufferManager {
    private device;
    constructor(device: GPUDevice);
    private bufferCount;
    private bufferSet;
    private dynamicBufferSet;
    create(descriptor: BufferDescriptor): REWGPUBuffer;
    update(): void;
    destroy(): void;
}
declare class REWGPUBuffer implements IREWGPUBuffer {
    private device;
    private cache;
    id: number;
    buffer?: GPUBuffer | undefined;
    data?: (SharedArrayBuffer | BufferSource) | undefined;
    readonly type = REWGPUType.Buffer;
    groupSize?: number;
    constructor(device: GPUDevice, cache: Map<number, REWGPUBuffer>, id: number, buffer?: GPUBuffer | undefined, data?: (SharedArrayBuffer | BufferSource) | undefined);
    update(data: SharedArrayBuffer | BufferSource, bufferOffset?: number, dataOffset?: number, size?: number): void;
    destroy(): void;
}
export {};
