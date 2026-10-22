import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { buildProjectArchive } from '@feather/builder/feather';

import { readFmapManifest } from './fmap';

export interface UnpackOptions {
  archive: string;
  dir?: string;
  kind?: string;
  force?: boolean;
}

export interface UnpackResult {
  dir: string;
  map: string;
  source: 'boxproject' | 'fmap';
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeName(value: string, fallback: string) {
  const name = String(value || '').trim();
  return /^[A-Za-z0-9._-]+$/.test(name) && !name.includes('..') ? name : fallback;
}

function extract(file: string, dest: string) {
  ensureDir(dest);
  const result = spawnSync('tar', ['-xzf', file, '-C', dest], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw Object.assign(new Error(`failed to extract ${file}: ${result.stderr || ''}`), {
      code: 'ARCHIVE_INVALID',
    });
  }
}

function writeWorkspace(
  target: string,
  source: 'boxproject' | 'fmap',
  manifest: {
    id: string;
    name?: string;
    version?: string;
    volume?: string;
    state: string;
    blobs: string;
  },
) {
  ensureDir(path.dirname(target));
  const workspace = fs.mkdtempSync(path.join(path.dirname(target), '.feather-unpack-'));
  try {
    const sourceDir = path.join(workspace, 'source');
    ensureDir(sourceDir);
    fs.copyFileSync(manifest.state, path.join(sourceDir, 'project-state.json'));
    if (fs.existsSync(manifest.blobs)) {
      fs.cpSync(manifest.blobs, path.join(sourceDir, 'blobs'), {
        recursive: true,
        dereference: true,
      });
    }
    const id = safeName(manifest.id, 'map');
    const version = manifest.version || '1.0.0';
    const toml = [
      'schema_version = 1',
      '',
      '[project]',
      `id = ${JSON.stringify(id)}`,
      ...(manifest.name ? [`name = ${JSON.stringify(manifest.name)}`] : []),
      `version = ${JSON.stringify(version)}`,
      '',
      '[build]',
      'source = "source"',
      `output = "dist/${id}.fmap"`,
      '',
      ...(manifest.volume ? ['[storage]', `volume = ${JSON.stringify(manifest.volume)}`, ''] : []),
    ].join('\n');
    fs.writeFileSync(path.join(workspace, 'feather.toml'), `${toml}\n`);
    if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
    fs.renameSync(workspace, target);
    return { dir: target, map: id, source };
  } catch (error) {
    fs.rmSync(workspace, { recursive: true, force: true });
    throw error;
  }
}

export async function unpackCommand(options: UnpackOptions): Promise<UnpackResult> {
  const archive = path.resolve(options.archive);
  if (!fs.existsSync(archive)) {
    throw Object.assign(new Error(`archive not found: ${archive}`), { code: 'ARCHIVE_INVALID' });
  }
  const kind = options.kind || 'baked';
  if (kind !== 'baked') {
    throw Object.assign(new Error(`unpack kind not implemented: ${kind}`), { code: 'NOT_IMPLEMENTED' });
  }
  const target = path.resolve(options.dir || path.basename(archive).replace(/\.(fmap|boxproject)$/i, ''));
  if (fs.existsSync(target) && !options.force) {
    throw Object.assign(new Error(`target exists: ${target} (use --force)`), { code: 'WORKSPACE_EXISTS' });
  }

  const ext = path.extname(archive).toLowerCase();
  if (ext === '.boxproject') {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-unpack-project-'));
    try {
      const fmap = path.join(temp, 'release.fmap');
      const built = buildProjectArchive(archive, fmap);
      const release = path.join(temp, 'release');
      extract(fmap, release);
      const manifest = readFmapManifest(release);
      const content = path.resolve(release, 'content');
      return writeWorkspace(target, 'boxproject', {
        id: manifest.map.id,
        name: manifest.map.name,
        version: manifest.map.version,
        volume: manifest.storage?.volume,
        state: path.join(content, 'project-state.json'),
        blobs: path.join(content, 'blobs'),
      });
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  }

  if (ext === '.fmap') {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-unpack-fmap-'));
    try {
      extract(archive, temp);
      const manifest = readFmapManifest(temp);
      const content = path.resolve(temp, 'content');
      return writeWorkspace(target, 'fmap', {
        id: manifest.map.id,
        name: manifest.map.name,
        version: manifest.map.version,
        volume: manifest.storage?.volume,
        state: path.join(content, 'project-state.json'),
        blobs: path.join(content, 'blobs'),
      });
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  }

  throw Object.assign(new Error(`unsupported project archive: ${archive}`), {
    code: 'ARCHIVE_UNSUPPORTED',
  });
}
