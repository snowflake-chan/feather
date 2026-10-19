import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MuServer } from '@box/mudb/server';
import { GameConnectionState } from '../src/game-server-schema';
import { MessageInspector } from '../src/anticheat/message-inspector';
import { inputEvent, keyboardEvent } from '../src/anticheat/message-categories';
import { permittedCorrections } from '../src/anticheat/net-movement';
import { AnticheatHost } from '../src/anticheat/anticheat-host';

test('unjoined clients cannot bypass a live listener by sending business messages', () => {
  const server = new MuServer({} as any);
  const inspector = new MessageInspector(server, { connections: {}, clock: { tick: 1 } } as any);
  let observed = false;
  inspector.listen(() => { observed = true; });
  let allowed: boolean | undefined;
  server.messageGuard!({ sessionId: 'unjoined', protocol: 'game-chat', message: 'noticeMessage', data: { title: 'test', detail: '' }, unreliable: false },
    (decision) => { allowed = decision; });
  assert.equal(allowed, false, 'a business message without an authenticated player must not be dispatched');
  assert.equal(observed, false, 'no fake GamePlayer may be created to bypass authentication');
  server.messageGuard!({ sessionId: 'unjoined', protocol: 'game-net', message: 'join', data: undefined, unreliable: false },
    (decision) => { allowed = decision; });
  assert.equal(allowed, true, 'ordinary engine join/handshake must still run');
});

test('malformed classified packets are rejected rather than silently skipping listeners', () => {
  for (const [convert, message, data] of [
    [inputEvent, 'input', {}], [inputEvent, 'input', { tick: 1, input: null }],
    [keyboardEvent, 'sendKeyBoardEvent', {}],
    [keyboardEvent, 'sendKeyBoardEvent', { tick: 1, keyDownState: [], prevKeyDownState: null }],
  ] as const) {
    let rejected = false;
    convert({ protocol: 'game-net', message, data, context: { reject() { rejected = true; } } } as any);
    assert.equal(rejected, true, `${message}: invalid shape must not bypass its classified check`);
  }
});

test('unknown message identities do not become a fake known category', () => {
  const event: any = { protocol: 'attacker', message: 'input', data: { tick: 1, input: { inputState: 128 } }, context: { reject() {} } };
  assert.equal(inputEvent(event), undefined);
});

test('foreign player and non-finite corrections cannot mutate another player', () => {
  const position = { px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0 };
  const safe = permittedCorrections([{ ...position, id: 2 }, { ...position, id: 1, vx: Infinity }], 1);
  assert.equal(safe.length, 0);
});

test('shared object corrections cannot bypass own movement checks when no own body is present', () => {
  const position = { px: 999, py: 999, pz: 999, vx: 999, vy: 999, vz: 999 };
  assert.deepEqual(permittedCorrections([{ ...position, id: 37 }], 1), []);
  assert.deepEqual(permittedCorrections([{ ...position, id: 1 }, { ...position, id: 37 }], 1).map((body) => body.id), [1]);
});

test('replaced login identity cannot consume a pending approval even with the same connection object', () => {
  const server = new MuServer({} as any);
  const connection = { id: 1, state: GameConnectionState.CONNECTED, sessionData: { user: { id: 'player-A' } } };
  const inspector = new MessageInspector(server, { connections: { peer: connection }, clock: { tick: 1 } } as any);
  let request = 0;
  inspector.listen((handle) => { request = handle; });
  let allowed: boolean | undefined;
  server.messageGuard!({ sessionId: 'peer', protocol: 'gui', message: 'sendMessage', data: { name: 'button', payload: '{}' }, unreliable: false },
    (decision) => { allowed = decision; });
  connection.sessionData.user.id = 'player-B';
  inspector.decide(request, 1, true);
  assert.equal(allowed, false);
  inspector.listen();
});

function hostFixture() {
  let running = true;
  let handlers: any;
  const game = new MuServer({} as any);
  const state: any = { connections: { peer: { id: 1, state: GameConnectionState.CONNECTED } }, clock: { tick: 1 } };
  const trusted: any = { sessionId: 'script', message: { clientMessage() {}, movement() {} } };
  const host = new (AnticheatHost as any)({ protocol: () => ({ configure: (value: any) => { handlers = value; } }) }, game, state,
    (id: string) => running && id === 'script', (id: string) => id === 'script');
  const inspect = () => {
    let allowed: boolean | undefined;
    if (game.messageGuard) game.messageGuard({ sessionId: 'peer', protocol: 'gui', message: 'sendMessage', data: { name: 'button', payload: '{}' }, unreliable: false },
      (value) => { allowed = value; });
    else allowed = true;
    return allowed;
  };
  return { host, handlers, trusted, game, inspect, running: (value: boolean) => { running = value; } };
}

test('script termination does not silently remove an armed message check', () => {
  const fixture = hostFixture();
  fixture.handlers.message.listenMessages(fixture.trusted, true);
  fixture.running(false);
  fixture.host.reset();
  assert.equal(fixture.inspect(), false, 'a missing anticheat worker must not create a fail-open window');
});

test('listener registration during script initialization is not lost before RUNNING', () => {
  const fixture = hostFixture();
  fixture.running(false);
  fixture.handlers.message.listenMessages(fixture.trusted, true);
  fixture.running(true);
  fixture.host.running?.();
  assert.ok(fixture.game.messageGuard, 'trusted startup subscription must survive transition to RUNNING');
  fixture.host.reset();
});

test('an input-only subscription does not delay unrelated GUI replies and network maintenance', () => {
  const fixture = hostFixture();
  fixture.handlers.message.listenMessages(fixture.trusted, 2);
  for (const [protocol, message, data] of [['gui', 'return', { handle: 1, value: 'value' }], ['game-net', 'acknowledge', 1]] as const) {
    let allowed: boolean | undefined;
    fixture.game.messageGuard!({ sessionId: 'peer', protocol, message, data, unreliable: false }, (value) => { allowed = value; });
    assert.equal(allowed, true, 'unrelated traffic must not consume the input inspection queue');
  }
  fixture.host.reset();
});

test('foreign script peers cannot disable listeners or approve another peer pending request', () => {
  const fixture = hostFixture();
  let request: any;
  fixture.trusted.message.clientMessage = (value: any) => { request = value; };
  fixture.handlers.message.listenMessages(fixture.trusted, 1);
  let allowed: boolean | undefined;
  fixture.game.messageGuard!({ sessionId: 'peer', protocol: 'gui', message: 'sendMessage', data: { name: 'button', payload: '{}' }, unreliable: false },
    (value) => { allowed = value; });
  const foreign = { sessionId: 'foreign-script' };
  fixture.handlers.message.listenMessages(foreign, 0);
  fixture.handlers.message.messageDecision(foreign, { handle: request.handle, playerId: 1, allow: true });
  assert.equal(allowed, undefined);
  assert.ok(fixture.game.messageGuard);
  fixture.handlers.message.messageDecision(fixture.trusted, { handle: request.handle, playerId: 2, allow: true });
  assert.equal(allowed, undefined);
  fixture.handlers.message.messageDecision(fixture.trusted, { handle: request.handle, playerId: 1, allow: false });
  assert.equal(allowed, false);
  fixture.host.reset();
});

test('reloading an initialized script without listeners can deliberately exit recovery mode', () => {
  const fixture = hostFixture();
  fixture.handlers.message.listenMessages(fixture.trusted, 1);
  fixture.host.reset(); fixture.running(false);
  fixture.handlers.message.listenMessages(fixture.trusted, 0);
  assert.equal(fixture.inspect(), false, 'old protection stays armed until initialization completes');
  fixture.handlers.message.initialized(fixture.trusted);
  fixture.running(true); fixture.host.running();
  assert.equal(fixture.game.messageGuard, undefined);
});
