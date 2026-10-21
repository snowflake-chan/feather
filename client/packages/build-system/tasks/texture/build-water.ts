import { BuildSystem } from '../../type';
import { readPixels, storePixelsOpt } from './voxel-utils';
import { bumpDerivative } from '../../utils/bump';

export async function buildWater(bs: BuildSystem, waterBumpHash: string) {
  const waterHeight = await readPixels(bs, waterBumpHash);
  if (!waterHeight) {
    throw new Error(`cannot read pixels from hash ${waterBumpHash}`);
  }
  bumpDerivative(waterHeight);
  return storePixelsOpt(bs, waterHeight);
}
