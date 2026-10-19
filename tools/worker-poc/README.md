# Worker PoC

验证：把 shell 从 ivmp（子进程 + isolated-vm）搬到 `worker_threads`，
**不改 `src/shell/**`**。

## 跑

```bash
node tools/worker-poc/run.js              # 直接测 adapter
node tools/worker-poc/run-script-server.js # 测 WorkerScriptServer（和引擎同序）
```

预期：

```
[poc] engine harness ready
[engine] shell connected: <uuid>
[shell:debug] ScriptShell socket client started.
[shell:debug] ScriptShell protocol is ready.
[poc] PASS: shell worker handshake + poll/pump round-trip (<X> ms)
```

## 它证明了什么

1. `MuWorkerSocketServer` 用 Node `worker_threads` 可以完成 mudb 的 session 握手
2. shell 的 `MuClient` 能在 Worker 里加载、连上 `MuServer(ScriptProtocol)`
3. engine → shell 的 `poll` 能触发 shell → engine 的 `pump`（双向消息）
4. `worker.terminate()` 后干净退出，无残留句柄

## 文件

| 文件 | 作用 |
|---|---|
| `adapter.js` | `worker_threads` 版 `MuSocketServer` / `MuSocket`（浏览器版在 `vendor/mudb/socket/worker/`） |
| `host.js` | 假 engine：`MuServer` + `ScriptProtocol`（直接 import shell 的 dist，schema 必然一致） |
| `worker.js` | Worker 入口：`parentPort` → socket → `new ScriptShell(socket, true, sysLog)` |
| `run.js` | 编排 + 断言 + 超时 + terminate（直接测 adapter） |
| `worker-script-server.js` | 生产形态的 `ScriptServer` 实现（`MuSocketServer` + `launch`） |
| `run-script-server.js` | 按引擎 `ScriptHost` 的调用顺序测 `WorkerScriptServer` |
| `engine/` | 引擎侧补丁（TS + rollup + `PATCH.md`），待拷进 `box3-local-engine` |

## 两个实现决定

1. **消息用结构化克隆（copy），不 transfer**
   `MuMessageFactory.createDispatch` 发完包会 `stream.destroy()` 把 buffer 还池；
   如果 `postMessage` transfer 了 ArrayBuffer，池里会留下 detached buffer。
   以后要零拷贝，得同时改 mudb 的 buffer 所有权约定。

2. **显式传 `sysLog`**
   `script-start.ts` 只传两个参数，`ScriptShell` 第三参 `sysLog` 是 undefined；
   正常路径不触发，出错路径会崩。PoC 里直接 `new ScriptShell(socket, true, sysLog)`。

## 实测结果（Apple M4 / Node 22）

| 指标 | 值 |
|---|---|
| 连续运行 | 5/5 通过 |
| Worker 启动 + 握手 + poll/pump 往返 | **~150 ms** |
| Worker isolate 活堆（强制 GC 后） | **~20 MB**（shell 模块 + 一个 ScriptShell 实例） |
| `src/shell/**` 改动 | **0 行** |

> 注意：`process.memoryUsage()` 在 Worker 里返回的是**整个进程**的内存；
> 要看单个 isolate 用 `v8.getHeapStatistics()`。

## 引擎接入

见 [`engine/PATCH.md`](engine/PATCH.md)：拷贝 4 个文件 + `entry.ts` 加 `case 'worker'` +
rollup 加一个配置，然后 `VM=worker` 启动。shell 侧仍然零改动。

## 没覆盖的

- 真正的 `start` / tick（需要构造合法 `ScriptInitSchema`，且 `config.config.url` 等字段有约束）
- `resourceLimits` / OOM / terminate 后的重启语义
- 多地图并发（一个 host 多个 Worker）
