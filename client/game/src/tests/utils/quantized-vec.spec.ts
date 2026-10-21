import { expect, test } from '@jest/globals';
import { vec3, vec2, vec4 } from 'gl-matrix';
import {
  QuantizedVec3Schema,
  QuantizedVec2Schema,
  QuantizedVec4Schema,
} from '@box/schema/utils/quantized-schema';
import { MuWriteStream, MuReadStream } from '@box/mudb/stream';

test('quantized-vec2', function () {
  function testDiffPatch(x: vec2, y: vec2, schema: QuantizedVec2Schema) {
    const write = new MuWriteStream(100);
    if (!schema.diff(x, y, write)) {
      expect(write.offset).toBe(0);
      return expect(schema.equal(x, y)).toBeTruthy();
    }
    const read = new MuReadStream(write.buffer.uint8);
    const z = schema.patch(x, read);
    expect(schema.equal(z, y)).toBeTruthy();
    expect(read.offset).toBe(write.offset);
  }

  function testRound(x: vec2, schema: QuantizedVec2Schema) {
    const z = schema.alloc();
    expect(schema.assign(z, x)).toBe(z);

    for (let i = 0; i < 2; ++i) {
      expect(Math.abs(z[i] - x[i]) <= schema.precision).toBeTruthy();
    }
    expect(schema.equal(x, z)).toBeTruthy();
  }

  function testPair(x: vec2, y: vec2, schema: QuantizedVec2Schema) {
    testRound(x, schema);
    testRound(y, schema);
    testDiffPatch(x, y, schema);
    testDiffPatch(y, x, schema);
    testDiffPatch(schema.identity, x, schema);
    testDiffPatch(schema.identity, y, schema);
    testDiffPatch(x, schema.identity, schema);
    testDiffPatch(y, schema.identity, schema);
  }

  function makeTestSchema(precision: number, identity: vec2) {
    const schema = new QuantizedVec2Schema(precision, identity);
    expect(schema.precision).toBe(precision);
    testRound(identity, schema);
    expect(schema.equal(identity, schema.identity)).toBeTruthy();
    return schema;
  }

  function randVec() {
    return vec2.fromValues(
      10 * (Math.random() - 0.5),
      10 * (Math.random() - 0.5),
    );
  }

  for (let scale = 0.25; scale <= 2; scale += 0.25) {
    const schema0 = makeTestSchema(scale, vec2.create());
    const schema1 = makeTestSchema(scale, vec2.fromValues(1, 1));
    for (let i = 0; i < 40; ++i) {
      const x = randVec();
      const y = randVec();
      testPair(x, y, schema0);
      testPair(x, y, schema1);

      x[0] = y[0];
      testPair(x, y, schema0);
      testPair(x, y, schema1);

      x[1] = y[1];
      testPair(x, y, schema0);
      testPair(x, y, schema1);

      x[0] = 10 * Math.random();
      testPair(x, y, schema0);
      testPair(x, y, schema1);
    }
  }
});

test('qunatized-vec3', function () {
  function testDiffPatch(x: vec3, y: vec3, schema: QuantizedVec3Schema) {
    const write = new MuWriteStream(100);
    if (!schema.diff(x, y, write)) {
      expect(write.offset).toBe(0);
      return expect(schema.equal(x, y)).toBeTruthy();
    }
    const read = new MuReadStream(write.buffer.uint8);
    const z = schema.patch(x, read);
    expect(schema.equal(z, y)).toBeTruthy();
    expect(read.offset).toBe(write.offset);
  }

  function testRound(x: vec3, schema: QuantizedVec3Schema) {
    const z = schema.alloc();
    expect(schema.assign(z, x)).toBe(z);

    for (let i = 0; i < 3; ++i) {
      expect(Math.abs(z[i] - x[i]) <= schema.precision).toBeTruthy();
    }
    expect(schema.equal(x, z)).toBeTruthy();
  }

  function testPair(x: vec3, y: vec3, schema: QuantizedVec3Schema) {
    testRound(x, schema);
    testRound(y, schema);
    testDiffPatch(x, y, schema);
    testDiffPatch(y, x, schema);
    testDiffPatch(schema.identity, x, schema);
    testDiffPatch(schema.identity, y, schema);
    testDiffPatch(x, schema.identity, schema);
    testDiffPatch(y, schema.identity, schema);
  }

  function makeTestSchema(precision: number, identity: vec3) {
    const schema = new QuantizedVec3Schema(precision, identity);
    expect(schema.precision).toBe(precision);
    testRound(identity, schema);
    expect(schema.equal(identity, schema.identity)).toBeTruthy();
    return schema;
  }

  function randVec() {
    return vec3.fromValues(
      10 * (Math.random() - 0.5),
      10 * (Math.random() - 0.5),
      10 * (Math.random() - 0.5),
    );
  }

  for (let scale = 0.25; scale <= 2; scale += 0.25) {
    const schema0 = makeTestSchema(scale, vec3.create());
    const schema1 = makeTestSchema(scale, vec3.fromValues(1, 1, 1));
    for (let i = 0; i < 40; ++i) {
      const x = randVec();
      const y = randVec();
      testPair(x, y, schema0);
      testPair(x, y, schema1);

      x[0] = y[0];
      testPair(x, y, schema0);
      testPair(x, y, schema1);

      x[1] = y[1];
      testPair(x, y, schema0);
      testPair(x, y, schema1);

      x[0] = 10 * Math.random();
      testPair(x, y, schema0);
      testPair(x, y, schema1);

      x[2] = y[2];
      testPair(x, y, schema0);
      testPair(x, y, schema1);

      x[1] = 10 * Math.random();
      testPair(x, y, schema0);
      testPair(x, y, schema1);

      x[0] = y[0];
      x[1] = 10 * Math.random();
      testPair(x, y, schema0);
      testPair(x, y, schema1);
    }
  }
});

test('qunatized-vec4', function () {
  function testDiffPatch(x: vec4, y: vec4, schema: QuantizedVec4Schema) {
    const write = new MuWriteStream(100);
    if (!schema.diff(x, y, write)) {
      expect(write.offset).toBe(0);
      return expect(schema.equal(x, y)).toBeTruthy();
    }
    const read = new MuReadStream(write.buffer.uint8);
    const z = schema.patch(x, read);
    expect(schema.equal(z, y)).toBeTruthy();
    expect(read.offset).toBe(write.offset);
  }

  function testRound(x: vec4, schema: QuantizedVec4Schema) {
    const z = schema.alloc();
    expect(schema.assign(z, x)).toBe(z);

    for (let i = 0; i < 4; ++i) {
      expect(Math.abs(z[i] - x[i]) <= schema.precision).toBeTruthy();
    }
    expect(schema.equal(x, z)).toBeTruthy();
  }

  function testPair(x: vec4, y: vec4, schema: QuantizedVec4Schema) {
    testRound(x, schema);
    testRound(y, schema);
    testDiffPatch(x, y, schema);
    testDiffPatch(y, x, schema);
    testDiffPatch(schema.identity, x, schema);
    testDiffPatch(schema.identity, y, schema);
    testDiffPatch(x, schema.identity, schema);
    testDiffPatch(y, schema.identity, schema);
  }

  function makeTestSchema(precision: number, identity: vec4) {
    const schema = new QuantizedVec4Schema(precision, identity);
    expect(schema.precision).toBe(precision);
    testRound(identity, schema);
    expect(schema.equal(identity, schema.identity)).toBeTruthy();
    return schema;
  }

  function randVec() {
    return vec4.fromValues(
      10 * (Math.random() - 0.5),
      10 * (Math.random() - 0.5),
      10 * (Math.random() - 0.5),
      10 * (Math.random() - 0.5),
    );
  }

  for (let scale = 0.25; scale <= 2; scale += 0.25) {
    const schema0 = makeTestSchema(scale, vec4.create());
    const schema1 = makeTestSchema(scale, vec4.fromValues(1, 1, 1, 1));
    for (let i = 0; i < 40; ++i) {
      for (let k = 0; k << (1 << 4); ++k) {
        const nx = randVec();
        const ny = randVec();
        for (let j = 0; j < 4; ++j) {
          if (k & (1 << j)) {
            ny[j] = nx[j];
          }
        }
        testPair(nx, ny, schema0);
        testPair(nx, ny, schema1);
      }
    }
  }
});
