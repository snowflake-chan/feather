import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { generateProject } from '@feather/builder/generate';
const { unpackWorkspace } = require('@feather/builder/workspace') as {
  unpackWorkspace: (
    contentDir: string,
    target: string,
    meta: { id: string; name?: string; version?: string; volume?: string; runtime?: { port?: number; memoryMb?: number | null; playerLimit?: number | null } },
  ) => Promise<unknown>;
};

export interface WorkspaceInitOptions {
  dir?: string;
  id?: string;
  name?: string;
  version?: string;
  force?: boolean;
}

export interface WorkspaceInitResult {
  dir: string;
  id: string;
}

function safeId(value: string) {
  return value.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'map';
}

export async function workspaceInitCommand(options: WorkspaceInitOptions = {}): Promise<WorkspaceInitResult> {
  const target = path.resolve(options.dir || process.cwd());
  if (fs.existsSync(target)) {
    const entries = fs.readdirSync(target);
    if (entries.length > 0 && !options.force) {
      throw Object.assign(new Error(`workspace not empty: ${target} (use --force)`), { code: 'WORKSPACE_EXISTS' });
    }
    if (entries.length > 0) fs.rmSync(target, { recursive: true, force: true });
  }
  fs.mkdirSync(target, { recursive: true });
  const id = safeId(options.id || path.basename(target));
  const name = options.name || id;
  const version = options.version || '0.1.0';
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-init-'));
  try {
    fs.writeFileSync(path.join(temp, 'index.js'), '// map entry\n');
    fs.writeFileSync(path.join(temp, 'clientIndex.js'), '// client entry\n');
    const staging = path.join(temp, 'staging');
    await generateProject(temp, staging);
    await unpackWorkspace(path.join(staging, 'content'), target, {
      id,
      name,
      version,
      runtime: { port: 0, memoryMb: 512, playerLimit: 32 },
    });
    const toml = [
      'schema_version = 1',
      '',
      '[project]',
      `id = ${JSON.stringify(id)}`,
      `version = ${JSON.stringify(version)}`,
      '',
      '[build]',
      'kind = "baked"',
      `output = "dist/${id}.fmap"`,
      '',
      '[runtime]',
      'port = 0',
      'memoryMb = 512',
      'playerLimit = 32',
      '',
    ].join('\n');
    fs.writeFileSync(path.join(target, 'feather.toml'), toml);
    return { dir: target, id };
  } catch (error) {
    fs.rmSync(target, { recursive: true, force: true });
    throw error;
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}
