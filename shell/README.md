# feather-shell

> **Monorepo note**：`@box/*` 依赖统一在仓库根 `vendor/`，`shell/vendor` 已移除；
> `pnpm install` 在仓库根执行，`pnpm --filter feather-shell build` 构建 shell。
> 脚本协议/绑定/共享 schema 在 `@feather/protocol`；`shell/src/shell/script` 只保留
> `script-shell.ts`、`safe-eval.ts`、`script-start.ts`、`pairing-heap.ts`。

神岛（box3）script shell 的抽取工作区。

**定位：代码暂存区 + 可编译验证环境。** 存放从上游挑出来的 shell 代码，已配置好依赖与类型检查，但不产出构建物。目的是为后续「Bun/Node + Worker」改造提供一份自洽、可编译的基座。

---

## 快速开始

```bash
pnpm install
pnpm typecheck     # 0 errors
```

---

## 来源

| | |
|---|---|
| 上游 | `box3-local-engine`（MIT） |
| 版本 | v2026.1.4 |
| commit | `074fe309` |
| 本地路径 | `../box3-local-engine` |

---

## 目录结构

```
feather-shell/
├── src/
│   ├── shell/          78 个文件，15,980 行 —— shell 本体
│   │   ├── script/     31 个 —— 核心（含 bindings/ 21 个）
│   │   │   └── engine/  4 个 —— 引擎边界（见「关键决策 4」）
│   │   ├── anticheat/   8 个 ┐
│   │   ├── href/        5 个 │
│   │   ├── rtc/         4 个 │
│   │   ├── moderation/  3 个 │
│   │   ├── storage/     3 个 ├─ 卫星层 *-script.ts + 协议 + 传递依赖
│   │   ├── gui/         2 个 │
│   │   ├── http/        2 个 │
│   │   ├── navigator/   2 个 │
│   │   ├── remote-channel/ 2 个 │
│   │   ├── teleport/    2 个 │
│   │   ├── utils/       2 个 │
│   │   ├── voxel/       4 个 ┘（含 box-encode、voxel-server-schema）
│   │   └── dialog/ interact/ particle/ player/ sound/ zone/  各 1 个
│   └── schema/        108 个文件，30,638 行 —— @box/schema 裁剪后
├── vendor/            4 个 @box 包（从上游拷入，见「关键决策 5」）
├── reference/
│   └── script-host.ts  协议另一端，**不参与编译**，仅作参考
├── docs/
│   └── SHELL-EXTRACTION.md   完整抽取清单与验证记录
├── tools/
│   └── schema-closure.py     schema 闭包计算脚本（可复现裁剪）
├── package.json        依赖声明（pnpm workspace）
├── pnpm-workspace.yaml workspace 指向 vendor/*
└── tsconfig.json       类型检查配置（noEmit）
```

---

## 关键决策

### 1. `script-host.ts` 不要

`script-shell.ts` 不 import 它，shell 目录里没有任何文件引用 `ScriptHost`。两者是 `ScriptProtocol` 的两端：

```
script-host.ts  ← 引擎侧（MuServer）  ✗ 丢弃（存 reference/ 备查）
script-shell.ts ← 脚本侧（MuClient）  ✓ 要
```

### 2. `@box/schema` 裁剪：158 → 108

shell 直接 import 64 个 schema 模块，**传递闭包是 108 个**。裁掉 50 个（32%）。

复现：`python3 tools/schema-closure.py`

### 3. 卫星层容易被漏掉

`script-shell.ts` 直接 import 了 10 个 `*-script.ts`，它们**不在 `script/` 目录**，散落在各功能目录。漏了这层 shell 编译不过。

### 4. 引擎边界收进 `script/engine/`

上游 shell 有 65 处 `../` 逃逸 import 指向引擎。这些已收进 `src/shell/script/engine/`，**4 个文件**：

| 文件 | 性质 | 说明 |
|---|---|---|
| `game-server-schema.ts` | 类型声明 | `GameServerState` 是 `MuStruct`，但 shell 只用作参数类型标注，无运行时取值 |
| `voxel-server.ts` | 接口声明 | 只声明 `setVoxel()` 一个方法 |
| `entity-state.ts` | **真实移植** | `destroyEntityId`/`clearDestroyedEntity`，函数体与上游逐字一致 |
| `chunk-boxes.ts` | **真实移植** | `getServerChunkBoxes`，函数体与上游逐字一致 |

前两个是**类型边界**（上游是 226 行 schema / 1,205 行 VoxelServer，shell 只用到类型），后两个是**真运行时调用**，必须要有实现。

移植的三个函数已用脚本验证与上游**逐字一致**。

### 5. `@box/*` 依赖走 `vendor/` 而非 `../box3-local-engine`

4 个 `@box` 包已拷进 `vendor/`，用 pnpm workspace 链接：

| 包 | 来源 | 说明 |
|---|---|---|
| `@box/mudb` | `packages/mudb` | 已带编译产物（`index.js` + `index.d.ts`） |
| `@box/utils` | `packages/utils` | 已带 `build/` |
| `@box/content-server` | `packages/content-server` | 已带 `build/` |
| `@box/script-api` | `packages/script-api` | **上游未构建**，已把 `main`/`types` 指向 `src/index.ts`（我们只用其类型） |

**注意 `@box/schema` 不在 `vendor/`** —— 它是 TS 源码包且我们已裁剪，直接用 `src/schema/` + `paths` 映射。

拷贝而非 `link:` 的代价是与上游脱节；好处是工作区自包含，不依赖 sibling 仓库存在。

`@box/utils` 的 `package.json` 声明了 `ioredis`/`redis`/`redis-mock` 等重依赖，但**shell 实际用到的 10 个模块都不引用它们**（已逐个 grep 验证），所以这些依赖虽被安装但不参与编译。

---

## 编译验证

```bash
pnpm typecheck     # tsc -p tsconfig.json
```

### 当前状态：**0 errors**

`tsconfig.json` 复刻上游 `services/game-server/tsconfig.json` 的编译选项（关键项见下），`@box/schema/*` 用 `paths` 指向 `src/schema/*`，其余 `@box/*` 走 `vendor/` 的 workspace 链接。

### 一个容易踩的坑：`strictNullChecks` 必须为 `true`

上游 `ClientMessageData` 是递归类型且**包含 `null`**：

```ts
export type ClientMessageData = null | boolean | number | string
  | readonly ClientMessageData[] | { readonly [key: string]: ClientMessageData };
```

若 `strictNullChecks: false`，TS 会把 `null` 从联合类型里折叠掉，导致 `tracker-snapshot.ts` 的 `Object.fromEntries(...)` 返回值无法赋给 `ClientMessageData`，报 `Type 'unknown' is not assignable to type 'ClientMessageData'`。

**这个错误看起来像代码问题，其实是配置问题。** 上游本来就开着 `strictNullChecks`，所以复刻时必须保留。

---

## 与上游的差异

`src/shell/` 中**只有 4 个文件**偏离上游，且**全部只是 import 路径**（指向 `script/engine/`）：

```
script/bindings/entity-update.ts    2 处
script/bindings/voxel-update.ts     2 处
script/bindings/world-update.ts     1 处
script/bindings/zone-updates.ts     1 处
```

其余 74 个文件与上游逐字节相同。新增 `script/engine/`（4 个文件）与 `voxel/` 下的 2 个文件。

---

## 下一步

1. **Worker 传输层改造** —— 把 mudb 的 `MuWorkerSocketServer` 从浏览器 API（`self.onmessage`）移植到 `worker_threads`（`parentPort`）
2. 决定运行时（Bun vs Node）—— 需先实测 `worker_threads` 与 `resourceLimits` 在 Bun 下的真实行为

详见 [docs/SHELL-EXTRACTION.md](docs/SHELL-EXTRACTION.md)。
