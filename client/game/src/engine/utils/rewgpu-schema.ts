// Hacks to get typescript interface into webgpu/rewgpu
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import type {
  IREWGPUBuffer,
  IREWGPUCube,
  IREWGPUGroup,
  IREWGPUSampler,
  IREWGPUTexture,
  IndexBufferDescriptor,
  ReWGPU,
} from '@box/rewgpu';

export const REWGPUSchema = new MuRefSchema<ReWGPU>();
export const REWGPUTexture2DSchema = new MuRefSchema<IREWGPUTexture>();
export const REWGPUCubeSchema = new MuRefSchema<IREWGPUCube>();
export const REWGPUBufferSchema = new MuRefSchema<IREWGPUBuffer>();
export const REWGPUSamplerSchema = new MuRefSchema<IREWGPUSampler>();
export const REWGPUPipelineSchema = new MuRefSchema<GPURenderPipeline>();
export const REWGPUGroupSchema = new MuRefSchema<IREWGPUGroup>();
export const REWGPUIndexBufferDesSchema =
  new MuRefSchema<IndexBufferDescriptor>();
export const REWGPUBindGroupLayoutSchema =
  new MuRefSchema<GPUBindGroupLayout>();
