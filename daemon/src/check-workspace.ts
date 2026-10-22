import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { buildCommand } from './build';
import { unpackCommand } from './unpack';

function readManifest(fmap: string) {
  const result = spawnSync('tar', ['-xOf', fmap, 'feather.json'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'missing feather.json');
  return JSON.parse(result.stdout) as {
    map: { id: string; name?: string; version?: string };
    storage?: { volume?: string };
    runtime?: { port?: number; memoryMb?: number | null; playerLimit?: number | null };
    content: { hash: string };
  };
}

async function main() {
  const fixture = path.resolve(__dirname, '../../test-fixtures/roundtrip.fmap');
  if (!fs.existsSync(fixture)) throw new Error(`missing fixture: ${fixture}`);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-workspace-check-'));
  try {
    const before = readManifest(fixture);
    const unpacked = path.join(root, 'unpacked');
    await unpackCommand({ archive: fixture, dir: unpacked });
    for (const required of ['project/info.json', 'project/assets.json', 'project/chunks']) {
      if (required === 'project/chunks') continue;
      if (!fs.existsSync(path.join(unpacked, required))) throw new Error(`missing ${required}`);
    }
    if (!fs.existsSync(path.join(unpacked, 'chunks'))) throw new Error('missing chunks/');
    const rebuilt = path.join(root, 'rebuilt.fmap');
    await buildCommand({ root: unpacked, output: rebuilt });
    const after = readManifest(rebuilt);
    const fail: string[] = [];
    if (before.map.id !== after.map.id) fail.push('map.id');
    if (before.map.name !== after.map.name) fail.push(`map.name ${before.map.name} != ${after.map.name}`);
    if (before.map.version !== after.map.version) fail.push('map.version');
    if (before.storage?.volume !== after.storage?.volume) fail.push('storage.volume');
    if (JSON.stringify(before.runtime) !== JSON.stringify(after.runtime)) fail.push('runtime');
    if (before.content.hash !== after.content.hash) fail.push(`content.hash ${before.content.hash} != ${after.content.hash}`);
    if (fail.length) throw new Error(`round-trip mismatch: ${fail.join(', ')}`);
    process.stdout.write(`workspace checks passed: ${before.content.hash}\n`);
  } finally {
    if (!process.env.KEEP) fs.rmSync(root, { recursive: true, force: true });
    else process.stdout.write(`kept: ${root}\n`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
