import fsext from 'fs-extra';
import pino from 'pino';

import {
  createContentServer,
  createOSSContentServer,
} from './utils/content-server';
import { buildResources } from './utils/resource';
import { MockBuildCache } from './build-cache-mock';
import { BuildSystem } from './build-system';

export async function start(
  paths: {
    tasksDir: string;
    assetsDir: string;
    targetDir: string;
  },
  config: {
    contentHostURL: string;
    maxIPFSConnections: number;
    ossUploadURL: string;
    ossCdnURL: string;
    nextUidListUsingGet: (query: { num: number }) => Promise<string[]>;
  },
) {
  // 初始化脚本使用的 logger
  const logger = pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
    },
  });

  const contentServer = createContentServer(logger, config);
  const ossContentServer = createOSSContentServer(logger, config);
  const buildCache = new MockBuildCache();
  const buildSystem = new BuildSystem(
    buildCache,
    contentServer,
    ossContentServer,
    config.nextUidListUsingGet,
    logger,
    false,
  );
  const { targetDir } = paths;
  // 清除构建的文件夹
  logger.info('starting build.  node' + process.version);
  await Promise.all([fsext.remove(targetDir)]);
  await Promise.all([fsext.mkdirp(targetDir)]);

  // 将assetsDir下的文件上传到ipfs并得到hash通过tasksDir写成文件到targetDir供其他文件依赖
  logger.info('initializing resources....');
  await buildResources(buildSystem, contentServer, logger, paths);
  logger.info('resources built.');

  return { buildSystem, logger };
}
