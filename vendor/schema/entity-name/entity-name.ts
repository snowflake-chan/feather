import {
  MuStruct,
  MuVarint,
  MuSortedArray,
  MuUTF8,
  MuQuantizedFloat,
  MuBoolean,
} from '@box/mudb/schema';
import { compareId } from '@box/utils/id';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
import { vec3 } from 'gl-matrix';

export const EntityNameComponentSchema = new MuStruct({
  id: new MuVarint(),
  radius: new MuQuantizedFloat(1 / 16, 16),
  name: new MuUTF8(),
  color: new QuantizedVec3Schema(1 / 256, vec3.fromValues(1, 1, 1)),
});
export type EntityNameComponent = typeof EntityNameComponentSchema.identity;

export const EntityNameComponentSetSchema = new MuSortedArray(
  EntityNameComponentSchema,
  Infinity,
  compareId,
);
