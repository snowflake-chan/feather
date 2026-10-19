import { voxelsToMeshes, unpackMeshData } from './index';
import { MuArray, MuStruct } from '@box/mudb/schema';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import { MeshDataSchema, MeshTextureSchema } from './schema';
import { VoxelView } from '@box/utils/voxel';

const MeshSchema = new MuStruct({
  texture: MeshTextureSchema,
  parts: new MuArray(
    new MuStruct({
      data: MeshDataSchema,
      rotation: new MuStruct({
        // balabala
      }),
      translate: new MuStruct({
        // balabala
      }),
    }),
    Infinity,
  ),
});

async function serverStuff(
  parts: VoxelView[],
  palette: number[],
  emissivePalette: number[],
) {
  const { meshes, texture } = await voxelsToMeshes(
    parts,
    palette,
    emissivePalette,
  );
  const mesh = MeshSchema.alloc();
  mesh.texture = texture;
  for (let i = 0; i < parts.length; i++) {
    mesh.parts.push({
      data: meshes[i],
      rotation: {},
      translate: {},
    });
  }
  const ws = new MuWriteStream(1);
  MeshSchema.diff(MeshSchema.identity, mesh, ws);
  const binaryData = ws.bytes();
  ws.destroy();
  MeshSchema.free(mesh);

  // should send binaryData to client
}

async function clientStuff(binaryData: Uint8Array) {
  const rs = new MuReadStream(binaryData);
  const mesh = MeshSchema.patch(MeshSchema.identity, rs);

  const img = new Image();
  img.src = URL.createObjectURL(
    new Blob([mesh.texture.data], { type: 'image/png' }),
  );
  img.onload = () => {
    /* update regl texture */
  };

  const meshData = mesh.parts.map(({ data }) =>
    unpackMeshData(
      data,
      Uint8Array, // [0, 255]
      Math.max(mesh.texture.width, mesh.texture.height) > 255
        ? Uint16Array
        : Uint8Array,
    ),
  );

  // meshData[0].meshData: x, y, z, normalCode
  // meshData[0].uvData: u, v
}
