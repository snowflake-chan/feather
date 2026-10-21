import {
  MuStruct,
  MuDictionary,
  MuASCII,
  MuFloat64,
  MuSchema,
  MuUint8,
} from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import type { ParsedGLTFMesh } from '../mesh/gltf/interfaces';

export enum ImageStatus {
  Loading,
  Error,
}

export const ImageResourceSchema = new MuStruct({
  /**
   * 图片本身的hash
   */
  hash: new MuASCII(),
  /*
   * 图片的宽
   */
  width: new MuFloat64(),
  /**
   * 图片的高
   */
  height: new MuFloat64(),
  /**
   * 图片元素
   */
  element: new MuRefSchema<HTMLImageElement | ImageBitmap>(),
  /**
   * 图片加载状态
   */
  status: <MuSchema<ImageStatus>>new MuUint8(ImageStatus.Loading),
});

export type ImageResource = typeof ImageResourceSchema.identity;
export type ImageMetaData = Pick<ImageResource, 'hash' | 'width' | 'height'>;

export type ParsedGLTFResource = {
  status: ImageStatus;
  mesh: ParsedGLTFMesh | null;
};

export const ResourcesSchema = new MuStruct({
  /**
   * 图片资源字典，key是metadata的hash
   */
  images: new MuDictionary(new MuRefSchema<ImageResource>(), Infinity),
  /**
   * fontFace字典，key是fontFace的fontFamily
   */
  fontFaces: new MuDictionary(new MuRefSchema<FontFace>(), Infinity),
  /**
   * GLTF解析成Mesh的缓存，key是metadata的hash
   */
  parsedGLTF: new MuDictionary(new MuRefSchema<ParsedGLTFResource>(), Infinity),
});

export type Resources = typeof ResourcesSchema.identity;
