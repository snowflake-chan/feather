import assert from 'node:assert/strict';
import { isSafeUrl } from '../src/href/safe-url';

for (const url of [
  'https://custom.example.org/api',
  'http://127.0.0.1:8080/api',
  'http://192.168.1.20:3000/api',
]) {
  assert.equal(isSafeUrl(url), true, `expected HTTP(S) URL to be allowed: ${url}`);
}

for (const url of [
  'javascript:alert(1)',
  'javascript%3Aalert(1)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
  'https://user:password@example.com/private',
  'https://example.com/\r\nX-Injected: true',
  'example.com/no-protocol',
]) {
  assert.equal(isSafeUrl(url), false, `expected unsafe URL to be rejected: ${url}`);
}

console.log('script URL policy regression checks passed');
