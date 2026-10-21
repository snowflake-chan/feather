import { IREWGPUSampler, REWGPUType } from './interface';
export declare class SamplerManager {
    private device;
    constructor(device: GPUDevice);
    private samplerCount;
    private samplerSet;
    create(descriptor?: GPUSamplerDescriptor): REWGPUSampler;
    destroy(): void;
}
declare class REWGPUSampler implements IREWGPUSampler {
    private cache;
    id: number;
    sampler?: GPUSampler | undefined;
    readonly type = REWGPUType.Sampler;
    constructor(cache: Map<number, REWGPUSampler>, id: number, sampler?: GPUSampler | undefined);
    destroy(): void;
}
export {};
