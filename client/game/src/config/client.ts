import type { ClientRuntimeConfig } from '../../configs/client';
export type ClientConfig = ClientRuntimeConfig;

export function getConfig() {
  if (typeof window === 'undefined') {
    return {};
  }
  const config = (<any>window).CLIENT_CONFIG || {};
  return config;
}

export const clientConfig: ClientConfig = Object.assign(
  {
    headless: true,
    prefetchHashes: [],
    cdnPath: '',
    websiteURL: '',
    shareName: '',
    shareDescription: '',
    shareImageURL: '',
    thirdPartyURL: '',
  },
  getConfig(),
);

export function syncClientConfig(config: ClientConfig) {
  Object.assign(clientConfig, config);
}

export const webClientConfig: ClientConfig = getConfig();
