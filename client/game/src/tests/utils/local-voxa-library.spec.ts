import { getLibraryMapId } from '../../utils/local-voxa-library';

test('does not map-scope the server-wide local VOXA library', () => {
  expect(getLibraryMapId(true, 0)).toBeUndefined();
  expect(getLibraryMapId(true, 42)).toBeUndefined();
});

test('preserves Boxes map scoping outside the local runtime', () => {
  expect(getLibraryMapId(false, 42)).toBe(42);
});
