/**
 * VOXA 前端项目配置
 */
import type { JTDSchemaType } from 'ajv/dist/core';

export interface VoxaRuntimeConfig {
  VOXA?: string; // TODO 其实没用，但去掉会有一些错误，留着占位给以后voxa用吧
}

export const VOXA_SCHEMA: JTDSchemaType<VoxaRuntimeConfig> = {
  optionalProperties: {
    VOXA: {
      type: 'string',
    },
  },
  additionalProperties: true,
} as const;
