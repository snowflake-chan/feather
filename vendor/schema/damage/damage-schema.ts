import {
  MuStruct,
  MuVarint,
  MuBoolean,
  MuSortedArray,
  MuQuantizedFloat,
} from '@box/mudb/schema';
import { compareId } from '@box/utils/id';

export const DamageSchema = new MuStruct({
  id: new MuVarint(),

  // display style
  showHealthBar: new MuBoolean(true),

  // damage level
  hp: new MuQuantizedFloat(1 / 256, 100),
  maxHp: new MuQuantizedFloat(1 / 256, 100),
});
export type Damage = typeof DamageSchema.identity;

export const DamageSetSchema = new MuSortedArray(
  DamageSchema,
  Infinity,
  compareId,
);
export type DamageSet = typeof DamageSetSchema.identity;
