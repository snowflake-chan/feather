# Daemon API（Docker-like）

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

**shard 崩溃后的自动重启**由 `MapSpec.restartPolicy` 决定：

| 值 | 行为 |
|---|---|
| `no`（默认） | 不重启，图停在 `error`，等人工处理 |
| `on-failure` | 仅当 shard 以非 0 退出码结束时重启 |
| `always` | 无论退出码都重启 |

退避从 1s 起翻倍、上限 30s；连续失败 5 次后放弃，把原因写进 `MapStatus.error`。
计数在两种情况下清零：图稳定运行超过 60s 之后又崩，或用户手动 `start` / `stop`。
退避期间执行 `stop` / `destroy` 会取消待执行的重启。

## 4. Endpoints

所有管理接口在 `/v1` 下；`/_ping` 不带版本。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/_ping` | liveness；`OK`；不需要认证 |
| GET | `/v1/version` | `{ version, apiVersion }` |
| GET | `/v1/info` | daemon 信息、runtime、地图数、uptime |
| GET | `/v1/maps` | 列出 map |
| POST | `/v1/maps` | 创建 map（CLI 不直接使用） |
| POST | `/v1/maps/import` | 上传 `.fmap` / `.boxplay`；`?replace=1&purge=1` |
| GET | `/v1/maps/:id` | map status |
| DELETE | `/v1/maps/:id` | destroy；`?force=1` |
| POST | `/v1/maps/:id/start` | start；异步返回 operation |
| POST | `/v1/maps/:id/stop` | stop；`?timeout=10&force=1` |
| POST | `/v1/maps/:id/restart` | restart |
| GET | `/v1/maps/:id/stats` | `tickRate`（TPS）/ `tickDuration`（每帧计算耗时，MC 的 MSPT）/ players / 所在 shard 的资源快照 |
| GET | `/v1/shards` | 按 shard 报 CPU / V8 堆 / 承载的图；资源指标唯一有意义的口径 |
| GET | `/v1/maps/:id/logs` | NDJSON；`follow=1&since=&tail=` |
| GET | `/v1/events` | NDJSON 生命周期事件；`since=` |
| GET | `/v1/operations/:id` | 异步操作状态 |
| POST | `/v1/maps/:id/eval` | JS eval（谨慎；默认关闭） |
| POST | `/v1/maps/:id/exec` | eval 的兼容别名 |
| POST | `/v1/shutdown` | 关闭 daemon；仅本地/已认证 |
| GET | `/v1/metrics` | Prometheus（可选） |

### 4.1 指标口径（`stats` / `shards`）

资源指标**只有 shard 口径**。engine 允许一个 shard 打包多图，CPU 和 V8 堆是整条线程 / 整个 isolate 共享的，摊不到单张图上。

| 字段 | 口径 | 说明 |
|---|---|---|
| `tickRate` | per-map | 实测 TPS。标称 15.625（`1000/64`），掉到标称以下说明已经跟不上 |
| `tickDuration` | per-map | 上一采样窗口内每帧的平均**计算耗时**（ms，MC 的 MSPT）。**不是** `1000/tickRate` |
| `maxTickDuration` | per-map | 启动以来最慢的一帧 |
| `cpuPercent` | per-shard | `worker.cpuUsage()` 窗口差值，单位 %。单核满载 = 100，塞了多图可超过 100 |
| `heapUsedBytes` / `heapTotalBytes` / `heapLimitBytes` | per-shard | `worker.getHeapStatistics()`，该 isolate 的 V8 堆 |
| `rssBytes` | 进程级 | 线程共享地址空间，RSS 没有 per-thread 口径。每个 shard 报的都是同一个数 |

还有一块内存不在上面任何一项里：**跨 shard 共享的内容 arena**。它放在 `SharedArrayBuffer` 里，
属于 V8 堆外，`heapUsed` / `arrayBuffers` / `rssBytes` 的构成都反映不出它。所以单独报在
`GET /v1/info` 的 `contentArena` 上，口径是**进程级**（不是每 shard）：

| 字段 | 说明 |
|---|---|
| `usedBytes` / `capacityBytes` | 已分配 payload 字节 / 总容量 |
| `entries` / `entryCapacity` | 已发布索引条目 / 表容量 |
| `rejected` | 空间不足被拒绝缓存的次数。持续增长说明 `FEATHER_CONTENT_ARENA_MB` 该调大 |

`FEATHER_CONTENT_ARENA=off` 时该字段缺省，内容缓存退回每 isolate 一份的 LRU。

单位命名约定（全契约统一）：

- **时间默认 ms，不加后缀**：`uptime`、`tickDuration`、`maxTickDuration`
- **字节必须带后缀**：`heapUsedBytes`、`rssBytes` —— 裸数字不会默认被理解成字节
- 百分比带 `Percent`，频率带 `Rate`

`GET /v1/maps/:id/stats` 只返回图自己能测的东西，资源以 `shardId` + `shard` 子对象附上：

```json
{
  "tick": 594, "players": 0, "uptime": 38046,
  "tickRate": 15, "tickDuration": 0.43, "maxTickDuration": 148.79,
  "shardId": "shard-0",
  "shard": {
    "cpuPercent": 2.8,
    "heapUsedBytes": 60761080, "heapTotalBytes": 67747840,
    "heapLimitBytes": 4345298944, "externalBytes": 21078111,
    "sampledAt": "2026-10-20T14:52:15.218Z"
  }
}
```

`GET /v1/shards` 是权威视角：

```json
[
  {"shardId":"shard-0","maps":["a"],"mapCount":1,"rssBytes":207290368,
   "uptime":70726,"cpuPercent":2.8,"heapUsedBytes":60761080,
   "heapTotalBytes":67747840,"heapLimitBytes":4345298944,
   "externalBytes":21078111,"sampledAt":"2026-10-20T14:52:15.218Z"},
  {"shardId":"shard-1","maps":["b"],"mapCount":1,"rssBytes":207290368,
   "uptime":38172,"cpuPercent":3.9,"heapUsedBytes":93776872,
   "heapTotalBytes":126844928,"heapLimitBytes":4345298944,
   "externalBytes":20005763,"sampledAt":"2026-10-20T14:52:15.219Z"}
]
```

采样是**按需**的：请求进来才向 worker 要一次数，`cpuPercent` 在 1s 内复用上次结果（窗口太短会被启动抖动主导）。所以 daemon 空闲时这块零开销。

### 4.2 创建地图

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
}
```

返回 `201` + `MapStatus`。`id` 由客户端提供；同一个 `Idempotency-Key` 重放返回同一个结果。

### 4.3 停止

```http
POST /v1/maps/bedwars-s2/stop?timeout=10
```

- 默认优雅停止：先停止接收新玩家，再让 tick 落地，最后退出
- `force=1`：直接 terminate
- 超时返回 `202` + operation；CLI 轮询 `/v1/operations/:id`

### 4.4 日志

```http
GET /v1/maps/bedwars-s2/logs?follow=1&tail=200
```

NDJSON，每行一条：

```json
{"time":"2026-10-19T16:00:00.000Z","stream":"stdout","message":"..."}
```

`stream`: `stdout` | `stderr` | `engine` | `script`。

### 4.5 事件

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

## 7. D2 实现状态

- daemon 运行时已落地：`createDaemon()` + UDS/TCP API
- shard 按核数分配：预算 = `availableParallelism()`（`FEATHER_MAX_SHARDS` 可覆盖），预算没用完就一图一 shard，用完才打包；script 仍一图一个 worker
- map 状态含 `shardId` / `runtime: "worker"`
- 资源指标按 shard 采（`worker.cpuUsage()` / `worker.getHeapStatistics()`），不再用 `process.*` —— 后者在 worker 里读的是整个进程，多 shard 会串号
- `feather up/ps/stop/logs/down` 已接入
- `featherd` 默认 `~/.feather/daemon.sock`
- daemon 重启只恢复 map 注册表，不自动启动图；需要显式 `start`

Postman Collection：[docs/postman/featherd.postman_collection.json](postman/featherd.postman_collection.json)（导入后改 `daemonSocket` 变量）。

Postman 可直接调 UDS：

```text
http://unix:/abs/workspace/.feather/daemon.sock:/v1/maps
```

Windows named pipe：

```text
http://unix://./pipe/featherd:/v1/maps
```

注意：D2 的 map logs 暂时是 shard 级日志（worker stdout/stderr），还没有按图打标；per-map 日志在 D3 补。

## 8. Daemon 契约

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
  listShards(): Promise<ShardStats[]>;
  logs(id: string, opts?: LogOptions): AsyncIterable<LogEntry>;
  events(opts?: EventOptions): AsyncIterable<DaemonEvent>;

  exec(id: string, command: string, args?: unknown): Promise<unknown>;
  close(): Promise<void>;
}
```

- `MapSpec` / `MapStatus` / `MapStats` / `ShardStats` / `LogEntry` / `DaemonEvent` / `Operation` 见契约文件
- 类型只描述 supervisor；单图 engine 仍是 `EngineHandle`
- D2 已实现 shard worker 多图；共享 HostContext 在 D3

## 9. CLI 映射

| CLI | API |
|---|---|
| `feather load <archive>` | `POST /v1/maps/import` |
| `feather ps` | `GET /v1/maps` |
| `feather up [id...]` | `GET /v1/maps` + `POST /v1/maps/:id/start` |
| `feather stop <id...>` | `POST /v1/maps/:id/stop` |
| `feather restart <id...>` | `POST /v1/maps/:id/restart` |
| `feather rm <id>` | `DELETE /v1/maps/:id` |
| `feather logs <id> -f` | `GET /v1/maps/:id/logs?follow=1` |
| `feather eval <id> -- code` | `POST /v1/maps/:id/eval` |
| `feather stats <id>`（planned） | `GET /v1/maps/:id/stats` |
| `feather events`（planned） | `GET /v1/events` |

## 10. 迁移

- **D1（本次）**：`@feather/daemon` 只放契约类型；不实现
- **D2（已完成）**：shard worker supervisor + 本地 UDS API；`ps/up/stop/logs/down`
- **D3**：共享 HostContext（content/build/brpc/redis），减少每图重复
- **D4**：多进程 / 独立 game runtime；daemon 只负责进程与 socket
- **D5**：events/metrics/exec，CLI 完整

## 11. 明确不做

- 不把 daemon 暴露到公网
- 不在 daemon 上做玩家 session
- 不在 daemon 上做游戏协议 WS
- 不引入 etcd/consul；先文件 + 单进程状态
