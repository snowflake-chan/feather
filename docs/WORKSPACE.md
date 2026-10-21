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

- 不写：每张图独立 `<dataRoot>/volumes/<mapId>.db`
- 显式同名：共享同一个 `.db`
- 每张图私有 namespace 仍然用 `map.id`
- 显式 volume 同时作为 group namespace

暂不支持 `"instance"`；实例 isolation 以后再做。

## 原生构建

第一版可以接受两种 native Arena 输入：

1. 已经带 `project-state.json + blobs` 的 prebaked 源目录
2. `index.js` + `mesh/` + `audio/` + `image/` 的源树

如果缺少 `source/project-state.json`，`feather build` 会调用
`builder/src/generate.js`，复用官方 `createDefaultProject` /
`storeProject` / `createDefaultPermissions` 生成状态。

prebaked 源目录：

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

也支持直接构建官方 `.boxproject`：

```bash
feather build ./pet-raising-island.boxproject --version 1.0.0
```

这条路径调用 `@feather/builder` 里 vendored 的官方
`project-manager.importProject` / `publishProject`，再把 release 的
`data/project-state.json + data/blobs` 打成 fmap。

当前 native workspace 构建**不做**：

- 从 `mesh/` / `audio/` / `image/` 源树生成 prebake
- 上传 Creator

同时会扫描源树里的：

```text
mesh/**
audio/**
image/**
```

写入：

```text
content/blobs/<sha256>
feather.json.assets
```

`assets` 的逻辑 key 保持 shell 路径，例如 `mesh/cube.vb`、`audio/theme.mp3`；hash 使用 content-server 的 base58 multihash。  
这些资源已经进包、可被后续 prebake compiler 使用；当前还不会自动注入 project-state/prebake，所以地图脚本暂时不能直接依赖新加的树资源。

当前 generator 已经能生成空白 world + scripts + audio/image 资源索引；
mesh 的 model metadata 仍需补官方模型元数据，fake `.vb` 会导致
`error when get model ... meta data`。真正的 prebake builder 仍要接官方模型导入流程。

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
