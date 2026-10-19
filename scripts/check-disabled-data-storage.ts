import assert from 'node:assert/strict';

import { DisabledDataStorage } from '../src/storage/disabled-data-storage';

async function main() {
  const storage = new DisabledDataStorage();
  await assert.rejects(
    storage.connect(),
    (error: Error & { msg?: string }) =>
      error.name === 'DataStorageNotConfiguredError' &&
      error.msg === '服主尚未配置 PostgreSQL，数据存储 API 不可用',
  );
  process.stdout.write('Disabled data storage checks passed.\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
