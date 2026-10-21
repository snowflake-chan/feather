import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { EngineConfig } from 'feather-engine/contract';

import type { MapSpec } from './contract';
import {
  buildMapConfig,
  normalizeVolumeName,
  resolveVolumeDatabasePath,
} from './runtime/config';

let failures = 0;
function check(label: string, condition: boolean, detail: string) {
  if (condition) return;
  failures++;
  process.stdout.write(`FAIL ${label}: ${detail}\n`);
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-volume-'));
const base = {} as EngineConfig;
const make = (extra: Partial<MapSpec> = {}): MapSpec => ({
  id: 'bedwars-lobby',
  dataDir: path.join(root, 'data', 'bedwars-lobby'),
  ...extra,
});

try {
  const def = buildMapConfig(base, make(), root);
  check('默认 volume 是 map id', normalizeVolumeName(undefined, 'bedwars-lobby') === 'bedwars-lobby', 'default');
  check(
    '默认数据库路径',
    def.databaseUrl === `sqlite:///${resolveVolumeDatabasePath(root, 'bedwars-lobby')}`,
    String(def.databaseUrl),
  );
  check('默认 group 也是 map id', def.groupStorageNamespace === 'bedwars-lobby', String(def.groupStorageNamespace));

  const lobby = buildMapConfig(base, make({ volume: 'bedwars-group' }), root);
  const game = buildMapConfig(base, make({ id: 'bedwars-s2', volume: 'bedwars-group' }), root);
  check('显式 volume 文件名', lobby.databaseUrl?.endsWith('/volumes/bedwars-group.db'), String(lobby.databaseUrl));
  check('两个 map 共用 volume', lobby.databaseUrl === game.databaseUrl, `${lobby.databaseUrl} !== ${game.databaseUrl}`);
  check('显式 volume 成为 group', lobby.groupStorageNamespace === 'bedwars-group', String(lobby.groupStorageNamespace));
  check('map 私有 namespace 仍隔离', lobby.dataStorageNamespace === 'bedwars-lobby' && game.dataStorageNamespace === 'bedwars-s2', 'namespaces');

  const explicit = buildMapConfig(base, make({ databaseUrl: 'sqlite:////tmp/custom.db', volume: 'ignored' }), root);
  check('显式 databaseUrl 优先', explicit.databaseUrl === 'sqlite:////tmp/custom.db', String(explicit.databaseUrl));

  let rejected = false;
  try {
    buildMapConfig(base, make({ volume: '../escape' }), root);
  } catch {
    rejected = true;
  }
  check('拒绝路径穿越', rejected, 'accepted invalid volume');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

if (failures > 0) {
  process.stdout.write(`volume checks failed: ${failures}\n`);
  process.exit(1);
}
process.stdout.write('volume checks passed\n');
