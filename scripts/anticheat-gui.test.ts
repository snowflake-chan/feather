import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GUIServer } from '../src/gui/gui-server';
import { GameConnectionState } from '../src/game-server-schema';

function fixture() {
  let gameHandlers: any; let scriptHandlers: any;
  const delivered: any[] = [];
  const requests: any[] = [];
  const alice: any = { sessionId: 'alice', message: { getAttribute: (data: any) => requests.push({ ...data }) } };
  const bob: any = { sessionId: 'bob', message: { getAttribute: (data: any) => requests.push({ ...data }) } };
  const script: any = { sessionId: 'script', message: { return: (data: any) => delivered.push({ ...data }), throw: (data: any) => delivered.push({ ...data }) } };
  const connections: any = { alice: { id: 1, sessionId: 'alice', state: GameConnectionState.CONNECTED }, bob: { id: 2, sessionId: 'bob', state: GameConnectionState.CONNECTED } };
  const scriptClients: any = { script };
  const gui = new GUIServer({
    state: { connections, connectionSet: Object.values(connections) } as any,
    server: { protocol: () => ({ configure: (value: any) => { gameHandlers = value.message; }, clients: { alice, bob }, broadcast: { reset() {} } }) } as any,
    scriptServer: { protocol: () => ({ configure: (value: any) => { scriptHandlers = value.message; }, clients: scriptClients,
      broadcast: { return: (data: any) => delivered.push({ ...data }), throw: (data: any) => delivered.push({ ...data }) } }) } as any,
  });
  return { gui, gameHandlers, scriptHandlers, delivered, requests, alice, bob, script, scriptClients };
}

test('a player cannot forge another player GUI attribute reply', () => {
  const f = fixture();
  f.scriptHandlers.getAttribute(f.script, { id: 2, handle: 9, selector: '#score', name: 'value' });
  assert.equal(f.requests.length, 1);
  const handle = f.requests[0].handle;
  f.gameHandlers.return(f.alice, { handle, value: 'forged' });
  assert.equal(f.delivered.length, 0, 'reply ownership must be enforced independently of optional anticheat listeners');
  f.gameHandlers.return(f.bob, { handle, value: 'valid' });
  assert.deepEqual(f.delivered, [{ handle: 9, value: 'valid' }]);
  f.gameHandlers.return(f.bob, { handle, value: 'replay' });
  assert.equal(f.delivered.length, 1);
  void f.gui.reset();
});

test('old GUI replies cannot target a new script with recycled private handles', () => {
  const f = fixture();
  f.scriptHandlers.getAttribute(f.script, { id: 2, handle: 0, selector: '#score', name: 'value' });
  const oldHandle = f.requests[0].handle;
  const fresh: any = { sessionId: 'new-script', message: f.script.message };
  delete f.scriptClients.script;
  f.scriptClients['new-script'] = fresh;
  f.scriptHandlers.getAttribute(fresh, { id: 2, handle: 0, selector: '#score', name: 'value' });
  assert.notEqual(f.requests[1].handle, oldHandle, 'public reply handles must not reset with script-local counters');
  f.gameHandlers.return(f.bob, { handle: oldHandle, value: 'old' });
  assert.equal(f.delivered.length, 0);
  f.gameHandlers.return(f.bob, { handle: f.requests[1].handle, value: 'new' });
  assert.deepEqual(f.delivered, [{ handle: 0, value: 'new' }]);
  void f.gui.reset();
});

test('GUI custom events do not reach script business handlers before the player joins', () => {
  let gameHandlers: any;
  const delivered: unknown[] = [];
  const state: any = { connections: { pending: { id: 0, state: GameConnectionState.PENDING } } };
  new GUIServer({ state,
    server: { protocol: () => ({ configure: (spec: any) => { gameHandlers = spec.message; } }) } as any,
    scriptServer: { protocol: () => ({ configure() {}, broadcast: { sendMessage: (value: unknown) => delivered.push(value) } }) } as any,
  });
  gameHandlers.sendMessage({ sessionId: 'pending' }, { name: 'button', payload: '{}' });
  assert.equal(delivered.length, 0);
});
