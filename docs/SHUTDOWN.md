# Map shutdown

`GameServer.close()` 是单进程多图的地基：停图必须释放 worker、socket、SQLite、timer 和状态引用。

## 顺序

```
GameServer.close()
  ├── clear tick interval
  ├── run registered disposers（player revocation poller 等）
  ├── ScriptHost.close()
  │     ├── stop scripts
  │     ├── scriptServer.close() -> terminate workers
  │     ├── muServer.destroy()
  │     └── StorageController.close() -> dbServer.close()
  ├── BackendSocket.close()
  ├── MuServer.destroy()
  ├── unsub event buses
  └── host drops the GameServer reference
```

## 所有权

| 资源 | 归属 | 关闭者 |
|---|---|---|
| tick loop | GameServer | `GameServer.close()` |
| MuServer / WebSocket | GameServer | `GameServer.close()` |
| script + worker | ScriptHost | `ScriptHost.close()` |
| SQLite / PG | StorageController | `StorageController.close()` |
| BackendSocket | GameServer | `GameServer.close()` |
| player revocation poller | GameServer disposer | `GameServer.close()` |
| content / build / brpc / redis / session / HTTP | HostContext | host |

共享服务不要在 `GameServer.close()` 里关。

## 测试

```bash
cd engine
pnpm check:game-close
pnpm check:two-games
```

两图测试会：

1. 同进程起两个 GameServer
2. 停 A，确认 B 仍 healthy
3. 停 B，确认退出
4. 打印 heap（加 `--expose-gc` 时会更接近实际回收）

## GC 验证

```bash
cd engine
pnpm check:gc
```

`check:gc` 会 close、丢掉 game/http 引用、保留 `scriptServer` 引用，然后跑 major GC + heap snapshot。

结果：

```
GameServer instances: []
heap ~73MB（engine/content 基线）
```

说明 close 后没有强引用链；GC 能收掉整个 GameServer 图。`close()` 本身不触发 GC，线上靠 V8 自动回收。

### 曾经的真实 root（已修）

- `process.on('uncaughtException'/'unhandledRejection')` 在 `startServer` 作用域内，process root 会保住整个 context（含 `/createSession` 路由和 GameServer）→ 移到 host/`launch.ts`
- `setTimeout(() => clearMemoryPool(), 1000)` 是 per-map、捕获 `startServer` context → 移到 host，且不再用闭包
- `ScriptHost` 的 `onConsoleLog/onConsoleClear/onException/onScriptCrash` 订阅 → close 时 `unsubAll()`
- `MuServer.destroy()` 不清 `protocols`/`_protocolSpecs`，`GameAdminServer` 会反向持有 game → close 时清空

## 已知限制

- 当前 `check:two-games` 用两次 `startServer`，每个实例仍会创建自己的 content/build/HTTP；它是 **生命周期 prototype**，不是最终共享 HostContext。
- worker 是硬 `terminate()`，没有优雅退出协议；脚本有未落盘状态时需要 host 先 `stop` + flush。
- `GameServerState` 的 MuStruct 没有 `free`；目前依赖 host 丢弃引用 + GC。`clearMemoryPool()` 是全局的，只能所有图都停后调用。
- RSS 不一定立刻下降；看 `heapUsed` / active handles，不要只看 RSS。
- 如果外部还持有 `GameServer`/`PlayServer`/`httpRoutes`，GC 不会收；host 必须丢引用。`scriptServer` 可以保留（protocols 已清）。
