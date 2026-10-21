import {
  MuStruct,
  MuFloat64,
  MuBoolean,
  MuArray,
  MuVarint,
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
  REGLViewportSchema,
  REGLFramebuffer2DSchema,
  REGLTexture2DSchema,
} from '../../utils/regl-schema';
import { GLTextureSchema } from './gl-texture';

export const GLShadowMapSchema = new MuStruct({
  shadowViewport: REGLViewportSchema,
  zRange: Vec2Schema,

  fbo: REGLFramebuffer2DSchema,
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

export type GLShadowMap = typeof GLShadowMapSchema.identity;

export const GLBakeShadowMapSchema = new MuStruct({
  shadowViewport: REGLViewportSchema,
  fbo: REGLFramebuffer2DSchema,

  shadowViewMatrix: Mat4Schema,
  shadowProjMatrix: Mat4Schema,
  shadowViewProjMatrix: Mat4Schema,
  invShadowViewProjMatrix: Mat4Schema,
  shadowNormalMatrix: Mat3Schema,
  shaderBounds: Vec4Schema,

  frustum: FrustumSchema,
});

export type GLBakeShadowMap = typeof GLBakeShadowMapSchema.identity;
export const BakeCascadeSchema = new MuArray(GLBakeShadowMapSchema, Infinity);

export const GLShadowStateSchema = new MuStruct({
  supported: new MuBoolean(true),
  enable: new MuBoolean(true),
  enableBakedShadow: new MuBoolean(true),

  // 生成阴影烘焙图用的数据
  bakeShadowMap: REGLFramebuffer2DSchema,
  bakeShadowMapTexture: REGLTexture2DSchema,
  bakeCascade: BakeCascadeSchema,
  /**
   * 太阳光角度不一致的时候，需要的阴影偏移（shadow bias）比例
   */
  bakeZScaleRatio: new MuFloat32(),

  // 渲染阴影烘焙图
  bakedShadowTexture: GLTextureSchema,
  bakedDataHash: new MuASCII(),
  bakedDataTexture: REGLTexture2DSchema,
  bakeChunkShift: new MuVarint(),
  /***
   * 当前bake数据需要的要的阴影偏移（shadow bias）比例
   */
  bakedZRatio: new MuFloat32(),
  chunkDimX: new MuVarint(),
  chunkDimY: new MuVarint(),
  chunkDimZ: new MuVarint(),

  shadowView: Mat4Schema,

  shadowMap: REGLFramebuffer2DSchema,
  shadowMapTexture: REGLTexture2DSchema,

  cascade: new MuArray(GLShadowMapSchema, Infinity, [
    GLShadowMapSchema.clone(GLShadowMapSchema.identity),
    GLShadowMapSchema.clone(GLShadowMapSchema.identity),
    GLShadowMapSchema.clone(GLShadowMapSchema.identity),
    GLShadowMapSchema.clone(GLShadowMapSchema.identity),
  ]),
  cascadeZ: new MuArray(new MuFloat64(), Infinity, [1, 2, 3, 4, 5]),
  cascadeSplits: Vec3Schema,
});

export type ShadowState = typeof GLShadowStateSchema.identity;
