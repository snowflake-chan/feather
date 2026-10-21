import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'smol-toml';

import { buildProjectArchive } from '@feather/builder/feather';
import { generateProject } from '@feather/builder/generate';

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
  version?: string;
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

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** 与 FileSystemContentServer 一致的 base58 multihash（sha256 + 0x12 0x20）。 */
function contentHash(content: Uint8Array): string {
  const digest = crypto.createHash('sha256').update(content).digest();
  const multihash = Buffer.concat([Buffer.from([0x12, 0x20]), digest]);
  let value = 0n;
  for (const byte of multihash) value = (value << 8n) | BigInt(byte);
  let out = '';
  while (value > 0n) {
    const rem = Number(value % 58n);
    value /= 58n;
    out = BASE58[rem] + out;
  }
  for (const byte of multihash) {
    if (byte !== 0) break;
    out = '1' + out;
  }
  return out;
}

function hashFile(file: string): string {
  return contentHash(fs.readFileSync(file));
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
          assets[logical] = { hash: digest, type: dir };
        }
      };
      walk(base);
    }
  }
  return assets;
}

export async function buildCommand(options: BuildOptions = {}) {
  const root = path.resolve(options.root || process.cwd());
  if (fs.existsSync(root) && fs.statSync(root).isFile()) {
    if (path.extname(root).toLowerCase() !== '.boxproject') {
      throw new Error(`unsupported build input: ${root} (expected .boxproject or a workspace)`);
    }
    const result = buildProjectArchive(root, options.output, {
      version: options.version,
    });
    process.stdout.write(`built:  ${result.output}\n`);
    process.stdout.write(`map:    ${result.manifest.map.id}\n`);
    process.stdout.write(`content: ${result.manifest.content.hash}\n`);
    return;
  }
  const cfg = readManifest(root);
  const id = String(cfg.project?.id || '').trim();
  if (!id) throw new Error('feather.toml is missing [project].id');
  const source = path.resolve(root, cfg.build?.source || 'source');
  const stateFile = path.join(source, 'project-state.json');
  const blobs = path.join(source, 'blobs');
  const hasPackagedState = fs.existsSync(stateFile) && fs.existsSync(blobs);
  if (!hasPackagedState && !fs.existsSync(path.join(root, 'index.js'))) {
    throw new Error(`missing ${stateFile} or ${path.join(root, 'index.js')}`);
  }

  const staging = fs.mkdtempSync(path.join(root, '.feather-build-'));
  try {
    const content = path.join(staging, 'content');
    ensureDir(content);
    if (hasPackagedState) {
      fs.copyFileSync(stateFile, path.join(content, 'project-state.json'));
      fs.cpSync(blobs, path.join(content, 'blobs'), {
        recursive: true,
        dereference: true,
      });
    } else {
      await generateProject(root, staging);
    }
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
