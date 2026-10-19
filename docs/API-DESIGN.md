# Game API 设计

玩家入口。和本地管理面（daemon API）完全分开，见 [DAEMON-API.md](DAEMON-API.md)。

## 1. 两个平面

| | Game API | Daemon API |
|---|---|---|
| 面向 | 玩家客户端 | 本机管理员 / CLI / daemon |
| 位置 | 每张图一个，游戏端口 | supervisor 一个，本地 socket/localhost |
| 认证 | session cookie / session proof | socket 权限 / 本地 token |
| CORS | 允许 | 不允许 |
| 典型接口 | `createSession`、WS、内容 | 地图生命周期、日志、stats、events |
| 玩家会话 | **是** | **否** |

`createSession` 属于 Game API；daemon 不碰玩家 session。

## 2. 分层

```
app/game/        组合根：httpServer + socketServer + engine + gameApi
api-game/        玩家网络边缘：HTTP session/content + WS 游戏协议
engine/          领域：项目、游戏循环、session、脚本、状态
protocol/        共享协议
transport/       worker_threads
```

依赖：`app/game → api-game → engine`。engine 不 import api。

## 3. Game API 面

### 3.1 HTTP（玩家）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health-check` | 玩家侧 liveness；不暴露内部细节 |
| GET | `/api/server-info` | 名称、版本、协议版本、contentId、maxPlayers |
| POST | `/createSession` | **玩家创建 session**；调 `engine.session.create`，设置 cookie |
| GET | `/api/session` | 查询当前 session |
| GET | `/engine/m/:hash` | 内容寻址读取 |
| GET | `/block` | 体素块（engine 自己注册） |
| GET | `/api/project-skin-previews` | 皮肤预览（engine 自己注册） |

### 3.2 WebSocket

- 每个游戏端口一个 `MuWebSocketServer`
- `requireSessionProof: true`
- 会话校验在 `engine.session.get` / `GameSession`
- 路径、TLS、代理头由 `api-game` 决定

## 4. Engine 契约（Game）

`feather-engine/contract`：

```ts
interface EngineHandle {
  readonly httpRoutes: EngineHttpRoutes;
  readonly muServer: MuServer;
  readonly session: EngineSessionApi;
  readonly content: EngineContentApi;
  status(): EngineStatus;
  start(): Promise<void>;   // 游戏循环，不 listen
  close(): Promise<void>;
}

interface CreateEngineOptions {
  scriptServer: ScriptServer;
  socketServer: MuSocketServer; // api-game 创建
  httpRoutes?: EngineHttpRoutes;
}
```

- **没有 `admin`**：地图生命周期归 daemon。
- `session` 只服务玩家 session。
- `content` 给 `/engine/m/:hash` 用。
- `httpRoutes` 只含 engine 自己的 `/block`、`/api/project-skin-previews`。

## 5. 关键流程

### createSession

```
client → api-game POST /createSession
api-game: body/CORS/限流
api-game → engine.session.create({ ipAddress, token, ... })
engine: 后端登录 → GameSessionData → bindUserSession
api-game: 设置 cookie → 返回 { sessionId }
```

### WS join

```
api-game: httpServer + MuWebSocketServer
app/game: createEngine({ socketServer, scriptServer })
engine: new MuServer(socketServer) + GameServer + GameSession
client: WS connect
MuServer: session proof → engine.session.get
engine: GameServer.handleUserJoin
```

## 6. 边界规则

1. engine 不 import api-game；api-game 不 import `entry.ts` 内部闭包。
2. api-game 拥有端口、TLS、CORS、cookie、限流、错误格式。
3. engine 拥有 session 语义、内容寻址、游戏循环、脚本宿主。
4. engine 不创建 `http.Server` / `MuWebSocketServer`。
5. daemon 不调用 `createSession`，也不持有玩家 cookie。
6. app 是唯一组合根。

## 7. 迁移

### C1（已完成）

- `engine/src/engine-contract.ts`：`EngineHandle` / `EngineStatus` / `EngineSessionApi` / `EngineContentApi` / `CreateEngine`
- `feather-engine/contract` 导出
- engine 打开 `declaration: true`

### C2

- `createGameServer` 接受 `socketServer`，不再自己 `new MuWebSocketServer`
- `startServer` 拆成 `createEngine`（build）+ `engine.start()`
- 保留 `startServer` 过渡

### C3

- 新建 `api-game/`：
  - `/api/health-check`、`/api/server-info`、`/createSession`、`/api/session`
  - `/engine/m/:hash`
  - 合并 `engine.httpRoutes`
- `app/game/index.ts` 组合
- `entry.ts` 不再注册控制面路由

### C4

- daemon supervisor + daemon API（见 DAEMON-API.md）
- `app/daemon/index.ts`
- CLI 走 daemon socket
