# feather 设计决策

> **状态**：讨论稿（decisions + open questions）
> **范围**：runtime 模型、session-on-demand、CLI 三件套、创作闭环
> **相关**：[CLI-CONTRACT.md](CLI-CONTRACT.md)、[DAEMON-API.md](DAEMON-API.md)、[MAP-AUTHORING.md](MAP-AUTHORING.md)、[WORKSPACE.md](WORKSPACE.md)

---

## 0. TL;DR

- **map = image**；**instance = registration + runtime**；**session = 玩家会话**。
- `featherd` 启动后监听地图访问；**玩家进入才启动 runtime / createSession**；空闲后回到 `created`，registration 保留。
- **`create` 注册 + 监听；`run` = create + start；`up` = 从工作区 build + load + start dev instance。**
- **不需要用 `server.toml` 声明 instance/route**。`state.json` 持久化。
- CLI 三件套：**`feather`**（runtime / ops）、**`featherc`**（authoring，`apc` 的开放对应物）、**`featherd`**（daemon + one-shot）。
- 创作闭环：`featherc terrain/entity/... → preview → diff → check → build`，然后 `feather load → run`。
- registry / `pull` / `push` 后置；不做托管开服。

---

## 1. 产品上下文

- 第一用户是**服主**：自己开服，不需要额外开发；卖的是 infra / 软件，不是托管 compute。
- 第二用户是**地图创作者 / AI**：CLI-first，无 GUI 也能完成闭环。
- registry 是分发桥梁；内容平台、身份、AI 供给在后。
- 独立项目，不冒充官方；目标是被生态当成默认工具，而不是自称官方。

---

## 2. Runtime 模型

### 2.1 层级

| 层 | 对应 | 说明 |
|---|---|---|
| archive | image tar | `.fmap` 分发物 |
| map | image | 已安装的地图定义；`load` / `pull` 产生 |
| instance | container + registration | `create` 注册；`run` 启动；玩家进入后才启动 runtime |
| session | 玩家会话 | 玩家连接时 `createSession` |
| volume | volume | SQLite 持久化边界 |

### 2.2 生命周期

```text
create ──▶ created ──player/start──▶ starting ──▶ running
              ▲                                      │
              │ idle timeout                         │ last player
              └──────────── idle ◀───────────────────┘
                                                      │ stop
                                                      ▼
                                                   stopped ──start──▶ starting
任意状态 ──rm──▶ removed
```

- `created`：listener 在，runtime 不在；玩家可触发。
- `starting`：cold start；玩家排队。
- `running`：有玩家，或 `start` 预热。
- `idle`：runtime 在，0 玩家；timeout 后回 `created`。
- `stopped`：listener 和 runtime 都不在；玩家进不来；`start` 恢复。
- `stop`：下线（runtime + listener）；idle timeout 是内部行为，不是 CLI `stop`。
- `rm`：注销。
- `error`：启动/运行失败；按 `restartPolicy` 处理。
- daemon 重启恢复 `created` / `stopped`，不自动启动。

### 2.3 命令语义

| 命令 | 语义 |
|---|---|
| `feather load <archive>` | 安装 cached map（image） |
| `feather pull <ref>` | 从 registry 安装（后置） |
| `feather create <map>` | 注册 instance + 监听；不启动 runtime；状态 `created` |
| `feather run <map>` | create + start；真正启动 runtime |
| `feather up [workspace]` | build + load + create + start dev instance（开发者一条龙） |
| `feather start <instance>` | 启动 runtime；`stopped` 时同时恢复 listener |
| `feather stop <instance>` | 停 runtime + 停 listener；下线 |
| `feather rm <instance>` | 注销 registration |
| `feather ps` | 列 instance：`INSTANCE MAP STATE PORT PLAYERS UPTIME VOLUME` |
| `feather maps` | 列 cached map |
| `feather rmi <map>` | 删 map；有 instance 时拒绝 |

### 2.4 为什么不是 Docker

| Docker | feather |
|---|---|
| `docker create` | `feather create`：注册 + 监听；不启动 runtime |
| `docker start` | `feather start`：启动 runtime |
| `docker run` | `feather run`：create + start |
| `docker stop` | `feather stop`：停 runtime + 停 listener（下线） |
| `docker rm` | `feather rm`：注销 |
| `docker compose up` | `feather up`：单工作区 dev 流程；不是多服务 manifest |
| 开机/重启自动拉起服务 | daemon 重启恢复 `created` / `stopped`，不自动启动 |
| container 长期驻留 | runtime 空闲后回 `created`，registration 保留 |
| image / container | map / instance |

### 2.5 不需要 `server.toml` 声明 instance

- `create` 是注册动作；`run` = create + start；`state.json` 持久化。
- `server.toml` 若存在，只放 daemon / network 等全局配置，不声明 instance / route。
- 需要备份/GitOps 时用 `feather export` / `feather import`；它是**备份格式**，不是 source of truth。
- 不回到 Docker Compose 的「声明 + 开机启动」。

---

## 3. Gateway / Session Router

### 3.1 为什么需要

runtime 不存在时，必须有人监听玩家连接；第一个玩家触发启动，然后 `createSession`。

```text
player → featherd listener :3001 → instance route
  → start worker（internal port）
  → createSession
  → proxy bytes
  → idle timeout → stop worker，保留 listener
```

### 3.2 路由方案

- **v1：per-instance port listener**。`run --port 3001`，daemon 监听 3001；第一个连接触发启动。不改客户端。
- **v2：single gateway + handshake**。玩家带 map/instance id 进入，gateway 路由；更省端口，但要协议支持。
- runtime 用内部端口，gateway 代理；socket handoff 更快但复杂，先代理、测延迟。

### 3.3 关键问题

- `createSession` 是启动 runtime，还是只挂到已运行 runtime？
- cold start 预算多少？连接排队/loading 怎么展示？
- proxy vs socket handoff 的延迟预算。
- 一个 registration 多房间 / auto-scale 吗？
- 公共 game listener 的鉴权、限流、DDoS。

### 3.4 边界

- **admin API**（本地 UDS）和 **game listener**（公网）分开；admin 不暴露公网。
- gateway 先放进 `featherd`，单进程；规模上来后拆独立 gateway。
- `featherd` 不再只是 supervisor：它同时是 gateway + session manager。

---

## 4. CLI 三件套

| 二进制 | 角色 | 受众 | 典型命令 |
|---|---|---|---|
| `feather` | runtime / ops | 服主 | `load/pull/run/start/stop/rm/ps/maps/rmi/logs/eval` |
| `featherc` | authoring | 创作者 / AI | `init/build/unpack/terrain/entity/ui/environment/asset/script/meta/preview/diff/check/fmt/schema/palette` |
| `featherd` | daemon + one-shot | 实现者 / 运维 | daemon；`build` / `unpack` / `edit` |

### 4.1 命名

- `featherc` 是 `apc`（Arena Pro CLI）的开放对应物；生态里已有先例。
- `featherc` 是独立实现，不冒充官方；命令概念尽量对齐 `apc`，降低迁移成本。
- 不用 `feather-edit` / `feather-map` / `feather-studio`。

### 4.2 实现

- 两个 Go 入口，共享 internal 包：`cmd/feather`、`cmd/featherc`。
- `featherc` 只做参数解析/转发：`featherc terrain ...` → `featherd edit ...`；`featherc build` → `featherd build`。
- builder / engine 在 TS 侧；Go 不重复实现。
- `featherc` 不依赖 daemon/socket；one-shot。
- 同一版本发布两个二进制；`featherc --version` 与 `feather` 一致。
- 备选：一个二进制按 `argv[0]` 分派；两个入口更清楚。

### 4.3 迁移

- `build / unpack / init` 从 `feather` 移到 `featherc`；`feather` 保留一个版本的 deprecated alias。
- `feather build` 只做 alias，不复制实现。
- 不引入 `feather edit`；authoring 全在 `featherc`。

---

## 5. 创作闭环

### 5.1 闭环

```text
featherc init
  → terrain / entity / ui / environment / asset / script / meta
  → preview
  → diff
  → check
  → build
  → feather load
  → feather run / start
```

### 5.2 命令面（P0 / P1 / P2）

**P0：先闭环**

```bash
featherc init <dir> [--template arena|empty]
featherc unpack <project archive> [--dir <workspace>]

featherc terrain heightmap --from <img> [--block <name>]
featherc terrain fill --box <x1,y1,z1,x2,y2,z2> --block <name> [--replace]
featherc terrain stamp --file <vox> --at <x,y,z>
featherc terrain carve --box <...> | --sphere <x,y,z,r>
featherc terrain get --at <x,y,z>

featherc entity add <type> --id <id> --at <x,y,z> [--from <json>] [--patch <json>]
featherc entity set <id> [--patch <json>]
featherc entity rm <id>
featherc entity get <id>
featherc entity list [--type <type>] [--json]

featherc ui add <id> --from <json>
featherc ui get <id>
featherc ui list
featherc environment set --preset <name> [--time HH:MM] [--patch <json>]
featherc environment get

featherc palette list
featherc preview [--out <png>] [--camera <...>] [--views iso,top]
featherc diff [--from <dir|ref>] [--to <dir|ref>] [--out <png>] [--json]
featherc check [--strict] [--json]
featherc build [--output <fmap>]
```

**P1**

`ui set/rm`、`asset add/rm/list`、`script add/rm/list/entry`、`meta get/set`、`fmt`、`schema`。

**P2**

`chunk get/set`、批量 `featherc batch --file ops.json`、`terrain replace/smooth`、`entity copy/move`、多视角 preview、`push/publish`。

### 5.3 通用参数

```text
--json                 所有命令
--dry-run              所有编辑命令
--force                删除/覆盖
--from <file|dir|ref>  输入
--patch <json>         set 的复杂字段
--if-exists error|skip|replace
--box x1,y1,z1,x2,y2,z2
--sphere x,y,z,r
--at x,y,z
```

### 5.4 AI 契约

- 所有命令支持 `--json`；错误结构化（code / message / path）。
- 编辑命令支持 `--dry-run`；无交互 prompt。
- `schema` / `palette list` 提供合法字段和方块名。
- `preview` / `diff` 输出图片路径 + JSON。
- `check` 是机器可读的质量门。
- 不引入隐藏状态；git 是 undo / 事务。

---

## 6. Registry（后置）

- `feather pull <ref>`：服主安装 map。
- `featherc push/publish`：创作者发布（命名待定）。
- ref：`registry://<owner>/<map>@<version>`。
- immutable versions、`latest` alias、content hash 校验、auth scopes、private maps。
- registry 不是 launch 阻塞项；private alpha 用本地 `.fmap`。

---

## 7. 决策记录

| 决策 | 状态 | 理由 |
|---|---|---|
| map = image，instance = registration + runtime，session = player | 已定 | 一张 map 可起多个 instance；玩家触发 session |
| 玩家进入才启动 runtime，idle 后 stop | 已定 | 神岛不是 Docker 的长期服务模型 |
| 不做 `server.toml` 声明 instance；`run` 即注册 | 已定 | 避免 Docker Compose 思维；state 持久化 |
| `featherc` 独立 authoring CLI | 已定 | `apc` 先例；受众分离；一级 `feather` 保持 Docker-like |
| `build / unpack / init` 归 `featherc` | 已定 | 它们是 authoring / artifact 转换；`feather` 保留 alias |
| 不做 `feather edit` | 已定 | 命名空间不如独立 CLI 清楚 |
| `run` 默认 dormant，`--start` 预热 | 提议 | 与「玩家触发」一致；需下游确认/改实现 |
| 两个 Go 二进制（vs argv[0] 分派） | 提议 | 入口清楚；构建简单 |
| gateway v1 per-instance port | 提议 | 不改客户端；先跑通 |
| gateway v2 single port + handshake | 开放 | 取决于客户端协议 |
| registry 后置 | 已定 | 不阻塞 private alpha |
| 托管开服 / 自营 compute | 否决 | 花大钱办小事 |
| `pack` | 暂缓 | `build` 已产出 `.fmap`；避免两个重叠命令 |
| GUI / 地形 DSL / op journal | 否决 | CLI-first；git 是历史 |

---

## 8. 当前实现 vs 目标

| 区域 | 当前 | 目标 |
|---|---|---|
| `run` | create + start | register（dormant）；`--start` 预热 |
| daemon | supervisor | supervisor + gateway / session manager |
| CLI | `build/unpack/init` 在 `feather` | 移到 `featherc`；`feather` 保留 alias |
| authoring | 文档里的草图 | `featherc` P0 命令 |
| `ps` | instance 列表 | 加 `PLAYERS` / `dormant` / `idle` |
| player session | daemon 不处理 | gateway 在玩家连接时 `createSession` |
| registry | 无 | 后置 |
| docs | runtime 契约 | 增加 `featherc` 契约 |

---

## 9. 下一步

1. **冻结 `run` 语义**：register dormant，`--start` 预热；改 CLI / daemon / docs。
2. **Gateway 垂直切片**：per-instance listener + cold start + createSession + idle stop。
3. **`featherc` 骨架**：init / build / unpack / terrain / entity / preview / diff / check。
4. **压测**：10 玩家 / 2 图 / 24h soak；cold start、泄漏、重连。
5. **registry**：pull/push；不阻塞 alpha。

### 验收（private alpha）

- 10 分钟安装。
- cold start 有明确预算并达标。
- 24h 无泄漏、无崩溃。
- 玩家断线重连；volume 跨 stop/start 持久。
- `feather ps` 状态准确；`featherc check` 可门禁。

---

## 10. 非目标

- 不做托管开服 / 自营 compute。
- 不做 GUI 编辑器。
- 不做地形文本 DSL / op journal / WAL。
- 不做 Docker Compose 式 manifest。
- 不在 gateway 之前做 dashboard / identity / AI。
- 身份/账号、论坛/社区、导出策略：单独文档，不在本文。
