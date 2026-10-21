import assert from 'node:assert/strict';

import { createContentArenaSpec } from './runtime/content-arena';

function check(name: string, fn: () => void) {
  fn();
  console.log(`ok  ${name}`);
}

check('默认开启，64MB payload + 16384 槽位', () => {
  const spec = createContentArenaSpec({} as NodeJS.ProcessEnv)!;
  assert.ok(spec, 'arena must be on by default');
  assert.equal(spec.data.byteLength, 64 * 1024 * 1024);
  // 单槽 72 字节
  assert.equal(spec.index.byteLength, 16384 * 72);
  assert.ok(spec.control instanceof SharedArrayBuffer);
  assert.ok(spec.data instanceof SharedArrayBuffer);
  assert.ok(spec.index instanceof SharedArrayBuffer);
});

check('FEATHER_CONTENT_ARENA=off 时返回 undefined', () => {
  for (const value of ['off', '0', 'false', ' OFF ']) {
    assert.equal(
      createContentArenaSpec({ FEATHER_CONTENT_ARENA: value } as NodeJS.ProcessEnv),
      undefined,
      `value ${JSON.stringify(value)} must disable the arena`,
    );
  }
});

check('FEATHER_CONTENT_ARENA_MB 覆盖 payload 大小', () => {
  const spec = createContentArenaSpec({
    FEATHER_CONTENT_ARENA_MB: '8',
  } as NodeJS.ProcessEnv)!;
  assert.equal(spec.data.byteLength, 8 * 1024 * 1024);
});

check('FEATHER_CONTENT_ARENA_ENTRIES 覆盖槽位数', () => {
  const spec = createContentArenaSpec({
    FEATHER_CONTENT_ARENA_ENTRIES: '256',
  } as NodeJS.ProcessEnv)!;
  assert.equal(spec.index.byteLength, 256 * 72);
});

check('非法数值回落到默认值', () => {
  const spec = createContentArenaSpec({
    FEATHER_CONTENT_ARENA_MB: 'abc',
    FEATHER_CONTENT_ARENA_ENTRIES: '-5',
  } as NodeJS.ProcessEnv)!;
  assert.equal(spec.data.byteLength, 64 * 1024 * 1024);
  assert.equal(spec.index.byteLength, 16384 * 72);
});

console.log('content arena 配置: 5 组断言通过');
