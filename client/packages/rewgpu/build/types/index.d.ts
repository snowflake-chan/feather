import { GPUConfig, ReWGPU } from './interface';
export * from './interface';
export declare function createREWGPU(canvas: HTMLCanvasElement, config?: GPUConfig): Promise<ReWGPU>;
export declare function initWebGPU(): Promise<GPUConfig>;
