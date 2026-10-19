import { rootLogger, setRootLogLevel } from './utils/logger'; // Logger 需要放在第一位加载来为其他模块提供日志

import { argv } from '../config';
import { getConfig } from '../config/server';
import { startServer } from './entry';

rootLogger.info('Start Game Server.');

// help flags
if (argv.help) {
  console.log(`
game launcher commands:
    Gameplay:
    --hash=HASH             loads a project/permission structure by hash
    --edit                  runs the editor instead of the player
    --production            runs server in production mode
    --port                  server port (default 9966)

    Login Auth config:
    --login=MODE            selects the login mode.  possible values of MODE are "guest", "user", "admin", "cookie" or "" (default "")
    --banRedirect=URL       redirect ban users to URL

    Debugging:
    --local                 runs a local server in browser
    --debug                 turn on to enable engine debug mode
    --trace=EXPR;...        list of expressions to trace in debug visualization mode
    --traceAlloc            turn on tracing to detect leaks in engine state schemas
    --traceDoubleFree       turn on tracing to detect double frees in engine state schemas
    --logLevel              ERROR(0), WARN(1), INFO(2), DEBUG(3)
    --logPrefixRegex        a regular expression to filter logs
    --vm                    selects script execution environment.  can be local, isolate, worker, isolate-snapshot
    --script=SCRIPT,..      a list of scripts that are executed (ignored if hash is specified)

    Quotas and settings:
    --playerLimit=N         Sets the player limit
    --entityLimit=N         Limits number of entities that can be created by scripts
    --seedLimit=N           Limits number of objects that can be placed in editor
    --scriptHeapMB=N        Limits amount of script memory
    --maxZeroPlayerTime=N   Maximum idle time before server automatically shut downs while idle
    --autoSaveInterval=N    How often game state gets autosaved

    Content server:
    --ipfsPath              url for IPFS proxy
    --cdnPath               url for CDN/static IPFS gateway
    --maxIPFSConnection     limit for maximum number of concurrent IPFS connections

    Backend: Uses a separate launcher for much improved dev speed. See 'npm run backend -- --help'
    --containerName         the container name in database

    Script SQL: Config for testing sql
    --featStorage           enable script sql
    --storageMode           SQL server type (sqlite, sqljs)
    --storagePath           path for sqlite database

For more info and examples see README.md
`);
  process.exit(0);
}

async function go() {
  // nacos配置
  const serverConfig = await getConfig();
  // Never log the complete runtime config. It can contain API keys, database
  // credentials, Redis passwords and signing secrets supplied by the host.
  rootLogger.info('Game server config loaded: %o', {
    env: serverConfig.env,
    method: serverConfig.method,
    mode: serverConfig.mode,
    port: serverConfig.port,
    contentId: serverConfig.contentId,
    containerName: serverConfig.containerName,
    playerLimit: serverConfig.playerLimit,
    storageMode: serverConfig.storageMode || 'local',
    dataStorage: serverConfig.databaseUrl
      ? 'postgres'
      : serverConfig.method === 'local'
        ? 'local'
        : 'remote',
    debug: serverConfig.debug,
  });
  setRootLogLevel(serverConfig.LOG_LEVEL); // 拿到配置后更新 log level

  rootLogger.info('game server.  node' + process.version);

  await startServer(serverConfig);
}

go().catch(async (e) => {
  rootLogger.error('Error in launcher.');
  rootLogger.error(e);
  process.exitCode = 1;
});
