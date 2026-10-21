import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { loadMaps } from './workspace-spec';

let failures = 0;
function check(label: string, condition: boolean, detail: string) {
  if (condition) return;
  failures++;
  process.stdout.write(`FAIL ${label}: ${detail}\n`);
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-maps-'));
const dataRoot = path.join(root, 'data');
function map(id: string, volume?: string): string {
  const dir = path.join(root, id);
  fs.mkdirSync(path.join(dir, 'data', 'blobs'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'data', 'project-state.json'), '{"formatVersion":1}');
  fs.writeFileSync(
    path.join(dir, 'feather.toml'),
    [
      'schema_version = 1',
      '[map]',
      `id = "${id}"`,
      '[storage]',
      volume === undefined ? '' : `volume = "${volume}"`,
      '',
    ].join('\n'),
  );
  return dir;
}

try {
  const a = map('a');
  const b = map('b', 'group');
  const c = map('c', 'group');
  const loaded = loadMaps([a, b, c], dataRoot);
  check('三个 map', loaded.maps.length === 3, String(loaded.maps.length));
  check('默认 volume = map id', loaded.maps[0].volume === 'a', String(loaded.maps[0].volume));
  check(
    '默认 DB 在 data root',
    loaded.maps[0].databaseUrl === `sqlite:///${path.join(dataRoot, 'volumes', 'a.db')}`,
    String(loaded.maps[0].databaseUrl),
  );
  check('显式 group 共享 DB', loaded.maps[1].databaseUrl === loaded.maps[2].databaseUrl, 'not shared');
  check('显式 group namespace', loaded.maps[1].groupNamespace === 'group', String(loaded.maps[1].groupNamespace));

  let duplicate = false;
  try {
    loadMaps([a, a], dataRoot);
  } catch {
    duplicate = true;
  }
  check('重复 map id 被拒绝', duplicate, 'accepted duplicate');

  let legacy = false;
  const legacyDir = path.join(root, 'legacy');
  fs.mkdirSync(legacyDir, { recursive: true });
  fs.writeFileSync(path.join(legacyDir, 'feather.toml'), '[[maps]]\nid = "old"\npath = "."\n');
  try {
    loadMaps([legacyDir], dataRoot);
  } catch {
    legacy = true;
  }
  check('旧 [[maps]] 不被接受', legacy, 'accepted legacy');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

if (failures > 0) {
  process.stdout.write(`map checks failed: ${failures}\n`);
  process.exit(1);
}
process.stdout.write('map checks passed\n');
