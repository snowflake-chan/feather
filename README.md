# feather

engine + shell 的 monorepo。

```
feather/
├── engine/          # 主线程：权威状态、物理、网络、内容
├── shell/           # Worker：执行用户代码
├── protocol/        # engine/shell 共享的脚本协议、schema、golden vectors
├── transport/       # Node worker_threads 传输层（server/client）
├── vendor/          # 13 个 @box 包（全量 schema，engine/shell 共用）
├── tsconfig.base.json
├── pnpm-workspace.yaml
└── package.json
```

## 拓扑

```
Node 主进程（engine）
├── HTTP/WS + 游戏逻辑 + 权威状态 + 内容
└── ScriptHost ── MessagePort ──> Worker 1..N（shell）
```

engine 不在主线程执行用户代码；shell 只通过 `ScriptProtocol` 和 engine 通信。

## 命令

```bash
pnpm install
pnpm typecheck     # protocol + transport + shell + engine，0 errors
pnpm build         # protocol + transport + shell + engine
pnpm test:protocol # golden vectors（schema 指纹 + diff/patch 字节）
```

## Smoke

完整命令见 [engine/SMOKE.md](engine/SMOKE.md)。摘要：

```bash
cd engine
BOX_LOCAL_CONFIG_PATH=/Users/lawrencebi/Projects/box3-local-engine/apps/local-engine/config/local.config.json \
BOX_BUNDLED_CONTENT_PATH=/Users/lawrencebi/Projects/box3-local-engine/apps/local-engine/data/blobs \
METHOD=local MODE=play IS_HTTPS=false PORT=9977 \
STORAGE_PATH=/tmp/feather-smoke VM=worker \
SCRIPT_WORKER_ENTRY=../shell/tools/worker-entry/worker-entry.js \
NODE_ENV=development node dist/src/launch.js

curl http://127.0.0.1:9977/api/health-check
```

预期看到 worker 日志：

```
[worker-entry] boot
[worker-entry] ScriptShell constructed
[shell:debug] ScriptShell protocol is ready.
[shell:debug] Loading module: index.js...
[shell:debug] Module loaded.
```

## 子项目文档

| 文档 | 内容 |
|---|---|
| [docs/API-DESIGN.md](docs/API-DESIGN.md) | API 层边界、engine 契约、迁移步骤 |
| [protocol/README.md](protocol/README.md) | 共享协议、构建顺序、golden vectors |
| [engine/README.md](engine/README.md) | engine 抽取、worker 传输、构建 |
| [engine/SMOKE.md](engine/SMOKE.md) | 已验证的 smoke 命令与输出 |
| [engine/SHELL-BOUNDARY.md](engine/SHELL-BOUNDARY.md) | engine 里删了哪些 shell 执行代码 |
| [engine/VENDOR.md](engine/VENDOR.md) | 13 个 vendor 包、构建顺序、上游同步 |
| [shell/README.md](shell/README.md) | shell 抽取与目录 |
| [shell/tools/worker-entry/README.md](shell/tools/worker-entry/README.md) | worker 入口 |

## 合并历史

`shell/` 和 `engine/` 通过 `git subtree` 迁入，各自保留原有 commit。
原仓库仍在：

- `../feather-shell`
- `../feather-engine`

## 阶段

- **Phase 1（已完成）**：合并、统一 vendor、build + typecheck + smoke
- **Phase 2（已完成）**：抽 `protocol/`（`ScriptProtocol` + 共享 schema + golden vectors）
- **Phase 3**：`daemon/`、`cli/`、CI
