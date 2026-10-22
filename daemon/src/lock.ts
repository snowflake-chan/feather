import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface FeatherLock {
  lockVersion: 1;
  tool: {
    feather: string;
    format: string;
    palette: string;
  };
  inputs: string;
  outputs: {
    projectHash: string;
    contentHash: string;
    chunkCount: number;
  };
}

const LOCK_FILE = 'feather.lock.json';
const IGNORED = new Set([
  '.git', 'node_modules', 'dist', '.feather-build', 'feather.lock.json',
]);

function ignored(name: string) {
  return IGNORED.has(name) || name.startsWith('.feather-build-') || name.endsWith('.fmap');
}

function inputHash(root: string): string {
  const hash = crypto.createHash('sha256');
  const walk = (dir: string, rel: string) => {
    for (const name of fs.readdirSync(dir).sort()) {
      if (ignored(name)) continue;
      const full = path.join(dir, name);
      const next = rel ? `${rel}/${name}` : name;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        hash.update(`d\0${next}\0`);
        walk(full, next);
      } else if (stat.isFile()) {
        hash.update(`f\0${next}\0`);
        hash.update(fs.readFileSync(full));
      }
    }
  };
  walk(root, '');
  return `sha256:${hash.digest('hex')}`;
}

function countChunks(root: string): number {
  const dir = path.join(root, 'chunks');
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((name) => name.endsWith('.bin')).length;
}

function projectHash(root: string): string {
  for (const candidate of [
    path.join(root, 'source', 'project-state.json'),
    path.join(root, 'content', 'project-state.json'),
    path.join(root, 'project-state.json'),
  ]) {
    if (!fs.existsSync(candidate)) continue;
    try {
      const state = JSON.parse(fs.readFileSync(candidate, 'utf8')) as { permissionHash?: unknown };
      if (typeof state.permissionHash === 'string') return state.permissionHash;
    } catch {
      // fall through
    }
  }
  return '';
}

export function makeLock(root: string, contentHash: string): FeatherLock {
  return {
    lockVersion: 1,
    tool: { feather: '0.1.0', format: 'project-rda:0.3.31', palette: 'builtin' },
    inputs: inputHash(root),
    outputs: {
      projectHash: projectHash(root),
      contentHash,
      chunkCount: countChunks(root),
    },
  };
}

export function lockPath(root: string) {
  return path.join(root, LOCK_FILE);
}

export function readLock(root: string): FeatherLock | undefined {
  const file = lockPath(root);
  if (!fs.existsSync(file)) return undefined;
  return JSON.parse(fs.readFileSync(file, 'utf8')) as FeatherLock;
}

export function writeLock(root: string, lock: FeatherLock) {
  fs.writeFileSync(lockPath(root), `${JSON.stringify(lock, null, 2)}\n`);
}

export function sameLock(left: FeatherLock | undefined, right: FeatherLock): boolean {
  return left !== undefined && JSON.stringify(left) === JSON.stringify(right);
}
