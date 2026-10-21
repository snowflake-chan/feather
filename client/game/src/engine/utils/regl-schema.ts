// Hacks to get typescript interface into webgl/regl state.  Kind of gross
import REGL from 'regl';
import { MuStruct, MuFloat64 } from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { REGLLoader } from '../gl/regl';

export const REGLSchema = new MuRefSchema<REGL.Regl>();
export const REGLLoaderSchema = new MuRefSchema<REGLLoader>();

export const REGLFramebufferCubeSchema =
  new MuRefSchema<REGL.FramebufferCube>();
export const REGLFramebuffer2DSchema = new MuRefSchema<REGL.Framebuffer2D>();
export const REGLTexture2DSchema = new MuRefSchema<REGL.Texture2D>();
export const REGLTextureCubeSchema = new MuRefSchema<REGL.TextureCube>();
export const REGLBufferSchema = new MuRefSchema<REGL.Buffer>();
export const REGLElementSchema = new MuRefSchema<REGL.Elements>();
export const REGLVAOSchema = new MuRefSchema<REGL.VertexArrayObject>();

export const REGLViewportSchema = new MuStruct({
  x: new MuFloat64(0),
  y: new MuFloat64(0),
  width: new MuFloat64(1),
  height: new MuFloat64(1),
});

export type REGLViewport = typeof REGLViewportSchema.identity;
