import fs from 'node:fs';
import path from 'node:path';

export interface BundleMember {
  id: string;
  publicId?: string;
  permanentMapId?: string;
  name?: string;
  mapRole?: string;
  mainProjectId?: string;
}

export interface PlayBundle {
  formatVersion: number;
  type: string;
  mapGroupId: string;
  permanentMapGroupId?: string;
  mainProjectId: string;
  version?: string;
  members: BundleMember[];
}

export interface MapGroupDescriptor {
  formatVersion: number;
  type: string;
  mapGroupId: string;
  mainProjectId: string;
  exportedProjectId?: string;
  members: BundleMember[];
}

export function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

export function safeName(value: string, fallback = 'workspace') {
  const normalized = value
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
    .trim()
    .slice(0, 80);
  return normalized || fallback;
}

export function tomlString(value: string) {
  // JSON string escaping is valid TOML for the values we emit.
  return JSON.stringify(value);
}

export function writeGitignore(workspace: string) {
  const file = path.join(workspace, '.gitignore');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '.feather/\n');
  }
}

export function ensureEmptyDir(workspace: string, force: boolean) {
  if (!fs.existsSync(workspace)) {
    fs.mkdirSync(workspace, { recursive: true });
    return;
  }
  const entries = fs.readdirSync(workspace).filter((x) => x !== '.DS_Store');
  if (entries.length > 0 && !force) {
    throw new Error(`workspace is not empty: ${workspace} (use --force to overwrite)`);
  }
}
