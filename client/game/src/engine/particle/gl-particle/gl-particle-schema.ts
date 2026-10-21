import { MuStruct } from '@box/mudb/schema';
import { REGLBufferSchema, REGLVAOSchema } from '../../utils/regl-schema';

export const GLParticleSchema = new MuStruct({
  particleBackBuffer: REGLBufferSchema,
  particleBackVAO: REGLVAOSchema,

  particleBuffer: REGLBufferSchema,
  particleVAO: REGLVAOSchema,
});
