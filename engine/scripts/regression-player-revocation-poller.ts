import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { startPlayerRevocationPoller } from '../src/player/player-revocation-poller';
const WebSocket = require('ws');
const subjectId = 'daf88e0865a546b39018906fd6aa0ee1';
const kicked: string[] = [], messages: string[] = [], requests: any[] = [];
const event = (id: string) => ({ id, subjectId, reason: 'banned', createdAt: new Date().toISOString() });
const game = {
  state: { connectionSet: [
    { sessionId: 'matching-session', sessionData: { fingerPrint: subjectId } },
    { sessionId: 'other-session', sessionData: { fingerPrint: '11111111111111111111111111111111' } },
  ] },
  net: { kickSession(id: string) { kicked.push(id); } },
};
const logger = { info(message: string) { messages.push(message); }, warn(message: string) { messages.push(message); } };
async function waitFor(check: () => boolean) {
  for (let i = 0; i < 300 && !check(); i++) await new Promise(resolve => setTimeout(resolve, 10));
  assert.ok(check(), messages.join('\n'));
}
async function main() {
  let current: any;
  const server = createServer(async (req, res) => {
    assert.equal(req.url, '/api/realtime/session');
    assert.equal(req.method, 'POST');
    assert.equal(req.headers.authorization, 'Bearer regression-secret');
    let body = ''; for await (const chunk of req) body += chunk;
    const data = JSON.parse(body); requests.push(data);
    assert.equal(data.kind, 'revocations');
    assert.ok(Date.now() - Date.parse(data.since) >= 2 * 60_000);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ticket: 'one-use-fixture', socketPath: '/api/realtime/socket' }));
  });
  const wss = new WebSocket.Server({ server, path: '/api/realtime/socket' });
  wss.on('connection', ws => {
    current = ws;
    ws.once('message', bytes => {
      assert.deepEqual(JSON.parse(String(bytes)), { type: 'connect', ticket: 'one-use-fixture' });
      ws.send(JSON.stringify({ type: 'ready' }));
      ws.send(JSON.stringify({ type: 'revocations', cursor: '41', events: [event('41')] }));
    });
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  process.env.BOX_PLAYER_SERVICE_INTERNAL_URL = `http://127.0.0.1:${(server.address() as any).port}`;
  process.env.PERMISSION_TOKEN_SECRET = 'regression-secret';
  delete process.env.BOX_WORLD_PERMANENT_MAP_ID;
  const stop = startPlayerRevocationPoller(game as never, logger as never);
  try {
    await waitFor(() => kicked.length === 1);
    assert.deepEqual(kicked, ['matching-session']);
    current.send(JSON.stringify({ type: 'revocations', cursor: '41', events: [event('40'), event('41')] }));
    await waitFor(() => kicked.length === 2);
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(requests.length, 1, 'idle runtime must not poll HTTP');
    current.close(); await waitFor(() => requests.length === 2);
    assert.equal(requests[1].after, '41');
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(kicked.length, 2, 'reconnect replay must deduplicate events');
    assert.ok(messages.some(message => message.includes(subjectId)));
    console.log('player revocation WebSocket regression passed: identity filtering, late commit, deduplication, reconnect, no idle polling');
  } finally {
    stop(); for (const ws of wss.clients) ws.terminate();
    await new Promise<void>(resolve => wss.close(() => server.close(() => resolve())));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
