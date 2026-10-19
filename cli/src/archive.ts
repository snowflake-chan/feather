import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function listArchive(file: string): string[] {
  const result = spawnSync('tar', ['-tzf', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`not a readable gzip/tar archive: ${file}\n${result.stderr || ''}`);
  }
  return result.stdout.split('\n').map((x) => x.trim()).filter(Boolean);
}

export function assertSafeEntries(entries: string[]) {
  for (const entry of entries) {
    const normalized = entry.replace(/^\.\//, '');
    if (normalized.startsWith('/') || normalized.split('/').includes('..')) {
      throw new Error(`unsafe archive entry: ${entry}`);
    }
  }
}

export function extractArchive(file: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const result = spawnSync('tar', ['-xzf', file, '-C', dest], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`failed to extract archive: ${file}\n${result.stderr || ''}`);
  }
}

export async function withTempExtract<T>(
  file: string,
  action: (dir: string, entries: string[]) => Promise<T>,
): Promise<T> {
  const entries = listArchive(file);
  assertSafeEntries(entries);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-load-'));
  try {
    extractArchive(file, dir);
    return await action(dir, entries);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
