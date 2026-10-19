# Workspace

一个 workspace 是一个部署单元：`feather.toml` + maps + `.feather/` 运行时状态。

## 从游戏包创建

```bash
pnpm --filter @feather/cli build
node cli/bin/feather load /path/to/map.boxplay --dir ./my-server
```

生成：

```
my-server/
  feather.toml
  feather.lock
  .gitignore
  maps/
    <mapGroupId>/
      bundle.json
      worlds/<memberId>/
        manifest.json
        data/project-state.json
        data/blobs/
  .feather/        # 运行时生成：data/logs/sqlite
```

`feather.toml`：

```toml
[workspace]
name = "起床战争"
data_dir = ".feather/data"

[storage]
driver = "sqlite"
mode = "shared"
group_namespace = "cloud-4e84..."

[[maps]]
id = "cloud-4e84..."
name = "起床战争"
path = "maps/cloud-4e84.../worlds/cloud-4e84..."
port = 3001
auto_start = true
```

- `mode = "shared"`：所有 map 共用一个 SQLite + group namespace
- 每图 `BOX_DATA_STORAGE_NAMESPACE` 用 map id，project 数据隔离
- `group_namespace` 来自 `.boxplay` 的 `bundle.json.mapGroupId`

## `.boxplay` vs `.boxproject`

| | `.boxplay` | `.boxproject` |
|---|---|---|
| 内容 | 发布后的 world/release | 可编辑 source |
| `feather load` | 生成可 `up` 的 workspace | 解包到 `projects/`，提示 TODO |
| 退出码 | 0 | 2（source，不是 playable release） |

`.boxproject` 需要 import + publish 才能生成 release；当前只做解包，不假装可玩。

## 下一步

- `feather up`：读 `feather.toml`，起 engine 进程，生成 SQLite/logs
- `feather ps/down/logs`
- 多图 + 反代
