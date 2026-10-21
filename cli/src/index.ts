import { daemonCommand } from './commands/daemon';
import { downCommand } from './commands/down';
import { execCommand } from './commands/exec';
import { logsCommand } from './commands/logs';
import { psCommand } from './commands/ps';
import { stopCommand } from './commands/stop';
import { upCommand } from './commands/up';
import { loadCommand } from './load';

function usage() {
  console.log(`
feather load <archive> [options]

Commands:
  load <archive>       extract a .boxplay into the data root
  up [mapId...]        start maps from the data root (default: all)
  ps                   list maps
  stop <id>            stop a map
  logs <id> [-f]       show map logs
  exec <id> -- <code>  eval in the map script shell
  down                 stop maps and daemon
  daemon               run daemon in foreground

Data root:
  --data-dir <path>    daemon state/data (default: ~/.feather or FEATHER_DATA_DIR)

Load options:
  --force              replace existing maps with the same id
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
  const dataDir = getArg(args, '--data-dir');
  if (command === 'up') {
    const ids: string[] = [];
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--data-dir') {
        i++;
        continue;
      }
      if (arg.startsWith('-')) continue;
      ids.push(arg);
    }
    await upCommand({
      ids,
      dataDir,
      foreground: args.includes('--foreground'),
    });
    return;
  }
  if (command === 'ps') {
    await psCommand(dataDir);
    return;
  }
  if (command === 'stop') {
    const id = args[1];
    if (!id) throw new Error('missing map id');
    await stopCommand(id, dataDir);
    return;
  }
  if (command === 'exec') {
    const id = args[1];
    if (!id) throw new Error('missing map id');
    const separator = args.indexOf('--');
    const code = (separator >= 0 ? args.slice(separator + 1) : args.slice(2)).join(' ');
    if (!code.trim()) throw new Error('missing code');
    await execCommand(id, code, dataDir);
    return;
  }
  if (command === 'logs') {
    const id = args[1];
    if (!id) throw new Error('missing map id');
    await logsCommand(id, {
      follow: args.includes('-f') || args.includes('--follow'),
      tail: Number(getArg(args, '--tail') || 0) || undefined,
      root: dataDir,
    });
    return;
  }
  if (command === 'down') {
    await downCommand(dataDir);
    return;
  }
  if (command === 'daemon') {
    await daemonCommand(dataDir);
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
    dataDir,
    force: args.includes('--force'),
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
