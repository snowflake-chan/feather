import type { IncomingMessage, ServerResponse } from 'http';
import type { MuServer } from '@box/mudb/server';
import type { MuSocketServer } from '@box/mudb/socket/socket';
import type { GameSessionData } from '@box/schema/session/schema';
import type { ScriptServer } from '@feather/protocol/script-server';
import type { ServerRuntimeConfig } from '../config/server';

/** engine 的完整配置；与 ServerRuntimeConfig 保持一致 */
export type EngineConfig = ServerRuntimeConfig;

export type EngineRuntimeState =
  | 'starting'
  | 'ready'
  | 'stopping'
  | 'stopped'
  | 'error';

export interface EngineMapInfo {
  id: string;
  name: string;
  version: string;
  permissionHash?: string;
}

export interface EngineStatus {
  runtime: EngineRuntimeState;
  map: EngineMapInfo;
  players: {
    current: number;
    limit: number;
  };
  tick: number;
  uptimeMs: number;
  storage: 'ok' | 'disabled' | 'error';
}

export type EngineHttpHandler = (
  req: IncomingMessage,
  res: ServerResponse,
) => void | Promise<void>;

export type EngineHttpRoutes = Record<string, EngineHttpHandler>;

export interface EngineContentStat {
  size: number;
  contentType?: string;
}

/** 内容读取门面；api 负责流式响应 */
export interface EngineContentApi {
  read(hash: string): Promise<Uint8Array | undefined>;
  stat(hash: string): Promise<EngineContentStat | undefined>;
}

export interface EngineCreateSessionInput {
  ipAddress: string;
  userId?: number;
  token?: string;
  name?: string;
  isAdmin?: boolean;
  url?: string;
  fingerPrint?: string;
  deviceHash?: string;
  region?: string;
}

/**
 * session 门面。
 * 当前 GameSession 暴露的是 bindUserSession/getSessionData/allowSessionAttempt；
 * create 由 engine 在后端登录之后组合，避免 api 碰后端 RPC。
 */
export interface EngineSessionApi {
  create(input: EngineCreateSessionInput): Promise<GameSessionData>;
  get(sessionId: string): Promise<GameSessionData | undefined>;
  revoke(sessionId: string): void;
  allowAttempt(ipAddress: string, limit: number): Promise<boolean>;
}

/**
 * engine 对 game api 暴露的唯一门面。
 * engine 不创建 http.Server，也不 listen；网络边缘归 api/app。
 */
export interface EngineHandle {
  /** engine 自己拥有的路由，api 合并后 listen */
  readonly httpRoutes: EngineHttpRoutes;
  /** 协议服务；api 用它接 MuWebSocketServer */
  readonly muServer: MuServer;
  readonly session: EngineSessionApi;
  readonly content: EngineContentApi;
  /** 同步快照，供 health/status 使用 */
  status(): EngineStatus;
  /** 启动游戏循环（不监听端口） */
  start(): Promise<void>;
  /** 停止游戏循环、释放资源 */
  close(): Promise<void>;
}

export interface CreateEngineOptions {
  /** 由 app 注入的脚本执行宿主 */
  scriptServer: ScriptServer;
  /** 由 api/app 创建；engine 用它构造 MuServer */
  socketServer: MuSocketServer;
  /** 可选：api 传入空 map，engine 往里注册自己的路由 */
  httpRoutes?: EngineHttpRoutes;
}

/**
 * Phase C2 实现：build 但不开端口。
 * 当前运行时仍走 launch.ts -> startServer；此类型是给 app/api 预留的缝。
 */
export type CreateEngine = (
  config: EngineConfig,
  options: CreateEngineOptions,
) => Promise<EngineHandle>;
