import { MuBoolean, MuStruct, MuUint32 } from '@box/mudb/schema';
import {
  REWGPUSchema,
  REWGPUTexture2DSchema,
  REWGPUIndexBufferDesSchema,
  REWGPUSamplerSchema,
  REWGPUBufferSchema,
  REWGPUGroupSchema,
  REWGPUBindGroupLayoutSchema,
} from '../../utils/rewgpu-schema';
import { GPUOverlaySchema } from './gpu-overlay';

export const GPUStateSchema = new MuStruct({
  rewgpu: REWGPUSchema,

  useOIT: new MuBoolean(false),

  target: REWGPUTexture2DSchema,
  depth: REWGPUTexture2DSchema,
  transparentTarget: REWGPUTexture2DSchema,
  transparentDepth: REWGPUTexture2DSchema,
  oitNodesBufferSize: new MuUint32(),
  oitStaticNodeBuffer0: REWGPUBufferSchema,
  oitOffsetBuffer0: REWGPUBufferSchema,

  oitStaticNodeBuffer1: REWGPUBufferSchema,
  oitOffsetBuffer1: REWGPUBufferSchema,

  oitStaticNodeBuffer2: REWGPUBufferSchema,
  oitOffsetBuffer2: REWGPUBufferSchema,

  targetSizeDirty: new MuBoolean(true),

  sampler: REWGPUSamplerSchema,
  linearSampler: REWGPUSamplerSchema,
  linearRepeatSampler: REWGPUSamplerSchema,

  smallIndexBuffer: REWGPUIndexBufferDesSchema,
  bigIndexBuffer: REWGPUIndexBufferDesSchema,

  emptyShadowTexture: REWGPUTexture2DSchema,
  emptyBuffer: REWGPUBufferSchema,
  emptyBakedShadowTexture: REWGPUTexture2DSchema,
  emptyBakedBuffer: REWGPUBufferSchema,
  emptyTexture: REWGPUTexture2DSchema,
  emptyVertexBuffer: REWGPUBufferSchema,

  mesh: new MuStruct({
    commonGroup: REWGPUGroupSchema,
    commonTransparentGroup: REWGPUGroupSchema,
    nodesGroupLayout: REWGPUBindGroupLayoutSchema,
    nodesTextureGroupLayout: REWGPUBindGroupLayoutSchema,
  }),
  voxel: new MuStruct({
    commonGroup: REWGPUGroupSchema,
    commonTransparentGroup: REWGPUGroupSchema,
    fluidCommonGroup: REWGPUGroupSchema,
  }),
  modelTextureGroupLayout: REWGPUBindGroupLayoutSchema,

  overlay: GPUOverlaySchema,
});

export type GPUState = typeof GPUStateSchema.identity;
