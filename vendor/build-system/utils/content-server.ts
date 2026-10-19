import type { Logger } from 'pino';

import { CachingContentServer } from '@box/content-server/caching-content-server';
import { ContentSplitter } from '@box/content-server/content-split';
import { ObjectStoreService } from '@box/content-server/object-store-service';
import { GoIPFSStore } from '@box/content-server/ipfs-http-store-node';

export function createContentServer(
  logger: Logger,
  config: {
    contentHostURL: string;
    maxIPFSConnections: number;
  },
) {
  const { contentHostURL, maxIPFSConnections } = config;
  const contentServer = new ContentSplitter(
    new CachingContentServer(
      logger.child({
        caller: 'caching-content',
      }),
      new GoIPFSStore({
        logger: logger.child({ caller: 'ipfs' }),
        uri: contentHostURL,
        pin: false,
        maxConcurrency: maxIPFSConnections,
      }),
    ),
  );

  return contentServer;
}

export function createOSSContentServer(
  logger: Logger,
  config: {
    ossUploadURL: string;
    maxIPFSConnections: number;
    ossCdnURL: string;
  },
) {
  const { ossUploadURL, maxIPFSConnections, ossCdnURL } = config;
  const contentServer = new ObjectStoreService({
    logger: logger.child({ caller: 'oss' }),
    uri: ossUploadURL,
    maxConcurrency: maxIPFSConnections,
    cdnPath: ossCdnURL,
  });

  return contentServer;
}
