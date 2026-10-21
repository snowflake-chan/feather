import { expect, test } from '@jest/globals';
import { hashToUrl } from '../../../server/utils/hash';

test('keeps an inline local project cover available to the Play loading page', () => {
  const cover = 'data:image/webp;base64,UklGRg==';

  expect(hashToUrl(cover, '/runtime/play')).toBe(cover);
});

test('keeps supported remote and local cover URLs unchanged', () => {
  expect(hashToUrl('https://example.com/cover.png', '/runtime/play')).toBe(
    'https://example.com/cover.png',
  );
  expect(hashToUrl('/map-templates/blank-template.png', '/runtime/play')).toBe(
    '/map-templates/blank-template.png',
  );
});

test('does not expose active data URLs as Play loading backgrounds', () => {
  expect(hashToUrl('data:image/svg+xml;base64,PHN2Zz4=', '/runtime/play')).toBe(
    '/runtime/play/block/data:image/svg+xml;base64,PHN2Zz4=',
  );
  expect(hashToUrl('data:text/html;base64,PHNjcmlwdD4=', '/runtime/play')).toBe(
    '/runtime/play/block/data:text/html;base64,PHNjcmlwdD4=',
  );
});

test('turns a bare content hash into a normalized CDN block URL', () => {
  expect(hashToUrl('cover-hash', '/runtime/play/')).toBe(
    '/runtime/play/block/cover-hash',
  );
});
