import {
  MuStruct,
  MuFloat64,
  MuBoolean,
  MuArray,
  MuUint32,
  MuUint8,
  MuASCII,
  MuFloat32,
} from '@box/mudb/schema';
import {
  Vec2Schema,
  Mat4Schema,
  Vec4Schema,
  Vec3Schema,
  Mat3Schema,
} from '@box/schema/utils/math-schema';
import { FrustumSchema } from '@box/schema/utils/frustum-schema';
import {
  REWGPUBindGroupLayoutSchema,
  REWGPUBufferSchema,
  REWGPUGroupSchema,
  REWGPUTexture2DSchema,
} from 'src/engine/utils/rewgpu-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';

export const ViewportSchema = new MuStruct({
  x: new MuFloat64(0),
  y: new MuFloat64(0),
  width: new MuFloat64(1),
  height: new MuFloat64(1),
});

export const GPUShadowMapSchema = new MuStruct({
  shadowViewport: ViewportSchema,
  zRange: Vec2Schema,

  scaledZRange: Vec2Schema,

  clippedCameraProj: Mat4Schema,
  cameraViewProj: Mat4Schema,
  invCameraViewProj: Mat4Schema,
  cameraFrustum: FrustumSchema,

  shadowViewMatrix: Mat4Schema,
  shadowProjMatrix: Mat4Schema,
  shadowViewProjMatrix: Mat4Schema,
  invShadowViewProjMatrix: Mat4Schema,
  prevShadowViewProjMatrix: Mat4Schema,
  shadowNormalMatrix: Mat3Schema,

  uvBounds: Vec4Schema,
  shaderBounds: Vec4Schema,

  frustum: FrustumSchema,
});

export type GPUShadowMap = typeof GPUShadowMapSchema.identity;

export const CascadeSchema = new MuArray(GPUShadowMapSchema, Infinity, [
  GPUShadowMapSchema.clone(GPUShadowMapSchema.identity),
  GPUShadowMapSchema.clone(GPUShadowMapSchema.identity),
  GPUShadowMapSchema.clone(GPUShadowMapSchema.identity),
  GPUShadowMapSchema.clone(GPUShadowMapSchema.identity),
]);

export type Cascade = typeof CascadeSchema.identity;

export const GPUBakeShadowMapSchema = new MuStruct({
  shadowViewport: ViewportSchema,

  shadowViewMatrix: Mat4Schema,
  shadowProjMatrix: Mat4Schema,
  shadowViewProjMatrix: Mat4Schema,
  invShadowViewProjMatrix: Mat4Schema,
  shadowNormalMatrix: Mat3Schema,
  shaderBounds: Vec4Schema,

  frustum: FrustumSchema,
});

export type GPUBakeShadowMap = typeof GPUBakeShadowMapSchema.identity;
export const BakeCascadeSchema = new MuArray(GPUBakeShadowMapSchema, Infinity);

export type BakeCascade = typeof BakeCascadeSchema.identity;

export const GPUShadowStateSchema = new MuStruct({
  enable: new MuBoolean(true),
  enableBakedShadow: new MuBoolean(true),

  // 生成阴影烘焙图用的数据
  bakeContext: new MuRefSchema<GPUCanvasContext>(),
  bakeShadowMapDepth: REWGPUTexture2DSchema,
  bakeCascade: BakeCascadeSchema,
  /**
   * 太阳光角度不一致的时候，需要的阴影偏移（shadow bias）比例
   */
  bakeZScaleRatio: new MuFloat32(),

  // 渲染阴影烘焙图
  bakedShadowTexture: REWGPUTexture2DSchema,
  bakedShadowData: REWGPUBufferSchema,
  bakedTextureHash: new MuASCII(),
  bakedDataHash: new MuASCII(),
  /***
   * 当前bake数据需要的要的阴影偏移（shadow bias）比例
   */
  bakedZRatio: new MuFloat32(),
  bakedShadowMapDirty: new MuBoolean(true),

  shadowView: Mat4Schema,

  shadowMapDepth: REWGPUTexture2DSchema,
  shadowMapTarget: REWGPUTexture2DSchema,
  /**
   * 当前使用缓存阴影深度图的idx
   * 阴影深度图一共四张，只有最后两张交替渲染
   * 即：
   * 当useCacheIdx为 1 时，渲染第三张深度图，第四张使用缓存
   * 当useCacheIdx为 0 时，渲染第四张深度图，第三张使用缓存
   */
  useCacheIdx: new MuUint8(1),

  cascade: CascadeSchema,
  cascadeZ: new MuArray(new MuFloat64(), Infinity, [1, 2, 3, 4, 5]),
  cascadeSplits: Vec3Schema,

  shadowViewProjectionBuffer: REWGPUBufferSchema,
  shadowViewProjectionGroup: REWGPUGroupSchema,
  shadowViewProjectionLayout: REWGPUBindGroupLayoutSchema,

  // 存储了阴影计算的相关数据，对应shadow-struct中的ShadowData
  shadowDataBuffer: REWGPUBufferSchema,

  shadowMapSize: new MuUint32(0),
  shadowMapDirty: new MuBoolean(true),
});

export type GPUShadowState = typeof GPUShadowStateSchema.identity;
