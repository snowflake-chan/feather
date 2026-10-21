import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { connectCreatorScene } from './scene-connection';
const instances: Socket[] = [];
class Socket {
  static OPEN = 1;
  readyState = 1;
  onopen?: () => void;
  onclose?: () => void;
  onerror?: () => void;
  onmessage?: (event: { data: string }) => Promise<void>;
  sent: any[] = [];
  constructor(public url: string) { instances.push(this); }
  send(data: string) { this.sent.push(JSON.parse(data)); }
  close() { this.readyState = 3; this.onclose?.(); }
  async receive(value: object) { await this.onmessage?.({ data: JSON.stringify(value) }); }
}
const fetchMock = jest.fn<any>();
const originalFetch = globalThis.fetch;
const originalWs = globalThis.WebSocket;
const originalWindow = (globalThis as any).window;
let dispose: (() => void) | undefined;
const drain = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
beforeEach(() => {
  jest.useFakeTimers();
  instances.length = 0;
  fetchMock.mockReset().mockImplementation(async (_url, options) => ({
    ok: true, status: 200,
    json: async () => ({ sessionId: 'session', socketToken: 'credential', socketPath: '/api/creator/v1/scene/socket' }),
  }));
  globalThis.fetch = fetchMock;
  globalThis.WebSocket = Socket as any;
  (globalThis as any).window = { location: { href: 'https://engine.example/edit/map', origin: 'https://engine.example' } };
});
afterEach(() => {
  dispose?.(); dispose = undefined;
  jest.useRealTimers();
  globalThis.fetch = originalFetch;
  globalThis.WebSocket = originalWs;
  (globalThis as any).window = originalWindow;
});
test('idle editor has no HTTP action polling and uses wss without URL credentials', async () => {
  dispose = connectCreatorScene('map', async () => 'cG5n'); await drain();
  const ws = instances[0]; ws.onopen?.(); await ws.receive({ type: 'ready' });
  jest.advanceTimersByTime(60_000); await drain();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(ws.url).toBe('wss://engine.example/api/creator/v1/scene/socket');
  expect(ws.sent).toEqual([{ type: 'connect', projectId: 'map', sessionId: 'session', socketToken: 'credential' }]);
});
test('capture output and failure use socket frames instead of HTTP', async () => {
  const capture = jest.fn<any>().mockResolvedValueOnce('cG5n').mockRejectedValueOnce(new Error('not ready'));
  dispose = connectCreatorScene('map', capture); await drain();
  const ws = instances[0]; ws.onopen?.(); await ws.receive({ type: 'ready' });
  await ws.receive({ type: 'capture', id: 'one', view: '3d' });
  await ws.receive({ type: 'capture', id: 'two', view: '2d' });
  expect(ws.sent.slice(1)).toEqual([
    { type: 'capture-result', id: 'one', contentBase64: 'cG5n' },
    { type: 'capture-error', id: 'two' },
  ]);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
test('disconnect reauthorizes once and disposal stops retries', async () => {
  dispose = connectCreatorScene('map', async () => 'cG5n'); await drain();
  instances[0].close();
  jest.advanceTimersByTime(1_000); await drain();
  expect(instances).toHaveLength(2);
  expect(fetchMock.mock.calls.filter(call => (call[1] as { method: string }).method === 'POST')).toHaveLength(2);
  dispose(); dispose = undefined;
  jest.advanceTimersByTime(120_000); await drain();
  expect(instances).toHaveLength(2);
});
test('denied authorization does not repeatedly request a session', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 403 });
  dispose = connectCreatorScene('map', async () => 'cG5n'); await drain();
  jest.advanceTimersByTime(120_000); await drain();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(instances).toHaveLength(0);
});
test('capture completing after disposal cannot send a stale result', async () => {
  let finish: (value: string) => void = () => undefined;
  dispose = connectCreatorScene('map', () => new Promise(resolve => { finish = resolve; })); await drain();
  const ws = instances[0]; ws.onopen?.(); await ws.receive({ type: 'ready' });
  const pending = ws.receive({ type: 'capture', id: 'old', view: 'full' });
  dispose(); dispose = undefined;
  finish('cG5n'); await pending;
  expect(ws.sent).toHaveLength(1);
});
