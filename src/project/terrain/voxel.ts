import { VoxelInfo, VoxelRDA } from '@box/schema/project/project-rda';
import { ContentServer } from '@box/content-server';
import {
  ServerVoxelPreloadData,
  ServerVoxelPreloadDataSchema,
} from '@box/schema/voxel/voxel-server-schema';
import { MuWriteStream } from '@box/mudb/stream';
import { boxCompress, meshChunkToBoxes } from '../../voxel/box-encode';
import { VoxelView } from '@box/utils/voxel';
import { CHUNK_SIZE } from '@box/schema/voxel/voxel-collision-schema';

export async function saveVoxelPreloadData(
  content: ContentServer,
  voxels: VoxelView,
): Promise<ServerVoxelPreloadData | null> {
  // allocate result
  const result = ServerVoxelPreloadDataSchema.alloc();
  const nx = (result.nx = voxels.shape[0]);
  const ny = (result.ny = voxels.shape[1]);
  const nz = (result.nz = voxels.shape[2]);
  result.boxes.length = 0;
  result.hashes.length = 0;

  // store all voxels to server
  const contentChunks: Promise<string | undefined>[] = [];
  for (let z = 0; z < nz; z += CHUNK_SIZE) {
    for (let y = 0; y < ny; y += CHUNK_SIZE) {
      for (let x = 0; x < nx; x += CHUNK_SIZE) {
        const boxes = meshChunkToBoxes(
          voxels.slice(
            [x, y, z],
            [x + CHUNK_SIZE, y + CHUNK_SIZE, z + CHUNK_SIZE],
          ),
        );
        result.boxes.push(boxes);

        const stream = new MuWriteStream(1024);
        boxCompress(boxes, stream);
        contentChunks.push(content.store(stream.bytes()));
        stream.destroy();
      }
    }
  }

  // wait for results and pack into encoded voxel data structure
  for (let i = 0; i < contentChunks.length; ++i) {
    const chunkHash = await contentChunks[i];
    if (chunkHash) {
      result.hashes.push(chunkHash);
    } else {
      ServerVoxelPreloadDataSchema.free(result);
      return null;
    }
  }

  return result;
}

function stripPreloadData(preload: ServerVoxelPreloadData): VoxelInfo {
  const result = VoxelRDA.stateSchema.alloc();
  result.shape.x = preload.nx;
  result.shape.y = preload.ny;
  result.shape.z = preload.nz;
  result.chunks = VoxelRDA.stateSchema.muData.chunks.assign(
    result.chunks,
    preload.hashes,
  );
  return result;
}

export async function saveVoxelData(
  content: ContentServer,
  voxels: VoxelView,
): Promise<VoxelInfo | null> {
  const preload = await saveVoxelPreloadData(content, voxels);
  if (!preload) {
    return null;
  }
  const info = stripPreloadData(preload);
  ServerVoxelPreloadDataSchema.free(preload);
  return info;
}
