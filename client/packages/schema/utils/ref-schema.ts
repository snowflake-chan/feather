// non-serializable object reference helper type for muschema
import { MuSchema } from '@box/mudb/schema';

const _noSerialize = () => {
  throw new Error('cannot serialize references');
};

export class MuRefSchema<T> implements MuSchema<T | null> {
  public identity: T | null = null;
  public muType = 'ref';
  public muData = { type: 'ref' };
  public json = { type: 'ref' };

  constructor() {}

  public diff = _noSerialize;
  public patch = _noSerialize;
  public toJSON = _noSerialize;
  public fromJSON = _noSerialize;

  public alloc(): T | null {
    return null;
  }
  public free() {}
  public assign(dst: T | null, src: T | null) {
    return src;
  }
  public clone(x) {
    return x;
  }
  public equal(a, b) {
    return a === b;
  }
}
