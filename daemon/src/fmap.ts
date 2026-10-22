import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface FmapManifest {
  format: 'feather.map';
  formatVersion: 1;
  map: {
    id: string;
    name?: string;
    version?: string;
  };
  content: {
    state: string;
    blobs: string;
    hash?: string;
  };
  storage?: {
    volume?: string;
  };
  assets?: Record<string, { hash: string; type: 'mesh' | 'audio' | 'image' }>;
  runtime?: {
    port?: number;
    memoryMb?: number | null;
    playerLimit?: number | null;
  };
  source?: {
    kind?: string;
    version?: string;
    hash?: string;
  };
  requires?: {
    feather?: string;
    format?: number;
  };
}

export function readFmapManifest(dir: string): FmapManifest {
  const file = path.join(dir, 'feather.json');
  if (!fs.existsSync(file)) throw new Error(`feather.json not found: ${file}`);
  const value = JSON.parse(fs.readFileSync(file, 'utf8')) as FmapManifest;
  if (value.format !== 'feather.map') {
    throw new Error(`unsupported package format: ${String(value.format)}`);
  }
  if (value.formatVersion !== 1) {
    throw new Error(`unsupported feather.map version: ${String(value.formatVersion)}`);
  }
  if (!value.map?.id) throw new Error('feather.json is missing map.id');
  if (!value.content?.state || !value.content?.blobs) {
    throw new Error('feather.json is missing content.state/content.blobs');
  }
  return value;
}

export function writeFmapManifest(dir: string, manifest: FmapManifest) {
  fs.writeFileSync(
    path.join(dir, 'feather.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );
}

/** 对 content 树做确定性 hash：相对路径 + 文件内容，按路径排序。 */
export function hashContent(dir: string): string {
  const hash = crypto.createHash('sha256');
  const walk = (current: string) => {
    for (const name of fs.readdirSync(current).sort()) {
      const full = path.join(current, name);
      const rel = path.relative(dir, full).split(path.sep).join('/');
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        hash.update(`d\0${rel}\0`);
        walk(full);
      } else if (stat.isFile()) {
        hash.update(`f\0${rel}\0`);
        hash.update(fs.readFileSync(full));
      }
    }
  };
  walk(dir);
  return `sha256:${hash.digest('hex')}`;
}
