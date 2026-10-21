import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { buildCommand } from './build';
import { readFmapManifest } from './fmap';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-build-check-'));
const source = path.join(root, 'source');
fs.mkdirSync(path.join(source, 'blobs'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'feather.toml'),
  [
    'schema_version = 1',
    '[project]',
    'id = "native-test"',
    'name = "Native Test"',
    'version = "0.1.0"',
    '[build]',
    'source = "source"',
    'output = "out/native-test.fmap"',
    '[storage]',
    'volume = "native-group"',
    '[runtime]',
    'playerLimit = 8',
    '',
  ].join('\n'),
);
fs.writeFileSync(
  path.join(source, 'project-state.json'),
  JSON.stringify({ formatVersion: 1 }),
);
fs.writeFileSync(path.join(source, 'blobs', 'blob-a'), 'hello');

async function main() {
try {
  await buildCommand({ root });
  const output = path.join(root, 'out', 'native-test.fmap');
  if (!fs.existsSync(output)) throw new Error(`missing output: ${output}`);
  const entries = spawnSync('tar', ['-tzf', output], {
    encoding: 'utf8',
  });
  if (entries.status !== 0) throw new Error(entries.stderr);
  const names = entries.stdout.split('\n').filter(Boolean);
  if (!names.includes('feather.json')) throw new Error('missing feather.json');
  if (!names.includes('content/project-state.json')) {
    throw new Error('missing content/project-state.json');
  }
  if (names.some((name) => name.includes('feather.toml'))) {
    throw new Error('feather.toml leaked into package');
  }

  const extract = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-build-extract-'));
  try {
    const tar = spawnSync(
      'tar',
      ['-xzf', output, '-C', extract],
      { encoding: 'utf8' },
    );
    if (tar.status !== 0) throw new Error(tar.stderr);
    const manifest = readFmapManifest(extract);
    if (manifest.map.id !== 'native-test') throw new Error('wrong map id');
    if (manifest.storage?.volume !== 'native-group') throw new Error('wrong volume');
    if (!manifest.content.hash?.startsWith('sha256:')) throw new Error('missing content hash');
  } finally {
    fs.rmSync(extract, { recursive: true, force: true });
  }
  process.stdout.write('build checks passed\n');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
