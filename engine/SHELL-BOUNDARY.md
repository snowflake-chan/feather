# Shell / Engine 边界

本文件记录 `feather-engine` 从 `box3-local-engine/services/game-server` 抽取时的判断依据。

## 判断方法

1. 从 engine 入口（`entry.ts` / `index.ts` / `createServer.ts` / `launch.ts`）做 import 闭包
2. 闭包内、且只被 shell 执行路径引用的 → 删
3. 闭包内、被 engine 或协议层引用的 → 留
4. 被删文件反向引用的 → 调整 import（不保留执行代码）

## 删除清单（21 项）

### 执行运行时

| 文件 | 原因 |
|---|---|
| `script/script-shell.ts` | 用户代码执行入口；只被 ivm2/ivmp 和 world-synchronizer（仅类型）引用 |
| `script/script-start.ts` | shell 启动入口 |
| `script/safe-eval.ts` | 只被 script-shell 引用 |
| `script/pairing-heap.ts` | shell 调度器节点池，engine 不引用 |

### 卫星脚本实现（`*-script.ts`）

anticheat / href / rtc / gui / http / navigator / channel / teleport / storage / storage-db / moderation

这些是 shell 侧的协议客户端实现；engine 只需要它们对应的 `*-protocol.ts` / `*-script-protocol.ts` schema。

### 旧传输

| 文件 | 原因 |
|---|---|
| `utils/script-server/ivm2/*` | isolated-vm 传输 |
| `utils/script-server/ivmp/*` | 子进程 + isolated-vm 传输 |
| `utils/script-server/local-script-socket.ts` | 同线程 local 模式 |
| `utils/script-server/isolate-res.ts` | ivm 资源 |

### 旧产物

- `assets/isolate/ivm2-script-entry.js`（shell bundle，归 feather-shell）
- `scripts/script-server/rollup.config.mjs`（构建 shell bundle 的配置）

## 保留清单（关键）

### engine 侧宿主

- `script/script-host.ts`：`MuServer(ScriptProtocol)` + 消息处理

### 协议 / 状态 schema

- `script/script-protocol.ts`
- `script/script-schema.ts`
- `script/script-state-schema.ts`
- `script/parse-error.ts`
- 卫星 `*-protocol.ts`、`*-script-protocol.ts`、`*-server-state.ts`

### binding 层（不是执行运行时）

- `script/bindings/*-synchronizer.ts`：schema + 同步逻辑
- `script/bindings/entity-update.ts` / `world-update.ts` / `voxel-update.ts` / `zone-updates.ts`：把 shell 的更新应用到 engine 状态
- `script/bindings/binding-factory.ts`、`api.ts`、`dispatcher.ts`、`motions.ts`、`animations.ts`、`resource.ts`、`selectors.ts`、`coerce.ts`、`physics-selector.ts`
- `script/codegen.ts`：synchronizer / binding DSL 依赖

> 这些文件里混着 shell API 定义和 engine 状态同步，不能按目录一刀切。
> 它们的 schema 是 engine 与 shell 的**共享契约**，删掉 engine 就不认识 shell 的消息。

### 共享工具

- `voxel/box-encode.ts`
- `utils/script-promise.ts`、`utils/deprecate.ts`（按需）

## 三处纠缠及处理

| 纠缠 | 处理 |
|---|---|
| `world-synchronizer.ts` 用 `ScriptShell` 类型 | 改成 `{ prevTickEvent: ScriptTickEvent }`（`import type`） |
| `script-host.ts` 用 `script-entry.ts` 的 `resolveRuntimeScriptEntry` | `script-entry.ts` 是纯函数工具，保留 |
| `entity-synchronizer.ts` 等用 `binding-factory` 的常量 | `binding-factory` 属于绑定 DSL，保留（不是执行运行时） |

## 删除的 shell 侧测试（8 个）

这些测试引用已删除的 shell 执行文件或 `isolated-vm`，随执行运行时一起移除：

- `scripts/anticheat-actions.test.ts`
- `scripts/anticheat-bridge.test.ts`
- `scripts/anticheat-policy.test.ts`
- `scripts/anticheat-tracker.test.ts`
- `scripts/regression-anticheat.ts`
- `scripts/regression-anticheat-isolate.ts`
- `scripts/regression-script-moderation.ts`
- `scripts/regression-moderation-isolate-error.ts`

它们属于 feather-shell 的测试范围，需要时在 shell 仓库重建。

## 未删除但可再评估

静态闭包显示以下文件当前不可达（可能是 feature / 动态引用）：

- `edit/replica/*`、`edit/code-editor/*`
- `anticheat/action-data.ts`、`player-tracker.ts`、`tracker-snapshot.ts`
- `player/player-schema.ts`
- `storage/local-data-storage.ts`
- `utils/map-scripts.ts`、`mu-array-union.ts`

没有删除，避免误删 feature。等 engine 真跑起来再做二次裁剪。


## Phase 2：共享协议已抽到 `protocol/`

以下内容已从 engine 移出，engine 和 shell 都改为 import `@feather/protocol/*`：

- `script-protocol.ts`、`script-schema.ts`、`script-state-schema.ts`
- `codegen.ts`、`parse-error.ts`、`script-entry.ts`
- `bindings/*`（除 4 个 `*-update.ts`）
- 共享 server-state schema：`player`、`particle`、`sound`、`zone`、`interact`、`dialog`

engine 只保留：

- `src/script/script-host.ts`
- `src/script/bindings/{entity,voxel,world,zone}-update.ts`

后者依赖 engine 的 `GameServerState` / `VoxelServer`，属于「把 patch 应用到 engine 状态」，
不是协议。
