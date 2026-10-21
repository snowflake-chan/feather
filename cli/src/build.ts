import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'smol-toml';

import { FmapManifest, hashContent, writeFmapManifest } from './fmap';

interface BuildToml {
  project?: { id?: string; name?: string; version?: string };
  build?: { source?: string; output?: string };
  storage?: { volume?: string };
  runtime?: {
    port?: number;
    memoryMb?: number | null;
    playerLimit?: number | null;
  };
}

export interface BuildOptions {
  root?: string;
  output?: string;
}

function readManifest(root: string): BuildToml {
  const file = path.join(root, 'feather.toml');
  if (!fs.existsSync(file)) throw new Error(`feather.toml not found: ${file}`);
  return parse(fs.readFileSync(file, 'utf8')) as unknown as BuildToml;
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

const ASSET_DIRS = ['mesh', 'audio', 'image'] as const;

function hashFile(file: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function scanAssets(
  roots: string[],
  blobs: string,
): Record<string, { hash: string; type: 'mesh' | 'audio' | 'image' }> {
  const assets: Record<string, { hash: string; type: 'mesh' | 'audio' | 'image' }> = {};
  fs.mkdirSync(blobs, { recursive: true });
  for (const root of roots) {
    for (const dir of ASSET_DIRS) {
      const base = path.join(root, dir);
      if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) continue;
      const walk = (current: string) => {
        for (const name of fs.readdirSync(current).sort()) {
          const full = path.join(current, name);
          const stat = fs.statSync(full);
          if (stat.isDirectory()) {
            walk(full);
            continue;
          }
          if (!stat.isFile()) continue;
          const logical = path.relative(root, full).split(path.sep).join('/');
          const digest = hashFile(full);
          fs.copyFileSync(full, path.join(blobs, digest));
          assets[logical] = { hash: `sha256:${digest}`, type: dir };
        }
      };
      walk(base);
    }
  }
  return assets;
}

export async function buildCommand(options: BuildOptions = {}) {
  const root = path.resolve(options.root || process.cwd());
  const cfg = readManifest(root);
  const id = String(cfg.project?.id || '').trim();
  if (!id) throw new Error('feather.toml is missing [project].id');
  const source = path.resolve(root, cfg.build?.source || 'source');
  const stateFile = path.join(source, 'project-state.json');
  const blobs = path.join(source, 'blobs');
  if (!fs.existsSync(stateFile)) throw new Error(`missing ${stateFile}`);
  if (!fs.existsSync(blobs) || !fs.statSync(blobs).isDirectory()) {
    throw new Error(`missing ${blobs}`);
  }

  const staging = fs.mkdtempSync(path.join(root, '.feather-build-'));
  try {
    const content = path.join(staging, 'content');
    ensureDir(content);
    fs.copyFileSync(stateFile, path.join(content, 'project-state.json'));
    fs.cpSync(blobs, path.join(content, 'blobs'), {
      recursive: true,
      dereference: true,
    });
    const assets = scanAssets([root, source], path.join(content, 'blobs'));

    const manifest: FmapManifest = {
      format: 'feather.map',
      formatVersion: 1,
      map: {
        id,
        name: cfg.project?.name,
        version: cfg.project?.version,
      },
      content: {
        state: 'content/project-state.json',
        blobs: 'content/blobs',
        hash: hashContent(content),
      },
      assets: Object.keys(assets).length ? assets : undefined,
      storage: cfg.storage?.volume ? { volume: cfg.storage.volume } : undefined,
      runtime: {
        port: cfg.runtime?.port ?? 0,
        memoryMb: cfg.runtime?.memoryMb ?? null,
        playerLimit: cfg.runtime?.playerLimit ?? null,
      },
      source: {
        kind: 'native',
        version: cfg.project?.version,
      },
      requires: { feather: '>=0.1.0', format: 1 },
    };
    writeFmapManifest(staging, manifest);

    const output = options.output
      ? path.resolve(options.output)
      : path.resolve(root, cfg.build?.output || `${id}.fmap`);
    ensureDir(path.dirname(output));
    const tar = spawnSync(
      'tar',
      ['-czf', output, '-C', staging, 'feather.json', 'content'],
      { encoding: 'utf8' },
    );
    if (tar.status !== 0) {
      throw new Error(`failed to pack ${output}: ${tar.stderr || tar.error}`);
    }
    process.stdout.write(`built:  ${output}\n`);
    process.stdout.write(`map:    ${id}\n`);
    process.stdout.write(`content: ${manifest.content.hash}\n`);
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}
