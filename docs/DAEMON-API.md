# Daemon API（Docker-like）

本地管理面。只给管理员 / CLI / daemon 自己用，和玩家入口（Game API）完全分开。

## 1. 定位

daemon 是 **supervisor**，管理两层资源：

- **cached map**（image）：已安装的地图定义；`load` 产生。
- **instance**（container）：map 的运行副本；`run` 产生，一张 map 可以起多个。

daemon 负责 instance 的 start/stop/restart/destroy、日志、统计、事件；不处理玩家 session，不暴露 `createSession`。默认只监听本机（Unix socket 或 127.0.0.1）。

Game API（玩家）见 [API-DESIGN.md](API-DESIGN.md)。

## 2. Transport 与认证

| 项 | 默认 |
|---|---|
| 传输 | Unix socket `~/.feather/daemon.sock` |
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
| MapDefinition | cached map / image：id、version、contentHash、size、installedAt、defaults、instanceCount |
| Instance | container：id、mapId、mapContentHash、state、port、shardId、dataDir、volume、limits |
| Operation | 异步 start/stop/restart/destroy 的记录；引用 `instanceId` |
| Event | map / instance 生命周期事件流 |
| Log | 每个 instance 的日志流（当前底层仍是 shard 级输出） |

### 3.1 Map 生命周期（image）

```
installed ──load --replace──▶ updated ──rmi──▶ removed
```

- map 没有 running 状态；只有 `installedAt` / `contentHash` / `instanceCount`。
- `DELETE /v1/maps/:id` 在仍有 instance 时返回 `409 MAP_HAS_INSTANCES`；`?force=1` 连 instance 一起删。
- map 更新不影响已有 instance：instance 创建时 pin `mapContentHash`。`up <archive>` 才会自动 recreate 目标 instance；裸 `load --replace` 遇到运行中的 instance 返回 `MAP_BUSY`。

### 3.2 Instance 状态机（container）

```
created → starting → running → stopping → stopped
   │         │          │          │
   └─────────┴──────────┴──────────┴──→ error
stopped / error → starting（restart）
任意状态 → destroyed（DELETE，先 stop）
```

**shard 崩溃后的自动重启**由 `InstanceSpec.restartPolicy` 决定：

| 值 | 行为 |
|---|---|
| `no`（默认） | 不重启，instance 停在 `error`，等人工处理 |
| `on-failure` | 仅当 shard 以非 0 退出码结束时重启 |
| `always` | 无论退出码都重启 |

退避从 1s 起翻倍、上限 30s；连续失败 5 次后放弃，把原因写进 `InstanceStatus.error`。
计数在两种情况下清零：instance 稳定运行超过 60s 之后又崩，或用户手动 `start` / `stop`。
退避期间执行 `stop` / `destroy` 会取消待执行的重启。

## 4. Endpoints

所有管理接口在 `/v1` 下；`/_ping` 不带版本。

### 4.1 Canonical

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/_ping` | liveness；`OK`；不需要认证 |
| GET | `/v1/version` | `{ version, apiVersion }` |
| GET | `/v1/info` | daemon 信息、maps 数、instances 数、uptime |
| GET | `/v1/maps` | 列出 `MapDefinition`（不是 instance） |
| POST | `/v1/maps/import` | 安装 `.fmap` / `.boxplay`；`?replace=1&purge=1` |
| GET | `/v1/maps/:id` | map definition |
| DELETE | `/v1/maps/:id` | 移除 cached map；有 instance 时 `409 MAP_HAS_INSTANCES`，`?force=1` |
| GET | `/v1/instances` | 列出 `InstanceStatus` |
| POST | `/v1/instances` | 创建 instance：`{ mapId, id?, port?, volume?, limits?, labels? }` |
| GET | `/v1/instances/:id` | instance status |
| DELETE | `/v1/instances/:id` | destroy instance；`?force=1` |
| POST | `/v1/instances/:id/start` | start；异步返回 operation |
| POST | `/v1/instances/:id/stop` | stop；`?timeout=10&force=1` |
| POST | `/v1/instances/:id/restart` | restart |
| GET | `/v1/instances/:id/stats` | `tickRate`（TPS）/ `tickDuration`（每帧计算耗时，MC 的 MSPT）/ players / 所在 shard 的资源快照 |
| GET | `/v1/instances/:id/logs` | NDJSON；`follow=1&since=&tail=` |
| POST | `/v1/instances/:id/eval` | JS eval（谨慎；默认关闭） |
| POST | `/v1/instances/:id/exec` | eval 的兼容别名 |
| GET | `/v1/shards` | 按 shard 报 CPU / V8 堆 / 承载的 instance；资源指标唯一有意义的口径 |
| GET | `/v1/events` | NDJSON 生命周期事件；`since=` |
| GET | `/v1/operations/:id` | 异步操作状态 |
| POST | `/v1/shutdown` | 关闭 daemon；仅本地/已认证 |
| GET | `/v1/metrics` | Prometheus（可选） |

### 4.2 兼容别名

没有。发版前不保留 `/v1/maps/:id/{start,stop,restart,stats,logs,eval,exec}` 或 `POST /v1/maps`；cached map 只走 `/v1/maps` / `/v1/maps/import`，运行副本只走 `/v1/instances`。


### 4.3 指标口径（`stats` / `shards`）

资源指标**只有 shard 口径**。engine 允许一个 shard 打包多个 instance，CPU 和 V8 堆是整条线程 / 整个 isolate 共享的，摊不到单个 instance 上。

| 字段 | 口径 | 说明 |
|---|---|---|
| `tickRate` | per-instance | 实测 TPS。标称 15.625（`1000/64`），掉到标称以下说明已经跟不上 |
| `tickDuration` | per-instance | 上一采样窗口内每帧的平均**计算耗时**（ms，MC 的 MSPT）。**不是** `1000/tickRate` |
| `maxTickDuration` | per-instance | 启动以来最慢的一帧 |
| `cpuPercent` | per-shard | `worker.cpuUsage()` 窗口差值，单位 %。单核满载 = 100，塞了多个 instance 可超过 100 |
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

`GET /v1/instances/:id/stats` 只返回 instance 自己能测的东西，资源以 `shardId` + `shard` 子对象附上：

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
  {"shardId":"shard-0","maps":["a-1"],"mapCount":1,"rssBytes":207290368,
   "uptime":70726,"cpuPercent":2.8,"heapUsedBytes":60761080,
   "heapTotalBytes":67747840,"heapLimitBytes":4345298944,
   "externalBytes":21078111,"sampledAt":"2026-10-20T14:52:15.218Z"},
  {"shardId":"shard-1","maps":["b"],"mapCount":1,"rssBytes":207290368,
   "uptime":38172,"cpuPercent":3.9,"heapUsedBytes":93776872,
   "heapTotalBytes":126844928,"heapLimitBytes":4345298944,
   "externalBytes":20005763,"sampledAt":"2026-10-20T14:52:15.219Z"}
]
```

`maps` 字段是 instance id。采样是**按需**的：请求进来才向 worker 要一次数，`cpuPercent` 在 1s 内复用上次结果（窗口太短会被启动抖动主导）。所以 daemon 空闲时这块零开销。

### 4.4 安装 cached map

```http
POST /v1/maps/import?replace=1
Content-Type: application/gzip

<.fmap 原始字节>
```

返回 `201`：

```json
{ "maps": [{ "id": "bedwars", "state": "created" }] }
```

- 只写 `<dataRoot>/maps/<mapId>/` + 合并 blobs；**不创建 instance**。
- `.boxplay` 的多个成员一起注册为多个 cached map。
- `--replace` 更新 definition；有运行中的 instance 时返回 `MAP_BUSY`。`up <archive>` 带 `recreate=1` 才 stop + rm 后重建。

`state` 是兼容字段；目标只返回 definition 字段（`id` / `version` / `contentHash`）。

### 4.5 创建 / 启动 instance

```http
POST /v1/instances
Content-Type: application/json

{
  "mapId": "bedwars",
  "id": "bedwars-2",
  "port": 3002,
  "volume": "bedwars-2",
  "limits": { "players": 32, "memoryMb": 512 }
}
```

- `id` 缺省 = `mapId`；重复返回 `409 INSTANCE_CONFLICT`。
- `volume` 缺省 = `id`；显式同名会共享 SQLite（多写要警告）。
- 返回 `201` + `InstanceStatus`（`state = "created"`）。
- `POST /v1/instances/:id/start` 返回 `202` + operation。

### 4.6 停止 / 重启

```http
POST /v1/instances/bedwars-2/stop?timeout=10
POST /v1/instances/bedwars-2/restart
```

- 默认优雅停止：先停止接收新玩家，再让 tick 落地，最后退出
- `force=1`：直接 terminate
- 超时返回 `202` + operation；CLI 轮询 `/v1/operations/:id`

### 4.7 日志

```http
GET /v1/instances/bedwars-2/logs?follow=1&tail=200
```

NDJSON，每行一条：

```json
{"time":"2026-10-19T16:00:00.000Z","stream":"stdout","message":"..."}
```

`stream`: `stdout` | `stderr` | `engine` | `script`。

当前底层是 shard 级 stdout/stderr，还没有按 instance 打标；per-instance 日志在后续补。

### 4.8 事件

```http
GET /v1/events?since=...
```

```json
{"type":"instance.running","mapId":"bedwars","instanceId":"bedwars-2","time":"..."}
```

| 层 | 事件 |
|---|---|
| map | `map.installed`、`map.updated`、`map.removed` |
| instance | `instance.created`、`instance.starting`、`instance.running`、`instance.stopping`、`instance.stopped`、`instance.error`、`instance.destroyed` |
| daemon | `daemon.ready`、`daemon.shutdown` |

> `instance.created` 已发；start/stop 生命周期当前仍发 `map.starting/running/...`（`mapId` = instance id），后续改 `instance.*`。

## 5. 错误模型

```json
{
  "code": "MAP_NOT_FOUND",
  "message": "map bedwars not found",
  "details": {}
}
```

| HTTP | code 示例 |
|---|---|
| 400 | `INVALID_ARGUMENT` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN`、`EVAL_DISABLED` |
| 404 | `MAP_NOT_FOUND`、`OPERATION_NOT_FOUND` |
| 409 | `MAP_CONFLICT`、`INSTANCE_CONFLICT`、`MAP_HAS_INSTANCES`、`MAP_BUSY`、`OPERATION_IN_PROGRESS` |
| 422 | `INVALID_SPEC`、`ARCHIVE_INVALID`、`ARCHIVE_UNSUPPORTED` |
| 500 | `INTERNAL` |
| 503 | `NOT_READY` |

- `MAP_NOT_FOUND` 目前同时用于 map 和 instance；后续拆 `INSTANCE_NOT_FOUND`。
- `MAP_CONFLICT`：import 目标 mapId 已存在。`INSTANCE_CONFLICT`：instance id 已存在。
- `MAP_HAS_INSTANCES`：`DELETE /v1/maps/:id` 时仍有 instance。
- 异步操作返回 `202` + `operation`
- 冲突时返回 `409`，带当前状态
- 限流返回 `429` + `Retry-After`（未来）

## 6. 幂等、并发、分页

- `POST /v1/maps/import`、`POST /v1/instances`、`POST .../start|stop|restart` 支持 `Idempotency-Key`
- 同一个 instance 同一时间只允许一个生命周期操作；冲突 `409`
- 列表未来支持 `?limit=&cursor=`；当前数量小，先全量
- 未来更新 spec 用 `If-Match` / generation 做乐观并发

## 7. 实现状态

- map / instance 拆分已在 contract、API、Go CLI 落地：`MapDefinition` / `InstanceSpec` / `InstanceStatus`。
- `MapStatus` / `MapSpec` 仅作为内部旧类型；新代码用 `MapDefinition` / `InstanceStatus` / `ResolvedMapSpec`。
- `importArchive` 现在只装 definition；但 `--replace` 仍会 force 删除该 map 的 instance。目标是保留 instance、只更新 definition。
- `instance.created` 已发；start/stop 生命周期仍发 `map.*`，目标是 `instance.*`。
- `featherd` 默认 `~/.feather/daemon.sock`。
- daemon 重启只恢复 instance 注册表，不自动启动；需要显式 `run` / `start`。

Postman Collection：[docs/postman/featherd.postman_collection.json](postman/featherd.postman_collection.json)（导入后改 `daemonSocket` 变量）。

Postman 可直接调 UDS：

```text
http://unix:/Users/you/.feather/daemon.sock:/v1/maps
```

Windows named pipe：

```text
http://unix://./pipe/featherd:/v1/maps
```

## 8. Daemon 契约

`@feather/daemon/contract`：

```ts
interface DaemonHandle {
  ping(): Promise<{ ok: true; version: string }>;
  version(): Promise<{ version: string; apiVersion: string }>;
  info(): Promise<DaemonInfo>;

  // cached maps / images
  listDefinitions(): Promise<MapDefinition[]>;
  getDefinition(id: string): Promise<MapDefinition | undefined>;
  destroyDefinition(mapId: string, opts?: DestroyOptions): Promise<void>;

  // instances / containers
  listInstances(): Promise<InstanceStatus[]>;
  createInstance(mapId: string, options?: { id?: string; port?: number; volume?: string; limits?: MapLimits; labels?: Record<string, string> }): Promise<InstanceStatus>;
  destroyInstance(id: string, opts?: DestroyOptions): Promise<void>;
  startMap(id: string): Promise<Operation>;
  stopMap(id: string, opts?: StopOptions): Promise<Operation>;
  restartMap(id: string): Promise<Operation>;

  defineMap(spec: MapSpec): Promise<MapDefinition>;

  // instance status（legacy 名字；/v1/instances/:id 仍在用）
  getMap(id: string): Promise<MapStatus | undefined>;

  listMaps(): Promise<MapStatus[]>;
  destroyMap(id: string, opts?: DestroyOptions): Promise<void>;

  stats(id: string): Promise<MapStats>;
  listShards(): Promise<ShardStats[]>;
  logs(id: string, opts?: LogOptions): AsyncIterable<LogEntry>;
  events(opts?: EventOptions): AsyncIterable<DaemonEvent>;

  exec(id: string, command: string, args?: unknown): Promise<unknown>;
  close(): Promise<void>;
}
```

- `MapDefinition` / `InstanceSpec` / `InstanceStatus` / `ResolvedMapSpec` 见契约文件。
- `MapSpec` / `MapStatus` 仅内部旧类型；新代码用 `MapDefinition` / `InstanceStatus` / `ResolvedMapSpec`。
- engine 侧仍然消费 `ResolvedMapSpec`，由 MapDefinition + InstanceSpec 合成；engine contract 尽量不改。
- `MapStats` 是 per-instance；`ShardStats` 是 per-shard。

## 9. CLI 映射

| CLI | API |
|---|---|
| `feather load <archive>` | `POST /v1/maps/import` |
| `feather up <archive\|map>` | `POST /v1/maps/import?recreate=1` + `/v1/instances` |
| `feather maps` | `GET /v1/maps` |
| `feather inspect <map>` | `GET /v1/maps/:id` |
| `feather rmi <map>` | `DELETE /v1/maps/:id` |
| `feather run <map>` | `POST /v1/instances` + `POST /v1/instances/:id/start` |
| `feather ps` | `GET /v1/instances` |
| `feather start <instance>` | `POST /v1/instances/:id/start` |
| `feather stop <instance>` | `POST /v1/instances/:id/stop` |
| `feather restart <instance>` | `POST /v1/instances/:id/restart` |
| `feather rm <instance>` | `DELETE /v1/instances/:id` |
| `feather logs <instance> -f` | `GET /v1/instances/:id/logs?follow=1` |
| `feather eval <instance> -- code` | `POST /v1/instances/:id/eval` |
| `feather stats <instance>`（planned） | `GET /v1/instances/:id/stats` |
| `feather events`（planned） | `GET /v1/events` |

## 10. 迁移

- **D1**：contract 类型。
- **D2**：shard worker supervisor + UDS API；map/instance 拆分。
- **D3**：共享 HostContext，减少每 instance 重复。
- **D4**：多进程 / 独立 game runtime；daemon 只负责进程与 socket。
- **D5**：events / metrics / eval，CLI 完整。

当前剩余：

- 删除 `listMaps` / `destroyMap` legacy 方法；`getMap` 改名 `getInstance`。
- 删除 `MapSpec` / `MapStatus` 兼容类型。
- 事件全面切到 `instance.*`（`instance.created` 已发）。
- instance 错误码拆 `INSTANCE_*`。

## 11. 明确不做

- 不把 daemon 暴露到公网
- 不在 daemon 上做玩家 session
- 不在 daemon 上做游戏协议 WS
- 不引入 etcd/consul；先文件 + 单进程状态
