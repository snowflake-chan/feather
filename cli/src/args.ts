import { usage } from './errors';

export interface ParsedArgs {
  command: string;
  positionals: string[];
  rest: string[];
  values: Map<string, string>;
  flags: Set<string>;
}

const COMMANDS = new Set([
  'build', 'unpack', 'load', 'up', 'stop', 'restart', 'ps',
  'logs', 'eval', 'rm',
]);

const COMMON_VALUES = new Set(['--socket']);
const COMMON_FLAGS = new Set(['--json', '--help', '-h', '--version']);

const COMMAND_VALUES: Record<string, Set<string>> = {
  build: new Set(['--output', '--project-version']),
  unpack: new Set(['--dir']),
  load: new Set(),
  up: new Set(),
  stop: new Set(),
  restart: new Set(),
  ps: new Set(),
  logs: new Set(['--tail']),
  eval: new Set(),
  rm: new Set(),
};

const COMMAND_FLAGS: Record<string, Set<string>> = {
  build: new Set(),
  unpack: new Set(['--force']),
  load: new Set(['--replace', '--purge-data']),
  up: new Set(),
  stop: new Set(),
  restart: new Set(),
  ps: new Set(),
  logs: new Set(['-f', '--follow']),
  eval: new Set(),
  rm: new Set(['--force']),
};

const VALUE_ALIASES: Record<string, string> = {
  '-C': '--workspace', // rejected below with a contract-specific error
};

function canonicalValue(token: string): string | undefined {
  return VALUE_ALIASES[token] || token;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const values = new Map<string, string>();
  const flags = new Set<string>();
  const positionals: string[] = [];
  const rest: string[] = [];
  let command = '';
  let separator = false;

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (separator) {
      rest.push(token);
      continue;
    }
    if (token === '--') {
      separator = true;
      continue;
    }
    if (!command && COMMON_FLAGS.has(token)) {
      flags.add(token);
      continue;
    }
    if (!command && token.startsWith('-')) {
      if (token === '--socket') {
        const value = argv[++i];
        if (!value) usage('missing value for --socket');
        values.set('--socket', value);
        continue;
      }
      usage(`unknown global option: ${token}`);
    }
    if (!command) {
      if (!COMMANDS.has(token)) usage(`unknown command: ${token}`);
      command = token;
      continue;
    }
    if (token.startsWith('-')) {
      const key = canonicalValue(token);
      if (key === '--workspace' || key === '-C') {
        usage('--workspace / -C was removed; pass the workspace as a positional argument');
      }
      if (COMMON_FLAGS.has(token)) {
        flags.add(token);
        continue;
      }
      if (token === '-h' || token === '--help') {
        flags.add('--help');
        continue;
      }
      const valueOptions = new Set([...COMMON_VALUES, ...(COMMAND_VALUES[command] || [])]);
      const flagOptions = new Set([...COMMAND_FLAGS[command] || []]);
      if (valueOptions.has(key || '')) {
        const value = argv[++i];
        if (value === undefined) usage(`missing value for ${token}`);
        values.set(key!, value);
        continue;
      }
      if (flagOptions.has(key || '')) {
        flags.add(key!);
        continue;
      }
      usage(`unknown option for ${command}: ${token}`);
    }
    positionals.push(token);
  }

  if (!command) usage('missing command');
  return { command, positionals, rest, values, flags };
}
