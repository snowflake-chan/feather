import { BuildSystem } from '../type';
import { BitArray } from '../utils/bitarray';
import * as bloomFilter from '../utils/bloom-filter';

import { BitArraySchema } from '../utils/bitarray-schema';

const FALSE_POSITIVES_PROBABILITY = 0.01;

export async function buildBloomFilter(bs: BuildSystem, hash: string) {
  const pwds = Buffer.from(await bs.retrieveContent(hash))
    .toString()
    .split('\n')
    .filter((s) => s);
  const bitArray = new BitArray();
  const addItem = bloomFilter.createBuilder(
    bitArray,
    pwds.length,
    FALSE_POSITIVES_PROBABILITY,
  );
  for (const pwd of pwds) {
    addItem(pwd);
  }
  const data = BitArraySchema.fromJSON(bitArray.save());
  const result = await bs.storeBinarySchema(BitArraySchema, data);
  BitArraySchema.free(data);
  return result;
}
