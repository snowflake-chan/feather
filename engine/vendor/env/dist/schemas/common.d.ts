/**
 * 公共配置，所有项目的配置中都会有
 */
import type { JTDSchemaType } from 'ajv/dist/core';
export interface CommonRuntimeConfig {
    /**
     * @deprecated 应使用功能标志位来区分不同环境的功能开启与否
     */
    APP_ENV: 'development' | 'test' | 'staging' | 'preprod' | 'production';
    /**
     * @deprecated 部署和配置需要一一对应并互相隔离，应当新增 Nacos Namespace 来区分
     */
    APP_EDITION: 'createra' | 'box3';
    /**
     * @deprecated 应当新增 Nacos Namespace 来区分
     * 从2023年5月开始，国内也要有createra业务了，所以又又增加了个新字段，用来区分国内外。
     */
    APP_REGION: 'cn' | 'oversea';
    /**
     * 认证 Cookie 名称
     */
    AUTH_COOKIE_NAME: string;
    /**
     * IPFS CDN
     */
    CDN_PATH: string;
    /**
     * OSS CDN
     */
    OSS_CDN_URL: string;
    /**
     * V3: Java Createra 专版
     */
    CREATERA_BACKEND_SERVER_URL: string;
    /**
     * V3: Java Createra 专版服务内网调用地址
     */
    INTRANET_CREATERA_BACKEND_SERVER_URL: string;
    /**
     * MAAS服务
     */
    MAAS_BACKEND_SERVER_URL: string;
    /**
     * MAAS服务内网调用地址
     */
    INTRANET_MAAS_BACKEND_SERVER_URL: string;
    /**
     * V2: Java 部分重构版
     */
    JAVA_BACKEND_SERVER_URL: string;
    /**
     * V1: Node RPC
     */
    BACKEND_SERVER_URL: string;
    /**
     * Node RPC Intranet
     */
    INTRANET_BACKEND_SERVER_URL: string;
    /**
     * Box api
     */
    BOX_API_URL: string;
    INTRANET_BOX_API_URL: string;
    /**
     * Node RPC Backend Auth Code
     */
    BACKEND_AUTH_CODE: string;
    BUILD_SERVER_URL: string;
    WEBSITE_URL: string;
    HOME_URL: string;
    ARENA_URL: string;
    VOXA_URL: string;
    ENGINE_APIS_URL: string;
    LOG_LEVEL: number;
    /**
     * content server url and max connections
     */
    CONTENT_SERVER_URL: string;
    MAX_CONTENT_SERVER_CONNECTIONS: number;
    /**
     * redis相关配置，backend和build-server
     */
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;
    REDIS_DB: number;
    REDIS_TLS: boolean;
    DBCONNECTIONLIMIT: number;
    DEBUG?: string;
    PAID_ACCESS: boolean;
    SWEAR_KEY: string;
    FEATURE_FLAGS?: string[];
    /**
     * 用于配置地形加载xz平面的最大一半尺寸
     * 比如配置3，地形最多会加载人物所在的地形1个chunk和前后左右各3个chunk，总共7 * 7个chunk
     * 如果配置并且地形超出了配置最大范围，则地形会使用动态加载
     * 不配置默认加载全部地形
     */
    MAX_HALF_CHUNKS?: number;
    /**
     * 功能同上，可单独配置y轴尺寸
     */
    MAX_Y_HALF_CHUNKS?: number;
    DIFY_BASE_URL: string;
    DIFY_API_KEY: string;
    FAST_GPT_BASE_URL: string;
    FAST_GPT_API_KEY: string;
}
export declare const COMMON_SCHEMA: JTDSchemaType<CommonRuntimeConfig>;
//# sourceMappingURL=common.d.ts.map