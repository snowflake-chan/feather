import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { buildProjectArchive } from '@feather/builder/feather';
import { readFmapManifest } from './fmap';

const { unpackWorkspace } = require('@feather/builder/workspace') as {
  unpackWorkspace: (
    contentDir: string,
    target: string,
    meta: { id: string; name?: string; version?: string; volume?: string; runtime?: { port?: number; memoryMb?: number | null; playerLimit?: number | null } },
  ) => Promise<{ map: string; projectDir: string }>;
};

export interface UnpackOptions {
  archive: string;
  dir?: string;
  force?: boolean;
}

export interface UnpackResult {
  dir: string;
  map: string;
  source: 'boxproject' | 'fmap';
}

function extract(file: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const result = spawnSync('tar', ['-xzf', file, '-C', dest], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw Object.assign(new Error(`failed to extract ${file}: ${result.stderr || ''}`), {
      code: 'ARCHIVE_INVALID',
    });
  }
}

function assertSafeTarget(target: string) {
  const resolved = path.resolve(target);
  const home = path.resolve(os.homedir());
  const cwd = path.resolve(process.cwd());
  const relativeCwd = path.relative(resolved, cwd);
  const containsCwd = relativeCwd === '' || (!relativeCwd.startsWith('..') && !path.isAbsolute(relativeCwd));
  if (resolved === path.parse(resolved).root || containsCwd || resolved === home) {
    throw Object.assign(new Error(`refusing to overwrite unsafe target: ${resolved}`), { code: 'UNSAFE_TARGET' });
  }
  if (fs.existsSync(resolved) && !fs.existsSync(path.join(resolved, 'feather.toml'))) {
    throw Object.assign(new Error(`refusing to replace non-workspace: ${resolved}`), { code: 'UNSAFE_TARGET' });
  }
}

async function expand(contentDir: string, target: string, meta: { id: string; name?: string; version?: string; volume?: string; runtime?: { port?: number; memoryMb?: number | null; playerLimit?: number | null } }) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const workspace = fs.mkdtempSync(path.join(path.dirname(target), '.feather-unpack-'));
  try {
    await unpackWorkspace(contentDir, workspace, meta);
    if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
    fs.renameSync(workspace, target);
    return { dir: target, map: meta.id };
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
  const target = path.resolve(options.dir || path.basename(archive).replace(/\.(fmap|boxproject)$/i, ''));
  assertSafeTarget(target);
  if (fs.existsSync(target) && !options.force) {
    throw Object.assign(new Error(`target exists: ${target} (use --force)`), { code: 'WORKSPACE_EXISTS' });
  }

  const ext = path.extname(archive).toLowerCase();
  if (ext === '.fmap') {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-unpack-fmap-'));
    try {
      extract(archive, temp);
      const manifest = readFmapManifest(temp);
      const result = await expand(path.join(temp, 'content'), target, {
        id: manifest.map.id,
        name: manifest.map.name,
        version: manifest.map.version,
        volume: manifest.storage?.volume,
        runtime: manifest.runtime,
      });
      return { ...result, source: 'fmap' };
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  }

  if (ext === '.boxproject') {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-unpack-project-'));
    try {
      const fmap = path.join(temp, 'release.fmap');
      buildProjectArchive(archive, fmap);
      const release = path.join(temp, 'release');
      extract(fmap, release);
      const manifest = readFmapManifest(release);
      const result = await expand(path.join(release, 'content'), target, {
        id: manifest.map.id,
        name: manifest.map.name,
        version: manifest.map.version,
        volume: manifest.storage?.volume,
        runtime: manifest.runtime,
      });
      return { ...result, source: 'boxproject' };
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  }

  throw Object.assign(new Error(`unsupported project archive: ${archive}`), {
    code: 'ARCHIVE_UNSUPPORTED',
  });
}
