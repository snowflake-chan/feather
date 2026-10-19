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
export declare const BUILD_SERVER_SCHEMA: JTDSchemaType<BuildServerRuntimeConfig>;
//# sourceMappingURL=build-server.d.ts.map