import { loadCommand } from './load';

function usage() {
  console.log(`
feather load <archive> [options]

Load a .boxplay (play bundle) or .boxproject (source archive) into a workspace.

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
