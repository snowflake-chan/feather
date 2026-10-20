import fs from 'node:fs';
import path from 'node:path';

export interface LocalConfig {
  common: Record<string, unknown>;
  arena: Record<string, unknown>;
  'game-server': Record<string, unknown>;
}

function template(port: number): LocalConfig {
  const base = `http://127.0.0.1:${port}`;
  return {
    common: {
      APP_ENV: 'development',
      APP_EDITION: 'createra',
      APP_REGION: 'cn',
      AUTH_COOKIE_NAME: 'box-local-session',
      CDN_PATH: base,
      OSS_CDN_URL: base,
      CREATERA_BACKEND_SERVER_URL: base,
      INTRANET_CREATERA_BACKEND_SERVER_URL: base,
      MAAS_BACKEND_SERVER_URL: base,
      INTRANET_MAAS_BACKEND_SERVER_URL: base,
      JAVA_BACKEND_SERVER_URL: base,
      BACKEND_SERVER_URL: base,
      INTRANET_BACKEND_SERVER_URL: base,
      BOX_API_URL: base,
      INTRANET_BOX_API_URL: base,
      BACKEND_AUTH_CODE: 'local-engine',
      BUILD_SERVER_URL: '',
      WEBSITE_URL: 'http://127.0.0.1:3127',
      HOME_URL: 'http://127.0.0.1:3127',
      ARENA_URL: 'http://127.0.0.1:3127',
      VOXA_URL: 'http://127.0.0.1:3123',
      ENGINE_APIS_URL: base,
      LOG_LEVEL: 2,
      CONTENT_SERVER_URL: '',
      MAX_CONTENT_SERVER_CONNECTIONS: 8,
      REDIS_HOST: '',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: '',
      REDIS_DB: 0,
      REDIS_TLS: false,
      DBCONNECTIONLIMIT: 1,
      PAID_ACCESS: false,
      SWEAR_KEY: '',
      FEATURE_FLAGS: [],
      DIFY_BASE_URL: '',
      DIFY_API_KEY: '',
      FAST_GPT_BASE_URL: '',
      FAST_GPT_API_KEY: '',
    },
    arena: {
      WEBSITE_PLAY_ROUTE: '/p',
      THIRD_PARTY_URL: '',
      CONTAINER_SCALING_FRAMESKIPS_THRESHOLD: 65535,
      PLATFORM_URL: 'http://127.0.0.1:3127',
    },
    'game-server': {
      AGORA_APP_ID: '',
      AGORA_CERTIFICATE: '',
      STORAGE_CACHE_REDIS_DB: 0,
      STORAGE_CACHE_REDIS_TTL: 0,
      STORAGE_CACHE_REDIS_SENTINEL_HOST: [],
      STORAGE_CACHE_REDIS_SENTINEL_PORT: 0,
      STORAGE_CACHE_REDIS_SENTINEL_PASSWORD: '',
      INTRANET_STORAGE_BACKEND_SERVER_URL: base,
      OPENROUTER_API_KEY: '',
      AI_MODEL_MAPPING: {},
      SCRIPT_TIMEOUT: 10,
      SCRIPT_MEMORY_LIMIT: 512,
    },
  };
}

export function ensureLocalConfig(workspaceRoot: string, port = 9966): string {
  const dir = path.join(workspaceRoot, '.feather', 'config');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'local.json');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `${JSON.stringify(template(port), null, 2)}\n`, 'utf8');
  }
  return file;
}
