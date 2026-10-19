import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuVarint } from '@box/mudb/schema/varint';
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
