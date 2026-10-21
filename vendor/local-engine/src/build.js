'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { prunePlayerBuild } = require('./prune-player-build');

const packageRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(packageRoot, '../..');
const buildLockRoot = path.join(packageRoot, '.build-lock');
const buildLockInfo = path.join(buildLockRoot, 'owner.json');
const gameRoot = path.join(repoRoot, 'apps/game');
const gameServerRoot = path.join(repoRoot, 'services/game-server');
const configPath = path.join(packageRoot, 'config/local.config.json');
const playBuildMarker = path.join(gameRoot, '.next/BOX_PLAY_BUILD');
const standaloneGameRoot = path.join(gameRoot, '.next/standalone/apps/game');
const buildArgs = process.argv.slice(2);
for (const arg of buildArgs) {
    if (arg !== '--creator' && arg !== '--play') {
        throw new Error(`Unknown build argument: ${arg}`);
    }
}
const creatorRequested = process.argv.includes('--creator');
const playMode = process.argv.includes('--play');

if (creatorRequested && playMode) {
    throw new Error('Choose only one build mode: --creator or --play');
}

// A build is always one complete deployable product. Both products contain the
// browser application and the authoritative runtime; only their capabilities
// differ. Calling this script without a mode keeps the creator default.
const creatorMode = !playMode;
const playBuild = playMode;
let ownsBuildLock = false;

const sharedEnv = {
    ...process.env,
    BOX_LOCAL_CONFIG_PATH: configPath,
    NEXT_PUBLIC_APP_ENV: 'development',
    NEXT_PUBLIC_APP_EDITION: 'createra',
    NEXT_PUBLIC_APP_REGION: 'cn',
    BACKEND_SERVER_URL: 'http://127.0.0.1:9966',
    INTRANET_BACKEND_SERVER_URL: 'http://127.0.0.1:9966',
    OSS_CDN_URL: process.env.BOX_LOCAL_OSS_CDN_URL || 'http://127.0.0.1:9966',
    CREATERA_BACKEND_SERVER_URL: process.env.BOX_LOCAL_AVATAR_API_URL || 'http://127.0.0.1:9966',
    INTRANET_CREATERA_BACKEND_SERVER_URL:
        process.env.BOX_LOCAL_AVATAR_API_URL || 'http://127.0.0.1:9966',
    MAAS_BACKEND_SERVER_URL: 'http://127.0.0.1:9966',
    INTRANET_MAAS_BACKEND_SERVER_URL: 'http://127.0.0.1:9966',
    INTRANET_STORAGE_BACKEND_SERVER_URL: 'http://127.0.0.1:9966',
    INTRANET_BOX_API_URL: 'http://127.0.0.1:9966',
    IS_LOCAL_GAME_SERVER: 'true',
    LOCAL_GAME_SERVER_URL: 'http://127.0.0.1:9966',
    LOCAL_EDIT_SERVER_URL: 'http://127.0.0.1:9967',
    ARENA_URL: playBuild ? 'http://127.0.0.1:3121' : 'http://127.0.0.1:3127',
    WEBSITE_URL: playBuild ? 'http://127.0.0.1:3121' : 'http://127.0.0.1:3127',
    HOME_URL: playBuild ? 'http://127.0.0.1:3121' : 'http://127.0.0.1:3127',
    PLATFORM_URL: playBuild ? 'http://127.0.0.1:3121' : 'http://127.0.0.1:3127',
    CACHE_IPFS: 'true',
    BOX_PLAY_BUILD: playBuild ? 'true' : 'false',
    BUILD_SERVER_URL: '',
    REDIS_HOST: '',
    NODE_ENV: 'production',
};

function processIsRunning(pid) {
    if (!Number.isInteger(pid) || pid <= 0) {
        return false;
    }
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        return error?.code === 'EPERM';
    }
}

function readBuildLock() {
    try {
        return JSON.parse(fs.readFileSync(buildLockInfo, 'utf8'));
    } catch {
        return null;
    }
}

function acquireBuildLock() {
    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            fs.mkdirSync(buildLockRoot);
            ownsBuildLock = true;
            fs.writeFileSync(
                buildLockInfo,
                `${JSON.stringify(
                    {
                        pid: process.pid,
                        mode: creatorMode ? 'creator' : 'play',
                        startedAt: new Date().toISOString(),
                    },
                    null,
                    2,
                )}\n`,
            );
            return;
        } catch (error) {
            if (error?.code !== 'EEXIST') {
                throw error;
            }
            const owner = readBuildLock();
            if (owner && processIsRunning(owner.pid)) {
                throw new Error(
                    `Another ${owner.mode || 'creator/play'} build is already running (PID ${owner.pid}). Wait for it to finish before starting a new build.`,
                );
            }

            // A process killed without cleanup can leave a stale lock. Only remove
            // it after confirming that the recorded owner no longer exists.
            if (owner) {
                fs.rmSync(buildLockRoot, { recursive: true, force: true });
                continue;
            }

            const age = Date.now() - fs.statSync(buildLockRoot).mtimeMs;
            if (age < 60_000) {
                throw new Error('Another creator/play build is starting. Please retry shortly.');
            }
            fs.rmSync(buildLockRoot, { recursive: true, force: true });
        }
    }
    throw new Error('Unable to acquire the creator/play build lock');
}

function releaseBuildLock() {
    if (!ownsBuildLock) {
        return;
    }
    ownsBuildLock = false;
    fs.rmSync(buildLockRoot, { recursive: true, force: true });
}

function run(label, cwd, args) {
    console.log(`\n[build] ${label}`);
    const result = spawnSync(process.execPath, args, {
        cwd,
        env: sharedEnv,
        stdio: 'inherit',
    });
    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`${label} failed with exit code ${result.status}`);
    }
}

function cleanStandaloneArtifacts() {
    // The standalone directory is a traced runtime copy, not a creator backup.
    // Keep it free of authoring projects, local blobs and build-time metadata so
    // zipping it can never leak a local editable project by accident.
    const removablePaths = [
        path.join(standaloneGameRoot, '../local-engine'),
        path.join(standaloneGameRoot, '.env.development'),
        path.join(standaloneGameRoot, '.env.production'),
        path.join(standaloneGameRoot, '.env.local'),
    ];
    for (const target of removablePaths) {
        fs.rmSync(target, { recursive: true, force: true });
    }

    const purgeRuntimeMetadata = (root) => {
        if (!fs.existsSync(root)) {
            return;
        }
        for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
            const target = path.join(root, entry.name);
            if (entry.isDirectory()) {
                purgeRuntimeMetadata(target);
            } else if (
                entry.name.endsWith('.map') ||
                entry.name.endsWith('.ts') ||
                entry.name.endsWith('.tsx') ||
                entry.name.endsWith('.nft.json') ||
                entry.name.endsWith('.pem') ||
                entry.name.endsWith('.key')
            ) {
                fs.rmSync(target, { force: true });
            }
        }
    };
    purgeRuntimeMetadata(standaloneGameRoot);
}

function main() {
    // Always build the browser app from a clean directory. Otherwise switching
    // from a creator build to a player build can leave Monaco/editor assets as
    // unreferenced files in the distributable `.next/static` directory.
    fs.rmSync(path.join(gameRoot, '.next'), {
        recursive: true,
        force: true,
    });

    run('Generate browser server API declarations', gameRoot, [
        path.join(gameRoot, 'node_modules/typescript/bin/tsc'),
        '-p',
        'api-tsconfig.json',
        '--declaration',
        '--emitDeclarationOnly',
    ]);
    run('Normalize browser server API declarations', gameRoot, [
        'scripts/fix-declaration.js',
        './scripts/assets/api/**/*.d.ts',
    ]);
    run('Generate browser client API declarations', gameRoot, [
        path.join(gameRoot, 'node_modules/typescript/bin/tsc'),
        '-p',
        'client-api-tsconfig.json',
        '--declaration',
        '--emitDeclarationOnly',
    ]);
    run('Normalize browser client API declarations', gameRoot, [
        'scripts/fix-declaration.js',
        './scripts/assets/client_api/**/*.d.ts',
    ]);

    // API declarations are content-addressed runtime assets. Rebuild them after
    // declaration generation on every product build; otherwise API_RES can keep
    // pointing at an obsolete blob even though the source .d.ts files changed.
    run('Prepare local assets', packageRoot, [path.join(__dirname, 'prepare-assets.js')]);

    run('Build optimized browser application', gameRoot, [
        path.join(gameRoot, 'node_modules/next/dist/bin/next'),
        'build',
    ]);

    if (playBuild) {
        prunePlayerBuild(path.join(gameRoot, '.next'));
        prunePlayerBuild(path.join(standaloneGameRoot, '.next'));
    }

    fs.rmSync(path.join(standaloneGameRoot, '.next/static'), {
        recursive: true,
        force: true,
    });
    fs.cpSync(path.join(gameRoot, '.next/static'), path.join(standaloneGameRoot, '.next/static'), {
        recursive: true,
    });
    if (fs.existsSync(path.join(gameRoot, 'public'))) {
        fs.rmSync(path.join(standaloneGameRoot, 'public'), {
            recursive: true,
            force: true,
        });
        fs.cpSync(path.join(gameRoot, 'public'), path.join(standaloneGameRoot, 'public'), {
            recursive: true,
        });
    }
    cleanStandaloneArtifacts();

    if (playBuild) {
        fs.writeFileSync(playBuildMarker, 'play-only\n');
        fs.writeFileSync(path.join(standaloneGameRoot, '.next/BOX_PLAY_BUILD'), 'play-only\n');
    }

    // dist 是可分发的运行时产物。先清理，防止已经删除的平台模块残留在包里。
    fs.rmSync(path.join(gameServerRoot, 'dist'), {
        recursive: true,
        force: true,
    });

    run('Build script isolate bundle', gameServerRoot, [
        path.join(gameServerRoot, 'node_modules/rollup/dist/bin/rollup'),
        '--config',
        'scripts/script-server/rollup.config.mjs',
    ]);

    run('Compile game runtime', gameServerRoot, [
        path.join(gameServerRoot, 'node_modules/typescript/bin/tsc'),
    ]);

    // Cross-workspace source imports must not silently move tsc's inferred root
    // and turn dist/src/launch.js into dist/services/game-server/src/launch.js.
    const runtimeEntry = path.join(gameServerRoot, 'dist/src/launch.js');
    if (!fs.existsSync(runtimeEntry)) {
        throw new Error(
            `Game runtime entry is missing: ${runtimeEntry}; check game-server rootDir and workspace imports`,
        );
    }

    console.log(`\nBOX Local Engine ${creatorMode ? 'creator' : 'play'} build is ready.`);
    console.log('This is a maintainer build artifact.\n');
}

try {
    acquireBuildLock();
    main();
} catch (error) {
    console.error(error);
    process.exitCode = 1;
} finally {
    releaseBuildLock();
}
