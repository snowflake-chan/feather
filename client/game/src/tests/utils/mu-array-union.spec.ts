import { expect, test } from '@jest/globals';
import { MuArray, MuStruct, MuUTF8, MuVarint } from '@box/mudb/schema';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import { MuArrayUnion } from '@box/schema/keyframes/mu-array-union';

test('mu-array-union', () => {
  const struct = new MuStruct({
    foo: new MuUTF8('aaa'),
    bar: new MuStruct({
      baz: new MuVarint(111),
    }),
  });
  const schema = new MuArrayUnion(
    new MuVarint(10),
    new MuUTF8('foo'),
    struct,
    new MuArray(new MuVarint(), Infinity),
  );

  // clone
  const x = {
    id: [0, 1, 2, 3],
    data: [
      10,
      'aaa',
      {
        foo: 'xx',
        bar: {
          baz: 5,
        },
      },
      [1, 2, 3],
    ],
  };

  const y = schema.clone(x);

  expect(y).toEqual(x);
  expect(schema.equal(x, y)).toBeTruthy();

  // assign

  const z = schema.alloc();
  const ret = schema.assign(z, y);

  expect(ret === z).toBeTruthy();
  expect(z).toEqual(y);

  // diff/patch
  const out = new MuWriteStream(1);

  expect(out.offset).toBe(0);
  expect(!schema.diff(x, y, out)).toBeTruthy();
  expect(out.offset).toBe(0);

  expect(schema.diff(schema.identity, y, out)).toBeTruthy();
  const inp = new MuReadStream(out.bytes());
});
