# Smoke Run

验证目标：engine 主线程 + feather-shell Worker，跑通默认项目、协议握手和 `start`。

## 命令

```bash
cd /Users/lawrencebi/Projects/feather/engine

BOX_LOCAL_CONFIG_PATH=/Users/lawrencebi/Projects/box3-local-engine/apps/local-engine/config/local.config.json \
BOX_BUNDLED_CONTENT_PATH=/Users/lawrencebi/Projects/box3-local-engine/apps/local-engine/data/blobs \
METHOD=local MODE=play IS_HTTPS=false PORT=9977 \
STORAGE_PATH=/tmp/feather-engine-smoke \
VM=worker \
SCRIPT_WORKER_ENTRY=../shell/tools/worker-entry/worker-entry.js \
NODE_ENV=development \
node dist/src/launch.js
```

## 预期输出（关键行）

```
<prebakeMap>: Voxels preloaded.
<prebakeMap>: Hot project baked.
Project loaded.
Creating GameServer.
<script-host>: Script server started.
<script-host>: start finished
local server listening on 9977
[worker-entry] boot
[shell:debug] ScriptShell socket client started.
[worker-entry] ScriptShell constructed
[shell:debug] ScriptShell protocol is ready.
[shell:debug] ScriptShell starting.
[shell:debug] Loading module: index.js...
[shell:debug] Module loaded.
```

健康检查：

```bash
curl http://127.0.0.1:9977/api/health-check
# {"status":"ok","runtime":"ready",...}
curl http://127.0.0.1:9977/api/server-info
# {"name":"BOX 世界","engineVersion":"0.1.1","protocolVersion":1,...}
```

## 已验证

| 项 | 结果 |
|---|---|
| engine 启动 + 默认项目 | ✅ |
| HTTP 服务 | ✅ 9977 |
| `ScriptHost` → `WorkerScriptServer.launch` | ✅ worker 创建（threadId=2） |
| worker 加载 feather-shell | ✅ `ScriptShell constructed` |
| `ScriptProtocol` 握手 | ✅ `protocol is ready` |
| engine → shell `start` | ✅ `ScriptShell starting` |
| 默认项目脚本加载 | ✅ `Loading module: index.js... Module loaded` |
| shell → engine 消息 | ✅ 协议 ready 后的 log/pump 通道可用 |

## 已知无害噪音

```
get local VOXA mesh assets error: connect ECONNREFUSED 127.0.0.1:3001
```

本地没有 VOXA 服务；`localContentWithVoxa` 的 fallback 会尝试它，失败后继续。
默认项目不依赖 VOXA mesh assets。

## 两个 dev-only 环境变量

| 变量 | 作用 | 生产 |
|---|---|---|
| `BOX_LOCAL_CONFIG_PATH` | 绕过 Nacos，读本地 YAML/JSON 配置 | 用真实配置中心 |
| `BOX_BUNDLED_CONTENT_PATH` | 默认项目的 block info / 模板资源回退 | 用项目自己的 blobs |

## 没覆盖

- 真实地图 / 玩家客户端进图
- tick 频率 / 延迟 / CPU
- worker watchdog（超时 → terminate → restart）
- `resourceLimits`
- 多地图 / daemon

## 复现注意

- 先 `pnpm install && pnpm build`
- `shell` 需要先构建：在仓库根 `pnpm --filter feather-shell build`（生成 `shell/dist/script/script-shell.js`）
- worker 入口在 **shell**：`../shell/tools/worker-entry/worker-entry.js`
- 端口被占用时改 `PORT`


## 最小验证脚本（不依赖外部服务）

用默认项目 + `engine/scripts/validation.js` 验证 tick / 定时器 / 查询 / 异常回传：

```bash
cd engine
BOX_LOCAL_CONFIG_PATH=/Users/lawrencebi/Projects/box3-local-engine/apps/local-engine/config/local.config.json \
BOX_BUNDLED_CONTENT_PATH=/Users/lawrencebi/Projects/box3-local-engine/apps/local-engine/data/blobs \
METHOD=local MODE=play IS_HTTPS=false PORT=9977 \
STORAGE_PATH=/tmp/feather-validation \
SCRIPT=scripts/validation.js VM=worker \
SCRIPT_WORKER_ENTRY=../shell/tools/worker-entry/worker-entry.js \
NODE_ENV=development node dist/src/launch.js
```

预期（1 秒后）：

```
[shell:debug] Loading module: validation.js...
[shell:debug] Module loaded.
[shell:error] Error: [validation] 1s ticks=15 entities=0
    at eval (validation.js:12:9)
    at script-scheduler.js:69
    at ScriptShell._poll (shell/dist/script/script-shell.js:572)
```

说明：

- `console.log` 在 engine 里走 `logger.trace`，默认级别看不到；脚本用抛异常把结果带出来
- `ticks=15` 证明 `world.onTick` 在跑
- 堆栈证明 engine → worker socket → shell → scheduler → 用户脚本整条链路
- 不依赖 PostgreSQL / player-service / 真图
