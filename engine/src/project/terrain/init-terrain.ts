import { allocVoxels, freeVoxels } from '@box/utils/voxel';
import { saveVoxelData } from './voxel';
import { genTerrain, TerrainTheme } from '.';
import { ContentServer } from '@box/content-server';

function initialMapSize(): [number, number, number] {
  const values = String(process.env.BOX_INITIAL_MAP_SIZE || '')
    .trim()
    .split(',')
    .map(Number);
  const [width, height, depth] = values;
  const valid =
    values.length === 3 &&
    values.every((value) => Number.isInteger(value) && value >= 16 && value % 16 === 0) &&
    width <= 1024 &&
    height <= 128 &&
    depth <= 1024;
  return valid ? [width, height, depth] : [128, 128, 128];
}

export async function initTerrain(spec: {
  contentServer: ContentServer;
  theme: TerrainTheme;
  baseBlock: number;
  surfaceBlock: number;
  bottomBlock: number;
  waterBlock: number;
}) {
  const [width, height, depth] = initialMapSize();
  const voxels = allocVoxels(width, height, depth);
  genTerrain(spec.theme, {
    voxels,
    baseBlock: spec.baseBlock,
    surfaceBlock: spec.surfaceBlock,
    bottomBlock: spec.bottomBlock,
    waterBlock: spec.waterBlock,
  });
  const hash = await saveVoxelData(spec.contentServer, voxels);
  freeVoxels(voxels);
  return hash;
}
