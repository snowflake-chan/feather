import path from 'node:path';

import { buildCommand } from './build';
import { unpackCommand } from './unpack';
import { workspaceInitCommand } from './workspace-init';

interface ToolArgs {
  positionals: string[];
  values: Map<string, string>;
  flags: Set<string>;
}

function parseTool(argv: string[], values: string[], flags: string[]): ToolArgs {
  const result: ToolArgs = { positionals: [], values: new Map(), flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--') {
      result.positionals.push(...argv.slice(i + 1));
      break;
    }
    if (values.includes(token)) {
      const value = argv[++i];
      if (value === undefined) throw toolError('USAGE', `missing value for ${token}`);
      result.values.set(token, value);
      continue;
    }
    if (flags.includes(token)) {
      result.flags.add(token);
      continue;
    }
    if (token.startsWith('-')) throw toolError('USAGE', `unknown option: ${token}`);
    result.positionals.push(token);
  }
  return result;
}

function toolError(code: string, message: string) {
  return Object.assign(new Error(message), { code });
}

/** One-shot tools shipped in the same binary as the daemon. */
export async function runFeatherdTool(argv: string[]): Promise<void> {
  const command = argv[0];
  if (command === 'build') return runBuild(argv.slice(1));
  if (command === 'unpack') return runUnpack(argv.slice(1));
  if (command === 'workspace') return runWorkspace(argv.slice(1));
  throw toolError('USAGE', `unknown featherd command: ${command || ''}`);
}

async function runUnpack(argv: string[]) {
  const args = parseTool(argv, ['--dir'], ['--force', '--json']);
  const archive = args.positionals[0];
  if (!archive) throw toolError('USAGE', 'usage: featherd unpack <archive> [--dir <workspace>]');
  const result = await unpackCommand({
    archive: path.resolve(archive),
    dir: args.values.get('--dir'),
    force: args.flags.has('--force'),
  });
  if (args.flags.has('--json')) {
    process.stdout.write(`${JSON.stringify({ ok: true, command: 'build', data: result })}\n`);
    return;
  }
  process.stdout.write(`unpacked: ${result.dir}\nmap: ${result.map}\n`);
}

async function runWorkspace(argv: string[]) {
  if (argv[0] !== 'init') throw toolError('USAGE', 'usage: featherd workspace init [dir] [--id <id>] [--name <name>] [--version <v>]');
  const args = parseTool(argv.slice(1), ['--id', '--name', '--version'], ['--force', '--json']);
  const result = await workspaceInitCommand({
    dir: args.positionals[0],
    id: args.values.get('--id'),
    name: args.values.get('--name'),
    version: args.values.get('--version'),
    force: args.flags.has('--force'),
  });
  if (args.flags.has('--json')) {
    process.stdout.write(`${JSON.stringify({ ok: true, command: 'workspace.init', data: result })}\n`);
    return;
  }
  process.stdout.write(`initialized: ${result.dir}\nmap: ${result.id}\n`);
}

async function runBuild(argv: string[]) {
  const args = parseTool(argv, ['--output', '--project-version'], ['--json']);
  const workspace = args.positionals[0];
  if (!workspace) {
    throw toolError('USAGE', 'usage: featherd build <workspace> [--output <file>]');
  }
  const result = await buildCommand({
    root: path.resolve(workspace),
    output: args.values.get('--output'),
    version: args.values.get('--project-version'),
  });
  if (args.flags.has('--json')) {
    process.stdout.write(`${JSON.stringify({ ok: true, command: 'unpack', data: result })}\n`);
    return;
  }
  process.stdout.write(`built:  ${result.output}\n`);
  process.stdout.write(`map:    ${result.map}\n`);
  process.stdout.write(`content: ${result.contentHash}\n`);
}
