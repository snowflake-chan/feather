import { expect, test } from '@jest/globals';
import { resolveOSSResourceUrl } from 'src/engine/resource/util';

test('keeps boxes absolute OSS URLs unchanged', () => {
  expect(
    resolveOSSResourceUrl(
      'https://assets.box3.fun',
      'image-hash',
      'http://127.0.0.1:3002',
    ),
  ).toBe('https://assets.box3.fun/engine/m/image-hash');
});

test('turns the local same-origin runtime proxy into an absolute OSS URL', () => {
  expect(
    resolveOSSResourceUrl(
      '/runtime/edit',
      'image-hash',
      'http://127.0.0.1:3002',
    ),
  ).toBe('http://127.0.0.1:3002/runtime/edit/engine/m/image-hash');
});
