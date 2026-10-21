'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
    ensurePlayImageArchive,
    ensurePlayerServiceImageArchive,
    getPlayImageConfig,
} = require('./play-image');
const { resolveBuildMetadata } = require('./build-metadata');

const packageRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(packageRoot, '../..');
const command = process.argv[2];
const commandArgs = process.argv.slice(3);
const rootManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

function gitRevision() {
    const result = spawnSync('git', ['rev-parse', 'HEAD'], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
    });
    return result.status === 0 ? result.stdout.trim() : 'unknown';
}

const automaticBuildMetadata = resolveBuildMetadata({
    version: rootManifest.version,
    revision: gitRevision(),
});

function readDotEnvValue(name) {
    try {
        const source = fs.readFileSync(path.join(repoRoot, '.env'), 'utf8');
        const line = source
            .split(/\r?\n/)
            .find((entry) => entry.trimStart().startsWith(`${name}=`));
        if (line) {
            return line
                .slice(line.indexOf('=') + 1)
                .replace(/^['"]|['"]$/g, '')
                .trim();
        }
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
    }
    return '';
}

function configuredValue(name) {
    return process.env[name] || readDotEnvValue(name) || '';
}

function assertRuntimeConfiguration(product) {
    const secret = configuredValue('PERMISSION_TOKEN_SECRET');
    if (secret.length < 32) {
        throw new Error(
            'PERMISSION_TOKEN_SECRET 必须设置为至少 32 个字符的固定随机值（可用 openssl rand -hex 32 生成）',
        );
    }
    const databaseUrl = configuredValue('BOX_DATABASE_URL');
    let parsed;
    try {
        parsed = new URL(databaseUrl);
    } catch {
        throw new Error('BOX_DATABASE_URL 必须设置为有效的 PostgreSQL 连接地址');
    }
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
        throw new Error('BOX_DATABASE_URL 只支持 PostgreSQL（postgresql://...）');
    }
    if (!parsed.hostname || !parsed.pathname.slice(1)) {
        throw new Error('BOX_DATABASE_URL 必须包含数据库主机和数据库名');
    }
    if (product === 'play') {
        const publicUrl = configuredValue('BOX_SERVER_PUBLIC_URL');
        const hostIp = configuredValue('BOX_PLAY_HOST_IP') || '127.0.0.1';
        if (hostIp !== '127.0.0.1' && !publicUrl) {
            throw new Error('Play 对外监听时必须设置 BOX_SERVER_PUBLIC_URL');
        }
        if (
            publicUrl &&
            !/^https:\/\//i.test(publicUrl) &&
            !/^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/?$/i.test(publicUrl)
        ) {
            throw new Error('公网 BOX_SERVER_PUBLIC_URL 必须使用 HTTPS');
        }
    }
}

function configuredCreatorPort() {
    return process.env.BOX_CREATOR_PORT || readDotEnvValue('BOX_CREATOR_PORT') || '3127';
}

function configuredPlayPort() {
    return (
        process.env.BOX_PLAY_PORT ||
        readDotEnvValue('BOX_PLAY_PORT') ||
        process.env.BOX_PORT ||
        readDotEnvValue('BOX_PORT') ||
        '3121'
    );
}

function configuredPlayerServicePort() {
    return (
        process.env.BOX_PLAYER_SERVICE_PORT || readDotEnvValue('BOX_PLAYER_SERVICE_PORT') || '3124'
    );
}

function configuredAuthPortalPort() {
    return process.env.BOX_AUTH_PORTAL_PORT || readDotEnvValue('BOX_AUTH_PORTAL_PORT') || '3125';
}

function configuredVoxaPort() {
    return process.env.BOX_VOXA_PORT || readDotEnvValue('BOX_VOXA_PORT') || '3123';
}

// The map library is deployment data, not network configuration. Resolve the
// same .env value for direct source deployment and Docker Compose usage so a
// port change can never select a different set of imported maps.
function configuredPlayLibraryDir() {
    const configured = process.env.BOX_PLAY_LIBRARY_DIR || readDotEnvValue('BOX_PLAY_LIBRARY_DIR');
    const directory = configured || path.join(packageRoot, 'play-worlds');
    return path.isAbsolute(directory) ? directory : path.resolve(repoRoot, directory);
}

function dockerEnvironment(extra = {}) {
    const config = getPlayImageConfig();
    return {
        ...process.env,
        ...automaticBuildMetadata,
        BOX_IMAGE_TAG: config.tag,
        BOX_PLAY_PLATFORM: config.platform,
        BOX_PLAY_LIBRARY_DIR: configuredPlayLibraryDir(),
        ...extra,
    };
}

function runDocker(args, { allowFailure = false, capture = false, env = {} } = {}) {
    const result = spawnSync('docker', args, {
        cwd: repoRoot,
        env: dockerEnvironment(env),
        encoding: capture ? 'utf8' : undefined,
        stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    if (result.error) {
        if (result.error.code === 'ENOENT') {
            throw new Error('未找到 Docker。请先安装并启动 Docker Desktop。');
        }
        throw result.error;
    }
    if (result.status !== 0 && !allowFailure) {
        throw new Error(`Docker command failed with exit code ${result.status}`);
    }
    return result;
}

function stopProduct(product) {
    runDocker(['compose', '--profile', product, 'stop', product], { allowFailure: true });
}

function assertPlayerServiceHealthy() {
    const container = runDocker(
        ['compose', '--profile', 'player-service', 'ps', '-q', 'player-service'],
        { allowFailure: true, capture: true },
    );
    const containerId = String(container.stdout || '').trim();
    if (container.status !== 0 || !containerId) {
        throw new Error('Player Service 尚未启动。请先启动玩家服务');
    }
    const result = runDocker(
        [
            'inspect',
            '--format',
            '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}',
            containerId,
        ],
        { allowFailure: true, capture: true },
    );
    const status = String(result.stdout || '').trim();
    if (result.status !== 0 || status !== 'healthy') {
        throw new Error(`Player Service 尚未健康（当前：${status || '未启动'}）。请先启动玩家服务`);
    }
}

function deployCreator({ build }) {
    if (commandArgs.length) {
        throw new Error(`Rush Creator ${build ? 'build' : 'start'} 不接受作品参数`);
    }
    assertRuntimeConfiguration('creator');
    assertPlayerServiceHealthy();
    if (build) {
        runDocker(['compose', '--profile', 'creator', 'build', 'creator']);
    }
    stopProduct('creator');
    runDocker(['compose', '--profile', 'creator', 'up', '-d', '--no-build', 'creator']);
    console.log('\n创作端已启动：http://127.0.0.1:' + configuredCreatorPort() + '\n');
    console.log('玩家中心：http://127.0.0.1:' + configuredPlayerServicePort() + '\n');
}

function startPlayerService({ build }) {
    if (commandArgs.length) {
        throw new Error(`Rush Player Service ${build ? 'build' : 'start'} 不接受参数`);
    }
    assertRuntimeConfiguration('player-service');
    const config = build
        ? ensurePlayerServiceImageArchive({
              forceBuild: true,
              buildMetadata: automaticBuildMetadata,
          })
        : getPlayImageConfig();
    stopProduct('player-service');
    runDocker([
        'compose',
        '--profile',
        'player-service',
        'up',
        '-d',
        '--no-build',
        '--force-recreate',
        'player-service',
    ]);
    console.log(`\n玩家服务已启动：http://127.0.0.1:${configuredPlayerServicePort()}`);
    if (build) {
        console.log(`可分发镜像：${config.playerServiceArchive}`);
    }
    console.log('Creator 和 Play 会共用这个服务；更新它时无需重建另外两个镜像。\n');
}

function startPlayerAuthPortal({ build }) {
    if (commandArgs.length) {
        throw new Error(`Rush Player Auth Portal ${build ? 'build' : 'start'} 不接受参数`);
    }
    const apiKey = configuredValue('BOX_PLAYER_AUTH_API_KEY');
    if (apiKey.length < 16) {
        throw new Error(
            'BOX_PLAYER_AUTH_API_KEY 必须设置为至少 16 个字符，并与 Player Service 使用相同值',
        );
    }
    assertPlayerServiceHealthy();
    if (build) {
        runDocker(['compose', '--profile', 'auth-portal', 'build', 'player-auth-portal']);
    }
    runDocker(['compose', '--profile', 'auth-portal', 'stop', 'player-auth-portal'], {
        allowFailure: true,
    });
    runDocker([
        'compose',
        '--profile',
        'auth-portal',
        'up',
        '-d',
        '--no-build',
        '--force-recreate',
        'player-auth-portal',
    ]);
    const portalUrl = `http://127.0.0.1:${configuredAuthPortalPort()}`;
    console.log(`\n玩家登录门户已启动：${portalUrl}`);
    console.log(`请把 BOX_PLAYER_LOGIN_URL 设置为 ${portalUrl}，再重建 Creator/Play 容器。`);
    console.log('该门户只代理认证请求，玩家账号与会话仍由 Player Service 统一管理。\n');
}

function deployPlay({ build }) {
    if (commandArgs.length) {
        throw new Error(`Rush Play ${build ? 'build' : 'start'} 不接受作品参数`);
    }
    assertRuntimeConfiguration('play');
    assertPlayerServiceHealthy();
    const libraryRoot = configuredPlayLibraryDir();
    fs.mkdirSync(libraryRoot, { recursive: true });
    const playImage = build
        ? ensurePlayImageArchive({
              forceBuild: true,
              buildMetadata: automaticBuildMetadata,
          })
        : getPlayImageConfig();
    runDocker(
        ['compose', '--profile', 'play', 'up', '-d', '--no-build', '--force-recreate', 'play'],
        {
            env: {
                BOX_PLAY_LIBRARY_DIR: libraryRoot,
            },
        },
    );
    console.log('\n游玩端已启动：http://127.0.0.1:' + configuredPlayPort());
    console.log('玩家中心：http://127.0.0.1:' + configuredPlayerServicePort());
    console.log(`地图目录：${libraryRoot}`);
    console.log('访问首页查看全部地图；新增地图无需重启。');
    console.log(`镜像架构：${playImage.platform}`);
    console.log(`可分发镜像：${playImage.archive}\n`);
}

function startVoxa({ build }) {
    if (commandArgs.length) {
        throw new Error(`Rush VOXA ${build ? 'build' : 'start'} 不接受参数`);
    }
    const dataRoot = path.join(repoRoot, 'apps/voxa/data');
    fs.mkdirSync(dataRoot, { recursive: true });
    if (build) {
        runDocker(['compose', '--profile', 'voxa', 'build', 'voxa']);
    }
    stopProduct('voxa');
    runDocker([
        'compose',
        '--profile',
        'voxa',
        'up',
        '-d',
        '--no-build',
        '--force-recreate',
        'voxa',
    ]);
    console.log('\nVOXA 已启动：http://127.0.0.1:' + configuredVoxaPort());
    console.log('模型列表已整合到创作端作品中心：http://127.0.0.1:3127/projects?view=models');
    console.log(`数据目录：${dataRoot}\n`);
}

function deployVoxa() {
    startVoxa({ build: true });
}

function startExistingVoxa() {
    startVoxa({ build: false });
}

function stopAll() {
    if (commandArgs.length) {
        throw new Error('stop 不接受参数');
    }
    runDocker([
        'compose',
        '--profile',
        'creator',
        '--profile',
        'play',
        '--profile',
        'voxa',
        '--profile',
        'player-service',
        '--profile',
        'auth-portal',
        'down',
    ]);
}

try {
    if (command === 'creator') {
        deployCreator({ build: true });
    } else if (command === 'creator-up') {
        deployCreator({ build: false });
    } else if (command === 'play') {
        deployPlay({ build: true });
    } else if (command === 'play-up') {
        deployPlay({ build: false });
    } else if (command === 'player-service') {
        startPlayerService({ build: true });
    } else if (command === 'player-service-up') {
        startPlayerService({ build: false });
    } else if (command === 'player-auth-portal') {
        startPlayerAuthPortal({ build: true });
    } else if (command === 'player-auth-portal-up') {
        startPlayerAuthPortal({ build: false });
    } else if (command === 'voxa') {
        deployVoxa();
    } else if (command === 'voxa-up') {
        startExistingVoxa();
    } else if (command === 'stop') {
        stopAll();
    } else {
        throw new Error(
            'Usage: deploy.js <creator|creator-up|play|play-up|player-service|player-service-up|player-auth-portal|player-auth-portal-up|voxa|voxa-up|stop>',
        );
    }
} catch (error) {
    console.error(`部署失败：${error.message}`);
    process.exitCode = 1;
}
