# Shell Worker 化改造 · 实测报告

> 目的：把官方「每地图一个 Node 进程 + isolated-vm」改成「单进程 + N Worker」。
> 本报告只记录**实测数据**，不包含推测。
>
> **测量环境（两套，结论一致）：**
>
> | | 开发机 | 生产服务器 |
> |---|---|---|
> | 硬件 | Apple M4 | 8 核 x86_64 |
> | 系统 | macOS | Ubuntu / Linux 6.8 |
> | Node | v22.23.2 | v24.20.0 |
> | Bun | 1.3.14 | 未安装 |
>
> 上游：box3-local-engine v2026.1.4（commit `074fe309`）
> 方法：`process.memoryUsage.rss()`，5 次采样取中位数，每项复测 3 次

---

## 一、结论摘要

### 1.1 关键发现：交接文档低估了官方方案的内存

**生产服务器实测（3 张真实地图运行中）：**

| 地图 | 进程树总 RSS |
|---|---|
| #1 | 354 MB |
| #2 | 304 MB |
| #3 | 294 MB |
| **平均** | **317 MB** |

**交接文档估计 75.5 MB/地图，实测 317 MB —— 差 4.2 倍。**

原因：文档只算了「两个空进程」（37 + 38.5），**没算 launcher 本身、没算 isolate 里编译的 shell**。

### 1.2 修正后的对比

| 方案 | 每地图 | 40 张地图 | 对比官方 |
|---|---|---|---|
| 官方（实测口径） | **317 MB** | ~12.4 GB | — |
| Worker 化（Node） | ~61 MB | ~2.4 GB | **省 80%** |
| Worker 化（Bun） | ~67 MB | ~2.6 GB | 省 79% |

**Worker 化的收益比之前估计的大得多 —— 因为官方的基线比文档写的高得多。**

### 1.3 但仍然达不到交接文档的 238 MB

文档声称 40 张地图 238 MB。**实测 2.4 GB，差 10 倍。**

原因：文档用「空 Worker」（5.4 MB）估算，**没算每个 Worker 都要重新编译一遍 shell（~49 MB）**。

**两个错误方向相反，部分抵消：**
- 官方基线低估 4.2 倍（让收益看起来更小）
- Worker 成本低估 10 倍（让收益看起来更大）

**净结果：真实收益是省 80%，不是文档说的省 92%，也不是我上一版报告说的省 24%。**

### 1.4 Bun 的结论

**空载 Bun 胜，实载 Node 胜。**

| | Node | Bun |
|---|---|---|
| 空载每 Worker | 9.2 MB | 5.2 MB |
| **实载每 Worker** | **56.7 MB** | **66.6 MB** |

**建议 Node。** 详见 2.3。

---

## 二、实测数据

### 2.0 生产环境实测（最重要）

**服务器：loki（8 核 x86_64，Ubuntu）**

运行中的真实地图（官方架构）：

```
每张地图的进程树：
  launcher 进程（~180-226 MB）
    └── game-server 进程
          └── ivmp 子进程（~88-127 MB）
```

| 地图 | launcher | game-server | ivmp | 合计 |
|---|---|---|---|---|
| #1 | 226 MB | （含在树内） | 127 MB | **354 MB** |
| #2 | 196 MB | | 109 MB | **304 MB** |
| #3 | 180 MB | | 88 MB | **294 MB** |

**注意：launcher 本身占 180-226 MB，这是文档完全没算的部分。**

容器层面（`docker stats`）：

| 容器 | 内存 |
|---|---|
| creator | 659 MB / 6 GB |
| play | 430 MB / 4 GB |
| player-service | 173 MB / 256 MB |

### 2.1 空 Worker 扩展性

| N | M4 / Node 22 | loki / Node 24 |
|---|---|---|
| 0（基线） | 39.1 MB | 44.6 MB |
| 1 | 52.2 MB | 61.0 MB |
| 4 | 80.2 MB | 94.9 MB |
| 8 | 116.6 MB | 139.8 MB |
| 16 | 187.3 MB | 230.0 MB |

**线性拟合（最小二乘）：**

| 环境 | 基线 | 每 Worker |
|---|---|---|
| M4 | 42.0 MB | 9.2 MB |
| loki | 47.7 MB | 11.4 MB |

### 2.2 加载真实 shell bundle 后

| N | M4 | loki |
|---|---|---|
| 1 | 100.5 MB | 122.9 MB |
| 4 | 252.1 MB | 301.1 MB |
| 8 | 466.0 MB | 556.8 MB |
| 16 | 947.4 MB | 1033.6 MB |

**线性拟合：**

| 环境 | 基线 | 每 Worker | shell 编译开销 |
|---|---|---|---|
| M4 | 30.1 MB | **56.7 MB** | **47.5 MB** |
| loki | 62.3 MB | **60.9 MB** | **49.4 MB** |

**两套环境高度一致（56.7 vs 60.9），说明这个开销是结构性的，不是环境噪声。**

### 2.3 Bun vs Node（仅 M4 可测）

| N | Node | Bun |
|---|---|---|
| 1 | 100.5 MB | 112.3 MB |
| 4 | 252.1 MB | 328.6 MB |
| 8 | 466.0 MB | 610.3 MB |
| 16 | 947.4 MB | 1115.3 MB |

| 运行时 | 基线 | 每 Worker | shell 编译开销 |
|---|---|---|---|
| Node | 30.1 MB | **56.7 MB** | 47.5 MB |
| Bun | 58.5 MB | **66.6 MB** | 61.4 MB |

**空载 Bun 胜（5.2 vs 9.2），实载 Node 胜（56.7 vs 66.6）。**

Bun 的 JSC 编译同一份代码多花约 14 MB/Worker。**只看空载数据会选错。**

---

## 三、内存去哪了

### 3.1 不在 JS 堆里

```
N=4，Node：
  heapUsed     4.2 MB
  heapTotal    5.1 MB
  external     1.5 MB
  ─────────────────────
  RSS        262.5 MB   ← 差了两个数量级
```

**内存不在数据上，在 V8 的代码空间和元数据里。**

### 3.2 是「每个 Worker 重新编译一遍 JS」的开销

逐步加载测量（Node）：

| 模块 | RSS 增量 |
|---|---|
| `@box/schema/project/project-rda` | +16.4 MB |
| `@box/schema/keyframes/bindings/entity-animation` | +9.7 MB |
| `@box/schema/debugger-console/schema` | +9.4 MB |
| `@box/schema/keyframes/bindings/world-animation` | +5.5 MB |
| `bindings/entity-synchronizer` | +3.1 MB |
| `bindings/world-synchronizer` | +2.1 MB |

**验证：空模块测试**

造 200 个空模块（`module.exports = {v: i}`）：

```
Node: 200 个空模块 = +3.2 MB  →  每个仅 16.6 KB
```

所以**不是模块数量的问题，是模块内容的问题** —— 大函数体的字节码 + 内联缓存 + 反馈向量。

**关键约束：每个 Worker 是独立 isolate，必须各自编译，无法共享。**

---

## 四、为什么达不到交接文档的估计

交接文档 5.3 节的账：

```
Bun + 40 Worker = 22 + 40×5.4 = ~238 MB
```

**这个估计只算了空载 Worker，没算 shell bundle 的编译开销。**

正确的账：

```
每地图 = Worker 基础 + shell 编译开销
       = 9.2 MB + 47.5 MB
       = 56.7 MB（Node）
```

文档 5.3 节其实提到了「加上 shell bundle（~5-10 MB）」，但：

1. **低估了 5-9 倍** —— 实测 47.5 MB，不是 5-10 MB
2. **算错了性质** —— 这不是「数据」，是**每 Worker 都要重付一次的编译成本**

---

## 五、已做的优化

### 5.1 修复：常量误从物理引擎引入

**问题：** shell 只需要 6 个常量，却从 `physics-solve` 引入，拖进整个物理引擎。

```ts
// 修复前
import { MAX_BODIES } from '@box/schema/physics/physics-solve';
import { MIN_MASS, MAX_MASS, MAX_VELOCITY, MIN_RADIUS, MAX_RADIUS }
  from '@box/schema/physics/physics-solve';

// 修复后
import { MAX_BODIES } from '@box/schema/physics/def';
import { MIN_MASS, MAX_MASS, MAX_VELOCITY, MIN_RADIUS, MAX_RADIUS }
  from '@box/schema/physics/def';
```

这 6 个常量全部定义在 `def.ts`（60 行，零依赖）。

**效果（实测，完整 shell 加载前后差）：**

| | RSS |
|---|---|
| 修复前 | 59.7 MB |
| 修复后 | 56.6 MB |
| **净省** | **3.1 MB / Worker** |

**注意：** 孤立测量 `physics-solve` 显示 +31.8 MB，但**这不是净增** —— 它的依赖（`physics-schema`、`constraint` 等）本来就会被 shell 其他部分加载。**孤立测量不能直接相加。**

40 张地图省约 120 MB。

### 5.2 无法优化的部分

剩余的大户都是**真运行时值**（`MuStruct` 实例，有 `.clone()`/`.alloc()` 调用）：

| 模块 | 内存 | 能否改 import 解决 |
|---|---|---|
| `project-rda` | +16.4 MB | ❌ 真运行时值 |
| `keyframes/bindings/*` | +15.2 MB | ❌ 真运行时值 |
| `debugger-console/schema` | +9.4 MB | ❌ 真运行时值 |

**不能靠改 import 路径解决。**

---

## 六、云原生遗留清单

### 6.1 shell 内部：零

`src/script/` 全目录 grep `fetch`/`axios`/`@box/apis`/`VOXA`，**命中数 0**。

（`safe-eval.ts` 里的 `fetch`/`WebSocket` 是「烧桥」列表，是**删除**这些 API，不是使用。）

**shell 本身没有任何云调用。**

### 6.2 引擎侧：全部在这里

云原生集中在 `services/game-server/src/`，通过 `entry.ts` 的一个分支进入：

```ts
// entry.ts:287
const ossContentServer = isLocal
  ? localContentWithVoxa                                    // 本地分支
  : new ObjectStoreService({                                // 云分支
      uri: spec.INTRANET_CREATERA_BACKEND_SERVER_URL,
      cdnPath: spec.OSS_CDN_URL,
    });
```

**关键：即使选「本地」分支，仍然带云。**

### 6.3 本地分支里的云回退链

`content/local-content-with-voxa.ts` 的四级回退：

```
1. 本地 blob（FileSystemContentServer）
2. group content
3. bundled content
4. 外部 CDN（https）        ← 网络
5. VOXA 服务（http）        ← 网络
```

**第 4、5 条是网络调用，藏在「本地模式」里。**

### 6.4 完整调用点

| 依赖 | 位置 | 用途 | 建议 |
|---|---|---|---|
| `VOXA_INTERNAL_URL` / `VOXA_URL` | `local-content-with-voxa.ts:18` | blob 回退 | 砍 |
| 外部 CDN | `local-content-with-voxa.ts:34` | 资产回退 | 砍 |
| `INTRANET_CREATERA_BACKEND_SERVER_URL` | `entry.ts:291` | OSS 服务 | 砍 |
| `OSS_CDN_URL` | `entry.ts:293` | CDN 路径 | 砍 |
| `INTRANET_BACKEND_SERVER_URL` | `entry.ts:298` | 后端 RPC | 砍 |
| `BACKEND_AUTH_CODE` | `entry.ts` | 后端鉴权 | 砍 |
| `CONTENT_SERVER_URL` | `entry.ts:270` | GoIPFS | 砍（本地用文件系统） |
| `BUILD_SERVER_URL` | `entry.ts` | 构建服务 | 待查 |
| `SCRIPT_OSS_CDN_PATH` | `script-host.ts:110` | 脚本 OSS 路径 | 砍 |

### 6.5 脚本/资产的获取路径

`script-host.ts:223` 的加载逻辑：

```ts
if (module.hash.startsWith('Qm')) {
  src = await this._state.content.retrieve(module.hash);        // IPFS
  if (!src) src = await this._state.ossContent.retrieve(...);   // OSS 回退
} else {
  src = await this._state.ossContent.retrieve(...);             // 直接 OSS
}
```

**两个问题：**

1. **按 hash 寻址，不是按名字** —— 无法「给我 `foo.js`」，只能说「给我 `QmXyz...`」
2. **hash → 内容 的映射在云端** —— 本地只是缓存，未命中就出网

**但本地已有按 hash 存的文件：**

```ts
// FileSystemContentServer
const target = path.join(this.directory, hash);   // blobs/QmXyz...
```

所以本地目录里已经是「hash 命名的文件」。**加一层「名字 → hash」映射即可实现具名获取。**

---

## 七、架构确认

### 7.1 引擎与 shell 完全解耦

```
引擎侧                           shell 侧
ScriptHost                       ScriptShell
  MuServer  ←── ScriptProtocol ──→  MuClient
       ↑                                  ↑
       └──────── MuSocket ────────────────┘
                  （唯一接缝）
```

**已验证：** 两侧 `ScriptProtocol` 定义完全一致；shell 入口是 `function (socket, unsafeExec)`，socket 是注入的。

**结论：换传输层（子进程 → Worker）不需要碰任何业务代码。**

### 7.2 官方拓扑（生产实测）

```
launcher 进程（每地图一个，~180-226 MB）   ← 交接文档漏了这一层
  └── game-server 进程
        └── ivmp 子进程（~88-127 MB）
              └── isolate（编译 shell bundle，1.23 MB）
```

**每张地图 2 个进程 + 1 个 isolate**，40 张地图 = 80 个进程。

**实测总计 ~317 MB/地图**（交接文档估计 75.5 MB，低估 4.2 倍）。

### 7.3 目标拓扑

```
单个 Node 进程
  ├── Worker 1 → shell → 地图 A 脚本
  ├── Worker 2 → shell → 地图 B 脚本
  └── ...
```

**Worker 隔离的是「地图与地图」，不是「脚本与引擎」。** 不加 isolate。

---

## 八、待决策事项

### 8.1 运行时选型：Node

**建议 Node，不建议 Bun。**

理由：真实负载下 Bun 每 Worker 多花约 10 MB（66.6 vs 56.7），40 张地图多用 400 MB。

Bun 的优势（原生 TS、空载更省）在**这个场景下不足以抵消**。

**补充理由：** Bun 不支持 `isolated-vm`。如果将来需要回退到 ivm 方案（比如要精确内存限制），Node 是唯一选择。

**除非**后续能解决 Bun 的编译开销问题。

### 8.2 内存限制机制

不加 isolate 后，`ivm` 的 `memoryLimit` 和 `timeout` 都没了。

| 能力 | 替代方案 | 风险 |
|---|---|---|
| 内存限制 | Worker `resourceLimits` | **V8 专属参数，Bun 下可能被忽略** |
| 超时中断 | `worker.terminate()` | **不可逆**，只能重启 Worker |

**注意：** 原 ivmp 的 isolate 超时是「可恢复的暂停」（isolate 仍可用，能继续报错）。`terminate()` 是「销毁重建」。**语义不等价。**

### 8.3 脚本/资产获取方式

三个选项：

**A. 走引擎中转 + 具名解析**（推荐）
- 在引擎侧加「名字 → hash」映射
- shell 不用改，仍收到脚本源码
- 保留 hash 校验（完整性）

**B. shell 直读文件**
- Worker 里直接 `fs.readFileSync`
- 需要定义路径约定
- 失去 hash 校验

**C. 主进程读入，`workerData` 传入**
- 主进程按名字读文件 → 通过 `workerData` 传给 Worker
- Worker 不碰 `fs`
- 兼顾具名和隔离

### 8.4 云原生清理范围

需要确认：**是否保留 IPFS 支持？**

- 保留 → 仍需 `CONTENT_SERVER_URL`（GoIPFS）
- 不保留 → 全部走本地文件系统，可砍掉 9 个环境变量

---

## 九、复现方法

```bash
# 1. 准备
cd feather-shell
pnpm install
pnpm build

# 2. 测量脚本
cat > /tmp/stable.js <<'EOF'
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
if (isMainThread) {
  const N = parseInt(process.argv[2] || '0', 10);
  const load = process.argv[3] === 'load';
  const rss = () => process.memoryUsage.rss()/1048576;
  const ws = [];
  for (let i=0;i<N;i++) ws.push(new Worker(__filename,{workerData:{load}}));
  let done=0;
  const fin = () => {
    if (++done < N && N>0) return;
    let samples=[], c=0;
    const t = setInterval(()=>{
      samples.push(rss());
      if (++c>=5) {
        clearInterval(t);
        samples.sort((a,b)=>a-b);
        console.log(`N=${String(N).padStart(2)} load=${load?'Y':'N'}  rss=${samples[2].toFixed(1)}MB`);
        ws.forEach(w=>w.terminate());
        process.exit(0);
      }
    }, 400);
  };
  if (N===0) fin(); else ws.forEach(w=>w.on('message',fin));
} else {
  if (workerData.load) { try{ require(process.cwd()+'/dist/script/script-start.js'); }catch(e){} }
  parentPort.postMessage(1);
  setInterval(()=>{},1000);
}
EOF

# 3. 测量
for n in 0 1 4 8 16; do node /tmp/stable.js $n; done        # 空 Worker
for n in 1 4 8 16; do node /tmp/stable.js $n load; done     # 加载 shell
```

---

## 十、方法论警告

**本报告修正了两个此前的错误估计，记录在此以免重犯：**

### 错误 1：用孤立测量推断增量收益

孤立加载 `physics-solve` 显示 +31.8 MB，我据此推断「改 import 能省 30 MB/Worker」。

**实测只省 3.1 MB。**

原因：模块间有大量**共享依赖**。孤立测量的数字**不能相加**。

**正确做法：** 一律测「完整加载的前后差」。

### 错误 2：用空载数据推断实载性能

交接文档用空载 Worker 数据（5.4 MB/Worker）估算 40 张地图的总内存。

**实测加载真实 shell 后是 56.7 MB/Worker，差 10 倍。**

**正确做法：** 必须加载真实 bundle 测量。

---

## 十一、关键数字速查

```
【官方方案 · 生产实测（loki，3 张真实地图）】
每地图进程树            ~317 MB（354 / 304 / 294）
  launcher 进程           ~180-226 MB   ← 文档完全没算
  game-server 进程        （含在树内）
  ivmp 子进程             ~88-127 MB
  其中 isolate 编译 shell  （未单独计量）

40 张地图推算            ~12.4 GB

【Worker 化 · 两套环境实测】
                    M4          loki
Worker 基础          9.2 MB      11.4 MB
shell 编译开销      47.5 MB      49.4 MB
─────────────────────────────────────────
每 Worker           56.7 MB      60.9 MB

40 张地图（Node）     ~2.4 GB     ← 对比官方省 80%

【Bun（仅 M4 可测）】
Worker 基础          5.2 MB      ← 空载胜 Node
shell 编译开销      61.4 MB
─────────────────────────────────────────
每 Worker           66.6 MB      ← 实载输 Node

【已做的优化】
physics import 修复：省 3.1 MB/Worker（40 地图省 120 MB）

【三个数字的修正史】
交接文档估计：75.5 MB/地图   → 实测 317 MB（低估 4.2x）
交接文档估计：238 MB/40地图  → 实测 2.4 GB（低估 10x）
本报告上一版：省 24%          → 修正为省 80%
```
