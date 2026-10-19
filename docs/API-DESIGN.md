# API 层设计

目标：把「网络边缘」从 engine 里彻底拆出去，engine 变成可嵌入的库，API 层可以替换（HTTP/WS、Go daemon、unix socket），app 负责组合。

## 1. 分层

```
app/           唯一组合根：创建 httpServer / socketServer / engine / api，然后 listen
api/           网络边缘：HTTP 路由、WS 服务、TLS、CORS、鉴权、限流、版本化、admin
engine/        领域：项目/内容、游戏循环、session、脚本宿主、状态
protocol/      共享协议与 schema
transport/     worker_threads server/client
```

依赖方向：

```
app → api → engine
app → engine
app → transport
engine → protocol, transport/server（仅 CLI 组合根）
api    → engine 的 EngineHandle
```

**engine 永远不 import api。** api 只通过 `EngineHandle` 访问 engine。

## 2. API 面

### 2.1 控制面（HTTP）

| 方法 | 路径 | 归属 | 说明 |
|---|---|---|---|
| GET | `/api/health-check` | api | liveness/readiness，返回 runtime/storage/redis |
| GET | `/api/server-info` | api | 名称、版本、协议版本、contentId、maxPlayers |
| POST | `/createSession` | api | 创建 session；调 `engine.session.create` |
| GET | `/api/session` | api | 查询当前 session |
| GET | `/v1/status` | api（未来） | daemon/CLI 用；比 health-check 更详细 |
| POST | `/v1/commands/:name` | api（未来） | 管理命令，转发 `engine.admin.command` |
| GET | `/v1/logs` | api（未来） | 日志流 |
| POST | `/v1/maps/:id/stop` | api（未来） | 多图 host 后使用 |

### 2.2 内容面

| 方法 | 路径 | 归属 | 说明 |
|---|---|---|---|
| GET | `/engine/m/:hash` | api | 内容寻址读取，走 `engine.content.read/stat` |
| GET | `/block` | engine | 体素块数据；engine 自己注册 |
| GET | `/api/project-skin-previews` | engine | 皮肤预览；engine 自己注册 |

engine 返回 `httpRoutes`（只有自己拥有的路由），api 合并自己的路由后再 `listen`。

### 2.3 数据面（WebSocket）

- api 创建 `MuWebSocketServer`（`httpServer` + `requireSessionProof`）
- engine 用这个 socket server 创建 `MuServer`
- 会话校验在 engine 的 `GameSession` 里；api 只负责把 `socketServer` 交给 engine
- 路径、TLS、CORS、代理头由 api 决定

### 2.4 Admin / daemon（未来）

给 Go CLI 用的控制面：

- `GET /v1/status`：运行状态、tick、玩家数、内存
- `GET /v1/logs`：日志流
- `POST /v1/commands/:name`：管理命令
- `POST /v1/maps/:id/stop`、`/restart`
- 错误统一 `{ status, code, msg }`；`/v1` 版本化；写操作支持 `Idempotency-Key`

## 3. Engine 契约

engine 预留的接口在 `engine/src/engine-contract.ts`，通过 `feather-engine/contract` 暴露：

```ts
import type { EngineHandle, CreateEngine } from 'feather-engine/contract';
```

核心是：

```ts
export interface EngineHandle {
  readonly httpRoutes: EngineHttpRoutes;
  readonly muServer: MuServer;
  readonly session: EngineSessionApi;
  readonly content: EngineContentApi;
  readonly admin: EngineAdminApi;
  status(): EngineStatus;
  start(): Promise<void>;
  close(): Promise<void>;
}
```

### 3.1 字段职责

| 字段 | 给谁用 | 说明 |
|---|---|---|
| `httpRoutes` | api | engine 自己拥有的路由；api 合并 |
| `muServer` | api / admin | 协议服务；api 用它接 `MuWebSocketServer` |
| `session` | api | 创建/查询/吊销 session、限流 |
| `content` | api | 读内容、取大小/MIME；api 负责流式响应 |
| `admin` | api（未来） | 状态、命令、停止 |
| `status()` | api | 同步快照，health/status 用 |
| `start()` / `close()` | app | 启动/停止游戏循环，不监听端口 |

### 3.2 创建

```ts
export interface CreateEngineOptions {
  scriptServer: ScriptServer;   // 由 app 注入
  socketServer: MuSocketServer; // 由 api/app 创建
  httpRoutes?: EngineHttpRoutes;
}

export type CreateEngine = (
  config: EngineConfig,
  options: CreateEngineOptions,
) => Promise<EngineHandle>;
```

- `socketServer` 由 api 创建，engine 不再 import `MuWebSocketServer`。
- `httpRoutes` 可以由 api 传入一个空 map，engine 往里注册；也可以 engine 自己建，返回给 api。契约里两者都允许。
- `createEngine` **只 build，不 listen**；`httpServer.listen` 由 api 负责。

## 4. 关键流程

### 4.1 createSession

```
client → api POST /createSession
api: 解析 body/headers、CORS、鉴权、限流
api → engine.session.create({ ipAddress, token, ... })
engine: 后端登录 / 构造 GameSessionData / bindUserSession
engine → api: GameSessionData
api: 设置 cookie、返回 { sessionId, ... }
```

### 4.2 WebSocket join

```
api: httpServer + MuWebSocketServer
app: createEngine({ socketServer, scriptServer })
engine: new MuServer(socketServer) + GameServer + GameSession
client: WS connect
MuServer: session proof 校验 → engine.session.get(sessionId)
engine: GameServer.handleUserJoin
```

### 4.3 内容

```
client → api GET /engine/m/:hash
api → engine.content.stat(hash) → size/contentType
api → engine.content.read(hash) → stream
```

## 5. 边界规则

1. **engine 不 import api**；api 不 import `engine/src/entry.ts` 的内部闭包。
2. **api 拥有端口、TLS、CORS、鉴权头、限流、错误格式、版本化。**
3. **engine 拥有 session 语义、内容寻址、游戏循环、脚本宿主。**
4. **engine 不创建 `http.Server` / `MuWebSocketServer`**；只接收 `MuSocketServer`。
5. **app 是唯一知道所有实现的地方**；`launch.ts` 最终变成 `app/cli.ts`。
6. **协议层不依赖 api**；`@feather/protocol` 只放共享类型/schema。

## 6. 迁移步骤

### C1（本次）

- 新增 `engine/src/engine-contract.ts`：`EngineHandle` / `EngineStatus` / `EngineSessionApi` / `EngineContentApi` / `EngineAdminApi` / `CreateEngine`。
- `engine/package.json` 增加 `./contract` export + `typesVersions`。
- 打开 `declaration: true`，engine 现在可以给 app/api 提供 `.d.ts`。
- 不改运行时。

### C2

- 把 `createGameServer` 的 `MuWebSocketServer` 创建移出去：接受 `socketServer: MuSocketServer`。
- 拆 `startServer` 为 `createEngine`（build） + `engine.start()`（game loop），不 `listen`。
- `startServer` 保留为过渡包装。

### C3

- 新建 `api/` 包：
  - `createApi({ engine, httpServer, socketServer })`
  - 注册 `/api/health-check`、`/api/server-info`、`/createSession`、`/api/session`
  - 注册 `/engine/m/:hash`
  - 合并 `engine.httpRoutes`
- `createGameServer` 不再注册控制面路由。

### C4

- `app/index.ts`：组合根
- `app/cli.ts`：参数解析、help
- `api/admin/*`：`/v1/status`、`/v1/commands`、`/v1/logs`
- 多图 host / worker pool 也接在这里

## 7. 待定

- `EngineSessionApi.create` 的输入字段（token/登录模式）需要和后端登录流程对齐
- admin 鉴权方式（token / unix socket / mTLS）
- `content.read` 是整块 `Uint8Array` 还是流；先整块，大文件再改流
- WS 路径是否加 `/v1`；游戏协议本身已有版本
- `EngineStatus.storage` 的三态（ok/disabled/error）由 engine 计算
