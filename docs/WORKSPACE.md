# Map / Data Root

> **状态**：本文关于 **data root、volume、`.fmap` 归档格式** 的部分仍然有效。
> workspace 布局、创作流程、git/merge 已迁移到 [MAP-AUTHORING.md](MAP-AUTHORING.md)；命令面见 [CLI-CONTRACT.md](CLI-CONTRACT.md)。

feather 没有 workspace 编排文件。cached map（image）在 data root 的 `maps/` 下，运行副本（instance）在 `instances/` 下：

```text
~/.feather/                 # 默认 data root，可用 FEATHER_DATA_ROOT 覆盖
  blobs/                    # 全局 content-addressed store，所有地图共享
  maps/<mapId>/             # cached map / image
    feather.json
    content/
      project-state.json
  instances/<instanceId>/   # 运行副本 / container
    data/                   # 运行时由 engine 写入
  volumes/<volume>.db
  daemon.sock
  daemon.pid
  state.json
  logs/
```

`feather.toml` 是 **map 的构建配置**，不会出现在 play 目录里。`feather build` 已实现；workspace 布局与 `kind` 见 [MAP-AUTHORING.md](MAP-AUTHORING.md) §4。

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
  "assets": {
    "mesh/cube.vb": { "hash": "Qm...", "type": "mesh" },
    "audio/theme.mp3": { "hash": "Qm...", "type": "audio" },
    "image/icon.png": { "hash": "Qm...", "type": "image" }
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

- 不写：每个 instance 独立 `<dataRoot>/volumes/<instanceId>.db`
- 显式同名：共享同一个 `.db`（SQLite 多写要警告；跨实例共享建议 Postgres）
- 每个 instance 的 `dataStorageNamespace` 用 `instance.id`
- `feather.toml` 的 `[storage].volume` 是 map 的默认值；`run --volume` 可覆盖
- 迁移中：`run` 未指定 `--volume` 时当前默认 = instance id；目标是继承 map 的 `[storage].volume`
- 显式 volume 仍可作为 group namespace 的兼容别名（group 已废弃）

## 构建

workspace 布局、`kind = baked|native|boxproject`、JSON sections、chunks、git/merge，统一见 [MAP-AUTHORING.md](MAP-AUTHORING.md)。

本文只保留 data root、volume、归档格式这些运行时/分发侧的定义。

## 从 `.boxplay` 导入

```bash
feather load /path/to/map.fmap
feather maps
feather up <mapId>
```

一个 `.boxplay` group 会拆成多个独立地图：

```text
<dataRoot>/blobs/                      # 所有 fmap 的 blobs 去重到这里
<dataRoot>/maps/cloud-4e84.../
  feather.json
  content/project-state.json
<dataRoot>/maps/cloud-3b56.../
  feather.json
  content/project-state.json
```

同一个 `mapGroupId` 下所有成员写同一个 `storage.volume`，用于共享 group storage。

`load` 只安装 cached map；`run` 才创建 instance，instance 的运行时数据在 `<dataRoot>/instances/<instanceId>/data`。

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
# daemon 前台运行（另开终端）
featherd --data-root /var/lib/feather

# 客户端只认 socket
feather maps
feather up cloud-4e84...                 # 默认 instance id = map id
feather up cloud-4e84... --scale 2    # cloud-4e84...-1 / -2
feather up cloud-4e84... cloud-3b56...   # 每张 map 一个默认 instance
feather ps
feather logs <instance> -f
feather stop <instance> [<instance>...]
```

## `.boxproject`

`.boxproject` 是可编辑源码，不是可玩 release：

```bash
feather unpack project.boxproject --dir my-project
```

产物是 workspace（`project/` + `chunks/` + `scripts/` + `assets/` + `feather.toml`），见 [MAP-AUTHORING.md](MAP-AUTHORING.md)。`load` 不再接受 `.boxproject`；构建用 `feather build`。

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
- **本地图默认跳过 mudb 协议一致性校验**：独立静态客户端的 protocol 指纹和服务端结构上就对不上，开着校验会在握手时把它拒掉。代价是 schema 漂移会表现成「进图后行为怪异」而不是干净拒绝；排查时用 `BOX_PROTOCOL_VALIDATION=1` 强制打开。跳过时每张图会打一条 warn。
- `MapSpec` 里不再有 `env` / `localConfigPath`：引擎大量直接读 `process.env`，per-map 环境变量在 worker 内无法隔离，留着只会变成静默无效的字段。
