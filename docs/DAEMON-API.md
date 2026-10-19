# Daemon API 设计（Docker-like）

本地管理面。只给管理员 / CLI / daemon 自己用，和玩家入口（Game API）完全分开。

## 1. 定位

daemon 是 **supervisor**：

- 管理多张地图的运行时（map runtime）
- 负责 start/stop/restart/destroy、日志、统计、事件
- 不处理玩家 session，不暴露 `createSession`
- 默认只监听本机（Unix socket 或 127.0.0.1）

Game API（玩家）见 [API-DESIGN.md](API-DESIGN.md)。

## 2. Transport 与认证

| 项 | 默认 |
|---|---|
| 传输 | Unix socket `/var/run/feather/daemon.sock` |
| TCP 回退 | `127.0.0.1:9978`，需显式开启 |
| 认证 | socket 文件权限 `0600`；TCP 用本地 token |
| CORS | **不允许** |
| Cookie | **不使用** |

- `GET /_ping` 不要求认证，只返回 `OK`，用于 CLI 探活
- TCP 模式下支持 `Authorization: Bearer <token>` 或 `X-Feather-Token`
- 不信任 `X-Forwarded-*`；daemon 不应该被反代到公网

## 3. 资源模型

| 资源 | 说明 |
|---|---|
| Map | 一张地图的运行时；有 spec / status / stats |
| Operation | 异步 start/stop/restart/delete 的操作记录 |
| Event | 生命周期事件流 |
| Log | 每个 map 的日志流 |

### Map 状态机

```
created → starting → running → stopping → stopped
   │         │          │          │
   └─────────┴──────────┴──────────┴──→ error
stopped / error → starting（restart）
任意状态 → destroyed（DELETE，先 stop）
```

## 4. Endpoints

所有管理接口在 `/v1` 下；`/_ping` 不带版本。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/_ping` | liveness；`OK` |
| GET | `/v1/version` | `{ version, apiVersion }` |
| GET | `/v1/info` | daemon 信息、runtime、地图数、uptime |
| GET | `/v1/maps` | 列出 map |
| POST | `/v1/maps` | 创建/加载 map；`Idempotency-Key` |
| GET | `/v1/maps/:id` | map status |
| DELETE | `/v1/maps/:id` | destroy；`?force=1` |
| POST | `/v1/maps/:id/start` | start；异步返回 operation |
| POST | `/v1/maps/:id/stop` | stop；`?timeout=10&force=1` |
| POST | `/v1/maps/:id/restart` | restart |
| GET | `/v1/maps/:id/stats` | tick / players / memory / cpu |
| GET | `/v1/maps/:id/logs` | NDJSON；`follow=1&since=&tail=` |
| GET | `/v1/events` | NDJSON 生命周期事件；`since=` |
| GET | `/v1/operations/:id` | 异步操作状态 |
| POST | `/v1/maps/:id/exec` | 管理命令（谨慎；默认关闭） |
| GET | `/v1/metrics` | Prometheus（可选） |

### 4.1 创建地图

```http
POST /v1/maps
Idempotency-Key: 7f3c...
Content-Type: application/json

{
  "id": "bedwars-s2",
  "name": "起床战争·S2",
  "projectHash": "QmRHV...",
  "projectStatePath": "/data/maps/bedwars/project-state.json",
  "port": 3001,
  "scriptWorkerEntry": "/app/shell/dist/worker-entry.js",
  "env": { "SCRIPT_MEMORY_LIMIT": "512" },
  "limits": { "players": 32, "memoryMb": 512 },
  "restartPolicy": "on-failure",
  "autoStart": true
}
```

返回 `201` + `MapStatus`。`id` 由客户端提供；同一个 `Idempotency-Key` 重放返回同一个结果。

### 4.2 停止

```http
POST /v1/maps/bedwars-s2/stop?timeout=10
```

- 默认优雅停止：先停止接收新玩家，再让 tick 落地，最后退出
- `force=1`：直接 terminate
- 超时返回 `202` + operation；CLI 轮询 `/v1/operations/:id`

### 4.3 日志

```http
GET /v1/maps/bedwars-s2/logs?follow=1&tail=200
```

NDJSON，每行一条：

```json
{"time":"2026-10-19T16:00:00.000Z","stream":"stdout","message":"..."}
```

`stream`: `stdout` | `stderr` | `engine` | `script`。

### 4.4 事件

```http
GET /v1/events?since=...
```

```json
{"type":"map.running","mapId":"bedwars-s2","time":"..."}
```

事件类型：`map.created`、`map.starting`、`map.running`、`map.stopping`、`map.stopped`、`map.error`、`map.destroyed`、`daemon.ready`、`daemon.shutdown`。

## 5. 错误模型

```json
{
  "code": "MAP_NOT_FOUND",
  "message": "map bedwars-s2 not found",
  "details": {}
}
```

| HTTP | code 示例 |
|---|---|
| 400 | `INVALID_ARGUMENT` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `MAP_NOT_FOUND` |
| 409 | `MAP_CONFLICT`、`OPERATION_IN_PROGRESS` |
| 422 | `INVALID_SPEC` |
| 500 | `INTERNAL` |
| 503 | `NOT_READY` |

- 异步操作返回 `202` + `operation`
- 冲突时返回 `409`，带当前状态
- 限流返回 `429` + `Retry-After`（未来）

## 6. 幂等、并发、分页

- `POST /v1/maps`、`POST .../start|stop|restart` 支持 `Idempotency-Key`
- 同一 map 同一时间只允许一个生命周期操作；冲突 `409`
- 列表未来支持 `?limit=&cursor=`；当前地图数量小，先全量
- 未来更新 spec 用 `If-Match` / generation 做乐观并发

## 7. Daemon 契约

`@feather/daemon/contract`：

```ts
interface DaemonHandle {
  ping(): Promise<{ ok: true; version: string }>;
  version(): Promise<{ version: string; apiVersion: string }>;
  info(): Promise<DaemonInfo>;

  listMaps(): Promise<MapStatus[]>;
  getMap(id: string): Promise<MapStatus | undefined>;
  createMap(spec: MapSpec): Promise<MapStatus>;
  startMap(id: string): Promise<Operation>;
  stopMap(id: string, opts?: StopOptions): Promise<Operation>;
  restartMap(id: string): Promise<Operation>;
  destroyMap(id: string, opts?: DestroyOptions): Promise<void>;

  stats(id: string): Promise<MapStats>;
  logs(id: string, opts?: LogOptions): AsyncIterable<LogEntry>;
  events(opts?: EventOptions): AsyncIterable<DaemonEvent>;

  exec(id: string, command: string, args?: unknown): Promise<unknown>;
  close(): Promise<void>;
}
```

- `MapSpec` / `MapStatus` / `MapStats` / `LogEntry` / `DaemonEvent` / `Operation` 见契约文件
- 类型只描述 supervisor；单图 engine 仍是 `EngineHandle`
- daemon 可以**先单图 in-process**，再演进到多图/多进程

## 8. CLI 映射

| CLI | API |
|---|---|
| `feather ps` | `GET /v1/maps` |
| `feather up <spec>` | `POST /v1/maps` |
| `feather start <id>` | `POST /v1/maps/:id/start` |
| `feather stop <id>` | `POST /v1/maps/:id/stop` |
| `feather restart <id>` | `POST /v1/maps/:id/restart` |
| `feather rm <id>` | `DELETE /v1/maps/:id` |
| `feather logs <id> -f` | `GET /v1/maps/:id/logs?follow=1` |
| `feather stats <id>` | `GET /v1/maps/:id/stats` |
| `feather events` | `GET /v1/events` |
| `feather exec <id> -- cmd` | `POST /v1/maps/:id/exec` |

## 9. 迁移

- **D1（本次）**：`@feather/daemon` 只放契约类型；不实现
- **D2**：单图 in-process supervisor + 本地 socket server；`ps/up/stop/logs`
- **D3**：多图；每图一个 engine 实例（后续 worker pool）
- **D4**：多进程 / 独立 game runtime；daemon 只负责进程与 socket
- **D5**：events/metrics/exec，CLI 完整

## 10. 明确不做

- 不把 daemon 暴露到公网
- 不在 daemon 上做玩家 session
- 不在 daemon 上做游戏协议 WS
- 不引入 etcd/consul；先文件 + 单进程状态
