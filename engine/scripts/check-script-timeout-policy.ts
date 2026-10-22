/**
 * 脚本超时判定的纯逻辑校验。
 *
 * 不起图、不连 IPFS，毫秒级跑完。守的是这条回归：
 * 之前用墙上时钟算「多久没收到 postTick」，把「脚本还在初始化」也算成卡死，
 * 于是每次开大图都在 10s 时杀掉脚本，再触发一次完整重同步。
 */
import {
  evaluateScriptTimeout,
  resolveScriptInitGraceMs,
} from '../src/script/script-timeout-policy';

let passed = 0;
function ok(condition: boolean, label: string) {
  if (!condition) throw new Error(`assertion failed: ${label}`);
  passed++;
  process.stdout.write(`ok  ${label}\n`);
}

const T = 10_000;
const base = { timeoutMs: T, startedAt: 0, lastTickAt: 0 };

// 1) 初始化阶段，宽限内不杀 —— 这条就是之前误杀的场景
{
  const v = evaluateScriptTimeout({
    ...base,
    ticking: false,
    now: 12_000,
    initGraceMs: 120_000,
  });
  ok(!v.kill, '初始化 12s（宽限 120s）不杀');
}

// 2) 初始化阶段超过宽限才杀
{
  const v = evaluateScriptTimeout({
    ...base,
    ticking: false,
    now: 121_000,
    initGraceMs: 120_000,
  });
  ok(v.kill && v.phase === 'init', '初始化超过宽限 → init timeout');
}

// 3) 已经在 tick，间隔没超 scriptTimeout 不杀
{
  const v = evaluateScriptTimeout({
    ...base,
    ticking: true,
    lastTickAt: 100_000,
    now: 108_000,
    initGraceMs: 120_000,
  });
  ok(!v.kill, 'ticking 间隔 8s < 10s 不杀');
}

// 4) 已经在 tick，间隔超过 scriptTimeout 杀
{
  const v = evaluateScriptTimeout({
    ...base,
    ticking: true,
    lastTickAt: 100_000,
    now: 111_000,
    initGraceMs: 120_000,
  });
  ok(v.kill && v.phase === 'tick', 'ticking 间隔 11s > 10s → tick timeout');
}

// 5) ticking 之后不再受 init grace 影响：就算启动很久，卡住照样杀
{
  const v = evaluateScriptTimeout({
    timeoutMs: T,
    ticking: true,
    startedAt: 0,
    lastTickAt: 1_000_000,
    now: 1_011_000,
  });
  ok(v.kill && v.phase === 'tick', 'ticking 后与启动时刻无关');
}

// 6) timeout <= 0 表示不限制
{
  for (const timeoutMs of [0, -1, Number.NaN]) {
    const v = evaluateScriptTimeout({
      ...base,
      timeoutMs,
      ticking: true,
      lastTickAt: 0,
      now: 10_000_000,
    });
    ok(!v.kill, `timeoutMs=${String(timeoutMs)} 不杀`);
  }
}

// 7) 默认宽限 = max(4 × timeout, 120s)
{
  ok(resolveScriptInitGraceMs(10_000) === 120_000, '默认宽限 120s');
  ok(resolveScriptInitGraceMs(60_000) === 240_000, '大 timeout 时按 4 倍算');
}

process.stdout.write(`script timeout policy: ${passed} 组断言通过\n`);
