import REGL from 'regl';
import { MuStruct } from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { EnvironmentStateSchema } from '@box/schema/environment/environment-schema';
import { GLTextureSchema } from '../gl/schema/gl-texture';

export const GLSkySchema = new MuStruct({
  lastSkyState: EnvironmentStateSchema,

  nightSampler: GLTextureSchema,
  noiseSampler: GLTextureSchema,
  cloudSamplerCube: GLTextureSchema,
  envMap: new MuRefSchema<REGL.Framebuffer2D>(),

  snowTexture: GLTextureSchema,
});

export type GLSky = typeof GLSkySchema.identity;
