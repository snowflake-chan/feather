# Vendor 说明

engine 的 `@box/*` 依赖以源码形式放在 `vendor/`，由 `pnpm-workspace.yaml` 链接。
这样 `feather-engine` 不依赖 sibling 仓库，可独立 `pnpm install` / `pnpm build`。

## 包清单（13 个）

| vendor 目录 | 包名 | 来源 | 产物 |
|---|---|---|---|
| `schema` | `@box/schema` | `internals/schema` | 现场 `tsc` → `build/` |
| `apis` | `@box/apis` | `internals/apis` | 现场 tsc + rollup → `dist/` |
| `env` | `@box/env` | `internals/env` | 现场 tsc + rollup → `dist/` |
| `script-api` | `@box/script-api` | `packages/script-api` | 现场 tsc + rollup → `dist/` `dts/` |
| `build-system` | `@box/build-system` | `internals/build-system` | 自带 `build/` |
| `content-server` | `@box/content-server` | `packages/content-server` | 自带 `build/` |
| `utils` | `@box/utils` | `packages/utils` | 自带 `build/` |
| `mesher` | `@box/mesher` | `packages/mesher` | 自带 `build/` |
| `vb-parser` | `@box/vb-parser` | `packages/vb-parser` | 自带 `build/` |
| `voxa-project` | `@box/voxa-project` | `packages/voxa-project` | 自带 `build/` |
| `vb` | `@box/vb` | `internals/vb` | 自带 |
| `mudb` | `@box/mudb` | `packages/mudb` | 根目录 JS + d.ts |
| `ao-mesher` | `@box/ao-mesher` | `packages/ao-mesher` | 根目录 JS |

## 构建顺序

依赖关系要求：

```
script-api  →  schema
env
apis（跳过 generate）
```

命令：

```bash
cd vendor/script-api && pnpm run build
cd vendor/schema     && pnpm run build
cd vendor/env        && pnpm run build
cd vendor/apis       && rm -rf dist && pnpm exec tsc --emitDeclarationOnly && pnpm exec rollup --config rollup.config.mjs
```

其余包自带产物，不需要重建。

## 相对上游的本地修改

| 文件 | 修改 | 原因 |
|---|---|---|
| `tsconfig.base.json` | 从上游根目录拷入 | schema/apis/env 的 tsconfig `extends ../../tsconfig.base.json` |
| `vendor/script-api/tsconfig.json` | `skipLibCheck: true` | `@types/node` 的 `undici-types` 在 pnpm 严格布局下解析失败 |
| `vendor/script-api/scripts/sync-moderation-types.js` | `../../internals/schema/` → `../../schema/` | vendor 目录层级与上游不同 |
| `vendor/apis` | 构建时跳过 `npm run generate` | `generate` 会扫描上游 monorepo 的 `apps/game`、`apps/voxa`、`services/game-server` 等路由源码来重建 `openapi.json`；vendor 里没有这些目录。`src/generated/*` 已提交，直接用它构建 |
| `package.json` | 删除 `isolated-vm` | ivmp/ivm2 已移除，不再需要 |
| `package.json` | `build` 拆成 `tsc` + `build:assets` | 资源生成依赖内容服务配置，和编译解耦 |
| `tsconfig.json` | `exclude: node_modules/dist/vendor` | 不把 vendor 源码当程序根文件 |

## 重新同步上游

1. 用同样的 13 个路径重新 `rsync`（排除 `node_modules`）
2. 重放上表的本地修改
3. 按构建顺序重建 4 个包
4. `pnpm install && pnpm build`
