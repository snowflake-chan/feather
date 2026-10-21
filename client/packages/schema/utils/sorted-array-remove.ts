import { TaggedId } from '@box/utils/id';
import { MuSchema } from '@box/mudb/schema';

export function sortedArrayDelete<
  T extends TaggedId,
  Schema extends MuSchema<T>,
>(schema: Schema, array: T[], ids: number[]) {
  if (ids.length === 0) {
    return;
  }
  let head = 0;
  let aptr = 0;
  let iptr = 0;
  while (aptr < array.length && iptr < ids.length) {
    const a = array[aptr];
    const id = ids[iptr];
    if (a.id < id) {
      array[head++] = a;
      aptr++;
    } else if (id < a.id) {
      iptr++;
    } else {
      schema.free(a);
      aptr++;
      iptr++;
    }
  }
  while (aptr < array.length) {
    array[head++] = array[aptr++];
  }
  array.length = head;
  return;
}
