import { createConfig, initLocalEnv } from '@box/env';
import { a, b, maybeS, s } from './builder';

/**
 * 来自环境变量中的配置
 * 包含 Server 与 Client 的配置
 */
export interface EnvironmentConfig {
  // 当前的项目名，例如：rush build --to @box/xxx 中的 @box/xxx
  projectId: string;
  logPrefixRegex?: string;

  isLocalGameServer: boolean;
  localGameServerURL: string;
  localEditServerURL: string;
  remoteGameServerURL: string;
  serverPublicUrl: string;
  trustProxy: boolean;

  mockJavaUrl?: string;

  /**
   * 无头模式，在Server运行引擎
   */
  headless: boolean;

  /**
   * 缓存IPFS文件
   */
  cacheIPFS: boolean;

  isbnPreview?: boolean;
}

let _env: EnvironmentConfig & Partial<RemoteConfig>;

/**
 * Next 不接受 undefined 只接受 null 的处理
 * @param props
 * @returns
 */
const removeUndefinedForNextJsSerializing = <T extends {}>(props: T): T =>
  Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  ) as T;

export function getEnvironmentConfig(): EnvironmentConfig &
  Partial<RemoteConfig> {
  if (!_env) {
    initLocalEnv();
    _env = removeUndefinedForNextJsSerializing({
      projectId: s(process.env.PROJECT_ID || ''),

      logPrefixRegex: maybeS(process.env.LOG_PREFIX_REGEX),

      // 是否是本地调试的game server
      isLocalGameServer: b(process.env.IS_LOCAL_GAME_SERVER),
      localGameServerURL: process.env.LOCAL_GAME_SERVER_URL || '',
      localEditServerURL:
        process.env.LOCAL_EDIT_SERVER_URL ||
        process.env.LOCAL_GAME_SERVER_URL ||
        '',
      remoteGameServerURL: process.env.BOX_REMOTE_SERVER_URL || '',
      serverPublicUrl: process.env.BOX_SERVER_PUBLIC_URL || '',
      trustProxy: process.env.BOX_TRUST_PROXY === 'true',
      mockJavaUrl: process.env.MOCK_JAVA_URL,

      headless: process.env.HEADLESS === 'true',
      cacheIPFS: process.env.CACHE_IPFS === 'true',

      // createra backend api url

      // 覆盖 Nacos 配置，本地开发用
      INTRANET_BACKEND_SERVER_URL: maybeS(
        process.env.INTRANET_BACKEND_SERVER_URL,
      ),
      INTRANET_MAAS_BACKEND_SERVER_URL: maybeS(
        process.env.INTRANET_MAAS_BACKEND_SERVER_URL,
      ),
      MAAS_BACKEND_SERVER_URL: maybeS(process.env.MAAS_BACKEND_SERVER_URL),
      // VOXA is published on a configurable host port. The bundled local
      // config only contains the development default (3001), which made an
      // editor opened through Deployment Manager keep requesting that stale
      // port after the owner changed BOX_VOXA_PORT.
      VOXA_URL: maybeS(process.env.VOXA_URL),
      // 本地覆盖稍稍有点 tricky，需要做一下转换
      FEATURE_FLAGS: a(process.env.FEATURE_FLAGS),
      // 覆盖ARENA_URL，本地开发用
      ARENA_URL: maybeS(process.env.ARENA_URL),
      // 本地服务联调时，可以通过 .env 配置根证书
      NODE_EXTRA_CA_CERTS: maybeS(process.env.NODE_EXTRA_CA_CERTS),
      BOX_API_URL: maybeS(process.env.BOX_API_URL),
    });
  }

  return _env;
}

export type RemoteConfig = Awaited<ReturnType<typeof getTypedConfig>>;
export type ServerConfig = RemoteConfig & EnvironmentConfig;

let _config: Promise<ServerConfig> | null = null;

export async function getServerConfig(): Promise<ServerConfig> {
  if (!_config) {
    _config = getTypedConfig(getEnvironmentConfig());
  }

  return await _config;
}

async function getTypedConfig(config: EnvironmentConfig) {
  return createConfig('arena', config);
}
