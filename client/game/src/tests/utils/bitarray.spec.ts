import { expect, test } from '@jest/globals';
import { BitArray } from '@box/build-system/utils/bitarray';

const BIT_ARRAY_SIZE = 1000;

test('test bitarray', function () {
  const ba = new BitArray(BIT_ARRAY_SIZE);
  const ba2 = new BitArray(BIT_ARRAY_SIZE);
  const positions = new Set();
  for (let i = 0; i < BIT_ARRAY_SIZE / 3; i++) {
    const pos = Math.ceil(Math.random() * BIT_ARRAY_SIZE);
    positions.add(pos);
    ba.set(pos);
  }
  ba2.load(JSON.parse(JSON.stringify(ba.save())));
  for (let i = 0; i < BIT_ARRAY_SIZE; i++) {
    expect(ba2.get(i)).toBe(positions.has(i));
  }
});
