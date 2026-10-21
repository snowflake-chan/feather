import { REWGPUObject, IREWGPUBuffer, IREWGPUTexture, IREWGPUSampler, IREWGPUCube } from './interface';
export declare function isREWGPUBuffer(object: REWGPUObject): object is IREWGPUBuffer;
export declare function isREWGPUTexture(object: REWGPUObject): object is IREWGPUTexture;
export declare function isREWGPUCube(object: REWGPUObject): object is IREWGPUCube;
export declare function isREWGPUSampler(object: REWGPUObject): object is IREWGPUSampler;
