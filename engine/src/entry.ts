import fs from 'fs';
import crypto from 'crypto';
import http from 'http';
import https from 'https';
import { AddressInfo } from 'net';
import os from 'os';
import path from 'path';
import url from 'url';

import { MockBuildCache } from '@box/build-system/build-cache-mock';
import { BuildSystem } from '@box/build-system/build-system';
import type { RetrievedGroupProjectMetaData } from '@box/build-system/group-project/index';
import { createDefaultPermissions } from '@box/build-system/permissions/permission-init';
import { PrebakeCacheSchema } from '@box/build-system/project/prebake-schema';
import { LocalBuildCache } from './utils/local-build-cache';
import { LocalDerivedContentServer } from './content/local-derived-content';
import { RedisBuildCache } from './utils/redis-build-cache';
import { prebakeMap } from '@box/build-system/tasks/prebake';
import { CachingContentServer } from '@box/content-server/caching-content-server';
import { ContentSplitter } from '@box/content-server/content-split';
import { createContentRouter } from '@box/content-server/content-host';
import { FileSystemContentServer } from '@box/content-server/file-system-store-node';
import { GoIPFSStore } from '@box/content-server/ipfs-http-store-node';
import { ObjectStoreService } from '@box/content-server/object-store-service';
import { MuSystemScheduler } from '@box/mudb/scheduler/system';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import { GroupProjectStore } from '@box/schema/group-project/rda';
import { PermissionRDA } from '@box/schema/permissions/permission-rda';
import {
  ExtraProjectInfoSchema,
  HotProjectSchema,
} from '@box/schema/project/hot-schema';
import { ProjectRDA } from '@box/schema/project/project-rda';
import { ProjectAction } from '@box/schema/replica/replica-schema';
import {
  SchemaTraceEntry,
  traceMathSchemas,
  traceSchema,
  trapDoubleFree,
} from '@box/schema/utils/trace-schema';
import { consoleSink } from '@box/utils/console-sink';
import { EventBus } from '@box/utils/event';
import { filterSink } from '@box/utils/filter-sink';
import { NodeFetch } from '@box/utils/http-fetch/node';
import { getRealIP } from '@box/utils/ip';
import { Logger } from '@box/utils/logger';
import { prettySink } from '@box/utils/pretty-log-sink';
import { BackendSocket } from '../backendSocket';
import { ServerRuntimeConfig } from '../config/server';
import { BLOCK_INFO_RES } from './assets/block_info';
import { BackendClientRPCNode } from './backend-rpc-client-node';
import { createGameServer, HttpRoutes } from './createServer';
import { createLocalContentWithVoxa } from './content/local-content-with-voxa';
import { GameServerStateSchema } from './game-server-schema';
import { createRuntimeRedisStore } from './redis/runtime-redis';
import { resolveGroupStorageNamespace } from './storage/storage-namespace';
import {
  getExtraProject,
  mergeExtraProjectInfo,
} from './project/project-extra';
import { createDefaultProject } from './project/project-init';
import {
  getLocalExtraProjectMode,
  getLocalExtraProjectStateHash,
  getDeletedLocalProjectModelPaths,
  getLocalGroupProjectMetaData,
  getLocalProjectSkinPreviews,
  persistLocalProjectState,
} from './project/local-project-state';
import { decodeExtraProjectInfo } from './project/decode-extra-project';
import { BuildSystemRemote } from './service/build-system-remote';
import { FrameskipsManager } from './utils/frameskips-manager';
import { LOGGER_HOST_UUID, rootLogger } from './utils/logger';
import { ScriptServer } from './utils/script-server/type';

function localNetworkAddress(): string {
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const candidate of addresses || []) {
      if (candidate.family === 'IPv4' && !candidate.internal) return candidate.address;
    }
  }
  return '127.0.0.1';
}

function localAssetContentType(fileName: string, content: Uint8Array) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === '.png') return 'image/png';
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.gif') return 'image/gif';
  if (extension === '.webp') return 'image/webp';

  if (
    content.length >= 8 &&
    content[0] === 0x89 &&
    content[1] === 0x50 &&
    content[2] === 0x4e &&
    content[3] === 0x47 &&
    content[4] === 0x0d &&
    content[5] === 0x0a &&
    content[6] === 0x1a &&
    content[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    content.length >= 3 &&
    content[0] === 0xff &&
    content[1] === 0xd8 &&
    content[2] === 0xff
  ) {
    return 'image/jpeg';
  }
  if (
    content.length >= 6 &&
    content[0] === 0x47 &&
    content[1] === 0x49 &&
    content[2] === 0x46 &&
    content[3] === 0x38 &&
    (content[4] === 0x37 || content[4] === 0x39) &&
    content[5] === 0x61
  ) {
    return 'image/gif';
  }
  if (
    content.length >= 12 &&
    content[0] === 0x52 &&
    content[1] === 0x49 &&
    content[2] === 0x46 &&
    content[3] === 0x46 &&
    content[8] === 0x57 &&
    content[9] === 0x45 &&
    content[10] === 0x42 &&
    content[11] === 0x50
  ) {
    return 'image/webp';
  }
  return undefined;
}

export interface EngineMapPaths {
  projectStatePath?: string;
  groupProjectStatePath?: string;
  bundledContentPath?: string;
  groupContentPath?: string;
  derivedStoragePath?: string;
  storagePath?: string;
  containerName?: string;
}

export interface StartServerOptions {
  /** 由组合根（launch.ts / app/index.ts）注入的脚本执行宿主 */
  scriptServer: ScriptServer;
  /** 同一进程/worker 内多图时，按图覆盖 project/content/storage 路径 */
  paths?: EngineMapPaths;
}

export interface StartServerResult {
  game: Awaited<ReturnType<typeof createGameServer>>;
  httpServer: http.Server | https.Server;
  scriptServer: ScriptServer;
}

export function installProcessErrorHandlers(logger: {
  error: (error: unknown, message?: string) => void;
}) {
  process.on('unhandledRejection', (reason) => {
    if (reason instanceof Error) {
      logger.error(reason, 'Unhandled rejection.');
    } else {
      logger.error(new Error(JSON.stringify(reason)), 'Unhandled rejection.');
    }
  });

  process.on('uncaughtException', (err) => {
    logger.error(err, 'Uncaught error.');
  });
}

export async function startServer(
  spec: ServerRuntimeConfig,
  options: StartServerOptions,
) {
  const isLocal = spec.method === 'local';
  const httpsConfig =
    spec.httpsCert && spec.httpsKey
      ? {
          cert: spec.httpsCert,
          key: spec.httpsKey,
        }
      : undefined;

  const isHttps = spec.isHttps && !!httpsConfig;
  const isDevelopment = spec.env === 'development';
  const startTime = Date.now();
  const projectStatePath =
    options.paths?.projectStatePath ?? process.env.BOX_PROJECT_STATE_PATH;
  const groupProjectStatePath =
    options.paths?.groupProjectStatePath ??
    process.env.BOX_GROUP_PROJECT_STATE_PATH;
  const containerName =
    spec.containerName ||
    options.paths?.containerName ||
    process.env.CONTAINER_NAME ||
    '';

  // create logger
  const legacyLogger = new Logger(
    filterSink(
      !spec.debug ? consoleSink : prettySink,
      spec.LOG_LEVEL,
      spec.logPrefixRegex,
    ),
    ['server'],
    LOGGER_HOST_UUID,
  );

  const logger = rootLogger;

  // print a start up message
  if (isDevelopment) {
    logger.warn('Server in development mode.');
  } else {
    logger.info('Server in production mode.');
  }

  // ip address
  const address = localNetworkAddress();
  // TODO: 移除直接赋值操作
  if (!spec.permissionTokenSecret) {
    // Local/private deployments must not share a predictable signing secret.
    // A host can provide PERMISSION_TOKEN_SECRET for a stable value.
    spec.permissionTokenSecret = crypto.randomBytes(32).toString('hex');
    logger.warn('PERMISSION_TOKEN_SECRET is unset; generated an ephemeral secret.');
  }

  // log container name
  logger.info(`container = ${spec.containerName}`);

  // install schema tracing handlers
  const traces: SchemaTraceEntry[] = [];
  if (spec.traceAlloc || spec.traceDoubleFree) {
    logger.debug('Tracing enabled.');
    traceMathSchemas(traces);
    traceSchema('server-state', GameServerStateSchema, traces);
    traceSchema('rda-state', ProjectRDA.stateSchema, traces);
    traceSchema('rda-store', ProjectRDA.storeSchema, traces);
    traceSchema('rda-action', ProjectRDA.actionSchema, traces);
    traceSchema('permission-state', PermissionRDA.stateSchema, traces);
    traceSchema('permission-store', PermissionRDA.storeSchema, traces);
    traceSchema('permission-action', PermissionRDA.actionSchema, traces);
  }
  if (spec.traceDoubleFree) {
    logger.debug('Throw on double free enabled.');
    trapDoubleFree(traces);
  }

  // create content server
  const sourceLocalContentServer = new FileSystemContentServer(
    path.join(spec.storagePath, 'blobs'),
  );
  const derivedStoragePath = isLocal
    ? String(options.paths?.derivedStoragePath ?? process.env.BOX_DERIVED_STORAGE_PATH ?? '').trim()
    : '';
  const localContentServer = derivedStoragePath
    ? new LocalDerivedContentServer({
        source: sourceLocalContentServer,
        derived: new FileSystemContentServer(
          path.join(derivedStoragePath, 'blobs'),
        ),
      })
    : sourceLocalContentServer;
  const bundledContentPath =
    options.paths?.bundledContentPath ?? process.env.BOX_BUNDLED_CONTENT_PATH ?? '';
  const bundledContentServer = bundledContentPath
    ? new FileSystemContentServer(bundledContentPath)
    : undefined;
  const groupContentPath =
    options.paths?.groupContentPath ?? process.env.BOX_GROUP_CONTENT_PATH ?? '';
  const groupContentServer = groupContentPath
    ? new FileSystemContentServer(groupContentPath)
    : undefined;
  let externalAssetDistribution: { cdnBaseUrl: string; hashes: string[] } | undefined;
  try {
    const hashes = JSON.parse(process.env.BOX_EXTERNAL_ASSET_HASHES || '[]');
    if (
      process.env.BOX_EXTERNAL_ASSET_CDN_URL &&
      Array.isArray(hashes) &&
      hashes.every((hash) => typeof hash === 'string')
    ) {
      externalAssetDistribution = {
        cdnBaseUrl: process.env.BOX_EXTERNAL_ASSET_CDN_URL,
        hashes,
      };
    }
  } catch {
    logger.warn('Ignoring invalid external asset distribution manifest');
  }
  const localContentWithVoxa = createLocalContentWithVoxa(
    localContentServer,
    logger,
    undefined,
    undefined,
    bundledContentServer,
    groupContentServer,
    externalAssetDistribution,
  );
  const contentServer = isLocal
    ? new ContentSplitter(
        new CachingContentServer(logger, localContentWithVoxa),
      )
    : new ContentSplitter(
        new CachingContentServer(
          logger,
          new GoIPFSStore({
            logger,
            uri: spec.CONTENT_SERVER_URL,
            pin: spec.mode === 'edit' && !isDevelopment,
            maxConcurrency: spec.MAX_CONTENT_SERVER_CONNECTIONS,
          }),
        ),
      );
  await contentServer.init();

  const ossContentServer = isLocal
    ? localContentWithVoxa
    : new ObjectStoreService({
        logger,
        uri: spec.INTRANET_CREATERA_BACKEND_SERVER_URL,
        maxConcurrency: spec.MAX_CONTENT_SERVER_CONNECTIONS,
        cdnPath: spec.OSS_CDN_URL,
      });
  await ossContentServer.init();

  // set up backend rpc server
  const brpc = new BackendClientRPCNode(
    spec.INTRANET_BACKEND_SERVER_URL,
    spec.BACKEND_AUTH_CODE,
    legacyLogger,
    isLocal,
  );

  // initialize build system
  const redisNamespace = resolveGroupStorageNamespace(spec);
  const [businessRedis, cacheRedis] = await Promise.all([
    createRuntimeRedisStore({
      host: spec.REDIS_HOST,
      port: spec.REDIS_PORT,
      password: spec.REDIS_PASSWORD,
      database: spec.REDIS_DB,
      role: 'business',
      logger,
    }),
    createRuntimeRedisStore({
      host: spec.REDIS_HOST,
      port: spec.REDIS_PORT,
      password: spec.REDIS_PASSWORD,
      database: spec.STORAGE_CACHE_REDIS_DB,
      role: 'build-cache',
      logger,
    }),
  ]);

  logger.info('Initializing build cache.');
  let buildSystem: BuildSystemRemote;
  const bsURL = spec.BUILD_SERVER_URL;
  let nextLocalUid = 1;
  const nextUidListUsingGet = async ({ num }: { num: number }) =>
    Array.from({ length: num }, () => `local-${nextLocalUid++}`);

  if (bsURL) {
    buildSystem = new BuildSystemRemote(
      new NodeFetch(bsURL),
      contentServer,
      ossContentServer,
      nextUidListUsingGet,
      logger.child({ caller: 'build' }),
    );
  } else {
    const storagePath = options.paths?.storagePath ?? process.env.STORAGE_PATH ?? '';
    const buildCacheRoot = derivedStoragePath || storagePath;
    const persistentBuildCache = isLocal && buildCacheRoot
      ? new LocalBuildCache(
          path.join(buildCacheRoot, 'build-cache.json'),
          derivedStoragePath
            ? path.join(storagePath, 'build-cache.json')
            : '',
        )
      : new MockBuildCache();
    const buildCache = cacheRedis && spec.STORAGE_CACHE_REDIS_TTL > 0
      ? new RedisBuildCache(
          persistentBuildCache,
          cacheRedis,
          spec.STORAGE_CACHE_REDIS_TTL,
          redisNamespace,
          logger.child({ caller: 'redis-build-cache' }),
        )
      : persistentBuildCache;
    buildSystem = new BuildSystem(
      buildCache,
      contentServer,
      ossContentServer,
      nextUidListUsingGet,
      logger.child({
        caller: 'build-system',
      }),
      false,
    ) as any;
  }

  // create basic http routes
  logger.info('Adding /healthCheck route.');
  const httpRoutes: HttpRoutes = {
    '/api/health-check': async (req, res) => {
      const databaseUrl = String(spec.databaseUrl || '');
      const dataStorageDriver = String(spec.dataStorageDriver || '').toLowerCase();
      const storage =
        databaseUrl.startsWith('sqlite:') ||
        dataStorageDriver === 'sqlite' ||
        (isLocal && !databaseUrl)
          ? 'sqlite'
          : databaseUrl.startsWith('postgres://') ||
              databaseUrl.startsWith('postgresql://')
            ? 'postgres'
            : isLocal
              ? 'disabled'
              : 'remote';
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'ok',
        runtime: 'ready',
        storage,
        redis: {
          configured: Boolean(spec.REDIS_HOST),
          business: !spec.REDIS_HOST
            ? 'disabled'
            : businessRedis?.isReady()
              ? 'ready'
              : 'fallback',
          cache: !spec.REDIS_HOST
            ? 'disabled'
            : cacheRedis?.isReady()
              ? 'ready'
              : 'fallback',
        },
      }));
    },
  };
  if (isLocal) {
    const storagePath = options.paths?.storagePath ?? process.env.STORAGE_PATH ?? '';
    const privateBlobManifest = path.join(storagePath, 'private-blobs.json');
    let deniedHashes = new Set<string>();
    if (spec.mode === 'play' && fs.existsSync(privateBlobManifest)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(privateBlobManifest, 'utf8'));
        if (Array.isArray(parsed?.hashes)) {
          deniedHashes = new Set(
            parsed.hashes.filter(
              (hash: unknown): hash is string => typeof hash === 'string',
            ),
          );
        }
      } catch (error) {
        throw new Error(
          `invalid private blob manifest: ${(error as Error).message}`,
        );
      }
    }
    const allowedOrigins = new Set(
      (process.env.BOX_RESOURCE_ALLOWED_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    );
    const contentRouter = createContentRouter(contentServer, {
      allowedOrigins,
      deniedHashes,
      readOnly: spec.mode === 'play',
    });
    httpRoutes['/block'] = async (req, res) => {
      await contentRouter(req, res);
    };
    httpRoutes['/api/project-skin-previews'] = async (req, res) => {
      if (req.method !== 'GET') {
        res.writeHead(405, { Allow: 'GET' });
        res.end('method not allowed');
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(getLocalProjectSkinPreviews(projectStatePath)));
    };
  }

  // load resources
  let contentId = spec.contentId;
  let prebake = PrebakeCacheSchema.identity;
  let scriptServer: ScriptServer = options.scriptServer;
  let storageMode = spec.storageMode;

  const mapIdString = contentId.toString();

  let groupProjectPendingActions: ProjectAction[][] = [];
  let groupProjectStore: GroupProjectStore | undefined;

  // 创建socket
  const backendSocket = new BackendSocket({
    logger: legacyLogger,
    enabled: !isLocal,
  });

  // init project and set up script server
  await Promise.all(
    [
      async () => {
        // initialize project
        logger.info('Loading project...');

        let hash = spec.hash;
        let userId = spec.userId || 0;
        let authorId = 0;

        if (!hash) {
          logger.info('Creating default permissions.');
          // if no hash is specified then we create a default debug project
          const projectHash = await createDefaultProject({
            userId,
            buildSystem,
            logger: legacyLogger,
            debugScripts: spec.script ? spec.script.split(',') : [],
            contentServer,
          });
          hash = await createDefaultPermissions({
            userId,
            projectHash,
            buildSystem,
            contentServer,
            logger,
          });
        } else if (spec.mode === 'edit') {
          // special case:  check if input hash is a project hash (ie it comes from a template)
          // if so, then we need to create a default set of permissions for the project
          const json = await buildSystem.retrieveJSON(hash);
          if (!(json.type === 'permission' || json.type === 'permissions')) {
            logger.info('Initializing permissions for user id = ' + userId);
            hash = await createDefaultPermissions({
              userId,
              projectHash: hash,
              buildSystem,
              contentServer,
              logger,
            });
          }
        }

        // Editable projects persist their latest root hash. Published play
        // worlds are intentionally mounted read-only and must never be mutated.
        if (isLocal && spec.mode === 'edit') {
          persistLocalProjectState(hash, undefined, projectStatePath);
        }

        // get the prebake hash for this project
        logger.info('Permission hash =' + hash);

        // get extra project info
        const embeddedExtraProject =
          isLocal &&
          (getLocalExtraProjectMode(projectStatePath) === 'embedded' ||
            Boolean(groupProjectStatePath));
        const persistedExtraProjectHash =
          isLocal && (spec.mode === 'play' || embeddedExtraProject)
            ? getLocalExtraProjectStateHash(projectStatePath)
            : '';
        let extraProject;
        let extraProjectHash = persistedExtraProjectHash;
        if (persistedExtraProjectHash) {
          const persistedExtraProject = await contentServer.retrieve(
            persistedExtraProjectHash,
          );
          if (!persistedExtraProject) {
            throw new Error(
              `published model metadata is missing: ${persistedExtraProjectHash}`,
            );
          }
          extraProject = decodeExtraProjectInfo(persistedExtraProject);
          if (embeddedExtraProject) {
            const localExtraProject = await getExtraProject(
              contentId,
              spec.mode,
              logger,
              containerName,
            );
            extraProject = mergeExtraProjectInfo(
              extraProject,
              localExtraProject,
              new Set(getDeletedLocalProjectModelPaths(projectStatePath)),
            );
            const stream = new MuWriteStream(1);
            ExtraProjectInfoSchema.diff(
              ExtraProjectInfoSchema.identity,
              extraProject,
              stream,
            );
            extraProjectHash = await contentServer.store(stream.bytes());
            stream.destroy();
          }
          logger.info(
            `Loading published extraProject hash =${persistedExtraProjectHash}`,
          );
        } else {
          extraProject = await getExtraProject(
            contentId,
            spec.mode,
            logger,
            containerName,
          );
          const stream = new MuWriteStream(1);
          ExtraProjectInfoSchema.diff(
            ExtraProjectInfoSchema.identity,
            extraProject,
            stream,
          );
          extraProjectHash = await contentServer.store(stream.bytes());
          stream.destroy();
        }

        if (isLocal && spec.mode === 'edit') {
          persistLocalProjectState(hash, extraProjectHash, projectStatePath);
        }

        // get extra project hash
        logger.info('Loading extraProject hash =' + extraProjectHash);

        let groupProjectMetaData: RetrievedGroupProjectMetaData | undefined;

        /**
         * 获取共享数据
         * - edit
         *   - 有其他可用容器时，获取其他容器的数据（groupProjectStore）
         *   - 否则请求后端，获取哈希数据（groupProjectMetaData）
         * - play
         *   - 直接请求后端，获取哈希数据（groupProjectMetaData）
         */
        groupProjectMetaData = getLocalGroupProjectMetaData(projectStatePath);
        if (groupProjectMetaData) {
          logger.info(
            `Has groupProject metaData ${JSON.stringify(groupProjectMetaData)}`,
          );
        }

        const dataFromBackend = undefined;

        try {
          const prebakeHash = await buildSystem.build(
            'prebakeMap',
            hash,
            BLOCK_INFO_RES.blockInfo,
            HotProjectSchema.identity.version,
            PermissionRDA.stateSchema.identity.version,
            ProjectRDA.stateSchema.identity.version,
            extraProjectHash,
            groupProjectMetaData,
            dataFromBackend,
          );
          logger.info('Loading prebake hash = ' + prebakeHash);
          const engineBytes = await contentServer.retrieve(prebakeHash);
          if (!engineBytes) {
            throw new Error('error loading prebake info');
          }
          prebake = PrebakeCacheSchema.patch(
            PrebakeCacheSchema.identity,
            new MuReadStream(engineBytes),
          );
        } catch (e) {
          logger.error(e, 'PREBAKE IMAGE CORRUPTED, ATTEMPTIGN REBUILD');
          (<any>buildSystem).contentServer = contentServer;
          const prebakeHash = await prebakeMap(
            buildSystem,
            hash,
            BLOCK_INFO_RES.blockInfo,
            HotProjectSchema.identity.version,
            PermissionRDA.stateSchema.identity.version,
            ProjectRDA.stateSchema.identity.version,
            extraProjectHash,
            groupProjectMetaData,
            dataFromBackend,
          );
          logger.info('Recovery prebake hash = ' + prebakeHash);
          const engineBytes = await contentServer.retrieve(prebakeHash);
          if (!engineBytes) {
            throw new Error('error loading prebake info');
          }
          prebake = PrebakeCacheSchema.patch(
            PrebakeCacheSchema.identity,
            new MuReadStream(engineBytes),
          );
        }
        // 使用数据库的作者ID覆盖作品文件里面的owner
        prebake.permissions.owner = (authorId || userId).toString();

        logger.info('Project loaded.');
        storageMode = storageMode || prebake.coldProject.storageMode;
      },
    ].map((f) => f()),
  );

  // try to migrate database
  if (storageMode === 'pg') {
    prebake.coldProject.storageMode = storageMode = 'sqlite';
  }
  // create http server
  const httpEvent = new EventBus<http.IncomingMessage>();
  const httpHandler = async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) => {
    logger.debug(`${getRealIP(req)} ${req.method} - ${req.url}`);
    if (spec.containerName) {
      httpEvent.notify(req);
    }
    if (!req.url) {
      res.writeHead(400);
      return res.end(`url cannot be empty`);
    }
    const { pathname } = url.parse(req.url);
    if (pathname) {
      const routeHandler = httpRoutes[pathname];
      if (routeHandler) {
        return await routeHandler(req, res);
      }
    }
    if (httpRoutes['/block'] && /^\/block/.test(pathname!)) {
      return httpRoutes['/block'](req, res);
    }
    if (
      isLocal &&
      /^\/(engine|avatar|tmp)\//.test(pathname || '')
    ) {
      const fileName = path.basename(pathname!);
      // Cloud preview assets frequently keep `.jpeg`/`.png` in the storage
      // key. Older local templates used the bare CID, so retain that fallback.
      const content =
        (await ossContentServer.retrieve(fileName)) ||
        (fileName.includes('.')
          ? await ossContentServer.retrieve(fileName.split('.')[0])
          : undefined);
      if (!content) {
        res.writeHead(404);
        return res.end('content not found');
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      const contentType = localAssetContentType(fileName, content);
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      return res.end(content);
    }

    logger.warn('Bad route.');
    res.writeHead(404);
    res.end('resource not found');
  };
  const httpServer = isHttps
    ? https.createServer(httpsConfig!, httpHandler)
    : http.createServer(httpHandler);

  // links
  const frameskipsManager = new FrameskipsManager(3);

  // launcher can run in 3 modes:
  //
  //  * proxy: where we proxy against a running game server.  host a locally modified client that fakes out the running game instance
  //  * local: where we run a local development mode version of the game server.  all processes hosted in browser
  //  * web: where the server we run is hosted remotely.  this can be further refined into 2 more categories:
  //      + development: used for testing the game server.  enables debug options and allows for testing user roles
  //      + production: used in production
  //
  logger.info('Creating GameServer.');

  let gameServer = await createGameServer({
    logger: logger,
    legacyLogger: legacyLogger,
    contentServer,
    ossContentServer,
    buildSystem,
    traces,
    brpc,
    scriptServer: scriptServer!,
    prebake,
    httpRoutes,
    httpServer,
    httpEvent,
    frameskipsManager,
    serverConfig: spec,
    backendSocket,
    pendingActions: groupProjectPendingActions,
    groupStore: groupProjectStore,
    businessRedis,
  });
  logger.info('GameServer created.');

  // start listening
  if (spec.method === 'local') {
    httpServer.listen(
      spec.port,
      spec.hostIP || '127.0.0.1',
      spec.playerLimit * 10,
    );
  } else {
    httpServer.listen(spec.port, spec.playerLimit * 10);
  }
  if (!httpServer.listening) {
    await new Promise<void>((resolve, reject) => {
      httpServer.once('listening', () => resolve());
      httpServer.once('error', (error) => reject(error));
    });
  }
  const serverAddress = httpServer.address();
  logger.info('HTTP server address: ', serverAddress);
  const realPort =
    spec.port ||
    (serverAddress && typeof serverAddress === 'object' ? serverAddress.port : 0);
  let serverName = `${spec.mode}/${spec.method}`;
  if (spec.method === 'local') {
    serverName = 'local';
  }
  logger.info(`${serverName} server listening on ${realPort}`);

  // server address
  logger.info(
    `Server address: ${isHttps ? 'https' : 'http'}://${address}:${realPort}`,
  );

  // print out all http routes
  logger.info(`HTTP routes: ${Object.keys(httpRoutes).join(', ')}`);
  logger.info(
    `Total startup time = ${((Date.now() - startTime) / 1000).toFixed(
      2,
    )} seconds`,
  );

  return { game: gameServer, httpServer, scriptServer };
}
