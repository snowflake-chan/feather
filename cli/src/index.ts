import { resolve } from 'node:path';
import { requireDaemon } from './socket';
import { runFeatherdTool } from './tool';
import { parseArgs } from './args';
import type { ParsedArgs } from './args';
import { CliError } from './errors';
import { writeError, writeJson } from './output';
import { evalCommand } from './commands/eval';
import { loadCommand } from './load';
import { logsCommand } from './commands/logs';
import { formatPs, psCommand } from './commands/ps';
import { rmCommand } from './commands/rm';
import { formatOperations, stopCommand } from './commands/stop';
import { restartCommand } from './commands/restart';
import { formatUp, upCommand } from './commands/up';

function usage() {
  process.stdout.write(`
Usage: feather [--socket <path>] [--json] <command> [options]

Commands:
  build <workspace|.boxproject> [--output <file>] [--project-version <v>]
  unpack <project archive> [--dir <path>] [--force]
  load <archive> [--replace] [--purge-data]
  up [map...]
  stop <map...>
  restart <map...>
  ps
  logs <map> [-f] [--tail N]
  eval <map> -- <code>
  rm <map> [--force]

Global:
  --socket <path>   daemon socket (default: ~/.feather/daemon.sock)
  daemon is started separately with featherd
  --json            machine-readable output
  --help
  --version
`);
}

function commandResult(command: string, parsed: ParsedArgs, data: unknown) {
  if (parsed.flags.has('--json')) writeJson(command, data);
  return data;
}

async function run(parsed: ParsedArgs) {
  const { command, positionals, values, flags, rest } = parsed;
  const socket = values.get('--socket');
  if (flags.has('--help')) {
    usage();
    return;
  }
  if (flags.has('--version')) {
    process.stdout.write('feather 0.0.0\n');
    return;
  }

  switch (command) {
    case 'build': {
      const root = positionals[0];
      if (!root) throw new CliError('USAGE', 'build requires a workspace or .boxproject', 2);
      const workspace = resolve(root);
      const args = ['build', workspace];
      if (values.has('--output')) args.push('--output', values.get('--output')!);
      if (values.has('--project-version')) args.push('--project-version', values.get('--project-version')!);
      if (flags.has('--json')) args.push('--json');
      const code = await runFeatherdTool(args);
      if (code !== 0) process.exitCode = code;
      return;
    }
    case 'unpack': {
      const archive = positionals[0];
      if (!archive) throw new CliError('USAGE', 'unpack requires a project archive', 2);
      const args = ['unpack', resolve(archive)];
      if (values.has('--dir')) args.push('--dir', resolve(values.get('--dir')!));
      if (flags.has('--force')) args.push('--force');
      if (flags.has('--json')) args.push('--json');
      const code = await runFeatherdTool(args);
      if (code !== 0) process.exitCode = code;
      return;
    }
    case 'load': {
      const archive = positionals[0];
      if (!archive) throw new CliError('USAGE', 'load requires an archive', 2);
      const result = await loadCommand({
        archive,
        socket,
        replace: flags.has('--replace'),
        purgeData: flags.has('--purge-data'),
      });
      if (flags.has('--json')) writeJson(command, result);
      else {
        for (const map of result.maps) {
          process.stdout.write(`${map.id}\t${map.state}\n`);
        }
      }
      return;
    }
    case 'up': {
      const maps = await upCommand({ ids: positionals, socket });
      commandResult(command, parsed, maps);
      if (!flags.has('--json')) process.stdout.write(formatUp(maps));
      return;
    }
    case 'stop': {
      const operations = await stopCommand(positionals, socket);
      commandResult(command, parsed, operations);
      if (!flags.has('--json')) process.stdout.write(formatOperations(operations));
      return;
    }
    case 'restart': {
      const operations = await restartCommand(positionals, socket);
      commandResult(command, parsed, operations);
      if (!flags.has('--json')) process.stdout.write(formatOperations(operations));
      return;
    }
    case 'ps': {
      const maps = await psCommand(socket);
      commandResult(command, parsed, maps);
      if (!flags.has('--json')) process.stdout.write(formatPs(maps));
      return;
    }
    case 'logs': {
      const id = positionals[0];
      if (!id) throw new CliError('USAGE', 'logs requires a map id', 2);
      await logsCommand(id, {
        follow: flags.has('--follow') || flags.has('-f'),
        tail: values.has('--tail') ? Number(values.get('--tail')) : undefined,
        socket,
      });
      return;
    }
    case 'eval': {
      const id = positionals[0];
      if (!id) throw new CliError('USAGE', 'eval requires a map id', 2);
      const code = rest.length > 0 ? rest.join(' ') : positionals.slice(1).join(' ');
      const result = await evalCommand(id, code, socket);
      commandResult(command, parsed, { result });
      if (!flags.has('--json')) process.stdout.write(`${result}\n`);
      return;
    }
    case 'rm': {
      const id = positionals[0];
      if (!id) throw new CliError('USAGE', 'rm requires a map id', 2);
      await rmCommand(id, { force: flags.has('--force'), socket });
      if (flags.has('--json')) writeJson(command, { id, removed: true });
      return;
    }
    default:
      throw new CliError('USAGE', `unknown command: ${command}`, 2);
  }
}

async function main() {
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    if (error instanceof CliError) {
      writeError('feather', error.code, error.hint ? `${error.message}\nhint: ${error.hint}` : error.message, process.argv.includes('--json'));
      process.exitCode = error.exitCode;
      return;
    }
    throw error;
  }
  try {
    await run(parsed);
  } catch (error) {
    const json = parsed.flags.has('--json');
    if (error instanceof CliError) {
      writeError(parsed.command, error.code, error.hint ? `${error.message}\nhint: ${error.hint}` : error.message, json);
      process.exitCode = error.exitCode;
      return;
    }
    const code = (error as { code?: string })?.code || 'RUNTIME_ERROR';
    writeError(parsed.command, code, error instanceof Error ? error.message : String(error), json);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
