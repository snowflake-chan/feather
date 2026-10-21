import { pick } from 'ramda';
import type { ServerConfig } from './server';

function localSharedScriptLockOwnerId(runtimeName: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < runtimeName.length; index += 1) {
    hash ^= runtimeName.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) || 1;
}

export interface MapInfoConfig {
  // content id
  contentId: number;
  // share stuff
  name: string;
  description: string;
  image: string; // 作品封面
  /** Stable local map identity. Unlike the access id, this never changes. */
  permanentMapId?: string;
  customizeType: 'DIGITALBLOCKLAND' | 'Fantour' | '';
  backgroundImage: string; // loading页面的背景图
  combType: number; // 地图类型（0-普通地图，1-扩展主图，2-扩展副图）
  /** Local map-group identity. Cloud maps do not provide these fields. */
  mapGroupId?: string;
  mapRole?: 'main' | 'submap';
  mainProjectId?: string;
  isLocalMapGroup?: boolean;
}

export function mapRoleToCombType(role?: MapInfoConfig['mapRole']): 0 | 1 | 2 {
  if (role === 'main') return 1;
  if (role === 'submap') return 2;
  return 0;
}

/** Cloud combined-map script mutations must never run in Local Engine. */
export function usesCloudMapGroupAPIs(mapInfo: MapInfoConfig): boolean {
  return Boolean(mapInfo.combType && !mapInfo.isLocalMapGroup);
}

export interface ClientModeConfig {
  mode: 'edit' | 'play';
  // container name
  name: string;
  /**
   * 平台VOXA的地址，用于跳转
   */
  WEBSITE_VOXA_URL: string;
}

export type FeatureFlags = {
  gameUI: boolean;
};

export type LocalRuntimeInfo = {
  productVersion: string;
  buildCommit: string;
  nodeVersion: string;
  deploymentMode: string;
  dataStorageBackend: 'disabled' | 'postgres';
  voxaConfigured: boolean;
  redisConfigured: boolean;
  redisBusinessDb: number;
  redisCacheDb: number;
};

const PROPERTIES_FROM_SERVER = [
  'APP_ENV',
  'APP_EDITION',
  'APP_REGION',
  'LOG_LEVEL',
  'WEBSITE_PLAY_ROUTE',
  'MAAS_BACKEND_SERVER_URL',
  'JAVA_BACKEND_SERVER_URL',
  'BACKEND_SERVER_URL',
  'CREATERA_BACKEND_SERVER_URL',
  'CDN_PATH',
  'OSS_CDN_URL',
  'WEBSITE_URL',
  'HOME_URL',
  'ARENA_URL',
  'VOXA_URL',
  'isbnPreview',
  'mockJavaUrl',
  'PLATFORM_URL',
  'headless',
  'cacheIPFS',
  'isLocalGameServer',
  'remoteGameServerURL',
  'PAID_ACCESS',
  'FEATURE_FLAGS',
  'MAX_HALF_CHUNKS',
  'MAX_Y_HALF_CHUNKS',
] as const;

export type ServerConfigForClient = Pick<
  ServerConfig,
  (typeof PROPERTIES_FROM_SERVER)[number]
> & {
  localRuntimeInfo?: LocalRuntimeInfo;
  /** Stable runtime owner used to identify local shared-script edit locks. */
  localMapRuntimeId?: number;
};

/**
 * 抽取 ServerConfig 转为 ClientConfig
 */
const pickServerConfigForClient = pick(PROPERTIES_FROM_SERVER);

export function extractServerConfigForClient(
  serverConfig: ServerConfig,
  mode: 'edit' | 'play' = 'play',
  containerName = '',
): ServerConfigForClient {
  const pickedConfig = pickServerConfigForClient(
    serverConfig,
  ) as ServerConfigForClient;
  const localRuntimeInfo: LocalRuntimeInfo | undefined = serverConfig.isLocalGameServer
    ? {
      productVersion: process.env.BOX_BUILD_VERSION || process.env.BOX_IMAGE_TAG || '0.2.0',
        buildCommit: process.env.BOX_BUILD_COMMIT || 'unknown',
        nodeVersion: process.version,
        deploymentMode: process.env.BOX_DEPLOYMENT_MODE || 'local',
        dataStorageBackend: process.env.BOX_DATABASE_URL ? 'postgres' : 'disabled',
        voxaConfigured: Boolean(process.env.VOXA_URL),
        redisConfigured: Boolean(process.env.REDIS_HOST),
        redisBusinessDb: Number(process.env.REDIS_DB || 0),
        redisCacheDb: Number(process.env.STORAGE_CACHE_REDIS_DB || 1),
      }
    : undefined;
  const clientConfig: ServerConfigForClient = {
    ...pickedConfig,
    ...(localRuntimeInfo ? { localRuntimeInfo } : {}),
    ...(serverConfig.isLocalGameServer && containerName
      ? { localMapRuntimeId: localSharedScriptLockOwnerId(containerName) }
      : {}),
  };

  if (
    process.env.BOX_DEPLOYMENT_MODE !== 'creator' &&
    process.env.BOX_DEPLOYMENT_MODE !== 'play'
  ) {
    return clientConfig;
  }

  // Both local products have one public origin. Internal loopback addresses
  // are valid for the web process, but must never be serialized to a browser.
  // Edit requests must use the writable runtime; play requests use the
  // read-only runtime.
  const localRuntimePath =
    process.env.BOX_DEPLOYMENT_MODE === 'creator'
      ? `/runtime/${mode}/${encodeURIComponent(containerName)}`
      : process.env.BOX_PLAY_LIBRARY_PATH && mode === 'play'
      ? `/runtime/play/${encodeURIComponent(containerName)}`
      : `/runtime/${mode}`;
  // Prefix public asset and API base paths so server-rendered inline styles
  // and background images resolve under the deployment path prefix too.
  const basePath =
    typeof window === 'undefined'
      ? process.env.BOX_APP_BASE_PATH || ''
      : (window as unknown as { __BOX_APP_BASE_PATH__?: string }).__BOX_APP_BASE_PATH__ || '';
  const runtimeURL =
    basePath && localRuntimePath.startsWith('/') && !localRuntimePath.startsWith(`${basePath}/`)
      ? `${basePath}${localRuntimePath}`
      : localRuntimePath;
  return {
    ...clientConfig,
    ARENA_URL: '',
    WEBSITE_URL: '',
    HOME_URL: '',
    // VOXA is a separate localhost-only product in creator deployments. Its
    // browser URL must remain available to the editor; play deployments never
    // expose authoring tools.
    VOXA_URL:
      process.env.BOX_DEPLOYMENT_MODE === 'creator'
        ? clientConfig.VOXA_URL
        : '',
    PLATFORM_URL: '',
    BACKEND_SERVER_URL: runtimeURL,
    MAAS_BACKEND_SERVER_URL: runtimeURL,
    JAVA_BACKEND_SERVER_URL: runtimeURL,
    CREATERA_BACKEND_SERVER_URL: runtimeURL,
    CDN_PATH: runtimeURL,
    OSS_CDN_URL: runtimeURL,
  };
}

/**
 * 最终传给前端的Config，在SSR时组装
 */
export type ClientRuntimeConfig = ServerConfigForClient & {
  mapInfo: MapInfoConfig;
  /** Present only when a native player launcher has prepared a verified local map package. */
  launcherServiceWorkerMode?: boolean;
  /** Original server asset route for live player-skin data omitted from map packages. */
  launcherAvatarCdnURL?: string;
  /** Signed package identity supplied by the native launcher for server-side version gating. */
  launcherPackage?: {
    permanentMapId: string;
    releaseVersion: string;
    manifestDigest: string;
    launchTicket?: string;
  };
} & ClientModeConfig;
