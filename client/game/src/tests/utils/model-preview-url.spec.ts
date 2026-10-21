import { expect, test } from '@jest/globals';

import { getModelPreviewURL } from '../../utils/model-preview-url';

test('local project models load previews from their active edit runtime', () => {
  expect(
    getModelPreviewURL({
      previewHash: 'QmPreview',
      isLocalGameServer: true,
      runtimeURL: '/runtime/edit/my-map',
    }),
  ).toBe('/runtime/edit/my-map/block/QmPreview');
});

test('cloud project models retain the OSS preview URL', () => {
  expect(
    getModelPreviewURL({
      previewHash: 'QmPreview',
      isLocalGameServer: false,
      ossCDNURL: 'https://assets.example.test/',
    }),
  ).toBe('https://assets.example.test/engine/m/QmPreview');
});
