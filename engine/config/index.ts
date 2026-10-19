import {
  ContainerType,
  ServerSettingsSchema,
} from '../src/settings/server-settings-schema';

import { configBuilder } from './builder';

export type EnvType =
  | 'development'
  | 'staging'
  | 'preprod'
  | 'production'
  | 'test';
export type ModeType = 'edit' | 'play';
export type MethodType = 'web' | 'local';

const { N, S, B, build, argv } = configBuilder();
const DEFAULT_SETTINGS = ServerSettingsSchema.identity;

/**
 * 从环境变量中同步获取的配置，没有包含从Nacos获取到的内容
 */
export const config = build({
  env: S('NODE_ENV', 'development') as EnvType,
  mode: S('MODE', 'play') as ModeType,
  method: S('METHOD', 'web') as MethodType,
  releaseVersion: N('RELEASE_VERSION', 0),
  // 是否允许传送
  teleportAccess: B('TELEPORT_ACCESS', false),
  paidAccess: B('PAID_ACCESS', false),
  // user login an auth things
  login: S('LOGIN', ''),
  // owner id
  userId: N('USER_ID', 0),
  // content id
  contentId: N('CONTENT_ID', 0),
  groupId: N('GROUP_ID', 0),
  // 默认值用于测试
  serverId: S('SERVER_ID', '1'),
  containerName: S('CONTAINER_NAME', DEFAULT_SETTINGS.containerName),
  containerType: S('TYPE', DEFAULT_SETTINGS.containerType) as ContainerType,
  teamId: S('TEAM_ID', DEFAULT_SETTINGS.teamId),
  // hash of project/permission structure to load
  hash: S('HASH', ''),
  isHttps: B('IS_HTTPS', true), // 默认true
  // http server configuration
  httpsCert: S('HTTPS_CERT', ''),
  httpsKey: S('HTTPS_KEY', ''),
  port: N('PORT', 9966),
  // host ip
  hostIP: S('HOST_IP', ''),
  serverPublicUrl: S('BOX_SERVER_PUBLIC_URL', ''),
  trustProxy: B('BOX_TRUST_PROXY', false),
  sessionTtlMs: N('BOX_SESSION_TTL_MS', 60_000),
  sessionRateLimitPerMinute: N('BOX_SESSION_RATE_LIMIT_PER_MINUTE', 60),
  directSessionApi: B('BOX_DIRECT_SESSION_API', true),
  playerLimit: N('PLAYER_LIMIT', DEFAULT_SETTINGS.playerLimit),
  maxZeroPlayerTime: N(
    'MAX_ZERO_PLAYER_TIME',
    DEFAULT_SETTINGS.zeroPlayerTimeout,
  ),
  autoSaveInterval: N('AUTO_SAVE_INTERVAL', DEFAULT_SETTINGS.autoSaveInterval),
  storagePath: S('STORAGE_PATH', '/tmp'),
  dataStoragePath: S('BOX_DATA_STORAGE_PATH', ''),
  vm: S('VM', ''),
  debug: B('DEBUG', false),

  // permission token secret key
  permissionTokenSecret: S('PERMISSION_TOKEN_SECRET', ''), // 邀请链接，没用了
  // banned users get redirected
  banRedirect: S('BAN_REDIRECT', 'https://www.xuexi.cn/'),
  // ERROR, WARN, INFO, DEBUG
  // 0      1     2     3
  logPrefixRegex: S('LOG_PREFIX_REGEX', ''),
  // sql/db configuration
  sqlLiteHeapQuota: N('DB_HEAP_LIMIT', DEFAULT_SETTINGS.sqlLiteHeapQuota),
  dbSizeLimit: N('DB_SIZE_LIMIT', DEFAULT_SETTINGS.dbSizeLimit),
  dbChunkSize: N('DB_CHUNK_SIZE', DEFAULT_SETTINGS.dbChunkSize),
  // script server things
  script: S('SCRIPT', ''), // debug script for default project in local mode
  // quotas and limits
  scriptHeapSizeMB: N('SCRIPT_HEAP_MB', DEFAULT_SETTINGS.scriptHeapSizeMB),
  scriptTimeout: N('SCRIPT_TIMEOUT', DEFAULT_SETTINGS.scriptTimeout),
  // script sql storage
  storageMode: S('STORAGE_MODE', ''),

  // Persistent high-level game.storage backend. Database credentials are
  // supplied by the server owner at runtime and never shipped to the client.
  dataStorageNamespace: S('BOX_DATA_STORAGE_NAMESPACE', ''),
  groupStorageNamespace: S('BOX_GROUP_STORAGE_NAMESPACE', ''),
  databaseUrl: S('BOX_DATABASE_URL', ''),
  databaseSchema: S('BOX_DATABASE_SCHEMA', 'box_engine'),
  databasePoolSize: N('BOX_DATABASE_POOL_SIZE', 10),
  databaseSsl: B('BOX_DATABASE_SSL', false),
  databaseSslRejectUnauthorized: B(
    'BOX_DATABASE_SSL_REJECT_UNAUTHORIZED',
    true,
  ),
  dataStorageLockTimeoutMs: N('BOX_DATA_STORAGE_LOCK_TIMEOUT_MS', 10_000),

  // url to remote game server
  traceAlloc: B('TRACEALLOC', false),
  traceDoubleFree: B('TRACEDOUBLEFFREE', false),
});

export { argv };
