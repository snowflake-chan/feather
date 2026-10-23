import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import type { MapSpec } from './contract';

export interface ImportOptions {
  replace?: boolean;
  purgeData?: boolean;
  recreate?: boolean;
}

export interface ImportResult {
  maps: { id: string; state: string }[];
}

interface FmapManifest {
  format?: string;
  formatVersion?: number;
  map?: { id?: string; name?: string; version?: string };
  content?: { state?: string; blobs?: string; hash?: string };
  storage?: { volume?: string };
  runtime?: { port?: number; memoryMb?: number | null; playerLimit?: number | null };
  source?: Record<string, unknown>;
}

interface BundleManifest {
  version?: string;
  mapGroupId?: string;
  members?: { id?: string; name?: string }[];
}

const ID_RE = /^[A-Za-z0-9._-]+$/;
const VOLUME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

function safeName(value: string, fallback: string) {
  const name = String(value || '').trim();
  return ID_RE.test(name) && !name.includes('..') ? name : fallback;
}

function listArchive(file: string) {
  const result = spawnSync('tar', ['-tzf', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw Object.assign(new Error(`not a readable gzip/tar archive: ${file}`), {
      code: 'ARCHIVE_INVALID',
    });
  }
  return result.stdout.split('\n').map((value) => value.trim()).filter(Boolean);
}

function assertSafe(entries: string[]) {
  for (const entry of entries) {
    const normalized = entry.replace(/^\.\//, '');
    if (normalized.startsWith('/') || normalized.split('/').includes('..')) {
      throw Object.assign(new Error(`unsafe archive entry: ${entry}`), {
        code: 'ARCHIVE_INVALID',
      });
    }
  }
}

function extract(file: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const result = spawnSync('tar', ['-xzf', file, '-C', dest]);
  if (result.status !== 0) {
    throw Object.assign(new Error(`failed to extract archive: ${file}`), {
      code: 'ARCHIVE_INVALID',
    });
  }
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

function hashFile(file: string) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function copyContent(source: string, target: string) {
  if (!fs.existsSync(source)) {
    throw Object.assign(new Error(`missing content: ${source}`), { code: 'ARCHIVE_INVALID' });
  }
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === 'blobs') continue;
    fs.cpSync(path.join(source, entry.name), path.join(target, entry.name), {
      recursive: true,
      dereference: true,
    });
  }
}

function mergeBlobs(source: string, dataRoot: string) {
  if (!fs.existsSync(source)) return;
  const target = path.join(dataRoot, 'blobs');
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const to = path.join(target, entry.name);
    if (!fs.existsSync(to)) fs.copyFileSync(path.join(source, entry.name), to);
  }
}

function projectHash(statePath: string) {
  try {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8')) as { permissionHash?: unknown };
    return typeof state.permissionHash === 'string' ? state.permissionHash : '';
  } catch {
    return '';
  }
}

function specFor(
  id: string,
  name: string | undefined,
  mapDir: string,
  dataRoot: string,
  manifest: FmapManifest,
): MapSpec {
  const volume = String(manifest.storage?.volume || id);
  if (!VOLUME_RE.test(volume) || volume.includes('..')) {
    throw Object.assign(new Error(`invalid volume: ${volume}`), { code: 'ARCHIVE_INVALID' });
  }
  const statePath = path.join(mapDir, 'content', 'project-state.json');
  return {
    id,
    name,
    projectStatePath: statePath,
    contentDir: path.join(dataRoot, 'blobs'),
    projectHash: projectHash(statePath),
    contentHash: manifest.content?.hash || "",
    port: Number(manifest.runtime?.port) || 0,
    scriptWorkerEntry: path.resolve(__dirname, '../../shell/tools/worker-entry/worker-entry.js'),
    dataDir: path.join(dataRoot, 'maps', id, 'data'),
    mode: 'play',
    method: 'local',
    databaseUrl: `sqlite:///${path.join(dataRoot, 'volumes', `${volume}.db`)}`,
    volume,
    dataStorageNamespace: id,
    limits: {
      memoryMb: typeof manifest.runtime?.memoryMb === 'number' ? manifest.runtime.memoryMb : undefined,
      players: typeof manifest.runtime?.playerLimit === 'number' ? manifest.runtime.playerLimit : undefined,
    },
    labels: {
      version: manifest.map?.version || '',
      source: String(manifest.source?.kind || ''),
    },
  };
}

export interface PreparedImport {
  temp: string;
  specs: MapSpec[];
  install: (spec: MapSpec) => void;
  cleanup: () => void;
}

function installMap(
  contentSource: string,
  mapDir: string,
  dataRoot: string,
  manifest: FmapManifest,
  archiveHash: string,
  options: ImportOptions,
) {
  if (options.purgeData) fs.rmSync(path.join(mapDir, 'data'), { recursive: true, force: true });
  fs.mkdirSync(mapDir, { recursive: true });
  const targetContent = path.join(mapDir, 'content');
  fs.rmSync(targetContent, { recursive: true, force: true });
  copyContent(contentSource, targetContent);
  mergeBlobs(path.join(contentSource, 'blobs'), dataRoot);
  const installed: FmapManifest = {
    ...manifest,
    source: { ...manifest.source, hash: archiveHash },
  };
  fs.writeFileSync(path.join(mapDir, 'feather.json'), `${JSON.stringify(installed, null, 2)}\n`);
}

/**
 * Prepare an archive in a temp dir. The daemon must check conflicts before
 * calling install(), so a failed multi-map import does not leave half a bundle.
 */
export function prepareImport(
  archive: string,
  dataRoot: string,
  options: ImportOptions,
): PreparedImport {
  const entries = listArchive(archive);
  assertSafe(entries);
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-import-'));
  extract(archive, temp);
  const archiveHash = hashFile(archive);

  if (fs.existsSync(path.join(temp, 'group.json'))) {
    fs.rmSync(temp, { recursive: true, force: true });
    throw Object.assign(new Error('.boxproject is editable source; use feather unpack'), {
      code: 'ARCHIVE_UNSUPPORTED',
    });
  }

  const maps: {
    id: string;
    name?: string;
    mapDir: string;
    contentSource: string;
    manifest: FmapManifest;
  }[] = [];

  if (fs.existsSync(path.join(temp, 'feather.json'))) {
    const manifest = readJson<FmapManifest>(path.join(temp, 'feather.json'));
    const id = safeName(String(manifest.map?.id || ''), '');
    if (!id) throw Object.assign(new Error('map archive has no valid map.id'), { code: 'ARCHIVE_INVALID' });
    const mapDir = path.join(dataRoot, 'maps', id);
    maps.push({
      id,
      name: manifest.map?.name,
      mapDir,
      contentSource: path.join(temp, 'content'),
      manifest,
    });
  } else if (fs.existsSync(path.join(temp, 'bundle.json'))) {
    const bundle = readJson<BundleManifest>(path.join(temp, 'bundle.json'));
    const members = Array.isArray(bundle.members) ? bundle.members : [];
    if (members.length === 0) {
      throw Object.assign(new Error('play bundle has no members'), { code: 'ARCHIVE_INVALID' });
    }
    for (const member of members) {
      const id = safeName(String(member.id || ''), '');
      if (!id) throw Object.assign(new Error('play bundle member has no valid id'), { code: 'ARCHIVE_INVALID' });
      maps.push({
        id,
        name: member.name,
        mapDir: path.join(dataRoot, 'maps', id),
        contentSource: path.join(temp, 'worlds', id, 'data'),
        manifest: {
          format: 'feather.map',
          formatVersion: 1,
          map: { id, name: member.name, version: bundle.version },
          storage: bundle.mapGroupId ? { volume: bundle.mapGroupId } : undefined,
          source: { kind: 'boxplay', version: bundle.version },
        },
      });
    }
  } else {
    fs.rmSync(temp, { recursive: true, force: true });
    throw Object.assign(new Error('unknown archive: expected feather.json or bundle.json'), {
      code: 'ARCHIVE_INVALID',
    });
  }

  const specs = maps.map((entry) => ({
    ...specFor(entry.id, entry.name, entry.mapDir, dataRoot, entry.manifest),
    size: fs.statSync(archive).size,
  }));
  return {
    temp,
    specs,
    install: (spec) => {
      const entry = maps.find((item) => item.id === spec.id);
      if (!entry) throw new Error(`missing import plan: ${spec.id}`);
      installMap(
        entry.contentSource,
        entry.mapDir,
        dataRoot,
        entry.manifest,
        archiveHash,
        options,
      );
    },
    cleanup: () => fs.rmSync(temp, { recursive: true, force: true }),
  };
}
