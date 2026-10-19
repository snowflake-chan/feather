import { MeshTextureSchema, MeshDataSchema } from '@box/mesher/schema';
import { MuStruct, MuUint8, MuSchema } from '@box/mudb/schema';
import { BodyPart } from '../player/player-schema';
import { Mat4Schema } from '../utils/math-schema';

export const PlayerSkinPartSchema = new MuStruct({
  partId: <MuSchema<BodyPart>>new MuUint8(0), // part id
  bindMat: Mat4Schema,
  mesh: MeshDataSchema,
  texture: MeshTextureSchema,
});
