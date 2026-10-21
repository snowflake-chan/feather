import { clientConfig } from 'src/config/client';
import { resolveContentURL } from '@box/content-server/content-fetch';
import { resolvePublicUrl } from './public-url';

export function resolveHashURL(cdnPath: string, value: string) {
  if (!value) {
    return '';
  }
  const urlPrefix = `${cdnPath.replace(/\/$/, '')}/block/`;
  return resolveContentURL(value, urlPrefix);
}

export function hashURL(hash: string) {
  return resolvePublicUrl(resolveHashURL(clientConfig.CDN_PATH || '', hash));
}

export type ImageFormats =
  | 'png'
  | 'jpg'
  | 'webp'
  | 'avif'
  | 'wp2'
  | 'jxl'
  | 'jpeg';
export type ImageFit = 'cover' | 'fill' | 'contain';
