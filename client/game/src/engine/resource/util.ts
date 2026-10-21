import { clientConfig } from 'src/config/client';

import { resolvePublicUrl } from 'src/utils/public-url';

export function resolveOSSResourceUrl(
  baseURL: string,
  hash: string,
  browserOrigin = '',
) {
  const normalizedBase = baseURL.replace(/\/$/, '');
  const absoluteBase =
    browserOrigin && normalizedBase.startsWith('/')
      ? `${browserOrigin.replace(/\/$/, '')}${normalizedBase}`
      : normalizedBase;
  return `${absoluteBase}/engine/m/${hash}`;
}

/**
 * 获取oss文件的地址，目前引擎的文件都存储于engine/m路径下
 * @param hash oss文件hash
 * @returns
 */
export function getOSSResourceUrl(hash: string) {
  return resolveOSSResourceUrl(
    resolvePublicUrl(clientConfig.OSS_CDN_URL),
    hash,
    typeof window === 'undefined' ? '' : window.location.origin,
  );
}
