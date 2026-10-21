import { expect, test } from '@jest/globals';
import { clientConfig, syncClientConfig } from 'src/config/client';

test('syncs page-specific asset configuration into the legacy client singleton', () => {
  const previousCdnPath = clientConfig.CDN_PATH;
  const previousLocalMode = clientConfig.launcherServiceWorkerMode;
  try {
    syncClientConfig({
      ...clientConfig,
      CDN_PATH: 'http://127.0.0.1:3121/runtime/play/map-one',
      launcherServiceWorkerMode: true,
    });

    expect(clientConfig.CDN_PATH).toBe('http://127.0.0.1:3121/runtime/play/map-one');
    expect(clientConfig.launcherServiceWorkerMode).toBe(true);
  } finally {
    clientConfig.CDN_PATH = previousCdnPath;
    clientConfig.launcherServiceWorkerMode = previousLocalMode;
  }
});
