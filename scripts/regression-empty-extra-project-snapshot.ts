import assert from 'assert';

import { MuWriteStream } from '@box/mudb/stream';
import { ExtraProjectInfoSchema } from '@box/schema/project/hot-schema';
import { decodeExtraProjectInfo } from '../src/project/decode-extra-project';

const stream = new MuWriteStream(1);
const changed = ExtraProjectInfoSchema.diff(
  ExtraProjectInfoSchema.identity,
  ExtraProjectInfoSchema.identity,
  stream,
);
const persistedBytes = stream.bytes();
stream.destroy();

assert.equal(changed, false, 'an empty shared-resource index must serialize as no diff');
assert.equal(persistedBytes.byteLength, 0, 'the persisted empty index must be zero bytes');

// Content storage reconstructs a fresh zero-length Uint8Array. Unlike the
// write stream's backing allocation, that has a genuinely zero-byte
// DataView—the exact form returned by contentServer.retrieve().
const retrievedBytes = new Uint8Array(persistedBytes);
const decoded = decodeExtraProjectInfo(retrievedBytes);
assert.deepEqual(
  decoded,
  ExtraProjectInfoSchema.identity,
  'a zero-byte shared-resource index must decode as identity without throwing',
);
ExtraProjectInfoSchema.free(decoded);

console.log('empty extra project snapshot regression passed');
