import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { buildCommand } from './build';
import { unpackCommand } from './unpack';

function readManifest(fmap: string) {
  const result = spawnSync('tar', ['-xOf', fmap, 'feather.json'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || `missing feather.json`);
  return JSON.parse(result.stdout) as {
    map: { id: string; name?: string; version?: string };
    storage?: { volume?: string };
    runtime?: { port?: number; memoryMb?: number | null; playerLimit?: number | null };
    content: { hash: string };
  };
}

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-workspace-check-'));
  try {
    fs.writeFileSync(path.join(root, 'feather.toml'), [
      'schema_version = 1',
      '[project]',
      'id = "roundtrip-test"',
      'version = "0.1.0"',
      '[build]',
      'kind = "native"',
      'output = "out/original.fmap"',
      '[storage]',
      'volume = "roundtrip-volume"',
      '[runtime]',
      'port = 0',
      'memoryMb = 512',
      'playerLimit = 8',
      '',
    ].join('\n'));
    fs.writeFileSync(path.join(root, 'index.js'), '// roundtrip entry\n');
    const original = path.join(root, 'out/original.fmap');
    await buildCommand({ root, output: original });
    const before = readManifest(original);

    const unpacked = path.join(root, 'unpacked');
    await unpackCommand({ archive: original, dir: unpacked });
    if (!fs.existsSync(path.join(unpacked, 'project', 'info.json'))) throw new Error('missing project/info.json');
    if (!fs.existsSync(path.join(unpacked, 'chunks'))) throw new Error('missing chunks/');

    const rebuilt = path.join(root, 'out/rebuilt.fmap');
    await buildCommand({ root: unpacked, output: rebuilt });
    const after = readManifest(rebuilt);
    const fail: string[] = [];
    if (before.map.id !== after.map.id) fail.push('map.id');
    if (before.map.name !== after.map.name) fail.push(`map.name ${before.map.name} != ${after.map.name}`);
    if (before.map.version !== after.map.version) fail.push('map.version');
    if (before.storage?.volume !== after.storage?.volume) fail.push('storage.volume');
    if (JSON.stringify(before.runtime) !== JSON.stringify(after.runtime)) fail.push('runtime');
    if (fail.length) throw new Error(`round-trip mismatch: ${fail.join(', ')}`);
    process.stdout.write(`round-trip content hash: before=${before.content.hash} after=${after.content.hash}\n`);
    process.stdout.write('workspace checks passed\n');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
