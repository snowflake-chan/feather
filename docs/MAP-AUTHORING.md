# 地图创作模型（Map Authoring）

> **状态**：已定稿（本会话）
> **读者**：实现 `cli/`、`daemon/`、`builder/`、编辑器的 agent
> **关系**：本文是**数据模型与创作流程**的唯一规范；命令面、daemon 生命周期、退出码见 [CLI-CONTRACT.md](CLI-CONTRACT.md)。
> **优先级**：本文与代码、README、旧 docs 冲突时，以本文为准。

---

## 0. 原则

1. **编辑器可选。** CLI 和 AI 必须能完成从建图到发布的全部流程；GUI 只是同一模型的另一个客户端。
2. **三种数据，三种生命周期。** 意图（`feather.toml`）、内容（JSON + chunks）、派生物（lock / archive）。
3. **工作区布局是我们的，archive 布局是官方的。** 工作区为可读、可 diff、可合并优化；archive 为兼容和去重优化。
4. **二进制按坐标存，归档按 hash 存。** 坐标寻址让 git 能 3-way 合并；hash 寻址让 archive 能去重。
5. **clone 必须能 build。** 仓库自包含，不依赖外部 store 才能构建。
6. **历史用 git，不引入第二套日志。** 没有 WAL，没有 op 日志，没有编辑器私有数据库。
7. **同一份输入 → 同一份输出。** 没有随机种子、没有时间戳、没有不确定的序列化。
8. **diff 是内容级的，不是操作级的。** 不同的 op 可以产出同一个 blob，op 不能当 source。

---

## 1. 对象与状态机

```
workspace ──build──▶ archive ──load(daemon)──▶ map (created = cached)
    ▲                                             │
    │                                             │ up
    └────────── unpack ──────────────────────     ▼
      (project archive → workspace)           map (running)
                                                  │
                                                  │ stop
                                                  ▼
                                             map (stopped = cached)
```

- **workspace**：创作现场。人和 AI 改这里；GUI 编辑器也改这里。
- **archive**：可分发包。`.fmap`（map archive）、`.boxplay`（play bundle）、`.boxproject`（project archive）。
- **map**：实体。cached map（`created` / `stopped`）和 running map 都是 map。
- `project-state.json` **不在工作区里**。它是 archive 的入口文件和运行时状态文件，不是创作源。

---

## 2. 工作区布局

```text
my-map/
  feather.toml               # 身份 + 构建/部署参数
  project/                   # 所有 ProjectRDA 配置
    info.json
    environment.json
    player.json
    physics.json
    collision-filter.json
    zones.json
    gamepad.json
    ambient-sound.json
    features.json
    permissions.json
    entities/
      <entityId>.json
    ui/
      <screenId>.json
    ui.json
  chunks/
    0,0,0.bin
    ...
  scripts/
    index.js
    clientIndex.js
  assets/
    mesh/...
    audio/...
    image/...
```

规则：

- `chunks/` 必须包含**所有** chunk 文件，包括空 chunk（空 chunk 也只有 2 字节），这样文件集合稳定、merge base 存在。
- 工作区里**没有** `project-state.json`、**没有** `blobs/Qm...`、**没有** `.fmap`。
- `assets/` 是逻辑路径；build 时 hash 成 blob。
- `scripts/` 是文本；`scriptIndex` 由 `scripts/index.js` 推导。

`.gitignore`：

```text
dist/
*.fmap
.feather/
.feather-build-*/
node_modules/
server.local.toml
```

`.gitattributes`：

```text
chunks/*.bin       -diff merge=feather-voxel
assets/**          -diff
```

---

## 3. 配置分层

| 层 | 内容 | 文件 | 进地图仓库 | 谁改 |
|---|---|---|---|---|
| 地图身份 / 构建 / 部署 | id、version、volume、runtime limits、build kind | `feather.toml` | ✅ | 人 |
| 地图内容 | 天气、实体、UI、玩家、物理、区域、权限 | JSON sections | ✅ | 人 / CLI / AI / GUI |
| 地图二进制 | 体素、mesh、音频、图片 | `chunks/`、`assets/` | ✅ | CLI / GUI |
| 地图派生物 | 无（全部具名，内容 hash 在 archive 中） | — | — | — |
| 服务器运行时 | 端口、人数、视距、tick、安全、日志 | `server.toml` | ❌（部署侧） | 运维 |
| 环境差异 / 密钥 | token、DB URL、路径 | 环境变量 | ❌ | 运维 |

### 3.1 归属规则

> **凡是 ProjectRDA 里的 section，一律 JSON；凡是构建/部署需要知道、但不在 ProjectRDA 里的，进 `feather.toml`；凡是服务器进程的，进 `server.toml`。**

### 3.2 「我想改 X，去哪里」

| 想改 | 去哪里 | 命令 |
|---|---|---|
| 地图 id / version | `feather.toml` | 手动改 |
| 显示名 / 描述 / 封面 | `project/info.json` | `feather info set` |
| 天气 / 时间 / 雾 | `project/environment.json` | `feather weather set` |
| 实体 / NPC / 刷怪点 | `project/entities/<id>.json` | `feather entity add\|rm\|set` |
| UI 屏幕 | `project/ui/<screen>.json`、`project/ui.json` | `feather ui ...` |
| spawn / 移动 | `project/player.json` | `feather player set` |
| 物理 | `project/physics.json` | `feather physics set` |
| 区域 | `project/zones.json` | `feather zone ...` |
| 权限 | `project/permissions.json` | `feather permission ...` |
| 体素 | `chunks/*.bin` | `feather terrain ...` |
| 人数 / 端口 / 视距 | `server.toml` | 手动改 / 运维 |
| token / DB URL | 环境变量 | 运维 |

`feather config where <key>` 应直接回答这张表。

---

## 4. `feather.toml`

### 4.1 Schema

```toml
schema_version = 1

[project]
id = "bedwars-lobby"
version = "1.0.0"

[build]
kind = "baked"                    # baked | native | boxproject
output = "dist/bedwars-lobby.fmap"

[storage]
volume = "bedwars-group"          # 可选；默认 = project.id

[runtime]
port = 0
memoryMb = 512
playerLimit = 32

[source]                          # 可选；unpack 写入的来源信息
archive = "bedwars.boxproject"
format = "boxproject"
version = "1.2.0"
```

### 4.2 规则

- **只放身份 + 构建/部署参数。** 实体、天气、UI、物理、权限一律不进 toml。
- `[project].name` **不存在**。显示名以 `info.json.displayName` 为准；archive 的 `map.name` 从那里取。
- `[build].source` 只在 `kind = "native"` / `"boxproject"` 时需要；`baked` 用工作区根。
- 超过约 30 行就说明有内容泄漏，应该挪到 JSON 或 `server.toml`。
- `[runtime]` 是**每图部署参数**，不是服务器全局配置；服务器全局配置见 §13。

### 4.3 `kind`

| kind | 工作区内容 | build 行为 |
|---|---|---|
| `baked`（默认） | JSON sections + `chunks/` + `scripts/` + `assets/` | 校验 + 组装 + 打包；不重新生成内容 |
| `native` | `index.js` + `assets/` + JSON sections | 先用官方 generator 生成空白 project，再应用 sections |
| `boxproject` | 一个 `.boxproject` 文件 + 可选 sections | 调官方 publish 流程，再把 sections 覆盖上去 |

`unpack` 产出 `baked`。

---

## 5. 内容 JSON

### 5.1 文件到 ProjectRDA 的映射

| 文件 | ProjectRDA 字段 | 合并策略 |
|---|---|---|
| `project/info.json` | `info` | 单对象，文本合并 |
| `project/environment.json` | `environment` | 单对象，文本合并 |
| `project/player.json` | `player` | 单对象，文本合并 |
| `project/physics.json` | `physics` | 单对象，文本合并 |
| `project/collision-filter.json` | `collisionFilter` | 单对象，文本合并 |
| `project/zones.json` | `zones` | 键值 / 数组，按 id |
| `project/gamepad.json` | `gamepad` | 单对象，文本合并 |
| `project/ambient-sound.json` | `ambientSound` | 单对象，文本合并 |
| `project/features.json` | `features` | 单对象，文本合并 |
| `project/permissions.json` | `permissions` | 单对象，文本合并 |
| `project/entities/<id>.json` | `entitiesTree` | 按 id 拆文件，零冲突 |
| `project/ui/<screenId>.json` | `uiTree` | 按 screen 拆文件，零冲突 |
| `project/ui.json` | `defaultScreenId` + 全局 UI | 单对象 |
| `chunks/*.bin` | `voxels.chunks` | 按坐标拆，见 §6 |
| `scripts/` | `assets` / `scriptAssets` | 文本 |
| `assets/` | `assets` | 二进制 |

### 5.2 规则

- **键值优先，数组慎用。** 实体、屏幕按 id 拆；数组只用于顺序有语义的地方（UI z-order、区域顺序）。这样两个 agent 改不同实体不会冲突。
- **schema 校验。** 用官方 MuRDA schema 验字段；未知字段拒绝，不静默丢弃。
- **跨引用校验。** 实体引用的 asset、UI 引用的 screen、区域引用的坐标，build 时统一检查。
- **初始状态。** JSON 描述地图加载时的初始状态；运行时变化写 data root，不回流工作区。
- **规范化。** 键排序、无时间戳、稳定数字格式；同一份内容每次序列化结果一致。

---

## 6. 体素 chunks

### 6.1 格式

- chunk 尺寸 32³（`CHUNK_SHIFT = 5`）。
- 工作区文件内容 = 官方 `boxCompress` 字节，和 archive 里的 blob **逐字节相同**。
- 空 chunk 也存文件（`boxCompress([])` 通常 2 字节）。
- 文件名 `chunks/<x>,<y>,<z>.bin`，坐标为 chunk 索引，非负。
- 解码链路：`boxDecompress` → `blitBoxesToChunk` → 32³ voxel 数组；编码链路：`meshChunkToBoxes` → `boxCompress`。空气是隐式的 0。

### 6.2 两种寻址

| 层 | 路径 | 目的 |
|---|---|---|
| workspace | `chunks/0,0,0.bin` | 可 merge、可读 |
| archive | `blobs/Qm...` | 去重、不可变、官方兼容 |

`feather build` 对每个 chunk 文件做 hash，按官方顺序组装 `voxels.chunks` 数组，再写 archive。**不需要重新编码**，因为文件内容就是 blob 内容。

git 的对象存储按内容去重：不同路径、不同地图里相同的 chunk 只存一份 blob。工作区可能看到重复文件，仓库不会因此变大。

### 6.3 合并

- 不同 chunk → 不同文件 → git 自动合并，零冲突。
- 同一个 chunk → 同一路径 → 调用 `feather merge-chunk`，见 §9。

### 6.4 block palette

- block id 由引擎内置的 `BlockInfo` 决定。
- palette 版本变化必须让 build 明确报错，不能按 id 硬合。
- 两边 palette 不一致时，merge 必须失败，不能按 id 硬合。

---

## 7. 归档

### 7.1 `.fmap` 布局（不变）

```text
feather.json
content/
  project-state.json
  blobs/
```

### 7.2 身份

「同一张 map」= 以下相同：

- `map.id`
- `content.hash`
- `storage.volume`
- `runtime`（port / memoryMb / playerLimit）

不参与：`source.*`（provenance）、tar 字节。

### 7.3 不提交 `.fmap`

`.fmap` 是 `blobs/` 的打包，提交就是重复存储；每次改一个 block 整个归档都变。它只在发布/tag 时生成。

### 7.4 unpack

`unpack` 把 archive 的 hash DAG **展开**成工作区：

- `blobs/Qm...` → 按 manifest 的坐标写成 `chunks/<x>,<y>,<z>.bin`；
- project 根 JSON 的各 section → `info.json` / `environment.json` / `entities/` / `ui/` …；
- 脚本和资源 → `scripts/`、`assets/`；
- 写 `feather.toml`（`kind = "baked"`）。

展开是**无损**的：chunk 字节不变，section JSON 语义不变。`build` 重新组装后：

- 源是 `.fmap`：`content.hash` 必须与源 `feather.json.content.hash` 一致；
- 源是 `.boxplay` / `.boxproject`：校验 chunk 字节与 section 语义（这两类源没有可直接比较的 `content.hash`）。

不一致就报错。

---

## 8. Git 模型

### 8.1 提交什么

提交：

- `feather.toml`
- 所有 JSON sections
- `chunks/`
- `assets/`
- `scripts/`

不提交：

- `dist/`、`*.fmap`
- `.feather-build-*/`
- 运行时 data root
- `server.local.toml`、密钥

### 8.2 不默认用 LFS

- chunk 粒度 + 内容去重让仓库增长可控；先量再决定。
- 迁移阈值：仓库 > 1 GB、或 `git clone` > 30 s、或单图唯一 chunk 字节数过大。
- 迁移到 LFS / store 时，lock 和 manifest 不变，对使用者透明。
- 共享默认资产（block info、音效、LUT）由引擎内置，不进每张图。

### 8.3 没有第二条历史

- 不引入 WAL / journal / op log。
- git 历史 + chunk 文件 + JSON 就是完整历史。
- 审计需求写到仓库外（`~/.feather/audit/` 或 CI 日志），不参与 build。

### 8.4 lock

工作区不生成 lock；所有内容都是具名文件，build 直接读取并校验：

- `lockVersion`
- `tool`：feather 版本、project format 版本、block palette hash
- `inputs`：`feather.toml`、各 JSON、`scripts`、`assets`、`chunks` 的树 hash
- `outputs`：`projectHash`、`contentHash`、`chunkCount`

规则：

- 排序输出、无时间戳、无绝对路径。
- 冲突时重新生成，不手 merge。
- CI 两次 build，比较 contentHash。

---

## 9. 合并

### 9.1 不同 chunk

git 自动合并。这是默认路径，绝大多数并行编辑走这里。

### 9.2 同一 chunk

用 git merge driver：

```bash
git config merge.feather-voxel.name "feather voxel 3-way merge"
git config merge.feather-voxel.driver "feather merge-chunk %O %A %B"
```

推荐用 `feather doctor --install-merge-driver` 安装；CI 检查 driver 是否安装。

### 9.3 `feather merge-chunk` 算法

```text
1. fast path：%O == %A 或 %O == %B → 直接取另一边，不解码
2. 解码三边为 32³ block 数组（缺失/空 chunk = 全 air）
3. 逐 voxel 3-way：
     ours == theirs   → 取该值
     ours == base     → 取 theirs
     theirs == base   → 取 ours
     否则             → 冲突，记录坐标
4. 无冲突：meshChunkToBoxes → boxCompress → 写 %A → exit 0
5. 有冲突：exit 1，打印冲突坐标/包围盒
```

### 9.4 冲突策略

- 默认**失败**。二进制地形里「两边改了同一个 voxel」通常是真冲突。
- 不提供静默 `last-write-wins`；不提供 `merge=ours`（丢数据）。
- palette 不一致 → 直接失败。
- 编码必须确定：`meshChunkToBoxes` 扫描顺序固定，`boxCompress` id 表稳定排序；加测试。

### 9.5 JSON 合并

- 实体/屏幕按 id 拆文件 → 不同实体不冲突。
- 单对象 JSON 用默认文本合并；数组只在顺序有语义时使用，冲突是真实的。
- **不要**用 `merge=union`（会产出非法 JSON）。

---

## 10. 确定性

没有确定性，build 每次都会变化，merge 也会不断冲突。build 前必须先满足：

1. **没有 `Math.random`。** 地形/噪声生成必须从 `feather.toml` 的 seed 或固定常量来。
2. **没有时间戳进内容。** `ProjectRDA` 的 `timestamp` / `prevHash` / `committerId` / `storageMode` 固定成确定值；`generate.js` 的 `updatedAt` 从内容 hash 中排除。
3. **规范化 JSON。** 键排序、稳定数字格式、稳定数组顺序。
4. **palette / tool 版本进 lock。** 工具升级导致的变化是有意的，不是噪声。

验收：

```bash
featherd build my-map
sha256sum dist/my-map.fmap > /tmp/a
featherd build my-map
sha256sum dist/my-map.fmap > /tmp/b
diff /tmp/a /tmp/b          # 必须为空
```

已知要修的洞：

- `engine/src/project/terrain/noise.ts`：`seed || Math.random()`。
- `engine/src/project/terrain/init-terrain.ts`：从不传 seed。
- `engine/src/project/terrain/moon-island.ts`：直接 `Math.random()`。
- `builder/src/generate.js`：mesh 的 `updatedAt: new Date()`。

---

## 11. 创作闭环

```bash
# 新建
feather init my-map --template arena

# 或从官方源码展开
feather unpack bedwars.boxproject --dir my-map

# 编辑（全部走 CLI，不需要 GUI）
feather terrain heightmap --from height.png
feather terrain fill --box 0,0,0,128,32,128 --block stone
feather terrain stamp --file structures/castle.vox --at 40,32,40
feather terrain carve --sphere 64,40,64,12
feather weather set --preset rain --time 18:00
feather entity add npc --id shopkeeper --at 10,64,10
feather ui add-screen --id shop --from ui/shop.json

# 反馈
feather preview --out preview.png
feather diff --out diff.png

# 构建 / 校验 / 打包
featherd build my-map
feather pack

# 运行
feather load dist/my-map.fmap
feather up my-map
```

规则：

- 所有编辑命令只改工作区文件，不维护隐藏状态。
- `feather preview` 是 AI 闭环的必需项；没有预览等于盲写。
- `feather diff` 是内容级：变化的 chunk 坐标、实体增删、UI 节点、天气字段，外加渲染图。
- `feather build` 只做校验 + 组装 + lock；`feather pack` 只做打包。

---

## 12. 编辑器契约

GUI 编辑器（如果做）必须遵守：

1. **同一份文件。** 编辑器读写工作区的 JSON / chunks，不引入私有格式、不引入私有数据库。
2. **同一套操作。** 编辑器的每个动作对应一个 CLI 命令或共享库函数；CLI 能做的，编辑器不偷偷多做。
3. **无隐藏状态。** 撤销/重做是编辑器本地的；任何影响地图的内容变化都必须落到文件。
4. **无服务器端场景库。** 多用户协作基于 git + merge driver；需要锁就用 region lease / 文件锁，不做中心化场景数据库。
5. **预览是只读的。** 预览可以缓存，但不能成为 source of truth。
6. **失败可见。** schema 错误、跨引用错误、palette 不匹配、merge 冲突，都要在编辑器里明确显示，不静默修复。
7. **AI 与人类同权。** 编辑器不提供只有 GUI 能做的操作；否则 AI 永远做不完整。

---

## 13. 服务器配置

地图的 `feather.toml` 小，是因为服务器配置应该在 `server.toml`，而不是地图清单。对应 MC 的 `server.properties`：

```toml
[daemon]
data_root = "~/.feather"
socket = "~/.feather/daemon.sock"

[network]
host = "127.0.0.1"
port = 9978

[engine]
max_players = 32
view_distance = 8
tick_rate = 15.625
script_memory_mb = 512

[storage]
backend = "sqlite"

[security]
enable_eval = false
token = ""                 # 优先用环境变量

[logging]
level = "info"
```

- 它是 **per-server / per-environment** 的，不跟着单张地图走。
- 优先级：CLI flag > 环境变量 > `server.local.toml` > `server.toml` > 默认值。
- 密钥不进任何仓库文件。
- 别学 `server.properties` 的扁平混杂；用 section + schema 校验。

---

## 14. 非目标

- 不做地形的文本 DSL。不同的 op 可以产出同一个 blob，op log 不能当 source。
- 不做 WAL / journal / 操作日志进仓库。
- 不做 op 级 diff；只做内容级 diff。
- 不要求 GUI 才能完成任何创作步骤。
- 不默认使用 LFS / 外部 blob store。
- 不改 content 布局（`project-state.json` + `blobs/` 是官方设计）。
- 不改 `.fmap` / `feather.map` 的 wire 名。
- 不引入 image / container 二分。

---

## 15. 落地顺序

### A. 确定性（阻塞项）

- 修 §10 的四个随机/时间戳洞。
- 加 build-twice 测试。
- 验收：两次 build 的 contentHash / 归档内容一致。

### B. 工作区展开 / 组装

- `unpack`：archive → `chunks/` + JSON sections + `scripts/` + `assets/` + toml + lock。
- `build`：反向组装，校验 `content.hash`。
- 验收：`unpack x.boxproject && cd x && featherd build x` 通过。

### C. 合并

- `feather merge-chunk` driver。
- `feather doctor --install-merge-driver`。
- 验收：两个分支改不同 chunk 自动合并；同 chunk 非重叠 voxel 由 driver 合并；同 voxel 不同值冲突并列出坐标。

### D. 反馈

- `feather preview`（无头渲染）。
- `feather diff <rev>`（内容级 + 渲染）。
- 验收：AI 能只靠 CLI 完成「改 → 看 → 再改」。

### E. CI / build-twice

- `featherd build` 两次输出 contentHash 相同。
- CI：clone → build → check，不依赖外部 store。

### F. 服务器配置

- `server.toml` + 优先级 + `feather config where`。
- 迁移现有 `--data-root` / `--socket` / `--enable-eval` 到配置表面。

---

## 16. 待确认

1. chunk 文件名用 `0,0,0.bin` 还是 `0_0_0.bin`（逗号在 shell/工具里是否需要转义）。
2. `feather preview` 用无头浏览器还是自写体素 raycaster。
3. `server.toml` 放部署仓库还是引擎仓库。
4. LFS 迁移阈值（1 GB / 30 s 是否合适）。
5. 实体是否永远按 id 拆文件，还是小图允许单个 `entities.json`。
6. lock 的 `inputs` 用树 hash 还是逐文件 hash（当前建议树 hash）。
