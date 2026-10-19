import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { SqliteDataStorage } from '../src/storage/sqlite-data-storage';

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-sqlite-'));
  const storage = new SqliteDataStorage({
    path: path.join(dir, 'data.sqlite'),
    projectNamespace: 'project',
    groupNamespace: 'group',
    mode: 'play',
    lockTimeoutMs: 1000,
    logger: console as any,
  });

  await storage.connect();
  await storage.createTable('project', 'test');

  await storage.set('project', 'test', 'a', { n: 1 });
  const first = await storage.get('project', 'test', 'a');
  assert.equal((first?.value as any).n, 1);

  await storage.set('project', 'test', 'count', 1);
  const incremented = await storage.increment('project', 'test', 'count', 2);
  assert.equal(incremented, 3);

  const listed = await storage.list('project', 'test', {
    pageSize: 10,
    cursor: 0,
  } as any);
  assert.equal(listed.items.length, 2);

  const historical = await storage.get('project', 'test', 'a', first!.version);
  assert.equal((historical?.value as any).n, 1);

  const removed = await storage.remove('project', 'test', 'a');
  assert.equal((removed?.value as any).n, 1);
  assert.equal(await storage.get('project', 'test', 'a'), undefined);

  await storage.dropTable('project', 'test');
  await storage.close();
  fs.rmSync(dir, { recursive: true, force: true });
  process.stdout.write('SQLite data storage checks passed.\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
