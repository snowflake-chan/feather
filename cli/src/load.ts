import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { resolveDataRoot } from './data-root';
import { withTempExtract } from './archive';
import {
  FmapManifest,
  hashContent,
  readFmapManifest,
  writeFmapManifest,
} from './fmap';
import {
  MapGroupDescriptor,
  PlayBundle,
  readJson,
  safeName,
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

function targetMapDir(dataRoot: string, id: string, force: boolean): string {
  const dir = path.join(dataRoot, 'maps', safeName(id, 'map'));
  if (fs.existsSync(dir)) {
    if (!force) throw new Error(`map already exists: ${dir} (use --force)`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function copyContent(source: string, target: string) {
  if (!fs.existsSync(source)) throw new Error(`missing content: ${source}`);
  fs.cpSync(source, target, { recursive: true, dereference: true });
}

function installFmap(
  temp: string,
  archive: string,
  options: LoadOptions,
) {
  const manifest = readFmapManifest(temp);
  const dataRoot = resolveDataRoot(options.dataDir);
  const mapDir = targetMapDir(dataRoot, manifest.map.id, !!options.force);
  const sourceContent = path.resolve(temp, 'content');
  copyContent(sourceContent, path.join(mapDir, 'content'));
  const installed: FmapManifest = {
    ...manifest,
    content: {
      ...manifest.content,
      hash: hashContent(path.join(mapDir, 'content')),
    },
    source: {
      ...manifest.source,
      hash: manifest.source?.hash || sha256(archive),
    },
  };
  writeFmapManifest(mapDir, installed);
  console.log(`data:      ${dataRoot}`);
  console.log(`map:       ${installed.map.id} ${installed.map.version || ''}`);
  console.log(`volume:    ${installed.storage?.volume || installed.map.id}`);
  console.log('');
  console.log('next:');
  console.log(`  feather up ${safeName(installed.map.id, 'map')}`);
}

function installPlayBundle(
  temp: string,
  archive: string,
  options: LoadOptions,
) {
  const bundle = readJson<PlayBundle>(path.join(temp, 'bundle.json'));
  const dataRoot = resolveDataRoot(options.dataDir);
  const archiveHash = sha256(archive);
  const ids: string[] = [];
  for (const member of bundle.members) {
    const mapDir = targetMapDir(dataRoot, member.id, !!options.force);
    const source = path.join(temp, 'worlds', member.id, 'data');
    copyContent(source, path.join(mapDir, 'content'));
    const contentDir = path.join(mapDir, 'content');
    const manifest: FmapManifest = {
      format: 'feather.map',
      formatVersion: 1,
      map: {
        id: member.id,
        name: member.name,
        version: bundle.version || undefined,
      },
      content: {
        state: 'content/project-state.json',
        blobs: 'content/blobs',
        hash: hashContent(contentDir),
      },
      // 只做 storage 映射：group 的成员共享这个 volume。
      storage: { volume: bundle.mapGroupId },
      runtime: {
        port: 0,
        memoryMb: null,
        playerLimit: null,
      },
      source: {
        kind: 'boxplay',
        version: bundle.version,
        hash: archiveHash,
      },
      requires: { feather: '>=0.1.0', format: 1 },
    };
    writeFmapManifest(mapDir, manifest);
    ids.push(safeName(member.id, 'map'));
  }

  console.log(`data:      ${dataRoot}`);
  console.log(`format:    boxplay -> feather.map (${bundle.version || 'unversioned'})`);
  console.log(`group:     ${bundle.mapGroupId}`);
  console.log(`maps:      ${bundle.members.map((m) => m.id).join(', ')}`);
  console.log('');
  console.log('next:');
  console.log(`  feather up ${ids.join(' ')}`);
}

function loadProjectArchive(
  temp: string,
  archive: string,
  options: LoadOptions,
) {
  const group = readJson<MapGroupDescriptor>(path.join(temp, 'group.json'));
  const workspace = path.join(resolveDataRoot(options.dataDir), 'projects');
  const target = path.join(workspace, safeName(group.mapGroupId, 'project'));
  if (fs.existsSync(target) && !options.force) {
    throw new Error(`project already exists: ${target} (use --force)`);
  }
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(path.join(temp, 'projects'), target, {
    recursive: true,
    dereference: true,
  });
  fs.copyFileSync(path.join(temp, 'group.json'), path.join(target, 'group.json'));

  console.log(`projects:  ${workspace}`);
  console.log(`format:    boxproject (source archive)`);
  console.log(`group:     ${group.mapGroupId}`);
  console.log('');
  console.log('note: .boxproject is editable source, not a playable release.');
  console.log('      use a .boxplay to produce feather.map packages.');
  process.exitCode = 2;
}

export async function loadCommand(options: LoadOptions) {
  const archive = path.resolve(options.archive);
  if (!fs.existsSync(archive)) {
    throw new Error(`archive not found: ${archive}`);
  }
  await withTempExtract(archive, async (temp) => {
    if (fs.existsSync(path.join(temp, 'feather.json'))) {
      installFmap(temp, archive, options);
      return;
    }
    if (fs.existsSync(path.join(temp, 'bundle.json'))) {
      installPlayBundle(temp, archive, options);
      return;
    }
    if (fs.existsSync(path.join(temp, 'group.json'))) {
      loadProjectArchive(temp, archive, options);
      return;
    }
    throw new Error('unknown archive: expected feather.json, bundle.json, or group.json');
  });
}
