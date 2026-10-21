import { describe, test, expect } from '@jest/globals';
import { toWebSocketURL } from './websocket-url';

describe('WebSocket URL selection', () => {
  test.each([
    ['http://engine.test/runtime/play/map', undefined, 'ws://engine.test/runtime/play/map'],
    ['https://engine.test/runtime/play/map', undefined, 'wss://engine.test/runtime/play/map'],
    ['/api/realtime/socket', 'https://engine.test/maps', 'wss://engine.test/api/realtime/socket'],
    ['/api/realtime/socket', 'http://engine.test/maps', 'ws://engine.test/api/realtime/socket'],
    ['ws://engine.test/runtime/map?sid=abc', 'https://engine.test/maps', 'wss://engine.test/runtime/map?sid=abc'],
    ['wss://remote.test:8443/socket', 'http://engine.test', 'wss://remote.test:8443/socket'],
    ['http://127.0.0.1:9968/socket', undefined, 'ws://127.0.0.1:9968/socket'],
  ])('%s on %s uses %s', (target, page, expected) => {
    expect(toWebSocketURL(target, page)).toBe(expected);
  });

  test('rejects unsupported schemes', () => {
    expect(() => toWebSocketURL('ftp://engine.test')).toThrow();
  });
});
