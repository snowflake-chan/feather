# Map / Data Root

feather 没有 workspace 编排文件。一张地图就是一个目录：

```text
bedwars-lobby/
  feather.toml
  manifest.json
  data/
    project-state.json
    blobs/
```

daemon 是全机唯一的；地图目录只放配置和内容，运行数据在 daemon 的 data root。

```text
~/.feather/                 # 默认 data root，可用 FEATHER_DATA_DIR 覆盖
  daemon.sock
  daemon.pid
  state.json
  volumes/<volume>.db
  maps/<mapId>/data/
  logs/
```

## `feather.toml`

```toml
schema_version = 1

[map]
id = "bedwars-lobby"
name = "起床战争"
port = 3001

[storage]
# 不写 volume：默认 map.id，即 bedwars-lobby.db
# volume = "bedwars-group"  # 显式同名会共享同一个 .db
```

可选字段：

```toml
[map]
data_dir = ".feather/data"
mode = "play"
memory_mb = 512       # 单图脚本 worker 的内存上限
player_limit = 32
```

- `memory_mb` 落到 `MapSpec.limits.memoryMb`，最终变成 shell worker 的
  `resourceLimits.maxOldGenerationSizeMb`。撞上限时只有这张图的 worker 被 abort。
- shard worker **不设**内存上限——一个 shard 承载多图，撞上限会一次带走整批图。

## storage volume

`volume` 是逻辑 SQLite 文件，写在单图配置里。

```toml
[storage]
volume = "bedwars-group"
```

默认数据文件：

```text
<data-root>/volumes/<volume>.db
```

如果配置了 `storage.path`：

```text
<storage.path>/<volume>.db
```

规则：

- 不写或空字符串：默认 `map.id`
- 显式同名：共享同一个 `.db`，同时作为 group namespace
- 每张图的私有 namespace 仍使用 `map.id`
- `database_url` 显式配置优先
- `volume` 只允许 `[A-Za-z0-9._-]`，且禁止 `..`
- 100 个农场应使用 100 个唯一 map id → 100 个独立 DB

## 从游戏包创建

```bash
pnpm --filter @feather/cli build
node cli/bin/feather load /path/to/map.boxplay --dir ./my-maps
```

输出是平铺的地图目录：

```text
my-maps/
  cloud-4e84.../
    feather.toml
  cloud-3b56.../
    feather.toml
  feather.lock
```

然后：

```bash
cd my-maps
feather up ./cloud-4e84... ./cloud-3b56...
```

## 运行

```bash
# 当前目录是一张地图
feather up

# 多张地图
feather up ./bedwars-lobby ./bedwars-s2

# 自定义 data root
feather up ./bedwars-lobby --data-dir /var/lib/feather

feather ps
feather logs <id> -f
feather stop <id>
feather down
```

`feather up` 会：

1. 读取每个 map 目录的 `feather.toml`
2. 没有 daemon 就在 data root 启动 daemon
3. 注册缺失的 map
4. 启动所有 map
5. 打印 `map -> http://127.0.0.1:<port>`

daemon 是全机的，不跟随某个地图目录；`ps` / `logs` / `stop` / `exec` 默认访问同一个 data root。

## `.boxplay` vs `.boxproject`

| | `.boxplay` | `.boxproject` |
|---|---|---|
| 内容 | 发布后的 world/release | 可编辑 source |
| `feather load` | 生成可 `up` 的地图目录 | 解包到 `projects/`，提示 TODO |
| 退出码 | 0 | 2（source，不是 playable release） |

`.boxproject` 需要 import + publish 才能生成 release；当前只做解包，不假装可玩。

## shard 行为

- 预算 = `os.availableParallelism()`，可用 `FEATHER_MAX_SHARDS=<n>` 覆盖
- 预算没用完：一张图一个 shard worker
- 预算用完：新图塞进最闲的 shard；`ceil(图数 / 核数)` 是单个 shard 的上限
- 每张图仍有自己的 script worker
- 停一张图不会停 shard；shard 空了才回收
- `MapStatus.shardId` 可见

只数 `running` / `starting` 的图，`created` / `stopped` 的图不占核预算。

## 已知限制

- 一个 shard 内多图仍各自调用一次 `startServer`，build 每图一份；共享 HostContext 在 D3
- 内容 blob 已经跨 shard 共享（`SharedArrayBuffer` arena，见 `docs/DAEMON-API.md` 的 `contentArena`）
- map logs 目前是 shard 级 stdout/stderr，未按图打标
- 不做热迁移；shard 崩溃按 map 重启策略恢复
- 不做反代；端口直接暴露
