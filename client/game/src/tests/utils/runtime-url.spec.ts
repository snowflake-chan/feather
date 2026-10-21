import { expect, test } from '@jest/globals';
import { resolveRuntimeURL } from '../../utils/runtime-url';

test('keeps the current project id when resolving an edit runtime endpoint', () => {
  expect(resolveRuntimeURL('/runtime/edit/my-map', 'block')).toBe(
    '/runtime/edit/my-map/block',
  );
});

test('normalizes slashes for an absolute runtime URL', () => {
  expect(resolveRuntimeURL('http://127.0.0.1:9967/', '/api/project-scripts')).toBe(
    'http://127.0.0.1:9967/api/project-scripts',
  );
});
