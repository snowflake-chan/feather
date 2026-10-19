# 引擎侧 Worker 补丁（待应用）

把 `ivmp`（子进程 + isolated-vm）换成 `worker_threads`。
**shell 代码零改动**；改动全部在 engine 侧，且是加法。

## 1. 拷贝文件

从 `feather-shell/tools/worker-poc/engine/` 拷到
`box3-local-engine/services/game-server/`：

| 源 | 目标 |
|---|---|
| `mu-worker-socket.js` | `src/utils/script-server/worker/mu-worker-socket.js` |
| `mu-worker-socket.d.ts` | `src/utils/script-server/worker/mu-worker-socket.d.ts` |
| `worker-script-server.ts` | `src/utils/script-server/worker/worker-script-server.ts` |
| `worker-script-entry.ts` | `src/utils/script-server/worker/worker-script-entry.ts` |
| `rollup.worker.config.mjs` | `scripts/script-server/rollup.worker.config.mjs` |

`tsconfig.json` 已经 `allowJs: true`，`.js` 会被一起编译。

## 2. `entry.ts` 加 `case 'worker'`

```diff
 import { IvmpScriptSocketServer } from './utils/script-server/ivmp/ivmp-script-socket-server';
+import { WorkerScriptServer } from './utils/script-server/worker/worker-script-server';

         switch (spec.vm) {
           case 'local':
             scriptServer = new LocalScriptSocketServer(MuSystemScheduler);
             break;
           case 'ivm2':
             ...
             break;
+          case 'worker':
+            scriptServer = new WorkerScriptServer({
+              workerEntry: path.resolve(
+                __dirname,
+                './assets/worker/worker-script-entry.js',
+              ),
+              workerData: { unsafeExec: false },
+            });
+            break;
           case 'ivmp':
           default:
             scriptServer = new IvmpScriptSocketServer(...);
             break;
         }
```

`unsafeExec` 与 ivm2 对齐用 `false`；要放开就传 `true`（对应 `LocalScriptSocketServer` 的语义）。

## 3. `package.json` 构建 worker 入口

```diff
-    "build_isolate": "rollup --config scripts/script-server/rollup.config.mjs",
+    "build_isolate": "rollup --config scripts/script-server/rollup.config.mjs && rollup --config scripts/script-server/rollup.worker.config.mjs",
```

产物：

```
src/assets/worker/worker-script-entry.js       （开发时）
dist/src/assets/worker/worker-script-entry.js  （部署时）
```

## 4. 构建 / 运行

```bash
cd services/game-server
npm run build

# 跑 worker 模式（VM 是 config/index.ts 里的 env）
VM=worker node dist/src/launch.js --useProdBundle
```

## 5. 验收

1. 地图能进，脚本能跑（`VM=worker`）
2. 和 `VM=ivm2` 跑同一张图，对比：
   - `ScriptProtocol` 消息（start/tick/postTick）字节一致
   - tick 行为一致
3. `kill -TERM` 地图进程后，worker 一起退出，无残留
4. 脚本死循环：`worker.terminate()` 后 host 仍健康（这是 ivmp timeout 的替代语义）

## 注意

- **消息是 copy，不是 transfer**：`createDispatch` 发完包会 `stream.destroy()` 还池，
  transfer 会留下 detached buffer。要零拷贝得改 mudb 的 buffer 所有权约定。
- **worker entry 引用的 shell**：这里用引擎仓库自己的 `src/script/script-shell.ts`
  （rollup 会打进去）。如果要改用抽离出来的 `feather-shell`，把
  `worker-script-entry.ts` 的 `import { ScriptShell } from '../../script/script-shell'`
  换成对应包路径即可，其余不变。
- **`resourceLimits`**：先不设，跑通后再按 `SCRIPT_MEMORY_LIMIT` 映射到
  `new Worker(..., { resourceLimits: { maxOldGenerationSizeMb } })`。
- **`onIsolateException`**：Worker 的 `error` / `exit` 事件需要接到
  `ScriptHost._scriptError`；第一版先靠 `console.error`，第二步再补 EventBus。
