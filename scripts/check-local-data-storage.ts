import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { LocalDataStorage } from '../src/storage/local-data-storage';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'box-local-storage-test-'));
const logger = { log() {}, error() {} } as any;

async function create(projectNamespace = 'project-a') {
  const storage = new LocalDataStorage({
    storagePath: root,
    projectNamespace,
    groupNamespace: 'global',
    mode: 'play',
    lockTimeoutMs: 2000,
    logger,
  });
  await storage.connect();
  return storage;
}

async function main() {
  let storage = await create();
  await storage.set('project', 'player', 'alice', { score: 3 });
  assert.deepEqual((await storage.get('project', 'player', 'alice'))?.value, { score: 3 });

  const before = await storage.get('project', 'player', 'alice', undefined, 'ticket-1');
  await storage.set('project', 'player', 'alice', { score: 7 }, 'ticket-1');
  assert.deepEqual((await storage.get('project', 'player', 'alice', before?.version))?.value, { score: 3 });
  assert.equal(await storage.increment('project', 'counter', 'visits', 2), 2);
  assert.equal(await storage.increment('project', 'counter', 'visits', 5), 7);

  await storage.set('project', 'rank', 'low', { score: 1 });
  await storage.set('project', 'rank', 'high', { score: 10 });
  const page = await storage.list('project', 'rank', { cursor: 0, pageSize: 1, ascending: false, constraintTarget: 'score' });
  assert.equal(page.items[0].key, 'high');
  assert.equal(page.isLastPage, false);

  await storage.set('group', 'shared', 'alice', 'group-value');
  assert.equal(await storage.get('project', 'shared', 'alice'), undefined);
  assert.equal((await storage.get('group', 'shared', 'alice'))?.value, 'group-value');

  const otherProject = await create('project-b');
  assert.equal(
    await otherProject.get('project', 'counter', 'visits'),
    undefined,
    'getDataStorage must be isolated by project',
  );
  assert.equal(
    (await otherProject.get('group', 'shared', 'alice'))?.value,
    'group-value',
    'getGroupStorage must be shared by all projects',
  );
  await otherProject.close();
  assert.equal((await storage.remove('project', 'player', 'alice'))?.key, 'alice');
  assert.equal(await storage.get('project', 'player', 'alice'), undefined);
  await storage.close();

  storage = await create();
  assert.equal((await storage.get('project', 'counter', 'visits'))?.value, 7);
  assert.equal((await storage.get('group', 'shared', 'alice'))?.value, 'group-value');
  await storage.close();
  fs.rmSync(root, { recursive: true, force: true });
  process.stdout.write('Local data storage checks passed.\n');
}

main().catch((error) => {
  fs.rmSync(root, { recursive: true, force: true });
  console.error(error);
  process.exitCode = 1;
});
