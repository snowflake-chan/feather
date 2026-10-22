# feather

engine + shell 的 monorepo。

```
feather/
├── cli/             # legacy JS CLI（测试/参考）
├── cli-go/          # canonical Go CLI
├── engine/          # 主线程：权威状态、物理、网络、内容
├── daemon/          # 本地 supervisor + UDS API（Docker-like）
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
feather CLI
   │ HTTP over Unix socket
daemon（main）
   ├── shard worker 0
   │     ├── GameServer A + script worker A
   │     └── GameServer B + script worker B
   └── shard worker 1 ...
```

engine 不跑用户脚本；script worker 一图一个，严格隔离。daemon 只做 supervisor。

## 命令

```bash
pnpm install
pnpm typecheck     # protocol + transport + shell + engine，0 errors
pnpm build         # protocol + transport + shell + engine
pnpm test:protocol # golden vectors（schema 指纹 + diff/patch 字节）
pnpm test:daemon   # shard + daemon API E2E（需要 BOX_BUNDLED_CONTENT_PATH）
```

CLI（Go，`cli-go/`）：

```bash
# daemon 前台运行（另开终端）
feather daemon

feather load map.fmap
feather up
feather ps
feather stop my-map
```

客户端命令只通过 `--socket` 找 daemon；`--data-root` 只属于 `feather daemon`。

构建 Go CLI：

```bash
cd cli-go
go build -o feather .
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
| [docs/API-DESIGN.md](docs/API-DESIGN.md) | Game API（玩家入口）、engine 契约 |
| [docs/DAEMON-API.md](docs/DAEMON-API.md) | Daemon API（本地管理面，Docker-like） |
| [docs/STORAGE.md](docs/STORAGE.md) | 数据存储：SQLite / PostgreSQL / 本地 JSON |
| [docs/WORKSPACE.md](docs/WORKSPACE.md) | data root、volume、`.fmap` 格式 |
| [docs/CLI-CONTRACT.md](docs/CLI-CONTRACT.md) | CLI 命令面、daemon 边界、错误码 |
| [docs/MAP-AUTHORING.md](docs/MAP-AUTHORING.md) | workspace、chunks、git/merge |
| [docs/SHUTDOWN.md](docs/SHUTDOWN.md) | `GameServer.close()`、单进程多图的生命周期与回收 |
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
- **Phase 3（D2 已完成）**：daemon shard supervisor + UDS API + `feather up/ps/stop/logs`
- **Phase 4**：共享 HostContext（C2，content/build 复用）、反代、CI
