import os from 'node:os';

import { resolveShardBudget, shouldCreateShard } from './runtime/shard-policy';

/**
 * 纯逻辑校验：不需要内容包，几毫秒跑完。
 * 同时兼作容量估算器（内存常量见下方注释）。
 */

const SHARD_MB = 62; // 实测：worker isolate 10MB + engine 模块图 52MB
const MAP_MB = 124; // 每图 engine 状态 54MB + script worker 70MB

interface Plan {
  budget: number;
  shards: number;
  sizes: number[];
}

function simulate(cores: number, maps: number, override?: string): Plan {
  const budget = resolveShardBudget(cores, override);
  const sizes: number[] = [];
  for (let active = 1; active <= maps; active++) {
    if (shouldCreateShard(active, sizes.length, budget)) {
      sizes.push(1);
      continue;
    }
    let target = 0;
    for (let i = 1; i < sizes.length; i++) if (sizes[i] < sizes[target]) target = i;
    sizes[target]++;
  }
  return { budget, shards: sizes.length, sizes };
}

let failures = 0;

function check(label: string, condition: boolean, detail: string) {
  if (condition) return;
  failures++;
  process.stdout.write(`FAIL ${label}: ${detail}\n`);
}

function expect(label: string, cores: number, maps: number, expected: number[]) {
  const plan = simulate(cores, maps);
  const actual = plan.sizes.join('+');
  check(label, actual === expected.join('+'), `expected ${expected.join('+')}, got ${actual}`);
  check(
    `${label} (总数)`,
    plan.sizes.reduce((a, b) => a + b, 0) === maps,
    `map 总数对不上：${plan.sizes.reduce((a, b) => a + b, 0)} != ${maps}`,
  );
}

// 1 核：无论多少图都只有一个 shard（全打包，代码页/模块图只留一份）
expect('1 核 5 图', 1, 5, [5]);
expect('1 核 1 图', 1, 1, [1]);

// 多核：核预算没用完就一图一 shard
expect('2 核 5 图', 2, 5, [3, 2]);
expect('10 核 10 图', 10, 10, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

// 图数超过核数：打包，且尽量均分
expect('10 核 20 图', 10, 20, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
expect('4 核 100 图', 4, 100, [25, 25, 25, 25]);

// 显式覆盖
check(
  'FEATHER_MAX_SHARDS=2',
  simulate(10, 6, '2').sizes.join('+') === '3+3',
  `got ${simulate(10, 6, '2').sizes.join('+')}`,
);
check(
  '非法覆盖回退到核数',
  resolveShardBudget(8, 'abc') === 8 && resolveShardBudget(8, '0') === 8,
  `got ${resolveShardBudget(8, 'abc')} / ${resolveShardBudget(8, '0')}`,
);
check(
  '覆盖值大于核数时按覆盖值',
  resolveShardBudget(4, '8') === 8,
  `got ${resolveShardBudget(4, '8')}`,
);

// 容量估算表
const cores = os.availableParallelism();
const W = 18;
process.stdout.write(`\ncores=${cores}  budget=${resolveShardBudget(cores, process.env.FEATHER_MAX_SHARDS)}\n`);
process.stdout.write('maps\\cores'.padEnd(11) + [1, 2, 4, 8, 16].map((c) => String(c).padStart(W)).join('') + '\n');
for (const maps of [1, 5, 10, 50]) {
  const row = [1, 2, 4, 8, 16].map((c) => {
    const plan = simulate(c, maps);
    const mb = plan.shards * SHARD_MB + maps * MAP_MB;
    const size = plan.sizes.length > 4 ? `${plan.shards}x` : plan.sizes.join('+');
    return `${size} ${(mb / 1024).toFixed(1)}GB`.padStart(W);
  });
  process.stdout.write(`maps=${String(maps).padEnd(6)}` + row.join('') + '\n');
}

if (failures > 0) {
  process.stdout.write(`\nshard policy checks failed: ${failures}\n`);
  process.exit(1);
}
process.stdout.write('\nshard policy checks passed\n');
