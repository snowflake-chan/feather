import { IREWGPUGroup, REWGPUType, GroupDescriptor } from './interface';
export declare class GroupManager {
    private device;
    constructor(device: GPUDevice);
    private groupCount;
    private groupSet;
    private tempEntries;
    create(descriptor: GroupDescriptor): REWGPUGroup;
    destroy(): void;
}
declare class REWGPUGroup implements IREWGPUGroup {
    private cache;
    id: number;
    group?: GPUBindGroup | undefined;
    readonly type = REWGPUType.Group;
    dynamicOffsets?: number[];
    constructor(cache: Map<number, REWGPUGroup>, id: number, group?: GPUBindGroup | undefined);
    destroy(): void;
}
export {};
