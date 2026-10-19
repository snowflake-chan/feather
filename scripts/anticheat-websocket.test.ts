import assert from 'node:assert/strict';
import { test } from 'node:test';
import http from 'node:http';
import WebSocket from 'ws';
import { MuWebSocketServer } from '@box/mudb/socket/web/server';
import { MuWebSocket } from '@box/mudb/socket/web/client';
import { MuSessionProof } from '@box/mudb/socket/web/session-proof';
import { parse } from 'node:url';

test('knowing another connection ID cannot attach a socket that inherits its identity', { timeout: 5000 }, async () => {
  const httpServer = http.createServer();
  const sockets: WebSocket[] = [];
  const received: Array<{ sender: string; message: string }> = [];
  const server: any = new MuWebSocketServer({ server: httpServer, requireSessionProof: true } as any);
  await new Promise<void>((resolve) => server.start({ ready: resolve,
    connection: (client: any) => client.open({ ready() {}, close() {},
      message: (data: unknown) => received.push({ sender: client.sessionId, message: String(data) }) }), close() {},
  }));
  await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  const port = (httpServer.address() as any).port;
  const connect = async (id: string, proof?: string) => {
    const query = new URLSearchParams({ sid: id });
    const socket = new WebSocket(`ws://127.0.0.1:${port}/?${query}`, proof ? ['box3-game', `box3-proof.${proof}`] : undefined);
    sockets.push(socket);
    const hello = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('WebSocket handshake timed out')), 1000);
      socket.once('message', (data) => { clearTimeout(timeout); resolve(JSON.parse(String(data))); });
      socket.once('close', () => { clearTimeout(timeout); resolve(undefined); });
      socket.once('error', () => { clearTimeout(timeout); resolve(undefined); });
    });
    return { socket, hello };
  };
  try {
    const proof = server.issueSessionProof?.('victim') || 'fixture-proof';
    const victim = await connect('victim', proof);
    assert.equal(victim.hello?.reliable, true);
    const intruder = await connect('victim');
    assert.equal(intruder.hello, undefined, 'secondary connection must prove ownership, not just supply a session ID');
    const forged = await connect('victim', 'invalid-proof');
    assert.equal(forged.hello, undefined);
    const other = server.issueSessionProof?.('different-player') || 'different-proof';
    assert.equal((await connect('victim', other)).hello, undefined);
    const secondary = await connect('victim', proof);
    assert.equal(secondary.hello?.reliable, false, 'legitimate multi-socket clients must keep working');
    secondary.socket.send('legitimate-secondary');
    await new Promise((resolve) => setTimeout(resolve, 15));
    assert.deepEqual(received, [{ sender: 'victim', message: 'legitimate-secondary' }]);
    assert.equal((await connect('new-player')).hello, undefined, 'new primary sockets also require a issued proof');
  } finally {
    sockets.forEach((socket) => socket.terminate());
    server.close();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  }
});

test('proofs expire, cannot be extended or used for another session/server', () => {
  let now = 1700000000000;
  const signer = new MuSessionProof(() => now);
  const proof = signer.issue('player-A');
  assert.equal(signer.verify('player-A', proof), true);
  assert.equal(signer.verify('player-B', proof), false);
  assert.equal(new MuSessionProof(() => now).verify('player-A', proof), false);
  const [expiry, signature] = proof.split('.');
  assert.equal(signer.verify('player-A', `${Number(expiry) + 1}.${signature}`), false);
  now += 600001;
  assert.equal(signer.verify('player-A', proof), false);
  assert.equal(signer.matches(proof, proof), true, 'already established auxiliary channels use their bound capability');
});

test('the actual HTTP WebSocket client opens all legitimate channels with the issued proof', { timeout: 5000 }, async () => {
  const httpServer = http.createServer();
  const received: unknown[] = [];
  const server = new MuWebSocketServer({ server: httpServer, requireSessionProof: true });
  await new Promise<void>((resolve) => server.start({ ready: resolve,
    connection: (socket) => socket.open({ ready() {}, close() {}, message: (data) => received.push(data) }), close() {},
  }));
  await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  const port = (httpServer.address() as any).port;
  const client = new MuWebSocket({ sessionId: 'legitimate-client', sessionProof: server.issueSessionProof('legitimate-client'),
    url: `ws://127.0.0.1:${port}/?existing=value&sid=untrusted-url-value`, maxSockets: 3 });
  try {
    await new Promise<void>((resolve, reject) => client.open({ ready: resolve, close: reject, message() {} }));
    const deadline = Date.now() + 1000;
    while ((client as any)._unreliableSockets.length !== 2) {
      if (Date.now() > deadline) throw new Error('Legitimate auxiliary channels did not open');
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    client.send('reliable');
    client.send('unreliable', true);
    await new Promise((resolve) => setTimeout(resolve, 15));
    assert.deepEqual([...received].sort(), ['reliable', 'unreliable']);
  } finally {
    client.close(); server.close();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  }
});

test('the Next.js WebSocket proxy preserves the proof header used by public Creator/Play routes', { timeout: 5000 }, async () => {
  const { proxyRequest } = require('../../../apps/game/node_modules/next/dist/server/lib/router-utils/proxy-request');
  const backend = http.createServer();
  const frontend = http.createServer();
  const received: unknown[] = [];
  const server = new MuWebSocketServer({ server: backend, requireSessionProof: true });
  await new Promise<void>((resolve) => server.start({ ready: resolve, close() {},
    connection: (socket) => socket.open({ ready() {}, close() {}, message: (data) => received.push(data) }),
  }));
  await new Promise<void>((resolve) => backend.listen(0, '127.0.0.1', resolve));
  const backendPort = (backend.address() as any).port;
  frontend.on('upgrade', (req, socket, head) => {
    const request = new URL(req.url!, 'http://localhost');
    void proxyRequest(req, socket, parse(`http://127.0.0.1:${backendPort}/?${request.searchParams}`, true), head)
      .catch(() => socket.destroy());
  });
  await new Promise<void>((resolve) => frontend.listen(0, '127.0.0.1', resolve));
  const frontendPort = (frontend.address() as any).port;
  const client = new MuWebSocket({ sessionId: 'proxied-player', sessionProof: server.issueSessionProof('proxied-player'),
    url: `ws://127.0.0.1:${frontendPort}/runtime/play/test-map`, maxSockets: 1 });
  try {
    await new Promise<void>((resolve, reject) => client.open({ ready: resolve, close: reject, message() {} }));
    client.send('through-next-proxy');
    const deadline = Date.now() + 1000;
    while (!received.length) {
      if (Date.now() > deadline) throw new Error('Proxy did not forward the authenticated connection');
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    assert.deepEqual(received, ['through-next-proxy']);
    assert.equal((client as any)._reliableSocket.protocol, 'box3-game', 'proof must not be echoed as the selected protocol');
  } finally {
    client.close(); server.close();
    await Promise.all([backend, frontend].map((item) => new Promise<void>((resolve) => item.close(() => resolve()))));
  }
});
