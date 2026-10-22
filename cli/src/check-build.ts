import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { buildCommand } from '@feather/daemon/build';
import { readFmapManifest } from './fmap';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-build-check-'));
fs.writeFileSync(
  path.join(root, 'feather.toml'),
  [
    'schema_version = 1',
    '[project]',
    'id = "native-test"',
    'name = "Native Test"',
    'version = "0.1.0"',
    '[build]',
    'kind = "native"',
    'output = "out/native-test.fmap"',
    '[storage]',
    'volume = "native-group"',
    '[runtime]',
    'playerLimit = 8',
    '',
  ].join('\n'),
);
fs.writeFileSync(path.join(root, 'index.js'), '// native test entry\n');
fs.mkdirSync(path.join(root, 'mesh'), { recursive: true });
fs.writeFileSync(path.join(root, 'mesh', 'cube.vb'), 'mesh-data');
fs.mkdirSync(path.join(root, 'audio'), { recursive: true });
fs.writeFileSync(path.join(root, 'audio', 'theme.mp3'), 'audio-data');

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
    if (manifest.assets?.['mesh/cube.vb']?.type !== 'mesh') throw new Error('missing mesh asset');
    if (manifest.assets?.['audio/theme.mp3']?.type !== 'audio') throw new Error('missing audio asset');
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
