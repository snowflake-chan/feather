import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MuReadStream } from '@box/mudb/stream';
import { NetSecretSchema, NetMessageType } from '@box/schema/net/net-schema';
import { GameConnectionSchema } from '../src/game-server-schema';
import { synchronizeClientSecrets } from '../src/net/net-state-operations';

function fixture() {
  const alice = GameConnectionSchema.alloc(), bob = GameConnectionSchema.alloc();
  alice.id = 1; alice.sessionData.user.id = 'test-user-a'; alice.sessionData.name = 'Alice';
  bob.id = 2; bob.sessionData.user.id = 'test-user-b'; bob.sessionData.name = 'Bob';
  const state: any = { connections: { alice, bob }, secrets: [], bodies: [] };
  const packets = { alice: [] as Uint8Array[], bob: [] as Uint8Array[] };
  const clients = {
    alice: { sendRaw: (data: Uint8Array) => packets.alice.push(new Uint8Array(data)) },
    bob: { sendRaw: (data: Uint8Array) => packets.bob.push(new Uint8Array(data)) },
    absent: { sendRaw: () => assert.fail('a missing connection must not receive a secret') },
  };
  return { alice, bob, state, packets, clients };
}

function decode(bytes: Uint8Array) {
  const stream = new MuReadStream(bytes);
  assert.equal(stream.readVarint(), NetMessageType.SECRET);
  return NetSecretSchema.patch(NetSecretSchema.identity, stream);
}

test('secret packets use the real codec and target only the corresponding connection', () => {
  const f = fixture(); synchronizeClientSecrets(f.state, f.clients);
  const alice = decode(f.packets.alice[0]), bob = decode(f.packets.bob[0]);
  assert.equal(alice.id, 1); assert.equal(alice.userId, 'test-user-a');
  assert.equal(bob.id, 2); assert.equal(bob.userId, 'test-user-b');
  NetSecretSchema.free(alice); NetSecretSchema.free(bob);
});

test('unchanged secrets are not resent and one peer update does not resend another peer state', () => {
  const f = fixture();
  synchronizeClientSecrets(f.state, f.clients);
  synchronizeClientSecrets(f.state, f.clients);
  assert.equal(f.packets.alice.length, 1); assert.equal(f.packets.bob.length, 1);
  f.alice.sessionData.name = 'Alice updated';
  synchronizeClientSecrets(f.state, f.clients);
  assert.equal(f.packets.alice.length, 2); assert.equal(f.packets.bob.length, 1);
  const updated = decode(f.packets.alice[1]);
  assert.equal(updated.userName, 'Alice updated'); NetSecretSchema.free(updated);
});

test('transport failure does not advance the last-sent snapshot before successful send', () => {
  const f = fixture();
  const before = NetSecretSchema.clone(f.alice.net.lastSentSecret);
  assert.throws(() => synchronizeClientSecrets(f.state, {
    alice: { sendRaw() { throw new Error('test transport failure'); } },
  }), /test transport failure/);
  assert.deepEqual(f.alice.net.lastSentSecret, before);
  NetSecretSchema.free(before);
});
