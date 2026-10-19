import {
  MuArray,
  MuStruct,
  MuVarint,
  MuUint8,
  MuUint32,
} from '@box/mudb/schema';

export const MeshTextureSchema = new MuStruct({
  palette: new MuArray(new MuUint32(), Infinity),
  data: new MuArray(new MuVarint(), Infinity),
  width: new MuVarint(),
});

export const MeshDataSchema = new MuArray(
  new MuStruct({
    vertices: new MuArray(new MuVarint(), Infinity),
    sizes: new MuArray(new MuVarint(), Infinity),
    uvs: new MuArray(new MuVarint(), Infinity),
    uvFlags: new MuArray(new MuUint8(), Infinity),
  }),
  6,
);
