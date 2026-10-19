import { ArenaRuntimeConfig } from './schemas/arena';
import { BackendRuntimeConfig } from './schemas/backend';
import { BuildServerRuntimeConfig } from './schemas/build-server';
import { CommonRuntimeConfig } from './schemas/common';
import { GameServerRuntimeConfig } from './schemas/game-server';
import { BoxApiConfig } from './schemas/box-api';
import { VoxaRuntimeConfig } from './schemas/voxa';
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
/**
 * 注入 .env.local 文件到环境变量中（如果有的话
 * 如果 NODE_ENV 为 development 或 undefined，再注入 .env.development 作为默认开发配置
 * @returns 被注入的内容对象
 */
export declare function initLocalEnv(): void;
export declare function initDebug(namespaces?: string): void;
export declare function initConfig(): Promise<CommonRuntimeConfig>;
/**
 * 根据当前环境变量，从Nacos拉取对应的环境配置
 * 由于存在安全性问题，此方法不应在前端使用
 * CI环境下无需鉴权，本地环境下环境变量中需要配置对应的用户名与密码进行登录，NACOS_USERNAME 以及 NACOS_PASSWORD
 * @param project 对应读取的项目配置
 * @param config 传入的外部配置，会被整合进返回的配置中，可用于覆盖或添加配置
 * @returns
 */
export declare function createConfig(): Promise<CommonRuntimeConfig>;
export declare function createConfig<C>(project: undefined, config?: C): Promise<CommonRuntimeConfig & C>;
export declare function createConfig<T extends Projects, C>(project: T, config: C): Promise<ConfigType<T> & C>;
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
    [K in keyof P]: P[K] extends Projects ? DataIdMap[P[K]] : never;
}[number] extends infer U ? (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never : never;
/**
 * 根据项目数组，从 Nacos 拉取并合并多个项目的配置。
 * 此方法会读取 common + 指定的 projects 配置，并进行合并和校验。
 * 不应在前端使用。
 */
export declare function createConfigByProjects<P extends readonly Projects[], C>({ projects, variant, externalConfig, }: ConfigByProjectsOptions<P, C>): Promise<CommonRuntimeConfig & C & MergeProjects<P>>;
export {};
//# sourceMappingURL=index.d.ts.map