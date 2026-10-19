import assert from 'node:assert/strict';
import { test } from 'node:test';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AnticheatAudit, auditRejection } from '../src/anticheat/audit';
import { MessageInspector } from '../src/anticheat/message-inspector';
import { GameConnectionState } from '../src/game-server-schema';
import { MessageGate } from '../src/anticheat/message-gate';

test('rejection identity and evidence come from authenticated connection; client secrets are never persisted', () => {
  const server: any = {};
  const records: any[] = [];
  const state: any = { clock: { tick: 5 }, connections: { session: {
    id: 1, state: GameConnectionState.CONNECTED, sessionData: { user: { id: 'trusted-user', displayname: 'Alice' } },
  } } };
  const inspector = new MessageInspector(server, state, value => records.push(value));
  let handle = 0, allowed: boolean | undefined;
  inspector.listen(value => { handle = value; });
  server.messageGuard({ sessionId: 'session', protocol: 'gui', message: 'sendMessage', unreliable: false,
    data: { userId: 'forged-user', password: 'secret-value', payload: 'private-message' } }, value => { allowed = value; });
  inspector.decide(handle, 1, false, 'weapon-cooldown');
  assert.equal(allowed, false);
  assert.equal(records.length, 1);
  assert.equal(records[0].userId, 'trusted-user');
  assert.equal(records[0].name, 'Alice');
  assert.equal(records[0].reason, 'weapon-cooldown');
  assert.equal(records[0].classification, 'suspected-anomaly');
  assert.ok(!/forged-user|secret-value|private-message/.test(JSON.stringify(records)));
  server.messageGuard({ sessionId: 'session', protocol: 'gui', message: 'sendMessage', data: {} }, () => {});
  inspector.decide(handle, 1, true);
  assert.equal(records.length, 1, 'allowed messages do not produce rejection records');
});

test('worker reset is an inspection failure, not evidence of cheating', () => {
  const gate = new MessageGate();
  let record: any;
  gate.submit(1, () => {}, (_allow, reason) => {
    record = auditRejection({ playerId: 1, userId: 'A', name: null }, 'message', reason);
  });
  gate.reset();
  assert.equal(record.reason, 'script-restart');
  assert.equal(record.classification, 'inspection-failure');
  assert.equal(auditRejection({ playerId: 1, userId: 'A', name: null }, 'message', 'x\n'.repeat(100)).reason.length, 128);
});

test('local audit survives writer recreation, rotates within storage limits, and bounds a flood', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'anticheat-audit-'));
  const reports: string[] = [];
  try {
    const writer = new AnticheatAudit(root, '../../map', value => reports.push(value), 300, 3);
    for (let i = 0; i < 200; i++) writer.record({ index: i, reason: 'test-rule', padding: 'x'.repeat(90) });
    await writer.flush();
    const directories = await fs.readdir(root);
    assert.equal(directories.length, 1);
    assert.match(directories[0], /^[a-f0-9]{24}$/);
    const directory = path.join(root, directories[0]);
    let files = await fs.readdir(directory);
    assert.ok(files.length <= 3);
    for (const file of files) {
      assert.ok((await fs.stat(path.join(directory, file))).size <= 300);
      for (const line of (await fs.readFile(path.join(directory, file), 'utf8')).trim().split('\n')) JSON.parse(line);
    }
    assert.ok(reports.some(value => /omitted/.test(value)));
    const replacement = new AnticheatAudit(root, '../../map', value => reports.push(value), 300, 3);
    replacement.record({ reason: 'after-restart' });
    await replacement.flush();
    files = await fs.readdir(directory);
    assert.ok(files.length <= 3);
    assert.ok((await Promise.all(files.map(file => fs.readFile(path.join(directory, file), 'utf8')))).some(text => text.includes('after-restart')));
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('audit storage failure is visible and does not throw into the game tick', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'anticheat-audit-error-'));
  try {
    const file = path.join(root, 'file'); await fs.writeFile(file, 'not a directory');
    const reports: string[] = [];
    const writer = new AnticheatAudit(file, 'map', value => reports.push(value));
    assert.doesNotThrow(() => writer.record({ reason: 'test' }));
    await writer.flush();
    assert.ok(reports.some(value => /write failed/.test(value)));
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
