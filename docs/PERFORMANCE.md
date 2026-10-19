# 性能对比：官方 vs feather worker

## 口径

| 项 | 官方 | 当前 |
|---|---|---|
| 架构 | 每图一个 Node 进程 + isolated-vm（ivmp/ivm2） | 每图一个 Node 进程 + shell Worker |
| 数据 | 生产实测，真实地图 | `起床战争 v1.1.2` 真图，本地加载 |
| 内存口径 | engine + isolate | engine + worker（同进程 RSS） |
| 来源 | `shell/docs/WORKER-BENCHMARK.md` | 本次 run，pid 31949 |

## 结果

| 指标 | 官方 | 当前 | 差异 |
|---|---|---|---|
| 每图 RSS | **317 MB** | **224 MB** | **-29%** |
| 脚本运行时内存 | ~56.7 MB/isolate | 22.6 MB used / **59.8 MB total** | 基本持平 |
| 启动 | — | **0.26 s** | — |
| tick | — | **15.8 Hz**（engine 设定） | — |
| 默认项目 bench | — | 268 MB RSS / 0.29 s / 15.8 Hz | — |

> 真图的 storage/telesense 未配置，脚本不是完全运行状态，224 MB 是**偏低口径**。
> 配齐 PostgreSQL + player-service 后，预计会回到 250–280 MB。
> 默认空图 bench 的 268 MB 是另一个上界参考。

## 结论

1. **单图 worker 化的收益是 -15% ~ -29%，不是 -70%。**
   worker 自身约 60 MB，和官方 isolate 的 ~57 MB 基本持平——省下来的不是脚本运行时，而是 engine 进程的 Node 基线/缓存差异。

2. **monorepo + protocol 抽取没有运行时提升。**
   启动 0.29 s、tick 15.8 Hz 与抽取前一致；worker used heap 21–23 MB，属同一量级。
   它改善的是工程结构（共享协议、golden vectors、单一 vendor），不是性能。

3. **要拿到 -70%，必须共享 engine 进程 + worker pool。**
   当前模型是「每图一个 engine + 一个 worker」，Node 基线、内容缓存、engine 代码仍然每图一份。
   目标形态：
   - 一个 engine 进程承载多张图
   - 一个 worker 服务 N 张图（pool），共享 schema/绑定
   - 按图状态 54 MB + worker 15 MB/N + 共享基线
   这样 40 图才可能落到 2.8–3.7 GB。

## 复现

```bash
# tick / 默认项目
cd engine
SCRIPT=scripts/bench.js pnpm ... # 见 engine/SMOKE.md 的 env

# 真图
HASH=QmRHVezsRJW7KKgniUMvTahd7SfPVRxBPP9SjAQaQfymYo
BOX_PROJECT_STATE_PATH=.../worlds/cloud-4e84.../data/project-state.json
STORAGE_PATH=/tmp/feather-realmap
```

`bench.js` 在 5 秒后抛异常，把 tick 数/rate 带出来；`console.log` 在 engine 里是 trace 级别，默认不可见。
