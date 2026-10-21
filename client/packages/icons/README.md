# 图标组件

`@box/icons` 将 `output/` 中的 React 图标编译为工作区使用的组件。普通开发直接使用已提交图标，无需 Figma 账号。

```sh
# 仓库根目录执行
npm run build -- --to @box/icons
```

需要从 Figma 重新导出时，在本目录复制 `.env.example` 为 `.env`，填写自己的 `FIGMA_TOKEN`，核对 `.figmaexportrc.js`，并将导出脚本的格式配置更新为当前 `.prettierrc.cjs` 后，再运行 `npm run figma:build`。重新导出需要 Figma 权限和网络。

图标放在专用 Page 中，以 component 导出；名称使用唯一的 `icon/<kebab-case>`。更新后提交 `output/`，不提交 Token 或 `.env`。Token 管理见 [Figma 文档](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)。
