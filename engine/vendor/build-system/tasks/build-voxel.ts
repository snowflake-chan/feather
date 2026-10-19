import { MuReadStream } from '@box/mudb/stream';
import { allocEmptyVoxels } from '@box/utils/helper';
import { NewMeshSchema } from '@box/schema/mesh/voxel';
import { generateNewMesh } from '@box/schema/mesh/new-mesher';
import { BuildSystem } from '../type';
import { decompress } from '@box/utils/rle-compress';
import { BUILD_HEAVY_LOCK } from './heavy_mutex';

export async function buildVoxel(bs: BuildSystem, hash: string) {
  await BUILD_HEAVY_LOCK.p();
  const t = Date.now();
  try {
    const projectData = await bs.retrieveJSON(hash);
    const CURRENTCOLORINDEX = projectData.CURRENTCOLORINDEX;
    const palette = projectData.HEXCOLORS[CURRENTCOLORINDEX].map((hex) =>
      hex ? parseInt(hex, 16) : 0xffffff,
    );
    const emissivePalette = projectData.PBRATTRBS[CURRENTCOLORINDEX].map(
      (a: number[]) => a[2],
    );

    const inp = new MuReadStream(new Uint8Array(projectData.ENCODEVOXELS));
    const nx = inp.readInt32();
    const ny = inp.readInt32();
    const nz = inp.readInt32();

    const voxel = allocEmptyVoxels(nx, ny, nz);
    decompress(inp, voxel);

    return bs.storeBinarySchema(
      NewMeshSchema,
      await generateNewMesh(voxel, palette, emissivePalette),
    );
  } finally {
    bs.logger.info(`build voxel mesh ${hash} elapsed time ${Date.now() - t}ms`);
    BUILD_HEAVY_LOCK.v();
  }
}

// const projectData = require('/tmp/ggm.vb.json');
// const CURRENTCOLORINDEX = projectData.CURRENTCOLORINDEX;
// const palette = projectData.HEXCOLORS[CURRENTCOLORINDEX].map((hex) => hex ? parseInt(hex, 16) : 0xffffff);
// const emissivePalette =  projectData.PBRATTRBS[CURRENTCOLORINDEX].map((a:number[]) => a[2]);

// const inp = new MuReadStream(new Uint8Array(projectData.ENCODEVOXELS));
// const nx = inp.readInt32();
// const ny = inp.readInt32();
// const nz = inp.readInt32();

// const voxel = allocEmptyVoxels(nx, ny, nz);
// decompress(inp, voxel);

// generateNewMesh(voxel, palette, emissivePalette).then(console.log);
