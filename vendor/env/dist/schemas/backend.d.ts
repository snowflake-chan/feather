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
export declare const BACKEND_SCHEMA: JTDSchemaType<BackendRuntimeConfig>;
//# sourceMappingURL=backend.d.ts.map