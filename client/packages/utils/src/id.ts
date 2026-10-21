export interface TaggedId {
  id: number;
}

export function compareId(a: TaggedId, b: TaggedId) {
  return a.id - b.id;
}

function interpolate(objects: TaggedId[], l: number, h: number, id: number) {
  const a = objects[l].id;
  const b = objects[h].id;
  const t = (id - a) / (b - a);
  return Math.max(l, Math.min(h, Math.round((1 - t) * l + t * h) | 0));
}

export function indexEqRange(
  objects: TaggedId[],
  id: number,
  _l: number,
  _h: number,
): number {
  let l = _l;
  let h = _h;
  while (l < h) {
    const m = interpolate(objects, l, h, id);
    const x = objects[m].id;
    if (x === id) {
      return m;
    } else if (x < id) {
      l = m + 1;
    } else {
      h = m - 1;
    }
  }
  if (l === h && objects[l].id === id) {
    return l;
  }
  return -1;
}

export function indexEq(objects: TaggedId[], id: number): number {
  let l = 0;
  let h = objects.length - 1;
  while (l < h) {
    const m = interpolate(objects, l, h, id);
    const x = objects[m].id;
    if (x === id) {
      return m;
    } else if (x < id) {
      l = m + 1;
    } else {
      h = m - 1;
    }
  }
  if (l === h && objects[l].id === id) {
    return l;
  }
  return -1;
}

export function indexPred(objects: TaggedId[], id: number): number {
  let l = 0;
  let h = objects.length - 1;
  let i = l - 1;
  while (l < h) {
    const m = interpolate(objects, l, h, id);
    const x = objects[m].id;
    if (x <= id) {
      i = m;
      l = m + 1;
    } else {
      h = m - 1;
    }
  }
  if (l === h && objects[l].id <= id) {
    return l;
  }
  return i;
}

function incrementTo(objects: TaggedId[], start: number, id: number) {
  let i = start;
  while (i < objects.length && objects[i].id < id) {
    ++i;
  }
  return i;
}

export function zipId<Tables extends TaggedId[][]>(
  f: (
    ...idx: {
      [index in keyof Tables]: Tables[index] extends (infer T)[] ? T : never;
    }
  ) => void,
  ...tables: Tables
) {
  if (tables.length === 1) {
    const t = tables[0];
    for (let i = 0; i < t.length; ++i) {
      (<any>f)(t[i]);
    }
  } else if (tables.length === 2) {
    const t0 = tables[0];
    const t1 = tables[1];
    for (let i0 = 0, i1 = 0; i0 < t0.length; ++i0) {
      const id0 = t0[i0].id;
      while (true) {
        if (!(i1 < t1.length)) {
          return;
        }
        const id1 = t1[i1].id;
        if (id0 < id1) {
          break;
        } else if (id1 === id0) {
          (<any>f)(t0[i0], t1[i1]);
        }
        ++i1;
      }
    }
  } else if (tables.length === 3) {
    const t0 = tables[0];
    const t1 = tables[1];
    const t2 = tables[2];
    for (let i0 = 0, i1 = 0, i2 = 0; i0 < t0.length; ++i0) {
      const id = t0[i0].id;
      i1 = incrementTo(t1, i1, id);
      if (!(i1 < t1.length)) {
        return;
      }
      if (t1[i1].id !== id) {
        continue;
      }
      i2 = incrementTo(t2, i2, id);
      if (!(i2 < t2.length)) {
        return;
      }
      if (t2[i2].id !== id) {
        continue;
      }
      (<any>f)(t0[i0], t1[i1], t2[i2]);
    }
  } else {
    // generic case
    const N = tables.length;
    const index: number[] = new Array(N);
    const rows: any[] = new Array(N);
    for (let i = 0; i < N; ++i) {
      index[i] = 0;
    }
    const t = tables[0];
    outer: for (let i = 0; i < t.length; ++i) {
      const row = (rows[0] = t[i]);
      const id = row.id;
      for (let j = 1; j < N; ++j) {
        const idx = (index[j] = incrementTo(tables[j], index[j], id));
        if (!(idx < tables[j].length)) {
          return;
        }
        const jrow = (rows[j] = tables[j][idx]);
        if (jrow.id !== id) {
          continue outer;
        }
      }
      (<any>f).apply(null, rows);
    }
  }
}

export function getById<T extends TaggedId>(data: T[], id: number): T | null {
  const idx = indexEq(data, id);
  if (idx < 0) {
    return null;
  }
  return data[idx];
}
