# feather CLI 契约

> **状态**：已定稿（本会话）
> **读者**：实现 `cli/`、`daemon/`、`builder/` 的 agent
> **优先级**：本文与代码、README、旧 docs 冲突时，以本文为准。实现按 §10 的 P1–P4 收敛。
> **数据模型**：workspace 布局、JSON sections、chunks、git/merge 见 [MAP-AUTHORING.md](MAP-AUTHORING.md)。

---

## 0. 给 agent 的十条

1. `workspace` 只指**地图项目目录**（含 `feather.toml`）。不再指 data root、CLI 自己、map id。
2. `map` 是**实体**。cached map（`created`/`stopped`）和 running map 都是 map，`<dataRoot>/maps/<id>` 不改名。
3. `archive` 是**容器统称**：`.fmap`（map archive）、`.boxplay`（play bundle）、`.boxproject`（project archive）。
4. **archive 不是 Docker image**。一个 archive 只携带一个 map id（`.boxplay` 是多个），加载两次是冲突，不是两个实例。
5. `feather.toml` 只放**身份 + 构建参数**，绝不放实体/场景数据。内容在 JSON sections + `chunks/`，见 [MAP-AUTHORING.md](MAP-AUTHORING.md)。
6. `data root` 是 **daemon 配置**。客户端命令一律不接受 `--data-root`。
7. `socket` 是**客户端端点**，独立于 data root。客户端只靠 `--socket` / `FEATHER_SOCKET` 找 daemon。
8. daemon **复制 dockerd**：前台进程、信号停止、不自动拉起、没有 `down` 命令。
9. `load` / `build` / `unpack` 都走 daemon。CLI 只发请求和展示结果，不解析 workspace、不打 archive。
10. CLI **不读 data root**。P2 之后，`cli/src` 里不应出现 `resolveDataRoot` / `maps/` / `blobs/` 的路径拼接。

---

## 1. 词表

### 1.1 规范词

| 词 | 定义 | 代码锚点 |
|---|---|---|
| **workspace** | 地图项目目录，构建输入。最少含 `feather.toml`；源码形式见 §4 | `feather.toml`、`feather build <workspace>` |
| **archive** | 可分发容器的统称。只在文档/文案层使用，不是命令名 | — |
| **map archive** | 一张 map 的归档，扩展名 `.fmap`，格式标识 `feather.map` | `FmapManifest`、`readFmapManifest` |
| **play bundle** | 神岛导出的可玩包 `.boxplay`，可含多张 map | `PlayBundle` |
| **project archive** | 神岛导出的项目源码包 `.boxproject` | `buildProjectArchive` |
| **map** | 实体：有 `map.id`、内容、生命周期。从 `load` 起存在 | `MapSpec` / `MapStatus` |
| **cached map** | 已导入未运行，或已停止的 map。状态 `created` / `stopped` | `<dataRoot>/maps/<id>` |
| **running map** | 正在运行的 map。状态 `starting` / `running` / `stopping` | `MapState` |
| **volume** | 存储单元：一个 SQLite 文件 = 一个持久化边界。**不是 Docker volume** | `storage.volume`、`volumes/<volume>.db` |
| **data root** | daemon 的运行时数据根：`maps/ blobs/ volumes/ logs/` | `--data-root`、`FEATHER_DATA_ROOT` |
| **daemon** | supervisor 进程。前台运行，信号停止 | `feather daemon` |
| **blob** | 内容寻址文件，全局去重 | `<dataRoot>/blobs/` |
| **asset** | 逻辑路径（`mesh/` `audio/` `image/`）→ blob 的映射 | `feather.json.assets` |
| **content** | 一张 map 的内容集合：`project-state.json` + `blobs/` | 归档内 `content/` |
| **shard** | daemon 内的 worker 线程；一张或多张 map 跑在上面 | `shardId` |
| **runtime mode** | map 的执行方式；目前只有 `worker` | `MapStatus.runtime` |

### 1.2 禁用词

| 不要用 | 改用 | 原因 |
|---|---|---|
| server / instance | map | 与引擎 `GameServer` 混淆 |
| supervisor（作 CLI 名词） | daemon | 角色不是名字 |
| data dir | data root | 同一概念两个词 |
| workspace（指 data root） | data root | workspace 专指项目 |
| workspace（指 map id） | map id | `workspaceId` 字段要删 |
| native arena workspace | native workspace / Arena project archive | `arena` 与共享内存 arena 撞车 |
| script shell | map script / eval | `shell` 是 `shell/` 包的名字 |
| group | volume（除导入兼容层） | group 已废弃 |
| project（作 CLI 名词） | workspace | `[project]`、`.boxproject`、`project-state.json` 是格式字段名 |
| image / container | archive / map | 见 §3.3，没有一对多实例化 |

---

## 2. 实体与状态机

### 2.1 三层转换

```
workspace ──build──▶ archive ──load(daemon)──▶ map (created = cached)
    ▲                                            │
    │                                            │ up
    └────────── unpack ──────────────────────    ▼
         (project archive → workspace)       map (running)
                                                 │
                                                 │ stop
                                                 ▼
                                            map (stopped = cached)
```

- `build`：经 daemon，workspace → archive；CLI 只发 job。
- `load`：**经 daemon**，archive → map（`created`）。
- `unpack`：经 daemon，project archive → workspace；CLI 只发 job。
- `up`：经 daemon，cached map → running map。

### 2.2 Map 生命周期

```
created ──up──▶ starting ──▶ running ──stop──▶ stopping ──▶ stopped
   ▲                              │                          │
   │                              └──────── error ◀──────────┘
   └──────────────── up ──────────────────────────────────────┘
任意状态 ──rm──▶ destroyed
```

规则：

- `stop` **不删除** map，只停运行时；map 回到 cached 状态。
- `rm` 删除记录 + 缓存内容；运行中必须 `--force` 或先 `stop`。
- daemon 关闭时停掉所有 map，记录保留为 `stopped`。
- daemon 启动时恢复记录为 `stopped`，**不自动启动**；启动由 `up` 负责。
- `ps` 必须能看到 `created` / `stopped`，否则 `load` 之后没有命令能确认安装结果。

---

## 3. 归档

### 3.1 三种归档

| 归档 | 扩展名 | 内容 | 可玩 | 消费命令 | 产物层 |
|---|---|---|---|---|---|
| map archive | `.fmap` | `feather.json` + `content/`，一张 map | ✅ | `load` | map |
| play bundle | `.boxplay` | 多张 map + group 元数据 | ✅ | `load` | map ×N |
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
- `storage.volume` 相同
- `runtime`（port / memoryMb / playerLimit）相同

**不参与**相等判断：

- `source.*`（来源归档的 kind / version / hash）——那是 provenance
- tar 字节——gzip mtime 和打包顺序不可控，也不该成为契约

`content.hash` 是内容身份。`source.hash` 是来源身份。两者不得混用。

### 3.3 archive 不是 image

Docker 的 image/container 是「模板 → 多实例」。feather 不是：

- 一个 `.fmap` 只携带一个 `map.id`。
- 同一个归档 `load` 两次 = `MAP_CONFLICT`，不是创建第二个 map。
- 没有 tag、没有 image 层、没有 `run --name`。

因此不要照搬 image/container 的命名和命令。`archive` 是**序列化形式**，`map` 是实体；关系类似 document / `.docx`，不是 image / container。

### 3.4 兼容层

- `group` 只允许出现在 `.boxplay` 导入映射里：`mapGroupId → storage.volume`。CLI 输出不得再打印 `group:`。
- `groupNamespace`（MapSpec）/ `groupStorageNamespace`（engine config）标记 `@deprecated`，语义等同 volume；P4 删除。
- `dataStorageNamespace` 保留：卷内每图隔离键。文档统一表述为「volume 共享，namespace 每图独立」。

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

[source]                          # 可选；由 unpack 写入，build --check 使用
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
feather unpack <project archive> [--dir <workspace>] [--kind baked|boxproject] [--force]
```

- 默认 `--kind baked`：先把 archive 的 hash DAG 展开成工作区——`chunks/<x>,<y>,<z>.bin`、各 JSON section、`scripts/`、`assets/`——再写 `feather.toml` 和 `feather.lock.json`。布局见 [MAP-AUTHORING.md](MAP-AUTHORING.md) §2、§7.4。
- `--kind boxproject`：只把归档放进 workspace，`[build].kind = "boxproject"`；构建时重跑官方 publish。
- 产出必须**不需要任何修改就能 `feather build`**，且 `content.hash` 与源归档一致。
- `unpack` 由 daemon 执行；CLI 不解析 archive、不碰 data root。
- 目标目录非空时拒绝，除非 `--force`。
- 默认目录名 = 归档 basename。

验收：

```bash
feather unpack bedwars.boxproject --dir bedwars
cd bedwars
feather build --check          # 校验 contentHash
```

### 4.5 `build`

```
feather build <workspace|project archive> [--output <file>] [--project-version <v>] [--check]
```

- 输入是目录 → 读 `feather.toml`；输入是 `.boxproject` 文件 → 等价于 `kind = "boxproject"` 的临时 workspace。
- `kind = "baked"`：校验 JSON sections + 对每个 chunk 文件做 hash，按官方顺序组装 `voxels.chunks`，写 `feather.lock.json`，再打包。
- 只接受位置参数。不再有 `--workspace` / `-C`；`--version` 保留给 CLI 自身。
- 版本覆盖用 `--project-version`。
- `--check`：校验 `feather.lock.json` 与当前工作区一致（inputs 树 hash + outputs `contentHash`）；不一致 exit 1。
- `--locked`：拒绝更新 lock；CI 用。
- 构建由 daemon 执行；CLI 只发送 workspace/output 路径和参数。

---

## 5. Daemon（dockerd 模型）

### 5.1 生命周期

- 只有一种启动方式：`feather daemon`，前台运行，日志写 stdout/stderr。
- 停止方式：SIGINT / SIGTERM（Ctrl-C、systemd、容器 stop）。
- **没有** `feather down`；`/v1/shutdown` 只作为内部/测试 API，不映射成 CLI 命令。
- **不自动 spawn**。daemon 没起时，`load` / `up` / `ps` / `stop` / `logs` / `eval` / `rm` 一律：

  ```
  daemon not running: <socket>
  start it with: feather daemon
  ```

  exit 1，错误码 `DAEMON_NOT_RUNNING`。

### 5.2 Data root 与 socket

| 项 | 归属 | 默认 | 覆盖 |
|---|---|---|---|
| data root | daemon | `~/.feather` | `feather daemon --data-root`、`FEATHER_DATA_ROOT` |
| socket | 客户端端点 | `~/.feather/daemon.sock` | `--socket`、`FEATHER_SOCKET` |
| daemon 日志 | daemon | stdout/stderr | systemd / 重定向 |

规则：

- `--data-root` **只**出现在 `feather daemon`。
- socket 路径是固定公式，不随 `--data-root` 漂移。自定义 data root 的 daemon 仍听默认 socket，除非显式 `--socket`。
- 一个 socket 对应一个 daemon；两个 daemon 必须用不同 socket。
- socket 权限 `0600`。

服务器级配置（端口、人数、视距、tick、安全、日志）的目标表面是 `server.toml`，见 [MAP-AUTHORING.md](MAP-AUTHORING.md) §13。当前实现仍用 daemon flag + env，优先级：flag > env > 配置文件 > 默认值。

### 5.3 状态与重启

- `state.json` 持久化 map 记录（spec + status）。
- daemon 启动时恢复记录，全部置为 `stopped`；不自动启动。
- daemon 关闭时优雅停止所有 map，写回 `stopped`。
- `restartPolicy` 只描述**shard 崩溃**后的重启，不描述 daemon 重启后的自动启动。

### 5.4 Import API

`load` 走 daemon，新增：

```
POST /v1/maps/import?replace=1
Content-Type: application/gzip
Body: .fmap / .boxplay 原始字节
```

daemon 侧：

1. 解包到临时目录，复用 `assertSafeEntries` 校验路径。
2. 识别 `feather.json`（map archive）或 `bundle.json`（play bundle）。
3. 写入 `<dataRoot>/maps/<id>/`，blobs 合并进 `<dataRoot>/blobs/`（已存在则跳过）。
4. 注册 map 记录，状态 `created`；`.boxplay` 所有成员一起注册，`volume = mapGroupId`。
5. 返回 `{ maps: [{ id, state }] }`。

冲突策略：

- 默认：任一目标 id 已存在 → `MAP_CONFLICT`，不写入任何一张（原子性）。
- `--replace`：覆盖缓存内容，**保留 `data/`**；运行中的 map 拒绝（`MAP_BUSY`）。
- `--purge-data`（与 `--replace` 同用）：连同 `data/` 一起删除。

`.boxproject` 不走这个接口；`load` 遇到 `.boxproject` 直接报 `ARCHIVE_UNSUPPORTED` 并提示 `feather unpack`。

---

## 6. 命令面

| 命令 | 层 | 需要 daemon | 幂等 | 说明 |
|---|---|---|---|---|
| `feather daemon [--data-root <p>] [--socket <p>]` | daemon | — | — | 前台；信号停止 |
| `feather build <workspace\|.boxproject>` | workspace → archive | ✅ | 覆盖输出 | daemon job |
| `feather unpack <project archive>` | archive → workspace | ✅ | `--force` | daemon job；默认 baked |
| `feather load <archive>` | archive → map | ✅ | `--replace` | 只接受 `.fmap` / `.boxplay` |
| `feather up [map...]` | cached → running | ✅ | 是 | 无参 = 所有已导入 map |
| `feather stop <map...>` | running → cached | ✅ | 是 | 不删内容 |
| `feather restart <map...>` | running → running | ✅ | 是 | |
| `feather ps` | 列表 | ✅ | 是 | 含 `created` / `stopped` |
| `feather logs <map> [-f] [--tail N]` | map | ✅ | 是 | shard 级输出（已知限制） |
| `feather eval <map> -- <code>` | map | ✅ | ❌ | JS 表达式求值；需 daemon `--enable-eval` |
| `feather rm <map> [--force]` | map → gone | ✅ | 是 | 删记录 + 缓存 |

删除：

| 命令 | 处理 |
|---|---|
| `feather down` | 删除。daemon 用信号停；停所有 map 用 `feather stop`（多选）或停 daemon |
| `feather exec` | 改名 `feather eval`。语义是 JS eval，不是进程 exec |
| `feather load *.boxproject` | 删除该分支；改用 `unpack` |
| `feather daemon` 自动 spawn | 删除；daemon 只由 `feather daemon` 启动 |
| `feather build --workspace` / `-C` | 删除；只保留位置参数 |
| `feather build --version` | 删除；改用 `--project-version` |
| `feather load --force` | 改名 `--replace`（+ `--purge-data`） |
| 客户端 `--data-dir` | 删除 |

占位符统一：`<workspace>`、`<archive>`、`<map>`、`<code>`。不要混用 `<id>` / `<mapId>`。

### 6.1 `up` 的语义

`up` 是**批量启动**，不是 compose 的 create+start：

- 无参：启动 daemon 已知的全部 map。
- 带参：只启动列出的 map；未知 id → `MAP_NOT_FOUND`。
- 已 running：no-op，返回当前状态。
- 不 import、不 build、不 unpack。
- `up` 之后输出每张 map 的 `id / state / url / shard`。

`stop` 与 `up` 对称，接受多个 id。`restart` 等价于 `stop` + `up`，但原子地由 daemon 执行。

---

## 7. 全局选项与解析

### 7.1 选项归属

| 选项 | 作用域 | 环境变量 |
|---|---|---|
| `--socket <path>` | 全部客户端命令 | `FEATHER_SOCKET` |
| `--json` | 全部客户端命令 | — |
| `--data-root <path>` | **仅** `feather daemon` | `FEATHER_DATA_ROOT` |
| `--enable-eval` | **仅** `feather daemon` | `FEATHER_ENABLE_EVAL` |

### 7.2 解析规则

- 形式：`feather [全局选项] <command> [命令选项] [位置参数]`。
- 全局选项由**一个** resolver 读一次；命令实现不重复解析。
- 严格模式：未知选项报错，不静默忽略。
- 位置参数不得从「非选项 token」里猜。`--output x` 的 `x` 是选项值，不是 workspace。
- `--` 之后全部是位置参数（`eval` 用）。

反例（现状，必须修）：

```
feather build --output ./dist/x.fmap     # 现在把 ./dist/x.fmap 当 workspace
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
| `DAEMON_NOT_RUNNING` | socket 不存在 / ping 失败 |
| `MAP_NOT_FOUND` | 未知 map id |
| `MAP_CONFLICT` | import 目标已存在且未 `--replace` |
| `MAP_BUSY` | map running/starting，操作不允许 |
| `ARCHIVE_INVALID` | 不是可读 gzip/tar，或清单缺失/版本不支持 |
| `ARCHIVE_UNSUPPORTED` | 归档类型不支持（如 `load .boxproject`） |
| `WORKSPACE_INVALID` | 缺 `feather.toml` / 字段非法 / source 不匹配 |
| `EVAL_DISABLED` | daemon 未开 `--enable-eval` |
| `USAGE` | 用法错误 |

### 8.4 `ps` 输出

```
ID              STATE     PORT   SHARD   VOLUME
bedwars-lobby   running   3001   shard-0 bedwars-group
lobby-2         stopped   -      -       lobby-2
new-map         created   -      -       new-map
```

`created` 是 `load` 之后、`up` 之前的状态。`VOLUME` 永远有值（默认 = map id），不要写 `-`。

---

## 9. Docker 对照表（裁决用）

| Docker | feather | 规则 |
|---|---|---|
| `dockerd` | `feather daemon` | 前台进程；SIGTERM/systemd 停止 |
| `docker` CLI | `feather` CLI | 只通过 socket 说话 |
| `dockerd --data-root` | `feather daemon --data-root` | data root 只属于 daemon |
| `/var/run/docker.sock`、`DOCKER_HOST` | `~/.feather/daemon.sock`、`--socket`、`FEATHER_SOCKET` | 客户端只用这个找 daemon |
| `docker load` | `feather load` | 归档流给 daemon，不自己写 data root |
| image / container | **没有对应** | archive 不是 image；map 不会一对多 |
| `docker start` | `feather up <map...>` | 只能启动已导入的 map |
| `docker stop` | `feather stop <map...>` | 不删除 |
| `docker rm` | `feather rm <map>` | 删记录 + 缓存 |
| `docker ps` | `feather ps` | 含 created/stopped |
| `docker logs` | `feather logs <map>` | 目前是 shard 级输出 |
| `docker exec` | `feather eval <map> -- <code>` | 是 JS eval，不是进程 exec |
| `docker compose up` | `feather up`（仅批量启动） | 没有 compose 文件、没有 create |
| `docker compose down` | **删除** | 停所有 map + 停 daemon 不属于 CLI |
| `docker volume` | `feather volume`（无命令，仅配置） | 语义不同：SQLite 文件 |

**裁决规则**：表里有对应项，按 Docker 的语义裁剪；表里写「没有对应」或「删除」，就不要发明。

---

## 10. 落地顺序

### P1 — surface（不动 daemon）

- 重写 `cli/src/index.ts` 的参数解析：严格、表驱动、单一 resolver。
- `--help` 只列 §6 的命令；补全 `--socket` / `--json` / `--tail` / `--project-version` / `--check`。
- 删除 `down`；`exec` → `eval`（保留一个版本的 alias 可选）；`load` 拒绝 `.boxproject`。
- `--force` → `--replace`（load）。
- 统一 `<map>` 占位符；错误码与退出码按 §8。
- 修文档漂移：README 的 `--dir` / `cd my-server`；`DAEMON-API.md` 的「up 读 feather.toml」。

验收：

```bash
feather --help | grep -c down          # 0
feather build --output ./dist/x.fmap   # 不把 ./dist/x.fmap 当 workspace
feather load a.boxproject              # ARCHIVE_UNSUPPORTED + 提示 unpack
feather stop --socket /tmp/s.sock a    # 不把 --socket 当 map id
```

### P2 — daemon 边界

- `daemon/src/main.ts`：删 `--workspace`；`--data-dir` → `--data-root`；socket 默认固定公式。
- `cli/src/daemon-process.ts`：删 spawn / `ensureDaemon`；只保留 socket 解析与 client。
- 新增 `POST /v1/maps/import`；把 `cli/src/load.ts` 的解包逻辑迁到 daemon（`daemon/src/import.ts`）。
- 把 `cli/src/workspace-spec.ts` 迁到 daemon，CLI 不再读 data root。
- `ps` 返回 `created` 状态。
- daemon 没起时所有客户端命令给 `DAEMON_NOT_RUNNING` + hint。

验收：

```bash
grep -rn "resolveDataRoot\|maps/\|blobs/" cli/src        # 0
feather ps                                              # daemon 关：DAEMON_NOT_RUNNING
feather daemon --data-root /tmp/fr &                    # socket 仍在默认位置
feather load map.fmap                                   # 走 import API
feather ps                                              # 能看到 created
```

### P3 — workspace / unpack

- daemon：把 `builder` 的 release 内容暴露给 `unpack`（或支持直接输出到 workspace）。
- 在 daemon 新增 unpack/build job；CLI 只调用 daemon API；按 [MAP-AUTHORING.md](MAP-AUTHORING.md) §2/§7.4 展开成 `chunks/` + JSON sections + `scripts/` + `assets/` + `feather.toml` + `feather.lock.json`。
- `build` 支持 `kind = baked|native|boxproject`；加 `--check` / `--locked` / `--project-version`。
- `feather merge-chunk` driver + `feather doctor --install-merge-driver`（[MAP-AUTHORING.md](MAP-AUTHORING.md) §9）。
- 删除 `.boxproject` 的 `load` 分支和 `<dataRoot>/projects/`。

验收：

```bash
feather unpack x.boxproject --dir x
cd x && feather build --check          # exit 0，content.hash 与源归档一致
grep -c "project-state" x/feather.toml # 0（toml 不含内容）
```

### P4 — 清理

- 删 `MapSpec.workspaceId`、`MapStatus.workspaceId`。
- 删 `daemon --workspace`、`workspaceRoot` 参数；`local-config` / `storage` / `group-state` 路径改为 data root 派生。
- `groupNamespace` / `groupStorageNamespace` 标记 deprecated；P4 末删除。
- 删 `cli/src/workspace.ts` 的 `writeGitignore` / `ensureEmptyDir` / `tomlString`；`safeName` 默认值改 `'map'`。
- `FEATHER_DATA_DIR` → `FEATHER_DATA_ROOT`（保留旧名一个版本并 warn）。

验收：

```bash
rg "workspaceId|--workspace|groupNamespace" cli daemon   # 0（除兼容层显式标注）
ls ~/.feather/.feather                                   # 不存在
```

---

## 11. 非目标

- 不改 content 布局（`project-state.json` + `blobs/` 是神岛官方设计）。
- 不改 volume 的名字与语义。
- 不改 `.fmap` / `feather.map` 的 wire 名。
- 不改 `<dataRoot>/maps/<id>` 目录名（cached map 也是 map）。
- 不做 per-map 日志路由；`logs` 保持 shard 级并文档说明。
- 不引入 image / container 二分。
- 不恢复 `down` / compose 语义。

## 12. 待确认（默认按本文执行）

1. `exec` → `eval` 的改名。若担心破坏脚本，可保留 `exec` 一个版本作为 deprecated alias。
2. 默认 socket 路径 `~/.feather/daemon.sock`。若要多用户/多实例隔离，改用 `$XDG_RUNTIME_DIR/feather/daemon.sock`。
3. `up` 作为唯一的启动动词（不新增 `start`）。若坚持 dockerd 字面，可改为 `start` 并把 `up` 降为 alias。
4. `--replace` 默认保留 `data/`（只换内容）。若希望默认干净覆盖，改为默认 `--purge-data`。
