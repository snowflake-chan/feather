'use strict';
// Golden vectors for the shared script protocol.
//   node scripts/golden.js            # verify
//   node scripts/golden.js --update   # regenerate
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MuWriteStream, MuReadStream } = require('@box/mudb/stream');
const proto = require('../dist/script-protocol');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function protocolFingerprint() {
  const map = {};
  for (const side of ['client', 'server']) {
    map[side] = {};
    for (const [name, schema] of Object.entries(proto.ScriptProtocol[side])) {
      map[side][name] = schema.json;
    }
  }
  return sha256(JSON.stringify(map));
}

function perfVector() {
  const schema = proto.ScriptPerfCounterSchema;
  const base = schema.alloc();
  const target = schema.clone(base);
  target.entitiesCreated = 3;
  target.pqScheduled = 7;

  const ws = new MuWriteStream(128);
  const changed = schema.diff(base, target, ws);
  const bytes = Buffer.from(ws.bytes());
  ws.destroy();

  const rs = new MuReadStream(bytes);
  const patched = schema.patch(schema.clone(base), rs);
  const patchOk =
    patched.entitiesCreated === 3 && patched.pqScheduled === 7;

  schema.free(base);
  schema.free(target);

  return {
    schema: 'ScriptPerfCounterSchema',
    schemaSha256: sha256(JSON.stringify(schema.json)),
    changed,
    diffHex: bytes.toString('hex'),
    diffBytes: bytes.length,
    patchOk,
  };
}

const vector = {
  protocolSha256: protocolFingerprint(),
  perf: perfVector(),
};

const file = path.join(__dirname, '..', 'golden', 'vectors.json');
if (process.argv.includes('--update') || !fs.existsSync(file)) {
  fs.writeFileSync(file, JSON.stringify(vector, null, 2) + '\n');
  console.log('wrote', file);
  process.exit(0);
}

const expected = JSON.parse(fs.readFileSync(file, 'utf8'));
if (JSON.stringify(expected) !== JSON.stringify(vector)) {
  console.error('golden vectors mismatch');
  console.error('expected:', JSON.stringify(expected, null, 2));
  console.error('actual:  ', JSON.stringify(vector, null, 2));
  process.exit(1);
}
if (!vector.perf.changed || !vector.perf.patchOk) {
  console.error('perf vector invalid');
  process.exit(1);
}
console.log('golden vectors ok', vector.perf.diffBytes, 'bytes');
