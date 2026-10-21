import type { StaticImageData } from 'next/legacy/image';
import { ImageRequest, retrieveWithImage } from '@box/content-server/image';

/**
 * - next.js编译game时，会通过next-image-loader导入图片，生成对象（StaticImageData）
 * - rusty webpack编译game时，仅通过普通的asset/inline或者asset/resource方式导入图片，会生成字符串（路径/base64）
 */
export type ImageImportAsset = StaticImageData | string;

/**
 * 判断导入（import）的图片模块是next/image对象还是字符串
 */
export function isStaticImage(img: ImageImportAsset): img is StaticImageData {
  return typeof img !== 'string';
}

/**
 * 可渲染的图片请求
 * - 继承ImageRequest，用asset属性记录资源地址（由于资源可能是base64，文本会很长，因此用asset字段来标记）
 */
export interface ImageAssetSource extends ImageRequest {
  asset: StaticImageData | string;
}

/**
 * 加载可渲染的图片（仅用于2D画布）
 * 基于retrieveImage()封装的方法，会从asset字段获取资源地址
 * @param out 可渲染的图片请求
 * @returns 可渲染的图片请求
 */
export function retrieveCanvas2DImage(out: ImageAssetSource): ImageRequest {
  if ((out.loaded && out.image) || out.error) {
    return out;
  }

  const { asset } = out;
  const url = isStaticImage(asset) ? asset.src : asset;

  retrieveWithImage(out, url);

  return out;
}

/**
 * 创建可渲染图片请求（仅用于2D画布）
 * @param asset 资源地址，可以是StaticImageData（next/image），也可以是字符串（url、base64等）
 * @param {boolean} [requestImmediate=true] 是否立即发情请求，默认是
 * @returns
 */
export function createCanvas2DImageSource(
  asset: StaticImageData | string,
  requestImmediate = true,
): ImageAssetSource {
  const assetRequest: ImageAssetSource = {
    asset,
    loaded: false,
    error: false,
    image: null,
  };

  if (requestImmediate) {
    retrieveCanvas2DImage(assetRequest);
  }

  return assetRequest;
}
