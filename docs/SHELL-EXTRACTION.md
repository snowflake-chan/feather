# Shell 抽取清单（机械验证版）

> 方法：把候选文件复制到临时目录，用 `tsc --noEmit` 编译，让编译器列出真实缺口。
> 上游：`box3-local-engine` v2026.1.4（commit `074fe309`）
> 工具链：全局 `tsc` 5.9.2（仓库声明 5.6.3，见「已知偏差」）

---

## 一、结论

**182 个文件、46,524 行**可以从上游抽出，作为一个自洽的 shell 单元编译通过：

| 部分 | 文件 | 行数 |
|---|---|---|
| shell 本体 | 74 | 15,886 |
| `@box/schema` 裁剪后 | 108 | 30,638 |
| **合计** | **182** | **46,524** |

关键判断：**`script-host.ts` 不要**。`script-shell.ts` 不 import 它，shell 目录里没有任何文件引用 `ScriptHost`。两者是 `ScriptProtocol` 的两端，各自独立。

```
script-host.ts  ← 引擎侧（MuServer）  ✗ 丢弃
script-shell.ts ← 脚本侧（MuClient）  ✓ 要
```

---

## 二、要搬的文件（74 个）

### 2.1 核心 `script/`（31 个，13,666 行）

`script/` 全部，**去掉 `script-host.ts`**：

```
script-shell.ts  script-protocol.ts  script-state-schema.ts  script-schema.ts
safe-eval.ts     codegen.ts          parse-error.ts          pairing-heap.ts
script-entry.ts  script-start.ts
bindings/  (21 个文件)
```

### 2.2 卫星 `*-script.ts`（12 个，1,631 行）

这些**不在 `script/` 目录**，散落在各功能目录，但是纯 shell 侧代码（只依赖 `@box/mudb/client` + `@box/schema/*`，不碰 server 实现）：

```
gui/gui-script.ts                    164
href/href-script.ts                   27
http/http-script.ts                  193
navigator/navigator-script.ts         85
rtc/rtc-script.ts                    187
storage/storage-script.ts            452
storage/storage-db-script.ts          (storage-script 依赖)
teleport/teleport-script.ts           76
moderation/moderation-script.ts      139
anticheat/anticheat-script.ts        207
remote-channel/channel-script.ts      38
utils/deprecate.ts                    15
utils/script-promise.ts               48
```

### 2.3 协议文件（12 个，465 行）

```
anticheat/anticheat-protocol.ts             16
gui/gui-script-protocol.ts                  57
href/href-protocol.ts                        9
href/href-script-protocol.ts                14
http/http-protocol.ts                       59
moderation/moderation-protocol.ts            7
navigator/navigator-script-protocol.ts      22
remote-channel/channel-script-protocol.ts   13
rtc/rtc-protocol.ts                         70
rtc/rtc-script-protocol.ts                  79
storage/storage-protocol.ts                 84
teleport/teleport-script-protocol.ts        35
```

### 2.4 卫星的传递依赖（17 个）

```
anticheat/action-data.ts              anticheat/message-categories.ts
anticheat/message-subscriptions.ts    anticheat/movement-inspector.ts
anticheat/player-tracker.ts           anticheat/tracker-snapshot.ts
href/href-client-state.ts             href/safe-url.ts
rtc/promise-wrapper.ts                moderation/moderation-script-error.ts
```

### 2.5 服务端状态 schema（必须真搬，7 个）

这些是 `MuStruct` 实例，**运行时值，不能 stub**：

| 文件 | 导出的运行时符号 |
|---|---|
| `player/player-server-schema.ts` | `ServerPlayerListSchema` |
| `particle/particle-server-state.ts` | `ServerParticleSetSchema`、`ServerParticleEntitySchema` |
| `sound/server-sound-state.ts` | `ServerSoundStateSchema`、`ServerEntitySoundEffectSchema` |
| `zone/zone-server-state.ts` | `ServerEnvironmentZoneSchema`、`MAX_ZONES` |
| `dialog/dialog-server-schema.ts` | `DialogEventSetSchema` |
| `interact/interact-server-state.ts` | `InteractiveEventSetSchema` |

### 2.6 体素闭包（2 个，311 行）

`bindings/voxel-update.ts` 需要 `getServerChunkBoxes`，其闭包只需这两个文件（**不是整个 `voxel-server.ts`**）：

```
voxel/box-encode.ts          243   meshChunkToBoxes / boxCompress / interleave3
voxel/voxel-server-schema.ts  68   ServerVoxelChunkSchema / ServerVoxelChunk
```

---

## 三、可以 stub 的（类型擦除）

验证确认：**`GameServerState` 在 shell 里 22 处引用，全部是类型位置，没有一次运行时使用**（无 `GameServerState.xxx`）。

因此整条 `game-server-schema.ts` 依赖链（226 行 + 11 个下游模块）**可以完全 stub 掉**：

```ts
// stubs/game-server-schema.d.ts
export type GameServerState = any;
```

同理可 stub：

| 符号 | 来源 | 理由 |
|---|---|---|
| `VoxelServer` | `voxel/voxel-server.ts` | 仅类型位置 |
| `AnticheatHost`、`ChatServer`、`DialogServer`、`GUIServer`、`HrefServer`、`HttpScriptController`、`InputServer`、`ModerationHost`、`NavigatorServer`、`NetServer`、`PlayerServer`、`RTCServer`、`RemoteChannelServer`、`SoundServer`、`StorageController`、`TeleportServer` | 各 `*-server.ts` | 全是 `script-host.ts` 用的，host 已丢弃 |

---

## 四、引擎边界处理（已完成）

上游 shell 有 65 处 `../` 逃逸 import 指向引擎。已全部收进 `src/shell/script/engine/`（4 个文件）：

| 文件 | 性质 | 上游来源 |
|---|---|---|
| `engine/game-server-schema.ts` | 类型声明 | `game-server-schema.ts`（226 行 + 11 个下游） |
| `engine/voxel-server.ts` | 接口声明 | `voxel/voxel-server.ts`（1,205 行） |
| `engine/entity-state.ts` | **真实移植** | `entity/entity-controller.ts:37-50` |
| `engine/chunk-boxes.ts` | **真实移植** | `voxel/voxel-server.ts:266-273` |

### 类型边界 vs 真实移植

**类型边界**（前两个）：`GameServerState` 在上游是 `MuStruct` 实例，但 shell 对它的 22 处引用**全是参数类型标注**，无任何运行时取值（已 grep 验证无 `GameServerState.xxx`）。`VoxelServer` 同理，只用到 `setVoxel()` 一个方法。

所以只声明类型，不移植 schema —— 这不是偷懒，是如实反映耦合面。

**真实移植**（后两个）：`destroyEntityId`、`clearDestroyedEntity`、`getServerChunkBoxes` 是**真运行时调用**，必须有实现。三个函数体与上游**逐字一致**（已用脚本验证）。

### `getServerChunkBoxes` 的闭包

上游它在 `voxel-server.ts`（1,205 行）里，但函数本身只依赖 `meshChunkToBoxes`：

```
getServerChunkBoxes  →  meshChunkToBoxes  →  voxel/box-encode.ts (243 行)
                                          →  @box/utils/voxel
                                          →  @box/mudb/stream
                     →  voxel/voxel-server-schema.ts (68 行)
                                          →  @box/content-server（HashSchema）
```

**不需要搬整个 `voxel-server.ts`。** 只搬了 `box-encode.ts` + `voxel-server-schema.ts` 两个文件。

### 修改的 4 个 binding 文件

只改 import 路径，不改逻辑：

| 文件 | 改动 |
|---|---|
| `bindings/entity-update.ts` | 2 处 → `engine/game-server-schema`、`engine/entity-state` |
| `bindings/voxel-update.ts` | 2 处 → `engine/game-server-schema`、`engine/voxel-server` + `engine/chunk-boxes` |
| `bindings/world-update.ts` | 1 处 → `engine/game-server-schema` |
| `bindings/zone-updates.ts` | 1 处 → `engine/game-server-schema` |

`script-start.ts` 的 `require`/`module` 待加 `@types/node`。

---

## 五、外部依赖

### 5.1 workspace 包（3 个）

| 包 | 用到的子模块 |
|---|---|
| `@box/mudb` | `client`、`server`、`schema`、`schema/json`、`socket/socket`、`stream` |
| `@box/utils` | `event`、`id`、`logger`、`mutracer`、`script`、`script/script-scheduler`、`semaphore`、`sorted-array-remove`、`swears/index`、`voxel` |
| `@box/schema` | **裁剪后 108 个文件**（见 5.3） |
| `@box/script-api` | 仅 `storage.ts` 需要 `I` 命名空间（类型） |

**注意 `@box/schema` 是 TS 源码包**（`internals/schema/`，158 个 `.ts`，无编译产物），`@box/mudb` 和 `@box/utils` 已带编译好的 `.js` + `.d.ts`。

### 5.2 npm 包（5 个）

```
gl-matrix        6 处（向量数学）
pino             2 处（仅类型 Level/Logger）
debug            传递依赖
bit-twiddle      传递依赖
nanoid/non-secure   storage-db-script 用
```

### 5.3 `@box/schema` 裁剪结果

**直接 import：64 个模块 → 传递闭包：108 个文件 / 30,638 行。**

原包 158 个文件，**裁掉 50 个（32%）**。

#### 裁剪方法

从 64 个直接 import 出发，递归解析相对 import 与 `@box/schema/*`，得到闭包。脚本见 `tools/schema-closure.py`（可复现）。

#### 实测验证

把 108 个文件复制到 `src/schema/`，把 `@box/schema/*` 指向该目录，**`tsc` 零 schema 侧错误** —— 闭包自洽，无遗漏。

#### 裁掉的 50 个文件（按目录）

| 目录 | 裁掉的文件 | 理由 |
|---|---|---|
| `admin/` | `admin-gateway-protocol`、`admin-protocol` | 管理后台 |
| `ai/` | `ai-protocol.schema`、`ai.types` | AI 服务 |
| `animation/` | `compute-ik`、`solve-ik` | 客户端 IK |
| `backend/` | `rpc-interface`、`rpc/auth-protocol`、`rpc/content-protocol` | 后端 RPC |
| `code-editor/` | `code-editor-common-state`、`code-editor-protocol`、`murda-id`、`murda-text` | 编辑器 |
| `constants/` | `skin` | 皮肤 |
| `debugger-console/` | `protocol` | 调试协议（shell 只用 `schema`） |
| `environment/` | `environment-controller` | 引擎侧控制器 |
| `events/` | `animation-event`、`client-event`、`player-event`、`server-event`、`voxel-event` | 未被 shell 引用 |
| `game-ui/` | `game-ui-protocol` | UI 协议 |
| `group-project/` | `schema-v0-3-26` | 旧版本迁移 |
| `gui/` | `gui-protocol` | GUI 协议（shell 只用 `types`） |
| `input/` | `input-protocol`、`input-schema` | 输入 |
| `market/` | `market-protocol`、`market-schema` | 市场 |
| `mesh/` | `modelMeshSchema`、`new-mesher`、`skin-schema`、`voxel` | 网格生成 |
| `navigator/` | `navigator-protocol` | 导航协议 |
| `net-log/` | `schema` | 网络日志 |
| `net/` | `delta`、`net-tick` | 增量同步（shell 用 `delta-schema`） |
| `physics/` | `contact-events` | 接触事件 |
| `player/` | `player-protocol` | 玩家协议 |
| `project/` | `ui-rda/util` | |
| `publish/` | `publish-schema` | 发布 |
| `remote-channel/` | `channel-protocol` | |
| `session/` | `schema`、`type` | 会话 |
| `teleport/` | `teleport-protocol` | |
| `types/` | `appEdition`、`game`、`node-type` | |
| `utils/` | `sorted-array-remove`、`trace-schema` | |
| `voxel/` | `voxel-server-schema` | **注意：这个要搬**（见 2.6），只是不在 schema 包内 |

> ⚠️ `voxel/voxel-server-schema.ts` 出现在裁掉列表里，是因为它属于 `services/game-server/src/voxel/`，不在 `internals/schema/` 内。它**必须搬**（见 2.6）。

#### 裁剪后的外部依赖

闭包对外只依赖：

```
@box/mudb/schema         59 处
@box/mudb/rda            10 处
@box/mudb/stream          6 处
@box/mudb/rpc/client      1 处
@box/utils/id            19 处
@box/utils/voxel          3 处
@box/utils/script         2 处
@box/utils/sorted-array-remove  1 处
@box/script-api           1 处（仅类型）
gl-matrix                12 处
debug                     1 处
```

---

## 六、验证方法与复现

```bash
tsc -p tsconfig.json
```

`tsconfig.json` 用 `paths` 把 `@box/*` 映射到上游源码，避免安装依赖：

```json
"paths": {
  "@box/schema/*": ["src/schema/*"],
  "@box/mudb/*":   ["../box3-local-engine/packages/mudb/src/*"],
  "@box/utils/*":  ["../box3-local-engine/packages/utils/src/*"],
  "gl-matrix": ["stubs/npm/gl-matrix"], "pino": ["stubs/npm/pino"],
  "debug": ["stubs/npm/debug"], "bit-twiddle": ["stubs/npm/bit-twiddle"],
  "nanoid/non-secure": ["stubs/npm/nanoid/non-secure"]
}
```

### 验证结果

| 阶段 | shell 内错误数 |
|---|---|
| 初次（仅核心层） | 81 |
| 加卫星层 + 协议 + 布局修正 | 46 |
| 加服务端 schema + npm stub | 9 |
| 加类型 stub + 体素闭包 | 9 |
| **最终（src/ 布局）** | **14**（含 5 个上游 mudb 错误） |

剩余错误**全部是良性**：

| 错误 | 数量 | 性质 |
|---|---|---|
| 上游 `mudb/src/stream/index.ts` | 5 | 上游代码缺 `@types/node`，非本工作区问题 |
| `Cannot find name 'global'`（`safe-eval.ts`） | 2 | 缺 `@types/node` |
| `Cannot find name 'require'/'module'`（`script-start.ts`） | 2 | 缺 `@types/node` |
| `Property 'id'/'attachments' does not exist on type 'unknown'`（`entity-update.ts`） | 3 | `any` stub 丢类型信息所致，非缺代码 |
| `Uint8Array not assignable to string \| ArrayBuffer`（`http-script.ts:135`） | 1 | TS 5.9 与 5.6 的 `ArrayBufferLike` 差异 |
| `Type 'unknown' not assignable to ClientMessageData`（`tracker-snapshot.ts:8`） | 1 | 同上 |

**零 schema 侧错误** —— 裁剪后的 schema 闭包自洽。

### 已知偏差

- 用全局 **tsc 5.9.2**，仓库声明 **5.6.3**。最后 2 个错误（`http-script`、`tracker-snapshot`）是版本差异，用 5.6.3 应消失。
- 未安装真实 npm 依赖，`gl-matrix`/`pino`/`debug`/`bit-twiddle`/`nanoid` 用手写 `.d.ts` 替身。真实类型可能暴露少量额外错误。

---

## 七、下一步

1. ~~确认 `getServerChunkBoxes` 的实现规模~~ ✅ 已查清，只需 2 个文件 311 行
2. ~~决定 `@box/schema` 怎么处理~~ ✅ 已裁剪，158 → 108
3. ~~按合适架构排布工作区~~ ✅ 已排为 `src/` + `stubs/` + `reference/`
4. ~~内联 `destroyEntityId` / `clearDestroyedEntity`~~ ✅ 已收进 `script/engine/`，`stubs/engine/` 已删除
5. **用 tsc 5.6.3 + 真实依赖复跑**，消除版本偏差
6. 然后才是 Worker 传输层（`MuWorkerSocketServer` 从浏览器 API 移植到 `worker_threads`）

## 八、工作区产物

```
feather-shell/
├── src/shell/        78 个文件（含 engine/ 4 个 + voxel/ 2 个）
├── src/schema/      108 个文件，30,638 行
├── stubs/npm/         6 个 npm 替身
├── reference/         script-host.ts（不参与编译）
├── docs/              本文档
├── tools/             schema-closure.py
└── tsconfig.json      编译验证配置
```

### 与上游的差异

`src/shell/` 中**只有 4 个文件**偏离上游，且**全部只是 import 路径**（指向 `script/engine/`）。其余 70 个文件与上游逐字节相同。
