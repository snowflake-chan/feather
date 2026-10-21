import { expect, test } from '@jest/globals';
import {
  getProjectSkinPreviewUrl,
  getProjectSkins,
} from '../../views/edit/components/player-manager/project-skins';

test('returns only imported project skins and marks the project default', () => {
  expect(
    getProjectSkins(
      {
        船员皮肤: { hash: 'skin-a' },
        守卫皮肤: { hash: 'skin-b' },
        'New-model__local_9': { hash: 'local-skin' },
      },
      '船员皮肤',
      {
        船员皮肤: 'preview-a',
        守卫皮肤: 'preview-b',
      },
    ),
  ).toEqual([
    {
      id: expect.any(Number),
      name: '船员皮肤',
      modelFileHash: 'skin-a',
      previewHash: 'preview-a',
      isDefault: true,
    },
    {
      id: expect.any(Number),
      name: '守卫皮肤',
      modelFileHash: 'skin-b',
      previewHash: 'preview-b',
      isDefault: false,
    },
  ]);
});

test('uses the browser-reachable project runtime URL for skin previews', () => {
  expect(
    getProjectSkinPreviewUrl(
      'preview/hash',
      'http://127.0.0.1:3002/runtime/edit/project-id/',
      '/empty.png',
    ),
  ).toBe(
    'http://127.0.0.1:3002/runtime/edit/project-id/engine/m/preview%2Fhash',
  );
  expect(getProjectSkinPreviewUrl('', 'http://runtime', '/empty.png')).toBe(
    '/empty.png',
  );
});
