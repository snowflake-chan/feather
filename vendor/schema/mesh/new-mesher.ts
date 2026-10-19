import { Mesher } from '@box/mesher';
import { VoxelView } from '@box/utils/voxel';
import { NewMeshSchema } from './voxel';

export async function generateNewMesh(
  voxel: VoxelView,
  palette: number[] | [number, number, number][],
  emissivePalette: number[],
  surfaceOnly = false,
) {
  const mesher = new Mesher(true, true, surfaceOnly);
  mesher.addModel(voxel);
  const mesh = NewMeshSchema.alloc();
  if (mesher.textureMap.size > 0) {
    mesh.data = mesher.getMesh(0);
    mesh.texture = await mesher.getTexture(palette, emissivePalette);
  }
  return mesh;
}
