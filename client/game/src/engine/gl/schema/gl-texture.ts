import {
  MuStruct,
  MuArray,
  MuVarint,
  MuASCII,
  MuBoolean,
  MuFloat64,
  MuSchema,
} from '@box/mudb/schema';
import { HashSchema } from '@box/schema/content-server/index';
import {
  REGLTexture2DSchema,
  REGLTextureCubeSchema,
} from '../../utils/regl-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { RenderableType } from '../../mesh/parse/mesh-schema';

export const GLTextureSchema = new MuStruct({
  renderableType: <MuSchema<RenderableType>>(
    new MuVarint(RenderableType.GLTexture)
  ),
  radius: new MuVarint(256),
  min: new MuASCII('linear'),
  mag: new MuASCII('linear'),
  wrap: new MuASCII('clamp'),
  format: new MuASCII('rgba'),
  hashes: new MuArray(HashSchema, Infinity),
  mipmap: new MuRefSchema<(HTMLImageElement | ImageBitmap)[]>(),
  faces: new MuRefSchema<(HTMLImageElement | ImageBitmap)[]>(),
  data: new MuRefSchema<HTMLImageElement | ImageBitmap>(),
  texture: REGLTexture2DSchema,
  cube: REGLTextureCubeSchema,
  premultiplyAlpha: new MuBoolean(false),
  width: new MuFloat64(0),
  height: new MuFloat64(0),
});

export type GLTexture = typeof GLTextureSchema.identity;
