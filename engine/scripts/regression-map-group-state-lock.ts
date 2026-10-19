import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { persistLocalProjectState } from '../src/project/local-project-state';

const ENVIRONMENT_KEYS = [
  'BOX_PROJECT_STATE_PATH',
  'BOX_GROUP_PROJECT_STATE_PATH',
  'BOX_GROUP_CONTENT_PATH',
  'BOX_GROUP_STATE_LOCK_TIMEOUT_MS',
  'BOX_GROUP_STATE_LOCK_STALE_MS',
] as const;

function withEnvironment(run: (root: string) => void) {
  const previous = Object.fromEntries(
    ENVIRONMENT_KEYS.map((key) => [key, process.env[key]]),
  );
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'box-group-state-lock-'));
  process.env.BOX_PROJECT_STATE_PATH = path.join(
    root,
    'member',
    'project-state.json',
  );
  process.env.BOX_GROUP_PROJECT_STATE_PATH = path.join(root, 'group-state.json');
  process.env.BOX_GROUP_CONTENT_PATH = path.join(root, 'group-blobs');
  process.env.BOX_GROUP_STATE_LOCK_TIMEOUT_MS = '100';
  process.env.BOX_GROUP_STATE_LOCK_STALE_MS = '1000';
  try {
    run(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    for (const key of ENVIRONMENT_KEYS) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function testBlobCopyDoesNotHoldStateLock() {
  withEnvironment(() => {
    const statePath = process.env.BOX_PROJECT_STATE_PATH!;
    const sourceBlobRoot = path.join(path.dirname(statePath), 'blobs');
    const lockPath = `${process.env.BOX_GROUP_PROJECT_STATE_PATH}.lock`;
    fs.mkdirSync(sourceBlobRoot, { recursive: true });
    fs.writeFileSync(path.join(sourceBlobRoot, 'QmRegression'), 'blob');

    const originalCopyFileSync = fs.copyFileSync;
    let copiedWhileLocked = false;
    fs.copyFileSync = ((...parameters: Parameters<typeof fs.copyFileSync>) => {
      copiedWhileLocked ||= fs.existsSync(lockPath);
      return originalCopyFileSync(...parameters);
    }) as typeof fs.copyFileSync;
    try {
      persistLocalProjectState('permission', 'extra-project');
    } finally {
      fs.copyFileSync = originalCopyFileSync;
    }

    assert.equal(
      copiedWhileLocked,
      false,
      'content blob copies must complete before the map group state lock is acquired',
    );
  });
}

function testDeadOwnerLockIsRecovered() {
  withEnvironment(() => {
    const lockPath = `${process.env.BOX_GROUP_PROJECT_STATE_PATH}.lock`;
    fs.writeFileSync(
      lockPath,
      JSON.stringify({
        formatVersion: 1,
        pid: 2_147_483_647,
        hostname: os.hostname(),
        token: 'dead-owner',
        createdAt: new Date().toISOString(),
      }),
    );

    const startedAt = Date.now();
    persistLocalProjectState('permission', 'extra-project');
    assert.ok(Date.now() - startedAt < 1000, 'dead lock recovery should not wait for timeout');
    assert.equal(fs.existsSync(lockPath), false);
  });
}

function testLiveOwnerLockIsNotStolen() {
  withEnvironment(() => {
    const lockPath = `${process.env.BOX_GROUP_PROJECT_STATE_PATH}.lock`;
    fs.writeFileSync(
      lockPath,
      JSON.stringify({
        formatVersion: 1,
        pid: process.pid,
        hostname: os.hostname(),
        token: 'live-owner',
        createdAt: new Date().toISOString(),
      }),
    );

    assert.throws(
      () => persistLocalProjectState('permission', 'extra-project'),
      /timed out waiting for map group state lock.*live-owner/u,
    );
    assert.equal(fs.existsSync(lockPath), true);
  });
}

function testLegacyExpiredLockIsRecovered() {
  withEnvironment(() => {
    process.env.BOX_GROUP_STATE_LOCK_STALE_MS = '1000';
    const lockPath = `${process.env.BOX_GROUP_PROJECT_STATE_PATH}.lock`;
    fs.writeFileSync(lockPath, '');
    const expired = new Date(Date.now() - 10_000);
    fs.utimesSync(lockPath, expired, expired);

    persistLocalProjectState('permission', 'extra-project');
    assert.equal(fs.existsSync(lockPath), false);
  });
}

testBlobCopyDoesNotHoldStateLock();
testDeadOwnerLockIsRecovered();
testLiveOwnerLockIsNotStolen();
testLegacyExpiredLockIsRecovered();
console.log('map group state lock regression passed');
