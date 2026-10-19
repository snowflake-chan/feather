# engine

从 `box3-local-engine/services/game-server` 抽出来的 **engine（游戏本体）**。
**不含 shell 执行运行时**：用户脚本在 worker 里跑，engine 只负责权威状态、物理、网络、内容。

## 拓扑

```
Node 主进程（engine）
├── HTTP/WS + 游戏逻辑 + 权威状态 + 内容
└── ScriptHost ── MessagePort ──> Worker 1..N（shell，来自 feather-shell）
```

engine 只通过 `ScriptProtocol` 和 shell 通信；不在主线程执行用户代码。

## 砍掉了什么

| 类别 | 文件 |
|---|---|
| 执行入口 | `script/script-shell.ts`、`script/script-start.ts`、`script/safe-eval.ts` |
| 调度 | `script/pairing-heap.ts` |
| 卫星脚本实现 | `*-script.ts`：anticheat / href / rtc / gui / http / navigator / channel / teleport / storage / storage-db / moderation |
| 旧传输 | `utils/script-server/ivm2/*`、`utils/script-server/ivmp/*`、`local-script-socket.ts`、`isolate-res.ts` |
| 旧产物 | `assets/isolate/*`、`scripts/script-server/*` |

## 保留了什么（协议契约 + engine）

- `script/script-host.ts`：engine 侧协议宿主
- `script/script-protocol.ts`、`script-schema.ts`、`script-state-schema.ts`：消息/状态 schema
- `script/bindings/*`：synchronizer、状态 schema、binding DSL（**不是执行运行时**）
- `script/codegen.ts`、`parse-error.ts`、`script-entry.ts`
- 卫星 `*-protocol.ts` / `*-script-protocol.ts` / `*-server-state.ts`
- `voxel/box-encode.ts` 等 engine 与 shell 共享的编码

详细边界见 [SHELL-BOUNDARY.md](SHELL-BOUNDARY.md)。

## 新传输：worker

`src/utils/script-server/worker/`：

| 文件 | 作用 |
|---|---|
| `mu-worker-socket.ts` | `worker_threads` 版 `MuSocketServer` / `MuSocket` |
| `worker-script-server.ts` | `ScriptServer` 实现（`MuSocketServer` + `launch`） |

engine 不包含 shell 的 worker 入口；入口由 **feather-shell** 提供：

```
../shell/tools/worker-entry/worker-entry.js
```

（additive 文件，不改 `src/shell/**`；engine 通过 `SCRIPT_WORKER_ENTRY` 指过去。）

## 运行

```bash
# worker 入口由 shell 包提供
export SCRIPT_WORKER_ENTRY=/path/to/feather-shell/dist/worker-script-entry.js

# VM=worker（entry.ts 的默认分支就是 worker）
node dist/src/launch.js --useProdBundle
```

`entry.ts` 的 VM 分支已移除 `local` / `ivm2` / `ivmp`，只剩 worker：

```ts
const workerEntry =
  process.env.SCRIPT_WORKER_ENTRY ||
  path.resolve(__dirname, './assets/worker/worker-script-entry.js');
scriptServer = new WorkerScriptServer({ workerEntry });
```

## 依赖（vendor）

`@box/*` 已 vendor 到 monorepo 根 `vendor/`（13 个包），pnpm workspace 链接，**已可独立构建**：

```bash
pnpm install
pnpm build          # tsc → dist，0 errors
pnpm build:assets   # 资源生成（需要内容服务配置，单独跑）
```

构建结果：

```
dist/src/entry.js
dist/src/utils/script-server/worker/worker-script-server.js
dist/config/server.js
dist/backendSocket.js
```

13 个包、构建顺序、相对上游的本地修改见 [VENDOR.md](VENDOR.md)。
shell 也使用同一份根 `vendor/`（不再维护裁剪版 schema）。

## 共享协议（Phase 2）

`ScriptProtocol`、状态 schema、绑定 schema 已抽到 `../protocol/`，engine 和 shell 都 import
`@feather/protocol/*`。engine 侧只保留 `script-host.ts` 和 4 个 `bindings/*-update.ts`
（把 patch 应用到 engine 状态）。

## API 契约

Game API（玩家入口）见 [`../docs/API-DESIGN.md`](../docs/API-DESIGN.md)；
Daemon API（本地管理面）见 [`../docs/DAEMON-API.md`](../docs/DAEMON-API.md)。

engine 对 game api 暴露的类型在 `src/engine-contract.ts`，通过 `feather-engine/contract` 引入：

```ts
import type { EngineHandle } from 'feather-engine/contract';
```

map 生命周期/日志/stats 归 `@feather/daemon/contract`，不在 `EngineHandle` 里。

## ScriptServer 注入

`startServer(spec, { scriptServer })` 不再自己创建 worker；`launch.ts` 是当前的组合根：

```ts
const scriptServer = new WorkerScriptServer({ workerEntry });
await startServer(serverConfig, { scriptServer });
```

engine 的库代码（`entry.ts` / `createServer.ts`）只依赖 `@feather/protocol/script-server` 的
`ScriptServer` 接口；worker 实现已经移到 `@feather/transport`。

## 与 shell 的关系

| | engine | shell |
|---|---|---|
| 角色 | 权威状态 / 游戏逻辑 | 执行用户代码 |
| 进程 | 主线程 | Worker |
| 共享 | `ScriptProtocol` + 状态 schema（两份拷贝，需 golden vectors 对齐） | 同左 |

`README.upstream.md` 是上游原 README，保留备查。

## 已验证

| 项 | 结果 |
|---|---|
| `pnpm install` | 13 workspace projects，成功 |
| `pnpm build`（tsc） | **0 errors** |
| worker 传输运行时加载 | 通过 |
| 本地 import | 0 unresolved |
| 删除的 shell 测试 | 8 个（anticheat/moderation/isolate），见 SHELL-BOUNDARY |
| **Smoke run** | ✅ engine + worker shell + 默认项目 + `start`，见 [SMOKE.md](SMOKE.md) |
