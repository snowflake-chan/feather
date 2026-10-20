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
```

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

D2 的 shard 行为：

- 默认 `target_maps_per_shard = 10`
- 2 张图会进入同一个 shard worker
- 每张图仍有自己的 script worker
- 停一张图不会停 shard
- `MapStatus` 里的 `shardId` 可见

## 已知限制（D2）

- 一个 shard 内多图仍各自调用一次 `startServer`，content/build 每图一份；共享 HostContext 在 D3
- map logs 目前是 shard 级 stdout/stderr，未按图打标
- 不做热迁移；shard 崩溃按 map 重启策略恢复
- 不做反代；端口直接暴露
