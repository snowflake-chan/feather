import { MuReadStream } from '@box/mudb/stream';
import { allocEmptyVoxels } from '@box/utils/helper';
import { BuildSystem } from '../type';
import { decompress } from '@box/utils/rle-compress';
import { IntBoundsSchema } from '../project/bounds-schema';

export async function calcVoxelBounds(bs: BuildSystem, hash: string) {
  const projectData = await bs.retrieveJSON(hash);
  const inp = new MuReadStream(new Uint8Array(projectData.ENCODEVOXELS));
  const nx = inp.readInt32();
  const ny = inp.readInt32();
  const nz = inp.readInt32();
  const voxel = allocEmptyVoxels(nx, ny, nz);
  decompress(inp, voxel);

  let minX = nx;
  let minY = ny;
  let minZ = nz;
  let maxX = 0;
  let maxY = 0;
  let maxZ = 0;
  for (let z = 0; z < nz; ++z) {
    for (let y = 0; y < ny; ++y) {
      for (let x = 0; x < nx; ++x) {
        if (voxel.getVoxel(x, y, z) !== 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          minZ = Math.min(minZ, z);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          maxZ = Math.max(maxZ, z);
        }
      }
    }
  }

  const result = IntBoundsSchema.alloc();
  result.lox = minX;
  result.loy = minY;
  result.loz = minZ;

  result.hix = maxX;
  result.hiy = maxY;
  result.hiz = maxZ;

  const resultHash = bs.storeBinarySchema(IntBoundsSchema, result);
  IntBoundsSchema.free(result);

  return resultHash;
}
