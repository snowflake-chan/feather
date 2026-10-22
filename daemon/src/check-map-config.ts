import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { EngineConfig } from 'feather-engine/contract';

import type { MapSpec } from './contract';
import { buildMapConfig, resolveScriptMemoryLimitMb } from './runtime/config';

/** 纯逻辑校验：单图内存上限的解析规则，不需要内容包。 */

let failures = 0;

function check(label: string, condition: boolean, detail: string) {
  if (condition) return;
  failures++;
  process.stdout.write(`FAIL ${label}: ${detail}\n`);
}

const base = (value?: number) => ({ SCRIPT_MEMORY_LIMIT: value }) as unknown as EngineConfig;
const spec = (memoryMb?: number) => ({ id: 'm', limits: memoryMb === undefined ? undefined : { memoryMb } }) as MapSpec;

check('无覆盖时取全局', resolveScriptMemoryLimitMb(spec(), base(512)) === 512, 'expected 512');
check('per-map 覆盖全局', resolveScriptMemoryLimitMb(spec(128), base(512)) === 128, 'expected 128');
check('全局也没有则不限制', resolveScriptMemoryLimitMb(spec(), base(undefined)) === undefined, 'expected undefined');
check('0 视为不限制', resolveScriptMemoryLimitMb(spec(0), base(512)) === undefined, 'expected undefined');
check('负数视为不限制', resolveScriptMemoryLimitMb(spec(-1), base(512)) === undefined, 'expected undefined');
check('小数向下取整', resolveScriptMemoryLimitMb(spec(127.9), base()) === 127, 'expected 127');

// redis 必须被钉死：engine 读 REDIS_HOST 时 process.env 优先于本地配置文件，
// 环境里残留一个值就会给每张图静默开两个 ioredis 连接。
{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-map-config-'));
  try {
    const built = buildMapConfig(
      { ...base(undefined), REDIS_HOST: 'leaked-from-env' } as unknown as EngineConfig,
      spec(),
      root,
    );
    check(
      'buildMapConfig 清掉继承来的 REDIS_HOST',
      built.REDIS_HOST === '',
      `got ${JSON.stringify(built.REDIS_HOST)}`,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

if (failures > 0) {
  process.stdout.write(`map config checks failed: ${failures}\n`);
  process.exit(1);
}
process.stdout.write('map config checks passed\n');
