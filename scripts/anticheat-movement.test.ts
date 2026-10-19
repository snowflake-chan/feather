import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NetClientInputSchema, NetInputSchema, NetPositionCorrectionSchema, TaggedNetClientInputSchema } from '@box/schema/net/net-schema';
import { RigidBodySchema, RigidBodyFlags } from '@box/schema/physics/physics-schema';
import { GameConnectionSchema, GameConnectionState } from '../src/game-server-schema';
import { NetServerStateSchema } from '../src/net/net-server-state';
import { permittedCorrections, queueMovementCorrection } from '../src/anticheat/net-movement';
import { setMovementInspector } from '../src/anticheat/movement-inspector';
import { synchronizeNetClientInput } from '../src/net/net-server-controller';
import { TimestampedClientInputSchema } from '@box/schema/net/net-schema';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';

function fixture(listening = true) {
  const connection = GameConnectionSchema.alloc();
  connection.id = 1; connection.state = GameConnectionState.CONNECTED; connection.sessionData.user.id = 'A';
  const body = RigidBodySchema.alloc(); body.id = 1; body.flags = 0;
  const net = NetServerStateSchema.alloc(); net.inputs.push(NetInputSchema.alloc());
  const entry = TaggedNetClientInputSchema.alloc(); entry.id = 1; entry.input.inputState = 8;
  net.inputs[0].clients.push(entry);
  const state: any = { connections: { peer: connection }, bodies: [body], players: [], net, clock: { tick: 0 } };
  let decide: (allow: boolean) => void = () => {};
  if (listening) setMovementInspector(state, (_sample, complete) => { decide = complete; return true; });
  const submit = () => {
    const input = NetClientInputSchema.alloc();
    const candidate = NetPositionCorrectionSchema.alloc(); candidate.id = 1; candidate.px = 5; candidate.vx = 1;
    input.bodies.push(candidate);
    assert.equal(queueMovementCorrection(state, 'peer', 0, 0, input), true);
    candidate.px = 999;
    NetClientInputSchema.free(input);
  };
  return { state, connection, body, entry, submit, decide: (allow: boolean) => decide(allow) };
}

test('movement rejection keeps controls and does not apply a position or velocity correction', () => {
  const f = fixture(); f.submit(); f.decide(false);
  assert.equal(f.entry.input.inputState, 8);
  assert.equal(f.entry.input.bodies.length, 0);
  assert.equal(f.body.px, 0);
});

test('duplicate own corrections survive the wire codec but never reach application or movement approval', () => {
  for (const listening of [true, false]) {
    const f = fixture(false); let inspections = 0;
    if (listening) setMovementInspector(f.state, (_sample, complete) => {
      inspections++; complete(true); return true;
    });
    const packet = TimestampedClientInputSchema.alloc(); packet.input.inputState = 8;
    for (const x of [1, 999]) {
      const candidate = NetPositionCorrectionSchema.alloc(); candidate.id = 1; candidate.px = x;
      packet.input.bodies.push(candidate);
    }
    const stream = new MuWriteStream(1024);
    TimestampedClientInputSchema.diff(TimestampedClientInputSchema.identity, packet, stream);
    const decoded = TimestampedClientInputSchema.patch(TimestampedClientInputSchema.identity, new MuReadStream(stream.bytes()));
    try {
      assert.equal(decoded.input.bodies.length, 2, 'test must actually reproduce duplicate IDs on the wire');
      synchronizeNetClientInput(f.state, 'peer', decoded, { warn() {} } as any);
      assert.equal(f.entry.input.bodies.length, 0, 'duplicates must not apply even without a map listener');
      assert.equal(inspections, 0, 'do not approve a different correction set than the inspected candidate');
      assert.equal(f.entry.input.inputState, 8, 'invalid correction must not discard ordinary controls');
    } finally {
      TimestampedClientInputSchema.free(packet); TimestampedClientInputSchema.free(decoded); stream.destroy();
    }
  }
});

test('direct movement queue cannot approve an unchecked second own correction', () => {
  const f = fixture();
  const input = NetClientInputSchema.alloc();
  for (const x of [1, 999]) {
    const candidate = NetPositionCorrectionSchema.alloc(); candidate.id = 1; candidate.px = x;
    input.bodies.push(candidate);
  }
  try {
    assert.equal(queueMovementCorrection(f.state, 'peer', 0, 0, input), false);
    f.decide(true);
    assert.equal(f.entry.input.bodies.length, 0);
  } finally { NetClientInputSchema.free(input); }
});

test('normalization rejects duplicate IDs regardless of order or validity and preserves a single own candidate', () => {
  const own = { id: 1, px: 1, py: 0, pz: 0, vx: 0, vy: 0, vz: 0 };
  for (const other of [{ ...own, px: 999 }, { ...own, vx: Infinity }]) {
    assert.deepEqual(permittedCorrections([own, other], 1), []);
    assert.deepEqual(permittedCorrections([other, own], 1), []);
  }
  assert.deepEqual(permittedCorrections([{ ...own, id: 2 }, own], 1), [own]);
});

test('approved movement uses its owned snapshot rather than a reused network message object', () => {
  const f = fixture(); f.submit(); f.decide(true);
  assert.equal(f.entry.input.bodies[0].px, 5);
  assert.equal(f.entry.input.bodies[0].vx, 1);
  assert.equal(f.entry.input.inputState, 8);
});

test('pause, server locks, expired rewind ticks and replaced players invalidate pending corrections', () => {
  for (const invalidate of [
    (f: ReturnType<typeof fixture>) => { f.connection.net.inputPauseCounter++; },
    (f: ReturnType<typeof fixture>) => { f.body.flags |= RigidBodyFlags.LOCKED; },
    (f: ReturnType<typeof fixture>) => { f.state.net.oldestTick = 1; },
    (f: ReturnType<typeof fixture>) => { f.state.connections.peer = null; },
  ]) {
    const f = fixture(); f.submit(); invalidate(f); f.decide(true);
    assert.equal(f.entry.input.bodies.length, 0);
  }
});
