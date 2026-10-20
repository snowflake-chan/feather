# Postman

## UDS

1. `feather up`（确保 daemon 已启动）
2. Postman → Import → File → 选 `feather-daemon.postman_collection.json`
3. 打开 collection variables，把 `daemonSocket` 改成你的 workspace：
   `/abs/workspace/.feather/daemon.sock`
4. 先发 `Health / ping`，返回 `OK`
5. 再发 `Maps / list maps`

Postman 的 UDS URL 格式：

```text
http://unix:/abs/workspace/.feather/daemon.sock:/v1/maps
```

collection 里用的是：

```text
http://unix:{{daemonSocket}}:/v1/maps
```

如果变量在 UDS host 里不解析，直接把 URL 改成绝对路径。

## 版本

Postman v11.70.4+ / v12 支持 UDS/named pipes；老版本先升级。

## TCP（可选）

```bash
feather-daemon --workspace /abs/workspace --tcp --port 9978 --token dev-token
```

Postman 用 `http://127.0.0.1:9978`，加 header：

```text
Authorization: Bearer dev-token
```

`/_ping` 不需要 token；`/v1/*` 在 TCP 模式需要。

## 注意

- `create map` 的 body 里 `ABS`、`projectHash` 是占位符，按 workspace 实际值改。
- `logs?follow=1` 是 NDJSON；Postman 会保持流式响应，点取消结束。
- 目前没有 OpenAPI；这份 collection 是手写调试入口。
