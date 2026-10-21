import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { hashContent, writeFmapManifest } from './fmap';
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
  const dir = path.join(dataRoot, 'maps', id);
  fs.mkdirSync(path.join(dir, 'content'), { recursive: true });
  fs.mkdirSync(path.join(dataRoot, 'blobs'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'content', 'project-state.json'), '{"formatVersion":1}');
  writeFmapManifest(dir, {
    format: 'feather.map',
    formatVersion: 1,
    map: { id, name: id, version: '1.0.0' },
    content: {
      state: 'content/project-state.json',
      blobs: path.join(dataRoot, 'blobs'),
      hash: hashContent(path.join(dir, 'content')),
    },
    storage: volume === undefined ? undefined : { volume },
    runtime: { port: 0 },
    requires: { feather: '>=0.1.0', format: 1 },
  });
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
  const projectStatePath = loaded.maps[0].projectStatePath || '';
  check(
    'content 路径正确',
    projectStatePath.endsWith('/content/project-state.json'),
    projectStatePath,
  );
  check(
    'contentDir 指向全局 blobs',
    loaded.maps[0].contentDir === path.join(dataRoot, 'blobs'),
    String(loaded.maps[0].contentDir),
  );

  let duplicate = false;
  try {
    loadMaps([a, a], dataRoot);
  } catch {
    duplicate = true;
  }
  check('重复 map id 被拒绝', duplicate, 'accepted duplicate');

  let traversal = false;
  const bad = map('bad');
  writeFmapManifest(bad, {
    format: 'feather.map',
    formatVersion: 1,
    map: { id: 'bad' },
    content: { state: '../../escape.json', blobs: 'content/blobs' },
  });
  try {
    loadMaps([bad], dataRoot);
  } catch {
    traversal = true;
  }
  check('content 路径穿越被拒绝', traversal, 'accepted traversal');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

if (failures > 0) {
  process.stdout.write(`map checks failed: ${failures}\n`);
  process.exit(1);
}
process.stdout.write('map checks passed\n');
