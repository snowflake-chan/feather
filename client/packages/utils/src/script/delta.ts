import {
  MuSortedArray,
  MuStruct,
  MuArray,
  MuUint32,
  MuSchema,
  MuBoolean,
} from '@box/mudb/schema';
import { TaggedId, compareId } from '../id';
import { sortedArrayDelete } from '../sorted-array-remove';

export type DeltaOutType<Schema extends MuSchema<TaggedId>> = {
  upserts: Schema['identity'][];
  remove: number[];
};

export function DeltaListSchema<ListSchema extends MuSortedArray<any>>(
  schema: ListSchema,
) {
  return new MuStruct({
    upserts: schema,
    remove: new MuArray(new MuUint32(0), Infinity),
  });
}

export function deltaList<Schema extends MuSchema<TaggedId>>(
  schema: Schema,
  out: {
    upserts: Schema['identity'][];
    remove: number[];
  },
  base: Schema['identity'][],
  target: Schema['identity'][],
) {
  for (let i = 0; i < out.upserts.length; ++i) {
    schema.free(out.upserts[i]);
  }
  out.upserts.length = 0;
  out.remove.length = 0;

  let bptr = 0;
  let tptr = 0;

  while (bptr < base.length && tptr < target.length) {
    const b = base[bptr];
    const t = target[tptr];
    if (b.id < t.id) {
      out.remove.push(b.id);
      bptr++;
    } else if (t.id < b.id) {
      out.upserts.push(schema.clone(t));
      tptr++;
    } else {
      if (!schema.equal(b, t)) {
        out.upserts.push(schema.clone(t));
      }
      tptr++;
      bptr++;
    }
  }

  while (tptr < target.length) {
    out.upserts.push(schema.clone(target[tptr++]));
  }

  while (bptr < base.length) {
    out.remove.push(base[bptr++].id);
  }
}

export function patchList<Schema extends MuSchema<TaggedId>>(
  schema: Schema,
  base: Schema['identity'][],
  patch: {
    upserts: Schema['identity'][];
    remove: number[];
  },
) {
  // delete elements
  if (patch.remove.length !== 0) {
    sortedArrayDelete(schema, base, patch.remove);
  }

  // insert new elements
  if (patch.upserts.length !== 0) {
    // faster to just append elements to list, then sort rather than call splice.
    //  could do in O(n) if we ran out of place, but would waste a copy...
    //  there's probably some fancy way to do the merge in one pass without sorting but can't think of anything

    let pptr = 0;
    let bptr = 0;

    const PL = patch.upserts.length;
    const BL = base.length;

    while (bptr < BL && pptr < PL) {
      const p = patch.upserts[pptr];
      const b = base[bptr];
      if (b.id < p.id) {
        bptr++;
      } else if (p.id < b.id) {
        base.push(schema.clone(p));
        pptr++;
      } else {
        if (!schema.equal(b, p)) {
          base[bptr] = schema.assign(b, p);
        }
        bptr++;
        pptr++;
      }
    }

    while (pptr < PL) {
      base.push(schema.clone(patch.upserts[pptr++]));
    }

    base.sort(compareId);
  }
}

export function patchListDelta<Schema extends MuSchema<TaggedId>>(
  schema: Schema,
  base: Schema['identity'][],
  patch: {
    upserts: Schema['identity'][];
    remove: number[];
  },
) {
  // delete elements
  if (patch.remove.length !== 0) {
    sortedArrayDelete(schema, base, patch.remove);
  }

  // path element
  if (patch.upserts.length !== 0) {
    // faster to just append elements to list, then sort rather than call splice.
    //  could do in O(n) if we ran out of place, but would waste a copy...
    //  there's probably some fancy way to do the merge in one pass without sorting but can't think of anything

    let pptr = 0;
    let bptr = 0;

    const PL = patch.upserts.length;
    const BL = base.length;

    while (bptr < BL && pptr < PL) {
      const p = patch.upserts[pptr];
      const b = base[bptr];
      if (b.id < p.id) {
        bptr++;
      } else if (p.id < b.id) {
        base.push(schema.clone(p));
        pptr++;
      } else {
        if (!schema.equal(b, p)) {
          // diff属性修改
          base[bptr] = schema.assign(b, p);
        }
        bptr++;
        pptr++;
      }
    }

    while (pptr < PL) {
      base.push(schema.clone(patch.upserts[pptr++]));
    }

    base.sort(compareId);
  }
}

export function DeltaSchema<Schema extends MuSchema<any>>(schema: Schema) {
  return new MuStruct({
    patch: schema,
    changed: new MuBoolean(false),
  });
}

export function deltaItem<Schema extends MuSchema<any>>(
  schema: Schema,
  out: {
    patch: Schema['identity'];
    changed: boolean;
  },
  base: Schema['identity'],
  target: Schema['identity'],
) {
  if (schema.equal(base, target)) {
    out.changed = false;
  } else {
    out.patch = schema.assign(out.patch, target);
    out.changed = true;
  }
}

export function patchItem<Schema extends MuSchema<any>>(
  schema: Schema,
  base: Schema['identity'],
  patch: {
    patch: Schema['identity'];
    changed: boolean;
  },
) {
  if (patch.changed) {
    return schema.assign(base, patch.patch);
  }
  return base;
}
