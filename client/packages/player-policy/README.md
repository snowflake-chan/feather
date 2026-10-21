# @box/player-policy

前后端共用的玩家管理 capability、角色规则和审计名称。根入口不依赖 React、Node、数据库或应用目录；导航与权限菜单通过 `/navigation`、`/permission-menu` 单独导出。

```ts
import { effectivePlayerAdminCapabilities } from '@box/player-policy';
const capabilities = effectivePlayerAdminCapabilities('moderator', ['players.view']);
```

服主身份仍由服务端会话验证；`owner` 要求不能通过角色字符串授予。客户端菜单判断不替代服务端授权。HTTP 记录继续来自 `@box/apis`，本包不定义另一套 DTO。

仓库中运行 `npm run build -- --to @box/player-policy`，在本目录运行 `npm test`。构建产物提供 ESM、CommonJS 和声明，构建后可 `npm pack` 给其他项目安装。
