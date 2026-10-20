import { NOMINAL_TICK_RATE, deriveTickDuration } from './runtime/stats';
import { deriveCpuPercent } from './runtime/shard-usage';

/** 纯逻辑校验：tick 计算开销的窗口均值推导 + shard CPU% 推导，不需要内容包。 */

let failures = 0;

function check(label: string, condition: boolean, detail: string) {
  if (condition) return;
  failures++;
  process.stdout.write(`FAIL ${label}: ${detail}\n`);
}

function eq(label: string, actual: unknown, expected: unknown) {
  check(label, actual === expected, `expected ${expected}, got ${actual}`);
}

eq('累计和除总帧数', deriveTickDuration({ tickTimeSum: 0, tickCounter: 0 }, { tickTimeSum: 640, tickCounter: 10 }), 64);
eq('窗口差值（不是生命周期均值）', deriveTickDuration({ tickTimeSum: 640, tickCounter: 10 }, { tickTimeSum: 680, tickCounter: 12 }), 20);
eq('保留两位小数', deriveTickDuration({ tickTimeSum: 0, tickCounter: 0 }, { tickTimeSum: 100, tickCounter: 3 }), 33.33);
eq('没有新帧', deriveTickDuration({ tickTimeSum: 640, tickCounter: 10 }, { tickTimeSum: 640, tickCounter: 10 }), undefined);
eq('计数倒退', deriveTickDuration({ tickTimeSum: 640, tickCounter: 10 }, { tickTimeSum: 700, tickCounter: 9 }), undefined);
eq('累计和倒退', deriveTickDuration({ tickTimeSum: 640, tickCounter: 10 }, { tickTimeSum: 600, tickCounter: 11 }), undefined);
eq('NaN 输入', deriveTickDuration({ tickTimeSum: 0, tickCounter: 0 }, { tickTimeSum: NaN, tickCounter: 10 }), undefined);
eq('标称 TPS', Math.round(NOMINAL_TICK_RATE * 1000) / 1000, 15.625);

// --- shard CPU%：窗口差值，单位是「单核百分比」 ---
const cpu = (user: number, system: number, at: number) => ({ user, system, at });
eq(
  '单核满载 = 100%',
  deriveCpuPercent(cpu(0, 0, 0), cpu(1_000_000, 0, 1000)),
  100,
);
eq(
  'user + system 合并计算',
  deriveCpuPercent(cpu(0, 0, 0), cpu(600_000, 400_000, 1000)),
  100,
);
eq(
  '一个 shard 塞多图可超过 100%',
  deriveCpuPercent(cpu(0, 0, 0), cpu(2_500_000, 0, 1000)),
  250,
);
eq(
  '保留一位小数',
  deriveCpuPercent(cpu(0, 0, 0), cpu(1_234_567, 0, 1000)),
  123.5,
);
eq('没有基线（shard 刚起来）', deriveCpuPercent(undefined, cpu(1_000_000, 0, 1000)), undefined);
eq('窗口为 0', deriveCpuPercent(cpu(0, 0, 1000), cpu(1_000_000, 0, 1000)), undefined);
eq('时间倒退', deriveCpuPercent(cpu(0, 0, 1000), cpu(1_000_000, 0, 500)), undefined);
eq('计数倒退不报负数', deriveCpuPercent(cpu(1_000_000, 0, 0), cpu(500_000, 0, 1000)), undefined);
eq('NaN 输入', deriveCpuPercent(cpu(0, 0, 0), cpu(NaN, 0, 1000)), undefined);

if (failures > 0) {
  process.stdout.write(`stats checks failed: ${failures}\n`);
  process.exit(1);
}
process.stdout.write('stats checks passed\n');
