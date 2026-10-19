import Ajv, { Schema, SomeJTDSchemaType } from 'ajv/dist/jtd';
import defineDebug from 'debug';
import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { defaultTo, mergeDeepRight, mergeDeepWith } from 'ramda';
import { parse } from 'yaml';

import { axios } from './request';
import { ARENA_SCHEMA, ArenaRuntimeConfig } from './schemas/arena';
import { BACKEND_SCHEMA, BackendRuntimeConfig } from './schemas/backend';
import {
  BUILD_SERVER_SCHEMA,
  BuildServerRuntimeConfig,
} from './schemas/build-server';
import { COMMON_SCHEMA, CommonRuntimeConfig } from './schemas/common';
import {
  GAME_SERVER_SCHEMA,
  GameServerRuntimeConfig,
} from './schemas/game-server';
import { BOX_API_SCHEMA, BoxApiConfig } from './schemas/box-api';
import { VOXA_SCHEMA, VoxaRuntimeConfig } from './schemas/voxa';

type DataIdMap = {
  'common': CommonRuntimeConfig;
  'arena': ArenaRuntimeConfig;
  'game-server': GameServerRuntimeConfig;
  'backend': BackendRuntimeConfig;
  'build-server': BuildServerRuntimeConfig;
  'voxa': VoxaRuntimeConfig;
  'box-api': BoxApiConfig;
};

export type Projects = keyof DataIdMap;
export type Variant = 'default' | 'global';
export type ConfigType<T extends Projects> = CommonRuntimeConfig & DataIdMap[T];

const SCHEMA_MAP = {
  'common': COMMON_SCHEMA,
  'arena': ARENA_SCHEMA,
  'game-server': GAME_SERVER_SCHEMA,
  'backend': BACKEND_SCHEMA,
  'build-server': BUILD_SERVER_SCHEMA,
  'voxa': VOXA_SCHEMA,
  'box-api': BOX_API_SCHEMA,
};

const debug = defineDebug('@box/env');
const ajv = new Ajv();

/**
 * 注入 .env.local 文件到环境变量中（如果有的话
 * 如果 NODE_ENV 为 development 或 undefined，再注入 .env.development 作为默认开发配置
 * @returns 被注入的内容对象
 */
export function initLocalEnv() {
  const localPath = join(process.cwd(), '.env.local');
  if (existsSync(localPath)) {
    config({ path: localPath });
  }

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    config({
      path: join(process.cwd(), '.env.development'),
    });
  }
}

export function initDebug(namespaces?: string) {
  if (namespaces) {
    defineDebug.enable(namespaces);
    debug('Debug enabled: %s', namespaces);
  }
}

export async function initConfig() {
  const result = await createConfig();
  initDebug(result.DEBUG);
  return result;
}

/**
 * 根据当前环境变量，从Nacos拉取对应的环境配置
 * 由于存在安全性问题，此方法不应在前端使用
 * CI环境下无需鉴权，本地环境下环境变量中需要配置对应的用户名与密码进行登录，NACOS_USERNAME 以及 NACOS_PASSWORD
 * @param project 对应读取的项目配置
 * @param config 传入的外部配置，会被整合进返回的配置中，可用于覆盖或添加配置
 * @returns
 */
export async function createConfig(): Promise<CommonRuntimeConfig>;
export async function createConfig<C>(
  project: undefined,
  config?: C,
): Promise<CommonRuntimeConfig & C>;
export async function createConfig<T extends Projects, C>(
  project: T,
  config: C,
): Promise<ConfigType<T> & C>;
export async function createConfig<
  T extends Projects,
  C extends Partial<ConfigType<T>>,
>(project?: T, externalConfig?: C) {
  // 1. 在公共入口层将 region 转换为 dataId
  const dataId = 'boxes';
  return createConfigWithSchema({ project, externalConfig, dataId });
}

interface ConfigByProjectsOptions<P extends readonly Projects[], C> {
  projects: P;
  variant?: Variant;
  externalConfig?: C;
}

/**
 * 将一个项目名称元组类型转换为其对应配置类型的交叉类型（合并类型）。
 * @example
 * // Inferred as: BackendRuntimeConfig & GameServerRuntimeConfig
 * type Merged = MergeProjects<['backend', 'game-server']>;
 */
type MergeProjects<P extends readonly Projects[]> = {
  // 1. 将 P 数组中的每个 key (K) 映射为其在 DataIdMap 中对应的类型。
  //    结果是一个对象，key 是数组索引，value 是配置类型。
  //    e.g., { 0: BackendRuntimeConfig, 1: GameServerRuntimeConfig }
  [K in keyof P]: P[K] extends Projects ? DataIdMap[P[K]] : never;
  // 2. 使用 [number] 获取这个对象所有 value 的联合类型。
  //    e.g., BackendRuntimeConfig | GameServerRuntimeConfig
}[number] extends infer U // 3. 将这个联合类型赋值给一个新的类型变量 U
  ? // 4. 使用一个经典的技巧将联合类型 U 转换为交叉类型。
    (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never
  : never;

/**
 * 根据项目数组，从 Nacos 拉取并合并多个项目的配置。
 * 此方法会读取 common + 指定的 projects 配置，并进行合并和校验。
 * 不应在前端使用。
 */
export async function createConfigByProjects<P extends readonly Projects[], C>({
  projects,
  variant = 'default',
  externalConfig,
}: ConfigByProjectsOptions<P, C>): Promise<
  CommonRuntimeConfig & C & MergeProjects<P>
> {
  if (typeof window !== 'undefined') {
    throw new Error('Should not be used directly on client-side!');
  }

  // --- 复用 createConfigWithSchema 中的环境和 Nacos 连接设置 ---
  const { NEXT_PUBLIC_APP_ENV } = process.env;
  let nacosNS = process.env.NACOS_NAMESPACE;

  if (!NEXT_PUBLIC_APP_ENV || !nacosNS) {
    throw new Error(
      `App env and nacos namespace should not be empty! Got: APP_ENV:${NEXT_PUBLIC_APP_ENV}; Nacos Namespace:${nacosNS}`,
    );
  }

  const nacosServers = process.env.NACOS_SERVER_ADDRESS!.split(',');
  // --- 设置结束 ---

  // 并行获取所有配置
  const configPromises = [
    // 获取 common 配置
    fetchConfig(nacosServers, nacosNS, NEXT_PUBLIC_APP_ENV, 'common'),
    // 获取所有指定项目的专属配置
    ...projects.map((project) =>
      fetchConfig(nacosServers, nacosNS, NEXT_PUBLIC_APP_ENV, project),
    ),
  ];

  const rawConfigs = await Promise.all(configPromises);

  // 解析并合并所有配置
  const commonConfig = parse(rawConfigs[0])[variant] || {};
  const projectConfigs = rawConfigs
    .slice(1)
    .map((raw) => parse(raw)[variant] || {})
    .reduce((acc, curr) => mergeDeepRight(acc, curr), {});

  let resultConfig = {
    ...commonConfig,
    ...projectConfigs,
    ...{
      APP_ENV: NEXT_PUBLIC_APP_ENV,
    },
  };

  if (externalConfig) {
    resultConfig = mergeDeepWith(defaultTo, resultConfig, externalConfig);
  }

  // 合并所有相关 schema 用于校验
  const combinedSchema = projects.reduce<SomeJTDSchemaType>((acc, project) => {
    return mergeDeepRight(acc, SCHEMA_MAP[project]);
  }, COMMON_SCHEMA);

  debug('Validating combined project config.');
  const result = validateWithSchema<CommonRuntimeConfig & C & MergeProjects<P>>(
    resultConfig,
    combinedSchema,
  );
  debug('Validating combined project config finished.');

  return result as CommonRuntimeConfig & C & MergeProjects<P>;
}

async function createConfigWithSchema<T extends Projects>(args: {
  project?: T;
  externalConfig?: Partial<ConfigType<T>>;
  /**
   * @param dataId - 不再接收 region，直接接收计算好的 dataId
   */
  dataId: string;
}) {
  const { project, externalConfig, dataId } = args;
  if (typeof window !== 'undefined') {
    throw new Error('Should not be used directly on client-side!');
  }

  const localConfigPath = process.env.BOX_LOCAL_CONFIG_PATH;
  if (localConfigPath) {
    const configData = parse(readFileSync(localConfigPath, 'utf8'));
    const projectResult = project ? configData[project] : undefined;
    let resultConfig = {
      ...configData.common,
      ...projectResult,
    };

    if (externalConfig) {
      resultConfig = mergeDeepWith(defaultTo, resultConfig, externalConfig);
    }

    debug('Validating local config from %s.', localConfigPath);
    return validateWithSchema(
      resultConfig,
      project
        ? mergeDeepRight(COMMON_SCHEMA, SCHEMA_MAP[project])
        : COMMON_SCHEMA,
    ) as ConfigType<T> & typeof externalConfig;
  }

  const { NEXT_PUBLIC_APP_ENV } = process.env; // APP_ENV 在 staging 和 production 环境不一致，不能取 Build Time 的值
  const APP_EDITION = process.env.NEXT_PUBLIC_APP_EDITION;
  // 从2023年5月开始，国内也要有createra业务了，所以又又增加了个新字段，用来区分国内外
  const APP_REGION = process.env.NEXT_PUBLIC_APP_REGION;
  let nacosNS = process.env.NACOS_NAMESPACE;

  if (!NEXT_PUBLIC_APP_ENV || !APP_EDITION || !APP_REGION) {
    throw new Error(
      `App env, edition and region should not be empty! Got: APP_ENV:${NEXT_PUBLIC_APP_ENV}; APP_EDITION:${APP_EDITION}; APP_REGION: ${APP_REGION}`,
    );
  }

  if (!nacosNS) {
    const STAGING_NAMESPACE_MAP: Record<string, string> = {
      createra: '9781fc14-2fcd-4b32-a8e1-0e235cc8d675',
      box3: '9b0268e6-dec1-4db3-9d60-7cfd46ad82d1',
    };
    nacosNS = STAGING_NAMESPACE_MAP[APP_EDITION];
  }

  const nacosServers = process.env.NACOS_SERVER_ADDRESS!.split(',');
  // 3. 直接将 dataId 传递给 fetchConfig
  const rawConfig = await fetchConfig(
    nacosServers,
    nacosNS,
    NEXT_PUBLIC_APP_ENV,
    dataId,
  );

  let configData = parse(rawConfig);

  const projectResult = project ? configData[project] : undefined;

  let resultConfig = {
    ...configData['common'],
    ...projectResult,
    ...{
      APP_ENV: NEXT_PUBLIC_APP_ENV,
      APP_EDITION,
      APP_REGION,
    },
  };

  if (externalConfig) {
    resultConfig = mergeDeepWith(defaultTo, resultConfig, externalConfig);
  }

  debug('Validating project config.');
  const result = validateWithSchema(
    resultConfig,
    project
      ? mergeDeepRight(COMMON_SCHEMA, SCHEMA_MAP[project])
      : COMMON_SCHEMA,
  );
  debug('Validating project config finished.');

  return result;
}

function validateWithSchema<T>(data: unknown, schema: string | Schema) {
  if (!ajv.validate(schema, data)) {
    throw new Error(
      'Config validation failed!\n' +
        JSON.stringify(ajv.errors, undefined, '\t'),
    );
  }

  return data;
}

async function fetchConfig(
  servers: string[],
  namespace: string,
  group: string,
  /**
   * @param dataId - 现在是必需的参数，职责更纯粹
   */
  dataId: string,
) {
  const nacosServerSize = servers.length;
  let index = Math.floor(Math.random() * nacosServerSize);
  for (let i = 0; i < nacosServerSize; ++i) {
    const baseUrl = getBaseUrl(servers[index]);
    try {
      debug(
        'Fetching nacos config: %s, dataId: %s, group: %s',
        baseUrl,
        dataId,
        group,
      );
      // 4. 直接使用传入的 dataId
      const response = await axios.get(
        `${baseUrl}/cs/configs?tenant=${namespace}&group=${group}&dataId=${dataId}`,
      );

      debug('Fetching nacos config finished.', baseUrl);
      return response.data;
    } catch (err) {
      debug('Fetch nacos config error: %O. Try next nacos server...', err);
      index = (index + 1) % nacosServerSize;
    }
  }

  throw new Error(`Failed to read config after tried all servers: ${servers}`);
}

function getBaseUrl(nacosServer: string) {
  const protocol = nacosServer.startsWith('http') ? '' : 'http://';
  return `${protocol}${nacosServer}/nacos/v1`;
}
