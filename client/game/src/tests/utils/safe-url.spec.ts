import { expect, test } from '@jest/globals';
import { isSafeUrl } from 'src/engine/utils/safe-url';

test('allows every valid HTTP(S) destination without a domain whitelist', () => {
  expect(isSafeUrl('https://www.baidu.com/path?q=1')).toBeTruthy();
  expect(isSafeUrl('https://custom.example.org/resource')).toBeTruthy();
  expect(isSafeUrl('http://127.0.0.1:8080/api')).toBeTruthy();
  expect(isSafeUrl('http://192.168.1.20:3000/api')).toBeTruthy();
});

test.each([
  'javascript:alert(1)',
  'JaVaScRiPt:alert(1)',
  'javascript%3Aalert(1)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
  'https://user:password@example.com/private',
  'https://example.com/\r\nX-Injected: true',
  'example.com/no-protocol',
])('rejects unsafe or malformed URL %s', (url) => {
  expect(isSafeUrl(url)).toBeFalsy();
});
