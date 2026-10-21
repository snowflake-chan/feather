# Workspace

一个 workspace 是一个部署单元：`feather.toml` + maps + `.feather/` 运行时状态。

## 从游戏包创建

```bash
pnpm --filter @feather/cli build
node cli/bin/feather load /path/to/map.boxplay --dir ./my-server
```

生成：

```
my-server/
  feather.toml
  feather.lock
  .gitignore
  maps/
    <mapGroupId>/
      bundle.json
      worlds/<memberId>/
        manifest.json
        data/project-state.json
        data/blobs/
  .feather/        # 运行时生成：data/logs/sqlite
```

`feather.toml`：

```toml
[workspace]
name = "起床战争"
data_dir = ".feather/data"

[storage]
driver = "sqlite"
mode = "shared"
group_namespace = "cloud-4e84..."

[[maps]]
id = "cloud-4e84..."
name = "起床战争"
path = "maps/cloud-4e84.../worlds/cloud-4e84..."
port = 3001
auto_start = true
memory_mb = 512       # 单图脚本 worker 的内存上限；不填用全局 SCRIPT_MEMORY_LIMIT
player_limit = 32
```

- `memory_mb` 落到 `MapSpec.limits.memoryMb`，最终变成 shell worker 的
  `resourceLimits.maxOldGenerationSizeMb`。撞上限时只有这张图的 worker 被 abort，
  daemon 和同 shard 其他图不受影响。不填则继承 `SCRIPT_MEMORY_LIMIT`（本地默认 512）。
- shard worker **不设**内存上限——一个 shard 承载多图，撞上限会一次带走整批图。

- `mode = "shared"`：所有 map 共用一个 SQLite + group namespace
- 每图 `BOX_DATA_STORAGE_NAMESPACE` 用 map id，project 数据隔离
- `group_namespace` 来自 `.boxplay` 的 `bundle.json.mapGroupId`

## `.boxplay` vs `.boxproject`

| | `.boxplay` | `.boxproject` |
|---|---|---|
| 内容 | 发布后的 world/release | 可编辑 source |
| `feather load` | 生成可 `up` 的 workspace | 解包到 `projects/`，提示 TODO |
| 退出码 | 0 | 2（source，不是 playable release） |

`.boxproject` 需要 import + publish 才能生成 release；当前只做解包，不假装可玩。

## 运行

```bash
cd my-server
feather up          # 启动 daemon + shard worker + map
feather ps
feather logs <id> -f
feather stop <id>
feather down
```

`feather up` 会：

1. 读 `feather.toml`
2. 没有 daemon 就 detached 启动 `<workspace>/.feather/daemon.sock`
3. 创建缺失的 map
4. 启动 `auto_start` 的 map
5. 打印 `map -> http://127.0.0.1:<port>`

daemon 状态：

```
.feather/
  daemon.sock
  daemon.pid
  state.json          # map specs，daemon 重启后恢复
  config/local.json   # @box/env 本地配置
  sqlite/<group>.sqlite
  data/<mapId>/
  logs/daemon.log
  logs/<mapId>.log
  storage/
```

shard 行为（按核数分配）：

- 预算 = `os.availableParallelism()`，可用 `FEATHER_MAX_SHARDS=<n>` 覆盖
- 预算没用完：一张图一个 shard worker（一图一线程，tick 互不排队）
- 预算用完：新图塞进最闲的 shard；`ceil(图数 / 核数)` 是单个 shard 的上限
- 1 核机器自然退化成「全部打包进一个 shard」，代码页与 engine 模块图只留一份
- 每张图仍有自己的 script worker（不受 shard 策略影响）
- 停一张图不会停 shard；shard 空了才回收
- `MapStatus` 里的 `shardId` 可见

只数 `running` / `starting` 的图，`created` / `stopped` 的图不占核预算。

## 已知限制（D2）

- 一个 shard 内多图仍各自调用一次 `startServer`，build 每图一份；共享 HostContext 在 D3
- 内容 blob 已经跨 shard 共享（`SharedArrayBuffer` arena，见 `docs/DAEMON-API.md` 的 `contentArena`），
  但 `ContentServer` 的 wrapper 仍是每图一套
- map logs 目前是 shard 级 stdout/stderr，未按图打标
- 不做热迁移；shard 崩溃按 map 重启策略恢复
- 不做反代；端口直接暴露
