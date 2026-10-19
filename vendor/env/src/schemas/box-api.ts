/**
 * Box API 的配置
 */
import type { JTDSchemaType } from 'ajv/dist/core';

export interface BoxApiConfig {
  BOX_DATABASE_URL: string;
  USER_DATABASE_URL: string;
  /**
   * 引擎数据库连接字符串
   */
  ENGINE_DATABASE_URL: string;

  JWT_SECRET: string;
  /**
   * 登录 Session-Token 的过期时间，单位：秒
   */
  JWT_EXPIRES_IN: number;
  /**
   * 允许跨域的来源列表
   */
  CORS_ORIGINS: string[];
  /**
   * 海外云函数的 URL 地址
   */
  GLOBAL_CLOUD_FUNCTION_URL: string;
  /**
   * 海外云函数的密钥
   */
  GLOBAL_CLOUD_FUNCTION_KEY: string;

  /**
   * Creem API Key，用于调用 Creem 的部分服务
   * 仅在海外版本使用
   */
  CREEM_API_KEY: string;
  /**
   * Creem API URL
   * 仅在海外版本使用
   */
  CREEM_API_URL: string;
  /**
   * Creem Webhook 的签名密钥
   * 仅在海外版本使用
   */
  CREEM_WEBHOOK_SECRET: string;
  /**
   * OpenRouter API Key，用于调用 OpenRouter 的部分服务
   * 仅在海外版本使用
   */
  OPENROUTER_API_KEY: string;
}

export const BOX_API_SCHEMA: JTDSchemaType<BoxApiConfig> = {
  properties: {
    BOX_DATABASE_URL: { type: 'string' },
    USER_DATABASE_URL: { type: 'string' },
    ENGINE_DATABASE_URL: { type: 'string' },
    JWT_SECRET: { type: 'string' },
    JWT_EXPIRES_IN: { type: 'uint32' },
    CORS_ORIGINS: {
      elements: {
        type: 'string',
      },
    },
    GLOBAL_CLOUD_FUNCTION_URL: { type: 'string' },
    GLOBAL_CLOUD_FUNCTION_KEY: { type: 'string' },
    CREEM_API_KEY: { type: 'string' },
    CREEM_API_URL: { type: 'string' },
    CREEM_WEBHOOK_SECRET: { type: 'string' },
    OPENROUTER_API_KEY: { type: 'string' },
  },
};
