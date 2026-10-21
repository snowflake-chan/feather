import { expect, test } from '@jest/globals';
import { murmur3 } from '@box/build-system/utils/murmur3';

const data = [
  'a',
  '123',
  '123456',
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0',
  '0000000000',
];

const result = [
  {
    seed: 967837809,
    expected: [
      0x896ec29f, 0xc0ccc500, 0x126fea5b, 0x786165ca, 0xec4ba1a6, 0xa7c74c2b,
      0x3b2f53d9,
    ],
  },
  {
    seed: 756603,
    expected: [
      0x77889515, 0x89de27d3, 0xb210d58a, 0x63e2e2ff, 0xbbb46bb8, 0x18565cdf,
      0xbab13f96,
    ],
  },
  {
    seed: 34489611,
    expected: [
      0xf2d5e0ce, 0x16c7f1e, 0xfbf4f38e, 0xee5d142, 0x54084a5c, 0x20ddcacd,
      0x4042f883,
    ],
  },
];

test('test murmur3', function () {
  for (const { seed, expected } of result) {
    for (let i = 0; i < data.length; i++) {
      expect(murmur3(data[i], seed)).toBe(expected[i]);
    }
  }
});
