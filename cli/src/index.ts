import { daemonCommand } from './commands/daemon';
import { downCommand } from './commands/down';
import { logsCommand } from './commands/logs';
import { psCommand } from './commands/ps';
import { stopCommand } from './commands/stop';
import { upCommand } from './commands/up';
import { loadCommand } from './load';

function usage() {
  console.log(`
feather load <archive> [options]

Commands:
  load <archive>       load a .boxplay/.boxproject into a workspace
  up                   create/start workspace maps
  ps                   list maps
  stop <id>            stop a map
  logs <id> [-f]       show map logs
  down                 stop maps and daemon
  daemon               run daemon in foreground

Workspace: run inside a directory containing feather.toml.

Options:
  --dir <path>    workspace directory (default: ./<name>)
  --name <name>   workspace name
  --force         overwrite a non-empty workspace
`);
}

function getArg(args: string[], name: string) {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  return args[index + 1];
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  if (!command || command === '-h' || command === '--help') {
    usage();
    return;
  }
  if (command === 'up') {
    await upCommand({ root: getArg(args, '--workspace') || getArg(args, '-C'), foreground: args.includes('--foreground') });
    return;
  }
  if (command === 'ps') {
    await psCommand(getArg(args, '--workspace') || getArg(args, '-C'));
    return;
  }
  if (command === 'stop') {
    const id = args[1];
    if (!id) throw new Error('missing map id');
    await stopCommand(id, getArg(args, '--workspace') || getArg(args, '-C'));
    return;
  }
  if (command === 'logs') {
    const id = args[1];
    if (!id) throw new Error('missing map id');
    await logsCommand(id, {
      follow: args.includes('-f') || args.includes('--follow'),
      tail: Number(getArg(args, '--tail') || 0) || undefined,
      root: getArg(args, '--workspace') || getArg(args, '-C'),
    });
    return;
  }
  if (command === 'down') {
    await downCommand(getArg(args, '--workspace') || getArg(args, '-C'));
    return;
  }
  if (command === 'daemon') {
    await daemonCommand(getArg(args, '--workspace') || getArg(args, '-C'));
    return;
  }
  if (command !== 'load') {
    console.error(`unknown command: ${command}`);
    usage();
    process.exitCode = 1;
    return;
  }
  const archive = args[1];
  if (!archive) {
    console.error('missing archive path');
    usage();
    process.exitCode = 1;
    return;
  }
  await loadCommand({
    archive,
    dir: getArg(args, '--dir'),
    name: getArg(args, '--name'),
    force: args.includes('--force'),
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
