import {
  MuStruct,
  MuBoolean,
  MuUTF8,
  MuArray,
  MuUint32,
  MuFloat32,
} from '@box/mudb/schema';
import {
  REGLFramebuffer2DSchema,
  REGLTexture2DSchema,
} from '../../utils/regl-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { Vec2Schema } from '@box/schema/utils/math-schema';

export const GLPostSchema = new MuStruct({
  // If set, use post processing
  enabled: new MuBoolean(false),
  supported: new MuBoolean(true),
  fbo: REGLFramebuffer2DSchema,
  fboColor: REGLTexture2DSchema,
  fboDepth: REGLTexture2DSchema,

  // If true, then support post processing on hardware
  fxaaEnabled: new MuBoolean(false),
  fxaaFBO: REGLFramebuffer2DSchema,
  fxaaColor: REGLTexture2DSchema,

  // Blur
  blurEnabled: new MuBoolean(false),
  blurScale: new MuUint32(4), // must be integer power of 2
  blurBuffers: new MuArray(REGLFramebuffer2DSchema, Infinity),
  blurShape: Vec2Schema,

  // Volumetric scattering
  scatteringEnabled: new MuBoolean(false),
  scatteringBuffer: REGLFramebuffer2DSchema,

  // Color grading lookup table stuff
  lutURL: new MuUTF8(''),
  lutEnabled: new MuBoolean(true),
  lutSupported: new MuBoolean(true),
  lut: REGLTexture2DSchema,
  lutImage: new MuRefSchema<HTMLImageElement>(),

  // SSAO
  ssaoEnabled: new MuBoolean(true),
  ssaoRadius: new MuFloat32(0.0478153),
  ssaoBias: new MuFloat32(0.0021426),
  ssaoStrength: new MuFloat32(1.5),
  ssaoDistance: new MuFloat32(80),
  ssaoBuffer: REGLFramebuffer2DSchema,
});
