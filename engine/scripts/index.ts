import path from 'path';
import { start } from '@box/build-system/build';
import { getConfig } from '../config/server';
const Paths = {
  targetDir: path.join(__dirname, '../src/assets'),
  assetsDir: path.join(__dirname, 'assets'),
  tasksDir: path.join(__dirname, 'resources'),
};

// Fail the build in CI if we have any errors
(async () => {
  try {
    const config = await getConfig();
    let nextUid = 1;
    await start(Paths, {
      contentHostURL: config.CONTENT_SERVER_URL,
      maxIPFSConnections: config.MAX_CONTENT_SERVER_CONNECTIONS,
      ossCdnURL: config.OSS_CDN_URL,
      ossUploadURL:
        config.APP_EDITION === 'createra'
          ? config.CREATERA_BACKEND_SERVER_URL
          : config.MAAS_BACKEND_SERVER_URL,
      nextUidListUsingGet: async ({ num }) =>
        Array.from({ length: num }, () => `local-${nextUid++}`),
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

process.on('warning', console.warn);
