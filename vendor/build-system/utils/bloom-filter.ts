import { BitArray } from './bitarray';
import { murmur3 } from './murmur3';

const seeds = [
  // they are just random numbers
  0x865cf75d, 0xba624a56, 0x5141fada, 0xdb228460, 0xe3781cd2, 0x508008d1,
  0x37549d09,
];

export function createFilter(bitArray: BitArray) {
  return function (s: string) {
    for (let i = 0; i < seeds.length; i++) {
      const pos = murmur3(s, seeds[i]) % bitArray.size;
      if (!bitArray.get(pos)) {
        return false;
      }
    }
    return true;
  };
}

export function createBuilder(bitArray: BitArray, n: number, p = 0.01) {
  const m = Math.ceil(
    (n * Math.log(p)) / Math.log(1 / Math.pow(2, Math.log(2))),
  );
  bitArray.init(m);
  return function (s: string) {
    for (let i = 0; i < seeds.length; i++) {
      const pos = murmur3(s, seeds[i]) % bitArray.size;
      bitArray.set(pos);
    }
  };
}
