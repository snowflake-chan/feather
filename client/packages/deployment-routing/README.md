# @box/deployment-routing

独立的运行时路径前缀适配模块，无 npm 运行依赖。浏览器、Node 和构建插件分开导出，导入根入口不会安装全局补丁。

| 入口                     | 职责                                        |
| ------------------------ | ------------------------------------------- |
| 根入口                   | 纯地址、资源属性与 srcset 变换              |
| `/browser`               | 生成浏览器 bootstrap 脚本                   |
| `/server`                | HTML/CSS、图片优化请求及显式 Node HTTP 安装 |
| `/next-webpack`          | Next React/JSX 与 Worker 资源路径适配       |
| `/standalone`            | 为 Next standalone 产物注入运行时入口       |
| `/react`、`/jsx-runtime` | 仅供已配置原始 React 别名的构建器使用       |

```js
const { publicPath } = require('@box/deployment-routing');
publicPath('/image.png', '/play', []);
```

Node 适配需显式调用 `/server` 的 `install()`，重复安装保持幂等。React 桥接不是一般 React 的替代品，必须由 Next 插件或 esbuild 配置提供原始模块别名。包不负责证书、Nginx、服务登录或授权，不改写其他服务与外部源地址。

standalone 注入器按本包的安装位置解析运行时模块，不依赖仓库目录层级。注入后须保持该安装位置不变；镜像应在最终运行路径完成注入。

本目录可直接 `npm test` 和 `npm pack`，导出原始 CommonJS 与声明，无需编译。登录门户独立模板携带本包的源码 vendor 副本，并将依赖转换为本地 file 引用，不要求已公开 npm 版本。源码迁移不更新已部署镜像，发行必须重新构建并验收最终产物。
