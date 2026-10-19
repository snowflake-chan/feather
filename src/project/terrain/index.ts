import { bigPool } from './big-pool';
import { fuji } from './fuji';
import { moonIsland } from './moon-island';
import { brokenPlanet } from './broken-planet';
import { defaultTerrain } from './plane';
import { volcano } from './volcano';
import { smallPool } from './small-pool';
import { arena } from './arena';
import { raceway } from './raceway';
import { VoxelView } from '@box/utils/voxel';

export enum TerrainTheme {
  bigPool,
  fuji,
  moonIsland,
  brokenPlanet,
  volcano,
  plane,
  smallPool,
  arena,
  raceway,
}

export interface TerrainSpec {
  voxels: VoxelView;
  baseBlock: number;
  surfaceBlock: number;
  bottomBlock: number;
  waterBlock: number;
  seed?: number;
}

export function genTerrain(theme: TerrainTheme, spec: TerrainSpec) {
  switch (theme) {
    case TerrainTheme.bigPool:
      return bigPool(spec);
    case TerrainTheme.fuji:
      return fuji(spec);
    case TerrainTheme.moonIsland:
      return moonIsland(spec);
    case TerrainTheme.brokenPlanet:
      return brokenPlanet(spec);
    case TerrainTheme.plane:
      return defaultTerrain(spec);
    case TerrainTheme.volcano:
      return volcano(spec);
    case TerrainTheme.smallPool:
      return smallPool(spec);
    case TerrainTheme.arena:
      return arena(spec);
    case TerrainTheme.raceway:
      return raceway(spec);
    default:
      return defaultTerrain(spec);
  }
}
