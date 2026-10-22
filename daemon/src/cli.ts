import path from 'node:path';

import { buildCommand } from './build';
import { unpackCommand } from './unpack';

function arg(argv: string[], name: string) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

function has(argv: string[], name: string) {
  return argv.includes(name);
}

/** One-shot tools shipped in the same binary as the daemon. */
export async function runFeatherdTool(argv: string[]): Promise<void> {
  const command = argv[0];
  if (command === 'build') return runBuild(argv.slice(1));
  if (command === 'unpack') return runUnpack(argv.slice(1));
  throw Object.assign(new Error(`unknown featherd command: ${command || ''}`), {
    code: 'USAGE',
  });
}

async function runUnpack(argv: string[]) {
  const archive = argv.find((value) => !value.startsWith('-'));
  if (!archive) {
    throw Object.assign(new Error('usage: featherd unpack <archive> [--dir <workspace>]'), {
      code: 'USAGE',
    });
  }
  const result = await unpackCommand({
    archive: path.resolve(archive),
    dir: arg(argv, '--dir'),
    kind: arg(argv, '--kind'),
    force: has(argv, '--force'),
  });
  if (has(argv, '--json')) {
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  process.stdout.write(`unpacked: ${result.dir}\nmap: ${result.map}\n`);
}

async function runBuild(argv: string[]) {
  const workspace = argv.find((value) => !value.startsWith('-'));
  if (!workspace) {
    throw Object.assign(new Error('usage: featherd build <workspace> [--output <file>]'), {
      code: 'USAGE',
    });
  }
  const result = await buildCommand({
    root: path.resolve(workspace),
    output: arg(argv, '--output'),
    version: arg(argv, '--project-version'),
  });
  if (has(argv, '--json')) {
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  process.stdout.write(`built:  ${result.output}\n`);
  process.stdout.write(`map:    ${result.map}\n`);
  process.stdout.write(`content: ${result.contentHash}\n`);
}
