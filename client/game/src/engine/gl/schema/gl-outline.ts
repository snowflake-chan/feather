import { MuStruct, MuBoolean } from '@box/mudb/schema';
import {
  REGLFramebuffer2DSchema,
  REGLTexture2DSchema,
} from '../../utils/regl-schema';

export const GLOutlineStateSchema = new MuStruct({
  supported: new MuBoolean(true),

  outlineFbo: REGLFramebuffer2DSchema,
  outlineDepth: REGLTexture2DSchema,
});

export type OutlineState = typeof GLOutlineStateSchema.identity;
