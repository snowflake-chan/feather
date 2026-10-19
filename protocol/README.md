# @feather/protocol

engine 和 shell 共享的脚本协议层。两边都从这里 import，不再各自维护副本。

## 内容

| 路径 | 内容 |
|---|---|
| `src/script-protocol.ts` | `ScriptProtocol` 消息表、`ScriptInit` / `ScriptTick` / `ScriptPostTick` 等 |
| `src/script-schema.ts` | 脚本状态 schema |
| `src/script-state-schema.ts` | `ScriptStateSnapshot` / `ScriptEvents` |
| `src/bindings/*` | 绑定 schema + synchronizer + `component-sync` |
| `src/player/*`、`particle/*`、`sound/*`、`zone/*`、`interact/*`、`dialog/*` | 双方共用的 server-state schema |
| `src/script-server.ts` | `ScriptServer` 传输契约（engine 只依赖它） |
| `src/codegen.ts`、`parse-error.ts`、`script-entry.ts` | 共享工具 |

## 消费方式

```ts
import { ScriptProtocol } from '@feather/protocol/script-protocol';
import { ScriptEntityUpdateSchema } from '@feather/protocol/bindings/entity-synchronizer';
```

构建产物在 `dist/`，`package.json` 的 `exports` / `typesVersions` 同时覆盖根入口和子路径。

## 构建

```bash
pnpm --filter @feather/protocol build
pnpm --filter @feather/protocol typecheck
```

`protocol` 必须先于 `shell` / `engine` 构建；根 `pnpm build` 已经排好顺序。

## Golden vectors

```bash
pnpm --filter @feather/protocol test:golden          # 校验
pnpm --filter @feather/protocol test:golden -- --update  # 重新生成
```

`golden/vectors.json` 包含：

- `protocolSha256`：`ScriptProtocol` 全部消息 schema 的指纹
- `perf.schemaSha256`：`ScriptPerfCounterSchema` 的 schema 指纹
- `perf.diffHex` / `diffBytes`：diff 的字节向量
- `perf.patchOk`：patch 回读校验

**改 schema 的规则**：改完跑 `--update`，把 `golden/vectors.json` 一起提交；engine 和 shell 必须同一次提交里更新。

## 边界

留在 engine：

- `src/script/script-host.ts`
- `src/script/bindings/{entity,voxel,world,zone}-update.ts`（把 patch 应用到 engine 状态）

留在 shell：

- `script-shell.ts`、`safe-eval.ts`、`script-start.ts`、`pairing-heap.ts`

这些是执行/应用层，不是协议。
