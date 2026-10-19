/**
 * backend的配置
 */
import type { JTDSchemaType } from 'ajv/dist/core';

export interface BackendRuntimeConfig {
  NODE_ENV: string;
  DBHOST: string;
  DBPORT: number;
  DBUSER: string;
  DBPASSWORD: string;
  DBDATABASE: string;
  DBMAXLIMIT: number;
  SQL_LOGGER: boolean;

  DB2HOST: string;
  DB2PORT: number;
  DB2USER: string;
  DB2PASSWORD: string;
  DB2DATABASE: string;

  K8S: boolean;
  K8S_USER_NAMESPACE: string;
  K8S_IMAGE_PULL_SECRET_NAME: string;
  K8S_API_BASE_URL: string;
  K8S_API_CA: string;
  K8S_API_KEY: string;
  K8S_API_TOKEN: string;
  K8S_STORAGE_SERVER: string;
  K8S_STORAGE_PATH: string;
  K8S_STORAGE_MOUNT_PATH: string;
  CERT_NAME: string;

  IMAGE_REGISTRY: string;
  VM: string;
  EDIT_PLAYER_LIMIT: number;
  PLAY_PLAYER_LIMIT: number;

  ALI_AK_ID: string;
  ALI_AK_SECRET: string;

  AGORA_APP_ID: string;
  AGORA_CERTIFICATE: string;

  JWT_SECRET: string;
}

export const BACKEND_SCHEMA: JTDSchemaType<BackendRuntimeConfig> = {
  properties: {
    NODE_ENV: { type: 'string' },
    DBHOST: { type: 'string' },
    DBPORT: { type: 'uint16' },
    DBUSER: { type: 'string' },
    DBPASSWORD: { type: 'string' },
    DBDATABASE: { type: 'string' },
    DBMAXLIMIT: { type: 'uint8' },
    SQL_LOGGER: { type: 'boolean' },

    DB2HOST: { type: 'string' },
    DB2PORT: { type: 'uint16' },
    DB2USER: { type: 'string' },
    DB2PASSWORD: { type: 'string' },
    DB2DATABASE: { type: 'string' },

    K8S: { type: 'boolean' },
    K8S_USER_NAMESPACE: { type: 'string' },
    K8S_IMAGE_PULL_SECRET_NAME: { type: 'string' },
    K8S_API_BASE_URL: { type: 'string' },
    K8S_API_CA: { type: 'string' },
    K8S_API_KEY: { type: 'string' },
    K8S_API_TOKEN: { type: 'string' },
    K8S_STORAGE_SERVER: { type: 'string' },
    K8S_STORAGE_PATH: { type: 'string' },
    K8S_STORAGE_MOUNT_PATH: { type: 'string' },
    CERT_NAME: { type: 'string' },

    IMAGE_REGISTRY: { type: 'string' },
    VM: { type: 'string' },
    EDIT_PLAYER_LIMIT: { type: 'uint8' },
    PLAY_PLAYER_LIMIT: { type: 'uint8' },

    ALI_AK_ID: { type: 'string' },
    ALI_AK_SECRET: { type: 'string' },
    AGORA_APP_ID: { type: 'string' },
    AGORA_CERTIFICATE: { type: 'string' },

    JWT_SECRET: { type: 'string' },
  },
  additionalProperties: true,
};
