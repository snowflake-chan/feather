# feather CLI 契约

> **状态**：已定稿（本会话）
> **读者**：实现 `cli/`、`daemon/`、`builder/` 的 agent
> **优先级**：本文与代码、README、旧 docs 冲突时，以本文为准。当前实现状态见 §10。
> **数据模型**：workspace 布局、JSON sections、chunks、git/merge 见 [MAP-AUTHORING.md](MAP-AUTHORING.md)。
> **作者侧 CLI**：`featherc` 的设计见 [DESIGN.md](DESIGN.md) §4–§5；本文描述 `feather` 的当前命令面。
> **迁移目标**：`build` / `unpack` / `init` 设计上归 `featherc`（见 DESIGN.md §4.3）；当前 `feather` 仍提供，后续保留 alias。

---

## 0. 给 agent 的十条

1. `workspace` 只指**地图项目目录**（含 `feather.toml`）。不再指 data root、CLI 自己、map id。
2. `map` 是**定义层 / image**：cached map（`<dataRoot>/maps/<id>`），没有运行时状态。
3. `instance` 是**运行副本 / container**：`<dataRoot>/instances/<id>`，从 `run` 起存在。
4. `archive` 是**分发物 / image tar**：`.fmap`（map archive）、`.boxplay`（play bundle）、`.boxproject`（project archive）。`load` 装 map；`run` 从 map 起 instance；一个 map 可以起多个 instance。
5. `feather.toml` 只放**身份 + 构建参数**，绝不放实体/场景数据。内容在 JSON sections + `chunks/`，见 [MAP-AUTHORING.md](MAP-AUTHORING.md)。
6. `data root` 是 **daemon 配置**。客户端命令一律不接受 `--data-root`。
7. `socket` 是**客户端端点**，独立于 data root。客户端只靠 `--socket` / `FEATHER_SOCKET` 找 daemon。
8. daemon **复制 dockerd**：前台进程、信号停止、不自动拉起、没有 `down` 命令。
9. `load` 走 daemon。`build` / `unpack` / `workspace init` 是一次性子进程；`feather` 只负责 spawn `featherd` 并转发输出。
10. CLI **不读 data root**。P2 之后，`cli/src` 里不应出现 `resolveDataRoot` / `maps/` / `blobs/` 的路径拼接。

---

## 1. 词表

### 1.1 规范词

| 词 | 定义 | 代码锚点 |
|---|---|---|
| **workspace** | 地图项目目录，构建输入。最少含 `feather.toml`；源码形式见 §4 | `feather.toml`、`featherc build <workspace>` |
| **archive** | 可分发物的统称。只在文档/文案层使用，不是命令名 | — |
| **map archive** | 一张 map 的归档，扩展名 `.fmap`，格式标识 `feather.map` | `FmapManifest`、`readFmapManifest` |
| **play bundle** | 神岛导出的可玩包 `.boxplay`，可含多张 map | `PlayBundle` |
| **project archive** | 神岛导出的项目源码包 `.boxproject` | `buildProjectArchive` |
| **map** | cached map / image：已安装的定义。从 `load` 起存在，没有运行时状态 | `MapDefinition` |
| **instance** | map 的运行副本 / container。从 `run` 起存在 | `InstanceSpec` / `InstanceStatus` |
| **cached map** | 已安装的 map 定义（image）。没有运行时状态；`instanceCount` 见 `MapDefinition` | `<dataRoot>/maps/<id>` |
| **instance state** | instance 的运行时状态：`created` / `starting` / `running` / `stopping` / `stopped` / `error` / `destroyed` | `InstanceStatus.state` |
| **volume** | 存储单元：一个 SQLite 文件 = 一个持久化边界。**不是 Docker volume** | `storage.volume`、`volumes/<volume>.db` |
| **data root** | daemon 的运行时数据根：`maps/ instances/ blobs/ volumes/ logs/` | `--data-root`、`FEATHER_DATA_ROOT` |
| **daemon** | supervisor 进程。前台运行，信号停止 | `featherd` |
| **blob** | 内容寻址文件，全局去重 | `<dataRoot>/blobs/` |
| **asset** | 逻辑路径（`mesh/` `audio/` `image/`）→ blob 的映射 | `feather.json.assets` |
| **content** | 一张 map 的内容集合：`project-state.json` + `blobs/` | 归档内 `content/` |
| **shard** | daemon 内的 worker 线程；一张或多张 instance 跑在上面 | `shardId` |
| **runtime mode** | instance 的执行方式；目前只有 `worker` | `InstanceStatus.runtime` |

### 1.2 禁用词

| 不要用 | 改用 | 原因 |
|---|---|---|
| server / world / replica | instance | `GameServer` 是 engine 内部对象 |
| supervisor（作 CLI 名词） | daemon | 角色不是名字 |
| data dir | data root | 同一概念两个词 |
| workspace（指 data root） | data root | workspace 专指项目 |
| workspace（指 map id） | map id | `workspaceId` 字段要删 |
| native arena workspace | native workspace / Arena project archive | `arena` 与共享内存 arena 撞车 |
| script shell | map script / eval | `shell` 是 `shell/` 包的名字 |
| group | volume（除导入兼容层） | group 已废弃 |
| project（作 CLI 名词） | workspace | `[project]`、`.boxproject`、`project-state.json` 是格式字段名 |
| map（指运行副本） | instance | map 是 image；instance 是 container |
| archive（当作 image） | archive / image tar | archive 是分发物；map 才是 image |

---

## 2. 实体与状态机

### 2.1 三层转换

```
workspace ──build──▶ archive ──load(daemon)──▶ map (image / cached)
    ▲                                             │
    │                                             │ run
    └────────── unpack ──────────────────────     ▼
      (project archive → workspace)          instance (container)
                                                  │
                                                  │ stop
                                                  ▼
                                             instance (stopped)
```

- `build`：一次性 `featherc build` 子进程，workspace → archive。
- `load`：**经 daemon**，archive → cached map（image）。不创建 instance。
- `unpack`：一次性 `featherc unpack` 子进程，project archive → workspace。
- `run`：**经 daemon**，map → instance（create + start）。
- `stop` / `rm` 只作用于 instance；`rmi` 作用于 map。

### 2.2 Map 生命周期（image）

```
installed ──load --replace──▶ updated ──rmi──▶ removed
```

- map 没有 running 状态；只有 `installedAt` / `contentHash` / `instanceCount`。
- `rmi` 有 instance 时拒绝（`MAP_HAS_INSTANCES`）；`--force` 连 instance 一起删。
- map 更新不影响已有 instance（instance pin `mapContentHash`）；要更新就 `up <archive>` 或 `rm` + `run`。

### 2.3 Instance 生命周期（container）

```
created ──start──▶ starting ──▶ running ──stop──▶ stopping ──▶ stopped
   ▲                              │                          │
   │                              └──────── error ◀──────────┘
   └──────────────── start ───────────────────────────────────┘
任意状态 ──rm──▶ destroyed
```

- `stop` 不删除 instance；`rm` 删除 instance。
- daemon 关闭时停掉所有 instance，记录保留为 `stopped`。
- daemon 启动时恢复 instance 为 `stopped`，**不自动启动**；启动由 `run` / `start` 负责。
- `ps` 列 instance；`maps` 列 map。`load` 之后 `maps` 能看到，`ps` 不显示未 `run` 的 map。

---

## 3. 归档

### 3.1 三种归档

| 归档 | 扩展名 | 内容 | 可玩 | 消费命令 | 产物层 |
|---|---|---|---|---|---|
| map archive | `.fmap` | `feather.json` + `content/`，一张 map | ✅ | `load` | cached map |
| play bundle | `.boxplay` | 多张 map + group 元数据 | ✅ | `load` | cached map ×N |
| project archive | `.boxproject` | 上游项目源码 | ❌ | `unpack` | workspace |

`.fmap` 内部布局**不改**：

```
feather.json
content/
  project-state.json
  blobs/
```

### 3.2 身份与相等

「同一张 map」的定义：

- `map.id` 相同
- `content.hash` 相同

**不参与** map 相等判断：

- `storage.volume` / `runtime`（port / memoryMb / playerLimit）——这些是 instance 的默认值/覆盖，不是 map 身份。
- `source.*`（来源归档的 kind / version / hash）——那是 provenance。
- tar 字节——gzip mtime 和打包顺序不可控，也不该成为契约。

instance 身份 = `instance.id`；instance 绑定 `mapId` + `mapContentHash` + 自己的 overrides。

`content.hash` 是 map 的内容身份；`source.hash` 是来源身份。两者不得混用。

### 3.3 archive / map / instance 三层

Docker 是三层，feather 也必须三层。之前把 archive 当 image 是错的：一对多发生在 **map → instance**，不在 archive → map。

| 层 | 定义 | Docker 对应 | 路径 |
|---|---|---|---|
| archive | `.fmap` 分发物 | image tar | 文件 |
| cached map | 已安装的地图定义 | image | `<dataRoot>/maps/<mapId>/` |
| instance | map 的运行副本 | container | `<dataRoot>/instances/<instanceId>/` |
| volume | SQLite 持久化边界 | volume | `<dataRoot>/volumes/<volume>.db` |

规则：

- `load` 安装/更新 cached map；`run` 创建并启动 instance。
- 一个 map 可以起多个 instance（多房间、测试服、replica）。
- instance 创建时 pin `mapContentHash`；map 更新不影响 running instance；`up <archive>` 才会自动 recreate。
- 重建 instance：`rm` + `run`（或后续 `run --recreate`）。
- 默认 instance id = mapId；`--name` / `--replicas` 生成其它 id。
- instance volume 默认 = instance id；`--volume` 显式覆盖/共享。SQLite 多写要警告。
- `rmi` 在存在 instance 时拒绝；`--force` 才一起删。

### 3.4 兼容层

- `group` 只允许出现在 `.boxplay` 导入映射里：`mapGroupId → storage.volume`。CLI 输出不得再打印 `group:`。
- `groupNamespace` 已从 MapSpec 移除；engine 侧 `groupStorageNamespace` 仍作为 volume 的兼容别名，标记 `@deprecated`。
- `dataStorageNamespace` 保留：卷内每 instance 隔离键。`volume` 共享，namespace 每 instance 独立。

---

## 4. Workspace 与 `feather.toml`

### 4.1 定义

workspace = 一个目录，至少包含 `feather.toml`。它是**构建输入**，不是运行时数据目录。

三种源码形式，由 `[build].kind` 选择：

| kind | 源码 | 适用 |
|---|---|---|
| `baked` | JSON sections + `chunks/` + `scripts/` + `assets/` | `unpack` 默认产物；保证内容一致 |
| `native` | `index.js` + `assets/` + JSON sections | 从零写的 native 项目 |
| `boxproject` | 一个 `.boxproject` 文件 + 可选 sections | 需要改上游源码、接受重新 publish |

工作区布局、JSON section 的划分、chunk 的坐标寻址，见 [MAP-AUTHORING.md](MAP-AUTHORING.md) §2–§6。

### 4.2 Schema

```toml
schema_version = 1

[project]
id = "bedwars-lobby"
version = "1.0.0"                 # 显示名在 info.json.displayName

[build]
kind = "baked"                    # baked | native | boxproject
output = "dist/bedwars-lobby.fmap"
# source 仅 native/boxproject 需要；baked 用工作区根

[storage]
volume = "bedwars-group"          # 可选；默认 = project.id

[runtime]
port = 0
memoryMb = 512
playerLimit = 32

[source]                          # 可选；由 unpack 写入
archive = "bedwars.boxproject"
format = "boxproject"
version = "1.2.0"
contentHash = "sha256:..."
```

### 4.3 铁律：toml 不放实体

`feather.toml` 只放**身份 + 构建参数**。实体、天气、UI、体素、脚本、资源引用一律留在 JSON sections + `chunks/` / `assets/`，见 [MAP-AUTHORING.md](MAP-AUTHORING.md) §4–§6。

理由：

1. **单一真相源。** ProjectRDA 的 section 是官方 schema 的权威内容；`project-state.json` 只是它的入口和运行时状态。
2. **格式不匹配。** 实体是深层嵌套、由 schema 版本演进、引用 blob 的数据；TOML 是扁平配置。
3. **编辑器回写。** 编辑器/CLI 改的是 sections 和 chunks；`project-state.json` 是 build 产物，不是手写源。
4. **可复现性。** 内容的 hash 必须基于字节；把内容拆到 toml 会引入排序/转义差异。
5. **与 archive 一致。** `feather.json` 也不含实体；toml 应该和它同层，而不是越级。

### 4.4 `unpack`

```
featherc unpack <project archive> [--dir <workspace>] [--force]
```

- 把 archive 的 hash DAG 展开成工作区——`chunks/<x>,<y>,<z>.bin`、各 JSON section、`scripts/`、`assets/`——再写 `feather.toml`。布局见 [MAP-AUTHORING.md](MAP-AUTHORING.md) §2、§7.4。
- 产出必须**不需要任何修改就能 `featherc build`**，且 `content.hash` 与源归档一致。
- `unpack` 由一次性 `featherc unpack` 执行；CLI 不解析 archive、不碰 data root。
- 目标目录非空时拒绝，除非 `--force`。
- 默认目录名 = 归档 basename。

验收：

```bash
featherc unpack bedwars.boxproject --dir bedwars
cd bedwars
featherc build .                # 校验并组装
```

### 4.5 `build`

```
featherc build [workspace|project archive] [--output <file>] [--project-version <v>]
```

- 输入是目录 → 读 `feather.toml`；输入是 `.boxproject` 文件 → 等价于 `kind = "boxproject"` 的临时 workspace。
- `kind = "baked"`：校验 JSON sections + 对每个 chunk 文件做 hash，按官方顺序组装 `voxels.chunks`，写 `.fmap`。
- 只接受位置参数。不再有 `--workspace` / `-C`；`--version` 保留给 CLI 自身。
- 版本覆盖用 `--project-version`。
- 构建由一次性 `featherc build` 执行；CLI 只 spawn 并转发 stdout/stderr。daemon 不需要运行。

---

## 5. Daemon（dockerd 模型）

### 5.1 生命周期

- 只有一种启动方式：`featherd`，前台运行，日志写 stdout/stderr。`feather` 不启动 daemon。
- 停止方式：SIGINT / SIGTERM（Ctrl-C、systemd、容器 stop）。
- **没有** `feather down`；`/v1/shutdown` 只作为内部/测试 API，不映射成 CLI 命令。
- **不自动 spawn**。daemon 没起时，所有客户端命令（`load` / `run` / `maps` / `rmi` / `ps` / `start` / `stop` / `restart` / `rm` / `logs` / `eval` / `inspect`）一律：

  ```
  daemon not running: <socket>
  start it with: featherd --data-root ~/.feather --socket <socket>
  ```

  exit 1，错误码 `DAEMON_NOT_RUNNING`。

### 5.2 Data root 与 socket

| 项 | 归属 | 默认 | 覆盖 |
|---|---|---|---|
| data root | daemon | `~/.feather` | `featherd --data-root`、`FEATHER_DATA_ROOT` |
| socket | 客户端端点 | `~/.feather/daemon.sock` | `--socket`、`FEATHER_SOCKET` |
| daemon 日志 | daemon | stdout/stderr | systemd / 重定向 |

规则：

- `--data-root` **只**出现在 `featherd`。
- socket 路径是固定公式，不随 `--data-root` 漂移。自定义 data root 的 daemon 仍听默认 socket，除非显式 `--socket`。
- 一个 socket 对应一个 daemon；两个 daemon 必须用不同 socket。
- socket 权限 `0600`。

服务器级配置（端口、人数、视距、tick、安全、日志）的目标表面是 `server.toml`，见 [MAP-AUTHORING.md](MAP-AUTHORING.md) §13。当前实现仍用 daemon flag + env，优先级：flag > env > 配置文件 > 默认值。

### 5.3 状态与重启

- `state.json` 持久化 map definitions + instance records。
- daemon 启动时恢复 instance 记录为 `stopped`，不自动启动；map definitions 保持不变。
- daemon 关闭时优雅停止所有 instance，记录写回 `stopped`。
- `restartPolicy` 是 instance 字段，只描述 **shard 崩溃**后的重启，不描述 daemon 重启后的自动启动。

### 5.4 Import API

`load` 走 daemon；它只安装/更新 cached map，不创建 instance：

```
POST /v1/maps/import?replace=1
Content-Type: application/gzip
Body: .fmap / .boxplay 原始字节
```

daemon 侧：

1. 解包到临时目录，复用 `assertSafeEntries` 校验路径。
2. 识别 `feather.json`（map archive）或 `bundle.json`（play bundle）。
3. 写入 `<dataRoot>/maps/<mapId>/`，blobs 合并进 `<dataRoot>/blobs/`（已存在则跳过）。
4. 注册 `MapDefinition`（`contentHash` / `instanceCount`），不注册 instance。
5. 返回 `{ maps: [{ id, ... }] }`。

冲突策略：

- 默认：任一目标 mapId 已存在 → `MAP_CONFLICT`，不写入任何一张（原子性）。
- `--replace`：更新 cached map 内容；若有运行中的 instance，返回 `MAP_BUSY`。`up <archive>` 带 `recreate=1`，才会先 stop + rm 再重建。
- `--purge-data`：只对旧 per-map `data/` 有效；新模型的 instance data 用 `rm` 删除，flag 将移除。

`.boxproject` 不走这个接口；`load` 遇到 `.boxproject` 直接报 `ARCHIVE_UNSUPPORTED` 并提示 `featherc unpack`。

> `load --replace` 只更新 definition；运行中的 instance 不会被隐式删除。需要重建时用 `up <archive>`。

---

## 6. 命令面

| 命令 | 层 | 需要 daemon | 幂等 | 说明 |
|---|---|---|---|---|
| `featherc init [dir]` | 创建 workspace | ❌ | `--force` | 默认 cwd；id = 目录名 |
| `featherc build [workspace\|.boxproject]` | workspace → archive | ❌ | 覆盖输出 | spawn `featherd build` |
| `featherc unpack <project archive>` | archive → workspace | ❌ | `--force` | spawn `featherd unpack` |
| `feather load <archive>` | archive → cached map | ✅ | `--replace` | 安装/更新 image |
| `feather maps` | 列表 | ✅ | 是 | 列 cached maps |
| `feather inspect <map>` | map | ✅ | 是 | map 详情 |
| `feather rmi <map> [--force]` | image → gone | ✅ | 是 | 有 instance 时拒绝；`--force` 连 instance 一起删 |
| `feather up <archive\|map> [--name X] [--scale N]` | archive/map → instance | ✅ | 是 | 自动 load + run；hash 变化自动 recreate |
| `feather run <map> [--name X] [--replicas N]` | map → instance | ✅ | 是 | 创建并启动 instance |
| `feather start <instance...>` | instance → running | ✅ | 是 | |
| `feather stop <instance...>` | running → stopped | ✅ | 是 | 不删 instance |
| `feather restart <instance...>` | running → running | ✅ | 是 | |
| `feather ps` | 列表 | ✅ | 是 | 列 instances |
| `feather logs <instance> [-f] [--tail N]` | instance | ✅ | 是 | shard 级输出 |
| `feather eval <instance> -- <code>` | instance | ✅ | ❌ | JS eval；需 daemon `--enable-eval` |
| `feather rm <instance> [--force]` | instance → gone | ✅ | 是 | 删运行副本 |

删除：

| 命令 | 处理 |
|---|---|
| `feather down` | 删除。daemon 用信号停；停所有 instance 用 `feather stop`（多选）或停 daemon |
| `feather exec` | 改名 `feather eval`。语义是 JS eval，不是进程 exec |
| `feather load *.boxproject` | 删除该分支；改用 `unpack` |
| `feather` 自动 spawn daemon | 删除；daemon 只由 `featherd` 启动 |
| `featherc build --workspace` / `-C` | 删除；只保留位置参数 |
| `featherc build --version` | 删除；改用 `--project-version` |
| `feather load --force` | 改名 `--replace`（+ `--purge-data`） |
| 客户端 `--data-dir` | 删除 |

占位符统一：`<workspace>`、`<archive>`、`<map>`、`<instance>`、`<code>`。不要混用 `<id>` / `<mapId>`。

### 6.0 `up` 的语义

`up` 是服主的一行部署入口，Compose 风格，不是 Docker `run`：

```bash
feather up lobby.fmap --name lobby
feather up lobby --scale 3
```

行为：

1. 如果参数是 archive，先 `load --replace`，并 recreate 该 map 的 instance。
2. 如果参数是已安装 map，直接确保 instance。
3. instance 不存在则创建。
4. instance 存在但 `mapContentHash` 与 map 当前 contentHash 不同，自动 `stop + rm + run`（recreate）。
5. instance 已是当前内容且 stopped，则 `start`。
6. 输出 instance 状态。

`run` 仍是底层 create+start：同名冲突不隐式 recreate。

### 6.1 `run` 的语义

`run` 是 Docker 的 create + start：

- 必须给 map；未知 id → `MAP_NOT_FOUND`。
- 同名 instance 已存在 → `INSTANCE_CONFLICT`；用 `start` 启动已有 instance。
- 不 import、不 build、不 unpack。
- `run` 之后输出 instance 的 `id / map / state / url / shard`。

`start/stop/restart/rm` 只接受 instance id；`restart` 等价于 `stop` + `start`。

---

## 7. 全局选项与解析

### 7.1 选项归属

| 选项 | 作用域 | 环境变量 |
|---|---|---|
| `--socket <path>` | 全部客户端命令 | `FEATHER_SOCKET` |
| `--json` | 全部客户端命令 | — |
| `--data-root <path>` | **仅** `featherd` | `FEATHER_DATA_ROOT` |
| `--enable-eval` | **仅** `featherd` | `FEATHER_ENABLE_EVAL` |

命令选项：

| 选项 | 作用域 | 说明 |
|---|---|---|
| `--name <instance>` | `run` | 指定 instance id；默认 = map id |
| `--replicas <n>` | `run` | 创建 n 个 instance（`<name>-1..n`） |
| `--replace` / `--purge-data` | `load` | 更新 cached map / 旧 per-map data |
| `--force` | `rmi` / `rm` / `unpack` | 强制删除/覆盖 |
| `-f` / `--follow`、`--tail <n>` | `logs` | 跟随 / 尾行 |
| `--output`、`--project-version` | `build` | 输出 / 版本覆盖 |
| `--dir`、`--force` | `unpack` | 目标目录 / 覆盖 |

### 7.2 解析规则

- 形式：`feather [全局选项] <command> [命令选项] [位置参数]`。
- 全局选项由**一个** resolver 读一次；命令实现不重复解析。
- 严格模式：未知选项报错，不静默忽略。
- 位置参数不得从「非选项 token」里猜。`--output x` 的 `x` 是选项值，不是 workspace。
- `--` 之后全部是位置参数（`eval` 用）。

反例（现状，必须修）：

```
featherc build --output ./dist/x.fmap     # 现在把 ./dist/x.fmap 当 workspace
feather stop --socket /tmp/s.sock map-a # 现在把 --socket 当 map id
```

---

## 8. 输出与退出码

### 8.1 退出码

| code | 含义 |
|---|---|
| 0 | 成功 |
| 1 | 运行时错误（daemon、map、归档、磁盘） |
| 2 | 用法错误（未知命令、缺参数、未知选项） |

不再使用「语义退出码」。旧 `load .boxproject` 的 `exit 2` 随该分支一起删除。

### 8.2 输出

- stdout：结果。stderr：错误与提示。
- `--json`：单行 JSON，`{ "ok": true, "command": "...", "data": ... }`；失败 `{ "ok": false, "error": { "code": "...", "message": "..." } }`。
- 错误格式（人类）：`<code>: <message>`，必要时附一行 `hint: ...`。

### 8.3 错误码

| code | 场景 |
|---|---|
| `DAEMON_NOT_RUNNING` | 客户端：socket 不存在 / ping 失败 |
| `MAP_NOT_FOUND` | 未知 map id；instance 未找到目前也复用此码（待拆 `INSTANCE_NOT_FOUND`） |
| `MAP_CONFLICT` | import 目标 mapId 已存在 |
| `INSTANCE_CONFLICT` | instance id 已存在 |
| `MAP_HAS_INSTANCES` | `rmi` 时仍有 instance |
| `MAP_BUSY` | instance running/starting/stopping，操作不允许 |
| `INVALID_SPEC` | 非法 id / 缺少 mapId |
| `ARCHIVE_INVALID` | 不是可读 gzip/tar，或清单缺失/版本不支持 |
| `ARCHIVE_UNSUPPORTED` | 归档类型不支持（如 `load .boxproject`） |
| `WORKSPACE_INVALID` / `WORKSPACE_EXISTS` / `UNSAFE_TARGET` | build/unpack 的目标/字段/source 问题 |
| `EVAL_DISABLED` | daemon 未开 `--enable-eval` |
| `USAGE` | CLI 用法错误 |

### 8.4 `ps` / `maps` 输出

`feather ps` 列 instance：

```
INSTANCE        MAP             STATE     PORT   SHARD   VOLUME
bedwars-lobby   bedwars-lobby   running   3001   shard-0 bedwars-lobby
lobby-2         bedwars-lobby   stopped   -      -       lobby-2
```

`feather maps` 列 cached map：

```
ID              VERSION   HASH              SIZE     INSTANCES
bedwars-lobby   1.0.0     sha256:4ce4fb...  10.0 KB  2
```

`STATE` 是 instance 状态（`created` / `starting` / `running` / `stopping` / `stopped` / `error`）。
`load` 之后不会出现在 `ps`，直到 `run`。`VOLUME` 默认 = instance id，永远有值。

---

## 9. Docker 对照表（裁决用）

| Docker | feather | 规则 |
|---|---|---|
| `dockerd` | `featherd` | 前台进程；SIGTERM/systemd 停止 |
| `docker` CLI | `feather` CLI | 只通过 socket 说话 |
| `dockerd --data-root` | `featherd --data-root` | data root 只属于 daemon |
| `/var/run/docker.sock`、`DOCKER_HOST` | `~/.feather/daemon.sock`、`--socket`、`FEATHER_SOCKET` | 客户端只用这个找 daemon |
| `docker load` | `feather load` | 安装/更新 cached map |
| `docker images` | `feather maps` | 列 cached maps |
| `docker run --name` | `feather run <map> --name <instance>` | 创建并启动 instance |
| `--scale` | `feather run <map> --replicas N` | 多 instance |
| `docker ps` | `feather ps` | 列 instances |
| `docker start` | `feather start <instance>` | 启动已创建 instance |
| `docker stop` | `feather stop <instance>` | 不删除 |
| `docker rm` | `feather rm <instance>` | 删 instance |
| `docker logs` | `feather logs <instance>` | 目前是 shard 级输出 |
| `docker exec` | `feather eval <instance> -- <code>` | 是 JS eval，不是进程 exec |
| `docker compose up` | **删除** | 没有 compose 文件 |
| `docker compose down` | **删除** | 停所有 instance + 停 daemon 不属于 CLI |
| `docker inspect` | `feather inspect <map>` / `GET /v1/instances/:id` | map definition vs instance |
| `docker volume` | `feather volume`（无命令，仅配置） | SQLite 文件 |
| `docker rmi` | `feather rmi <map>` | 有 instance 时拒绝 |

**裁决规则**：表里有对应项，按 Docker 的语义裁剪；表里写「没有对应」或「删除」，就不要发明。

---

## 10. 当前实现状态

已完成：

- Go CLI canonical（`feather`）；JS CLI 已删除。
- `featherd` daemon；`build` / `unpack` 是一次性 `featherd` 子进程。
- `load` 装 cached map；`run/start/stop/restart/rm/ps/maps/inspect/rmi` 已接入。
- contract：`MapDefinition` / `InstanceSpec` / `InstanceStatus`；`MapSpec` / `MapStatus` deprecated。
- asset provenance、workspace round-trip、CI（typecheck/build/test:daemon/go）。

迁移中：

- `POST /v1/maps`、`PUT /v1/maps/:id` 和 `/v1/maps/:id/{start,...}` 已删除。
- `importArchive` 已只装 definition；但 `load --replace` 仍会 force 删除该 map 的 instance。
- instance id 冲突返回 `INSTANCE_CONFLICT`；其它 instance 错误码仍可能复用 `MAP_*`。
- `instance.created` 已发；start/stop 生命周期仍发 `map.*`，目标 `instance.*`。

剩余：

- 删除 JS CLI（等 parity/CI 稳定）。
- `feather --version` 默认 `0.0.0`，需要 ldflags 注入。
- boxproject workspace in-place build。
- Postman / docs 已按 maps/instances 更新；后续跟随 API 变更。

验收：

```bash
feather load m.fmap
feather maps
feather run m --replicas 2
feather ps
feather stop m-1
feather rm m-2
feather rmi m --force
```

## 11. 非目标

- 不改 content 布局（`project-state.json` + `blobs/` 是神岛官方设计）。
- 不改 volume 的名字与语义。
- 不改 `.fmap` / `feather.map` 的 wire 名。
- 不改 `<dataRoot>/maps/<id>` 目录名（cached map 也是 map）。
- 不做 per-instance 日志路由；`logs` 保持 shard 级并文档说明。
- 不把 archive 叫 image；map 是 image，instance 是 container。
- 不恢复 `down` / compose 语义。

## 12. 待确认（默认按本文执行）

1. `exec` → `eval` 的改名。保留 `exec` 一个版本作为 deprecated alias。
2. 默认 socket 路径 `~/.feather/daemon.sock`。多用户/多实例隔离可改用 `$XDG_RUNTIME_DIR/feather/daemon.sock`。
3. `run` = create+start；`start` = start existing。
4. `--replace` 对已有 instance 的影响：当前 pin 旧 content；是否加 `run --recreate`。
5. map version/tag：是否允许同一 mapId 多版本共存（像 image tag）。
6. instance 错误码是否拆 `INSTANCE_*`。
7. `--purge-data` 是否保留；新模型下 instance data 由 `rm` 删除。
