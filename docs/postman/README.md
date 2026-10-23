# Postman

## UDS

1. `feather run`（确保 daemon 已启动）
2. Postman → Import → File → 选 `featherd.postman_collection.json`
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
featherd --data-root /abs/data --tcp --port 9978 --token dev-token
```

Postman 用 `http://127.0.0.1:9978`，加 header：

```text
Authorization: Bearer dev-token
```

`/_ping` 不需要 token；`/v1/*` 在 TCP 模式需要。

## 注意

- `create map` 的 body 里 `ABS`、`projectHash` 是占位符，按 workspace 实际值改。
- `limits.memoryMb` 是**单图脚本 worker** 的内存上限（落到 `resourceLimits.maxOldGenerationSizeMb`）。撞上限时只有这张图的 worker 被 abort，daemon 和同 shard 其他图不受影响；不填则继承 `SCRIPT_MEMORY_LIMIT`。
- `logs?follow=1` 是 NDJSON。**Postman 会缓冲流式响应**，可能直到断开才一次性显示；实时 follow 用 `curl -N` 或 `feather logs -f`：

```bash
curl -N --unix-socket /abs/workspace/.feather/daemon.sock \
  'http://localhost/v1/maps/<id>/logs?follow=1'
```
- 目前没有 OpenAPI；这份 collection 是手写调试入口。

## stats 怎么读

```json
{"tick":594,"players":0,"uptime":38046,
 "tickRate":15,"tickDuration":0.43,"maxTickDuration":148.79,
 "shardId":"shard-0",
 "shard":{"cpuPercent":2.8,"heapUsedBytes":60761080,"heapTotalBytes":67747840,
          "heapLimitBytes":4345298944,"externalBytes":21078111,
          "sampledAt":"2026-10-20T14:52:15.218Z"}}
```

| 字段 | 口径 | 含义 |
|---|---|---|
| `tickRate` | 图 | 实测 TPS。标称 15.625（`1000/64`），掉到标称以下说明已经跟不上 |
| `tickDuration` | 图 | 上一采样窗口内每帧的平均**计算耗时**（ms），对应 MC 的 MSPT |
| `maxTickDuration` | 图 | 启动以来最慢的一帧（ms） |
| `shard.cpuPercent` | shard | 该 worker 线程的 CPU 占用（%）。单核满载 = 100 |
| `shard.heapUsedBytes` | shard | 该 isolate 的 V8 堆已用量 |

`tickDuration` **不是** `1000 / tickRate`：后者是帧周期（含等待）。上面这组数据里周期约 64ms、耗时 0.43ms，差 150 倍——只有等 `tickDuration` 超过 64ms，`tickRate` 才开始掉。

资源指标**只有 shard 口径**（engine 一个 shard 可以打包多图，CPU / 堆摊不到单图上）。`GET /v1/shards` 是权威视角，`rssBytes` 例外——它是进程级的，每个 shard 报的都一样。
