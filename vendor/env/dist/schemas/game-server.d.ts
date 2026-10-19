/**
 * game-server 后端项目配置
 */
import type { JTDSchemaType } from 'ajv/dist/core';
export interface GameServerRuntimeConfig {
    APP_ID?: string;
    AGORA_APP_ID: string;
    AGORA_CERTIFICATE: string;
    /**
     * 每次向脚本服务调用方法的超时时间
     */
    SCRIPT_TIMEOUT?: number;
    /**
     * 脚本服务所能使用的内存限制
     */
    SCRIPT_MEMORY_LIMIT?: number;
    STORAGE_CACHE_REDIS_DB: number;
    STORAGE_CACHE_REDIS_TTL: number;
    STORAGE_CACHE_REDIS_SENTINEL_HOST: string[];
    STORAGE_CACHE_REDIS_SENTINEL_PORT: number;
    STORAGE_CACHE_REDIS_SENTINEL_PASSWORD: string;
    /**
     * Java 的storage的调用地址
     */
    INTRANET_STORAGE_BACKEND_SERVER_URL: string;
    /**
     * AI 模型映射配置
     * Key: 模型类型 (FAST, PRO)
     * Value: 候选模型列表
     */
    AI_MODEL_MAPPING: Record<string, string[]>;
    /**
     * OpenRouter API Key，用于调用 OpenRouter 的部分服务
     * 仅在海外版本使用
     */
    OPENROUTER_API_KEY: string;
}
export declare const GAME_SERVER_SCHEMA: JTDSchemaType<GameServerRuntimeConfig>;
//# sourceMappingURL=game-server.d.ts.map