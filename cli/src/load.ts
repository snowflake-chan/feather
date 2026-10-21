import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { resolveDataRoot } from './data-root';
import { withTempExtract } from './archive';
import {
  ensureEmptyDir,
  MapGroupDescriptor,
  PlayBundle,
  readJson,
  safeName,
  tomlString,
} from './workspace';

export interface LoadOptions {
  archive: string;
  dataDir?: string;
  force?: boolean;
}

function sha256(file: string) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

function copyPlayBundle(
  temp: string,
  dataRoot: string,
  bundle: PlayBundle,
  force: boolean,
): string[] {
  const mapsRoot = path.join(dataRoot, 'maps');
  fs.mkdirSync(mapsRoot, { recursive: true });
  const dirs: string[] = [];
  const seen = new Set<string>();
  for (const member of bundle.members) {
    const dirName = safeName(member.id, 'map');
    if (seen.has(dirName)) throw new Error(`duplicate map directory: ${dirName}`);
    seen.add(dirName);
    const mapDir = path.join(mapsRoot, dirName);
    if (fs.existsSync(mapDir)) {
      if (!force) throw new Error(`map already exists: ${mapDir} (use --force)`);
      fs.rmSync(mapDir, { recursive: true, force: true });
    }
    fs.cpSync(path.join(temp, 'worlds', member.id), mapDir, {
      recursive: true,
      dereference: true,
    });
    const lines: string[] = [];
    lines.push('schema_version = 1');
    lines.push('');
    lines.push('[map]');
    lines.push(`id = ${tomlString(member.id)}`);
    if (member.name) lines.push(`name = ${tomlString(member.name)}`);
    lines.push('');
    lines.push('[storage]');
    // group 成员共享同一个 volume；单图也会得到 <groupId>.db
    lines.push(`volume = ${tomlString(bundle.mapGroupId)}`);
    lines.push('');
    fs.writeFileSync(path.join(mapDir, 'feather.toml'), lines.join('\n'));
    dirs.push(mapDir);
  }
  return dirs;
}

function writePlayWorkspace(
  mapDir: string,
  archive: string,
  bundle: PlayBundle,
) {
  fs.writeFileSync(
    path.join(mapDir, 'feather.lock'),
    JSON.stringify(
      {
        format: 'boxplay',
        source: path.basename(archive),
        sha256: sha256(archive),
        mapGroupId: bundle.mapGroupId,
        version: bundle.version || '',
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ) + '\n',
  );
}

function loadPlayBundle(
  temp: string,
  archive: string,
  options: LoadOptions,
) {
  const bundle = readJson<PlayBundle>(path.join(temp, 'bundle.json'));
  const dataRoot = resolveDataRoot(options.dataDir);
  const mapDirs = copyPlayBundle(temp, dataRoot, bundle, !!options.force);
  for (const mapDir of mapDirs) writePlayWorkspace(mapDir, archive, bundle);

  console.log(`data:      ${dataRoot}`);
  console.log(`format:    boxplay (${bundle.version || 'unversioned'})`);
  console.log(`group:     ${bundle.mapGroupId}`);
  console.log(`maps:      ${bundle.members.map((m) => m.id).join(', ')}`);
  console.log('');
  console.log('next:');
  console.log(`  feather up ${bundle.members.map((m) => safeName(m.id, 'map')).join(' ')}`);
}

function loadProjectArchive(
  temp: string,
  archive: string,
  options: LoadOptions,
) {
  const group = readJson<MapGroupDescriptor>(path.join(temp, 'group.json'));
  const workspace = path.join(resolveDataRoot(options.dataDir), 'projects');
  fs.mkdirSync(workspace, { recursive: true });
  const target = path.join(workspace, group.mapGroupId);
  if (fs.existsSync(target) && !options.force) {
    throw new Error(`project already exists: ${target} (use --force)`);
  }
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(path.join(temp, 'projects'), path.join(target, 'projects'), {
    recursive: true,
    dereference: true,
  });
  fs.copyFileSync(path.join(temp, 'group.json'), path.join(target, 'group.json'));
  fs.writeFileSync(
    path.join(target, 'feather.lock'),
    JSON.stringify(
      {
        format: 'boxproject',
        source: path.basename(archive),
        sha256: sha256(archive),
        mapGroupId: group.mapGroupId,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ) + '\n',
  );

  console.log(`workspace: ${workspace}`);
  console.log(`format:    boxproject (source archive)`);
  console.log(`group:     ${group.mapGroupId}`);
  console.log(`source:    ${target}`);
  console.log('');
  console.log('note: .boxproject is editable source, not a playable release.');
  console.log('      use a .boxplay for `feather up`; project import/publish is TODO.');
  process.exitCode = 2;
}

export async function loadCommand(options: LoadOptions) {
  const archive = path.resolve(options.archive);
  if (!fs.existsSync(archive)) {
    throw new Error(`archive not found: ${archive}`);
  }
  await withTempExtract(archive, async (temp) => {
    if (fs.existsSync(path.join(temp, 'bundle.json'))) {
      loadPlayBundle(temp, archive, options);
      return;
    }
    if (fs.existsSync(path.join(temp, 'group.json'))) {
      loadProjectArchive(temp, archive, options);
      return;
    }
    throw new Error('unknown archive: expected bundle.json (.boxplay) or group.json (.boxproject)');
  });
}
