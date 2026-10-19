/**
 * build-server 服务端配置
 */
import { JTDSchemaType } from 'ajv/dist/core';

export interface BuildServerRuntimeConfig {
  BUILD_CACHE_DBHOST: string;
  BUILD_CACHE_DBPORT: number;
  BUILD_CACHE_DBUSER: string;
  BUILD_CACHE_DBPASSWORD: string;
  BUILD_CACHE_DBDATABASE: string;
  POST_BODY_SIZE_LIMIT_BYTES: number;
}

export const BUILD_SERVER_SCHEMA: JTDSchemaType<BuildServerRuntimeConfig> = {
  properties: {
    BUILD_CACHE_DBHOST: { type: 'string' },
    BUILD_CACHE_DBPORT: { type: 'uint16' },
    BUILD_CACHE_DBUSER: { type: 'string' },
    BUILD_CACHE_DBPASSWORD: { type: 'string' },
    BUILD_CACHE_DBDATABASE: { type: 'string' },
    POST_BODY_SIZE_LIMIT_BYTES: { type: 'uint32' },
  },
  additionalProperties: true,
} as const;
