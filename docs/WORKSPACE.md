# Map / Data Root

feather 没有 workspace 编排文件。一张地图是一个目录，**load 后固定进 data root**：

```text
~/.feather/                 # 默认 data root，可用 FEATHER_DATA_DIR 覆盖
  maps/<mapId>/             # 可玩地图内容 + play 配置
    feather.toml
    manifest.json
    data/
      project-state.json
      blobs/
  volumes/<volume>.db       # 所有地图 SQLite
  daemon.sock
  daemon.pid
  state.json
  logs/
```

默认 `~/.feather`，也可：

```bash
FEATHER_DATA_DIR=/var/lib/feather
feather load map.boxplay
```

## `feather.toml`

当前 play 目录里的单图配置：

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
node cli/bin/feather load /path/to/map.boxplay
```

输出固定：

```text
~/.feather/maps/
  cloud-4e84.../
    feather.toml
    manifest.json
    data/
    feather.lock
  cloud-3b56.../
    feather.toml
    manifest.json
    data/
    feather.lock
```

不会再把地图解到任意 `--dir`。`--force` 会替换同 id 的地图目录。

## 运行

```bash
# 启动 data root 下所有 map
feather up

# 只启动指定 map
feather up cloud-4e84... cloud-3b56...

# 自定义 data root
FEATHER_DATA_DIR=/var/lib/feather feather up
# 或
feather up --data-dir /var/lib/feather

feather ps
feather logs <id> -f
feather stop <id>
feather down
```

`feather load` 在 data root 里创建 map；`feather up` 注册到全机唯一 daemon。

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
