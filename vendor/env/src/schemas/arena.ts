/**
 * Arena 前端项目配置
 */

import type { JTDSchemaType } from 'ajv/dist/core';

export interface ArenaRuntimeConfig {
  // 平台play模式的路由
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

export const ARENA_SCHEMA: JTDSchemaType<ArenaRuntimeConfig> = {
  properties: {
    WEBSITE_PLAY_ROUTE: {
      type: 'string',
    },
    THIRD_PARTY_URL: {
      type: 'string',
    },
    CONTAINER_SCALING_FRAMESKIPS_THRESHOLD: {
      type: 'uint16',
    },
    PLATFORM_URL: {
      type: 'string',
    },
  },
  additionalProperties: true,
} as const;
