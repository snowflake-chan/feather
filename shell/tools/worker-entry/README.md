# Shell Worker Entry

engine 通过 `SCRIPT_WORKER_ENTRY` 指向这个文件，把 shell 跑在 `worker_threads` 里。

**非侵入**：不 import、不修改 `src/shell/**`；只是把 `parentPort` 包成 `MuSocket`，
然后 `new ScriptShell(socket, false, sysLog)`。

## 依赖

- `feather-shell` 先构建：`pnpm build`（生成 `dist/script/script-shell.js`）
- `@feather/transport/client` 提供 `NodeWorkerSocket`（client 侧）

## 用法

```bash
SCRIPT_WORKER_ENTRY=/Users/lawrencebi/Projects/feather/shell/tools/worker-entry/worker-entry.js \
VM=worker \
node /Users/lawrencebi/Projects/feather-engine/dist/src/launch.js
```

完整的 engine smoke 命令见
[feather-engine/SMOKE.md](../../../engine/SMOKE.md)。
