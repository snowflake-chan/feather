# 地图脚本 API

`@box/script-api` 维护客户端和服务端脚本声明，生成编辑器使用的 DTS 与接口参考。

| 内容               | 来源                                            |
| ------------------ | ----------------------------------------------- |
| 客户端 API         | `src/client/`                                   |
| 服务端 API         | `src/server/`                                   |
| `world.moderation` | 从 `internals/schema/api/js/moderation.ts` 同步 |
| 类型与参考文档     | `dts/`、`dist/`、`docs/` 等生成产物             |

在仓库根目录执行：

```sh
npm run build -- --to @box/script-api
npm --prefix apps/game run build:script-types
```

第二条同步脚本 SDK 和地图编辑器类型资源。修改源声明并提交所需生成物，不手改 DTS；接口行为以运行时实现为准。使用示例见[脚本入门](../../internals/schema/api/js/README.md)。
