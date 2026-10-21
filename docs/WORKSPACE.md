# Map / Data Root

feather 没有 workspace 编排文件。一个可玩地图是 data root 下的一个 `feather.map` 目录：

```text
~/.feather/                 # 默认 data root，可用 FEATHER_DATA_DIR 覆盖
  maps/<mapId>/
    feather.json
    content/
      project-state.json
      blobs/
    data/                   # 运行时由 engine 写入
  volumes/<volume>.db
  daemon.sock
  daemon.pid
  state.json
  logs/
```

`feather.toml` 是以后的 **project 构建配置**，不会出现在 play 目录里。当前还没有 `feather build`；先用 `.boxplay` 导入。

## `feather.json`

```json
{
  "format": "feather.map",
  "formatVersion": 1,
  "map": {
    "id": "bedwars-lobby",
    "name": "起床战争",
    "version": "1.0.0"
  },
  "content": {
    "state": "content/project-state.json",
    "blobs": "content/blobs",
    "hash": "sha256:..."
  },
  "storage": {
    "volume": "bedwars-group"
  },
  "runtime": {
    "port": 0,
    "memoryMb": null,
    "playerLimit": 32
  },
  "source": {
    "kind": "boxplay",
    "version": "v1.1.2",
    "hash": "sha256:..."
  },
  "requires": {
    "feather": ">=0.1.0",
    "format": 1
  }
}
```

字段：

- `format` / `formatVersion`：包格式
- `map`：地图 id、名称、内容版本
- `content`：初始状态和内容寻址 blobs
- `storage.volume`：SQLite 卷名；不写默认 `map.id`
- `runtime`：端口、脚本内存、玩家上限
- `source`：从哪个 `.boxplay` 导入
- `requires`：feather 兼容性

不包含：

```text
manifest.json
bundle.json
group
mapRole
mainProjectId
绝对路径
database_url
```

## volume

```json
"storage": { "volume": "bedwars-group" }
```

- 不写：每张图独立 `<dataRoot>/volumes/<mapId>.db`
- 显式同名：共享同一个 `.db`
- 每张图私有 namespace 仍然用 `map.id`
- 显式 volume 同时作为 group namespace

暂不支持 `"instance"`；实例 isolation 以后再做。

## 原生构建

第一版接受已经带 `project-state.json + blobs` 的 native Arena 源目录：

```text
my-map/
  feather.toml
  source/
    project-state.json
    blobs/
```

`feather.toml`：

```toml
schema_version = 1

[project]
id = "bedwars"
name = "起床战争"
version = "1.0.0"

[build]
source = "source"
output = "bedwars.fmap"

[storage]
volume = "bedwars-group"

[runtime]
port = 0
memoryMb = 512
playerLimit = 32
```

构建：

```bash
feather build ./my-map
# 或
feather build --workspace ./my-map --output ./dist/bedwars.fmap
```

产物：

```text
bedwars.fmap
  feather.json
  content/
    project-state.json
    blobs/
```

当前构建**不做**：

- 从 `mesh/` / `audio/` / `image/` 源树生成 prebake
- 从 `.boxproject` 直接构建
- 上传 Creator

它只是把 native Arena 的 `project-state + blobs` 打成 fmap。  
真正的源树编译（prebake builder）是下一步。

## 从 `.boxplay` 导入

```bash
pnpm --filter @feather/cli build
node cli/bin/feather load /path/to/map.boxplay
```

一个 `.boxplay` group 会拆成多个独立地图：

```text
<dataRoot>/maps/cloud-4e84.../
  feather.json
  content/
<dataRoot>/maps/cloud-3b56.../
  feather.json
  content/
```

同一个 `mapGroupId` 下所有成员写同一个 `storage.volume`，用于共享 group storage。

## `.fmap`

`.fmap` 是 gzip tar：

```text
feather.json
content/
  project-state.json
  blobs/
```

安装：

```bash
feather load map.fmap
```

## 运行

```bash
# 启动 data root 下所有地图
feather up

# 只启动指定地图
feather up cloud-4e84... cloud-3b56...

# 自定义 data root
feather up --data-dir /var/lib/feather
# 或
FEATHER_DATA_DIR=/var/lib/feather feather up

feather ps
feather logs <id> -f
feather stop <id>
feather down
```

## `.boxproject`

`.boxproject` 是可编辑源码，不是可玩 release：

```bash
feather load project.boxproject
```

当前只解包到：

```text
<dataRoot>/projects/<mapGroupId>/
```

退出码 2。`feather build` 还没实现。

## shard 行为

- 预算 = `os.availableParallelism()`，可用 `FEATHER_MAX_SHARDS=<n>` 覆盖
- 预算没用完：一张图一个 shard worker
- 预算用完：新图塞进最闲的 shard
- 每张图仍有自己的 script worker
- 停一张图不会停 shard；shard 空了才回收
- `MapStatus.shardId` 可见

只数 `running` / `starting` 的图。

## 已知限制

- 一个 shard 内多图仍各自调用一次 `startServer`
- content blob 已跨 shard 共享（SharedArrayBuffer arena）
- map logs 目前是 shard 级 stdout/stderr
- 不做热迁移
- 不做反代
- 没有正式 auth/player identity
