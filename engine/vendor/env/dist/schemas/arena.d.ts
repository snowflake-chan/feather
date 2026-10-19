/**
 * Arena 前端项目配置
 */
import type { JTDSchemaType } from 'ajv/dist/core';
export interface ArenaRuntimeConfig {
    WEBSITE_PLAY_ROUTE: string;
    /**
     * 负责三方登陆的 OAuth 服务地址
     * 实际上应该只有国内在用，海外的地址都是国内的
     * 目前版本的代码甚至根本没用
     * 估计是对接编程猫时的遗留物？
     */
    THIRD_PARTY_URL: string;
    CONTAINER_SCALING_FRAMESKIPS_THRESHOLD: number;
    PLATFORM_URL: string;
}
export declare const ARENA_SCHEMA: JTDSchemaType<ArenaRuntimeConfig>;
//# sourceMappingURL=arena.d.ts.map