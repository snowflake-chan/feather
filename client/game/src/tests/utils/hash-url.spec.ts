import { expect, test } from '@jest/globals';
import { resolveHashURL } from 'src/utils/hash-url';

test('keeps a project runtime resource URL unchanged', () => {
  expect(
    resolveHashURL(
      '/runtime/play/',
      '/runtime/edit/cloud-project/engine/m/preview-hash',
    ),
  ).toBe('/runtime/edit/cloud-project/engine/m/preview-hash');
});

test('turns a bare content hash into a block URL', () => {
  expect(resolveHashURL('/runtime/edit/cloud-project', 'image-hash')).toBe(
    '/runtime/edit/cloud-project/block/image-hash',
  );
});
