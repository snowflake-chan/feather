import { expect, test } from '@jest/globals';
import {
  mapRoleToCombType,
  usesCloudMapGroupAPIs,
  type MapInfoConfig,
} from 'configs/client';

const mapInfo = (patch: Partial<MapInfoConfig>): MapInfoConfig => ({
  contentId: 0,
  name: 'Map',
  description: '',
  image: '',
  customizeType: '',
  backgroundImage: '',
  combType: 0,
  ...patch,
});

test('maps local main and submap roles to Boxes comb types', () => {
  expect(mapRoleToCombType('main')).toBe(1);
  expect(mapRoleToCombType('submap')).toBe(2);
  expect(mapRoleToCombType(undefined)).toBe(0);
});

test('local map groups never use retired cloud mutation APIs', () => {
  expect(
    usesCloudMapGroupAPIs(
      mapInfo({ combType: 1, mapRole: 'main', isLocalMapGroup: true }),
    ),
  ).toBe(false);
  expect(
    usesCloudMapGroupAPIs(
      mapInfo({ combType: 2, mapRole: 'submap', isLocalMapGroup: true }),
    ),
  ).toBe(false);
  expect(usesCloudMapGroupAPIs(mapInfo({ combType: 2 }))).toBe(true);
});
