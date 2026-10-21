import { clientConfig } from 'src/config/client';

export function isCreatera() {
  return clientConfig.APP_EDITION === 'createra';
}
