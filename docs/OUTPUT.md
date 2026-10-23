# CLI Output Contract

> 状态：P0 契约
> 优先级：高于颜色、字体、TTY 样式

---

## 0. 三条铁律

1. **stdout 只放结果。**
   - 表格、key-value、JSON、图片路径。
2. **stderr 只放诊断。**
   - 进度、warning、error、hint。
   - 不能混进 stdout。
3. **日志只走日志流。**
   - daemon / engine / script 的运行记录不随命令结果打印。
   - `feather logs` 单独读取。

---

## 1. `--json` envelope

非流式命令成功：

```json
{"ok":true,"command":"ps","data":[...]}
```

失败：

```json
{"ok":false,"error":{"code":"MAP_NOT_FOUND","message":"map not found: bedwars","hint":"run `feather maps`"}}
```

规则：

- 一行，无颜色，无日志。
- `--json` 失败也必须是 JSON。
- 人类输出不是稳定契约；脚本只认 `--json`。
- `command` 是 canonical 命令名，例如 `up`、`ps`、`workspace.init`。

流式命令：

- `feather logs`、`feather events` 用 NDJSON。
- 不套 `{ok,data}`。
- 错误走 stderr + 非 0 退出码。

---

## 2. 人类输出

### 列表

`ps`、`maps` 用 tabwriter：

```text
INSTANCE    MAP       STATE    PORT  SHARD    VOLUME
bedwars-1   bedwars   running  3001  shard-0  bedwars-1
```

- 表头大写。
- 空结果使用正确名词：
  - `no instances`
  - `no maps`
- 支持 `--no-headers`、`--wide`、`--json`。

### 单个对象

`inspect`、`build`、`unpack` 用 key-value：

```text
id       bedwars
version  1.0.0
content  sha256:...
```

- key 小写，冒号对齐。

### 动作

一行一个受影响对象：

```text
created  bedwars-1  map=bedwars  state=created
started  bedwars-1  map=bedwars  state=running
sealed   bedwars-1  map=bedwars  state=sealed
unsealed bedwars-1  map=bedwars  state=stopped
removed  bedwars-1
loaded   bedwars  sha256:...
```

- `run` 只打印本次创建的 instance。
- `start` / `stop` 默认等待完成，打印 instance 状态。
- `--no-wait` 才打印 operation。
- `rm` / `rmi` 统一 `removed  <id>`，不要两种顺序。

### 错误

stderr：

```text
error: map not found: bedwars
  code: MAP_NOT_FOUND
  hint: run `feather maps`
```

- exit 1。
- usage 错误 exit 2。
- 文案小写；code 大写。
- 错误文案用英文。

---

## 3. 日志 schema

统一 NDJSON：

```json
{"time":"2026-10-20T14:52:16.001Z","level":"info","source":"gateway","message":"player connected","instanceId":"bedwars-1","mapId":"bedwars","sessionId":"s-1","fields":{"remote":"..."}}
```

字段：

- `time`: ISO 8601 UTC
- `level`: `error|warn|info|debug|trace`
- `source`: `daemon|gateway|engine|script|process`
- `message`: 人读文本
- `instanceId` / `mapId` / `shardId` / `sessionId`: 可选
- `fields`: 结构化附加字段

旧 `stream` 字段保留一个版本，逐步废弃。

人类渲染：

```text
14:52:16 INFO  gateway  bedwars-1  player connected  session=s-1
```

格式：

```text
HH:MM:SS LEVEL source instance message key=value
```

选项：

- `--json`: NDJSON
- `--raw`: 只输出 message
- `--no-time`
- `--utc`
- `--level`
- `--grep`

---

## 4. daemon / one-shot

- `featherd` 日志走 stderr。
- `--log-format text|json`
- `--log-level`
- 启动 banner 走 stderr：

```text
featherd 0.1.0
  data root  /Users/x/.feather
  socket     /Users/x/.feather/daemon.sock
  gateway    0.0.0.0:9978
```

- `featherd build/unpack`：
  - 结果走 stdout
  - 进度走 stderr
  - `--json` 使用统一 envelope

---

## 5. TTY / color / progress

- 颜色只在 TTY：`--color auto|always|never`、`NO_COLOR`
- 进度只在 TTY：`--no-progress`；`--json` 自动关闭
- `--quiet`：只留 error
- `--verbose`：加 info
- `--debug`：加 stack / request id
- 日志 level 默认 `info`

---

## 6. 落地顺序

### P0

1. `--json` 失败也输出 envelope。
2. `load` 不再打印原始 API JSON。
3. `run` 只打印本次创建的 instance。
4. `ps` / `maps` 空结果名词修正。
5. `logs` 加 `--json` / `--raw`。
6. 错误统一 `error/code/hint`。
7. 表格用 tabwriter。

### P1

1. `LogEntry` 加 `level`、`source`、`instanceId`、`mapId`、`shardId`、`sessionId`。
2. `featherd --log-format` / `--log-level`。
3. engine pino child bindings；script console 捕获。
4. `feather logs <instance>` 真正按 instance 过滤。

### P2

日志轮转、redaction、`--grep`、file sink、events 人类渲染。
