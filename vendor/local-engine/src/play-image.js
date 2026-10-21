'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const packageRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(packageRoot, '../..');
const supportedPlatforms = new Set(['linux/amd64', 'linux/arm64']);
// Format 4 requires the complete game-server runtime dependency tree. Older
// format-3 archives may be missing executable files from packages whose
// runtime directory is named `doc` (notably yaml/dist/doc/directives.js).
const playFormat = '7';

function readDotEnvValue(name) {
    try {
        const source = fs.readFileSync(path.join(repoRoot, '.env'), 'utf8');
        const line = source
            .split(/\r?\n/)
            .find((entry) => entry.trimStart().startsWith(`${name}=`));
        if (!line) {
            return '';
        }
        return line
            .slice(line.indexOf('=') + 1)
            .trim()
            .replace(/^(['"])(.*)\1$/, '$2');
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
        return '';
    }
}

function getPlayImageConfig() {
    const tag = process.env.BOX_IMAGE_TAG || readDotEnvValue('BOX_IMAGE_TAG') || '2026.1.4';
    const platform =
        process.env.BOX_PLAY_PLATFORM || readDotEnvValue('BOX_PLAY_PLATFORM') || 'linux/amd64';
    if (!supportedPlatforms.has(platform)) {
        throw new Error(
            `BOX_PLAY_PLATFORM must be linux/amd64 or linux/arm64, received: ${platform}`,
        );
    }

    const configuredArchive =
        process.env.BOX_PLAY_IMAGE_ARCHIVE || path.join(packageRoot, 'dist/images/play-image.tar');
    const archive = path.isAbsolute(configuredArchive)
        ? configuredArchive
        : path.resolve(repoRoot, configuredArchive);
    const configuredPlayerServiceArchive =
        process.env.BOX_PLAYER_SERVICE_IMAGE_ARCHIVE ||
        path.join(packageRoot, 'dist/images/player-service-image.tar');
    const playerServiceArchive = path.isAbsolute(configuredPlayerServiceArchive)
        ? configuredPlayerServiceArchive
        : path.resolve(repoRoot, configuredPlayerServiceArchive);

    return {
        archive,
        image: `box-local-engine-play:${tag}`,
        playerServiceImage: `box-local-engine-player-service:${tag}`,
        playerServiceArchive,
        platform,
        tag,
    };
}

function configuredPlayLibraryDir() {
    const configured = process.env.BOX_PLAY_LIBRARY_DIR || readDotEnvValue('BOX_PLAY_LIBRARY_DIR');
    const directory = configured || path.join(packageRoot, 'play-worlds');
    return path.isAbsolute(directory) ? directory : path.resolve(repoRoot, directory);
}

function dockerEnvironment(config, extra = {}) {
    return {
        ...process.env,
        BOX_IMAGE_TAG: config.tag,
        BOX_PLAY_PLATFORM: config.platform,
        // Compose parses the play volume even for image-only build commands.
        BOX_PLAY_LIBRARY_DIR: configuredPlayLibraryDir(),
        ...extra,
    };
}

function runDocker(args, { allowFailure = false, capture = false, env } = {}) {
    const result = spawnSync('docker', args, {
        cwd: repoRoot,
        env: env || process.env,
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
        const details = capture ? String(result.stderr || result.stdout || '').trim() : '';
        throw new Error(details || `Docker command failed with exit code ${result.status}`);
    }
    return result;
}

function inspectLocalImagePlatform(config, image = config.image) {
    const result = runDocker(['image', 'inspect', '--format', '{{.Os}}/{{.Architecture}}', image], {
        allowFailure: true,
        capture: true,
        env: dockerEnvironment(config),
    });
    if (result.status !== 0) {
        return '';
    }
    return String(result.stdout || '').trim();
}

function inspectLocalImageFormat(
    config,
    image = config.image,
    label = 'org.box.local-engine.play-format',
) {
    const result = runDocker(
        ['image', 'inspect', '--format', `{{index .Config.Labels "${label}"}}`, image],
        {
            allowFailure: true,
            capture: true,
            env: dockerEnvironment(config),
        },
    );
    if (result.status !== 0) {
        return '';
    }
    return String(result.stdout || '').trim();
}

function extractArchiveJSON(archive, entry) {
    const result = spawnSync('tar', ['-xOf', archive, entry], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (result.error || result.status !== 0) {
        return null;
    }
    try {
        return JSON.parse(result.stdout);
    } catch {
        return null;
    }
}

function inspectPlayImageArchive(archive, image) {
    if (!fs.existsSync(archive) || fs.statSync(archive).size === 0) {
        return null;
    }
    const manifest = extractArchiveJSON(archive, 'manifest.json');
    if (!Array.isArray(manifest)) {
        return null;
    }
    const imageEntry = manifest.find(
        (entry) => Array.isArray(entry?.RepoTags) && entry.RepoTags.includes(image),
    );
    const configEntry = imageEntry?.Config;
    if (
        typeof configEntry !== 'string' ||
        configEntry.startsWith('/') ||
        configEntry.includes('\\') ||
        configEntry.split('/').includes('..')
    ) {
        return null;
    }
    const imageConfig = extractArchiveJSON(archive, configEntry);
    if (!imageConfig?.os || !imageConfig?.architecture) {
        return null;
    }
    return {
        image,
        platform: `${imageConfig.os}/${imageConfig.architecture}`,
        playFormat: imageConfig?.config?.Labels?.['org.box.local-engine.play-format'] || '',
    };
}

function archiveMatches(config, archive = config.archive) {
    const inspected = inspectPlayImageArchive(archive, config.image);
    return inspected?.platform === config.platform && inspected?.playFormat === playFormat;
}

function buildPlayImage(config, buildMetadata = {}) {
    runDocker(['compose', '--profile', 'play', 'build', 'play'], {
        env: dockerEnvironment(config, buildMetadata),
    });
    const actualPlatform = inspectLocalImagePlatform(config);
    if (actualPlatform !== config.platform) {
        throw new Error(
            `游玩镜像架构不正确：期望 ${config.platform}，实际 ${actualPlatform || '未知'}`,
        );
    }
    if (inspectLocalImageFormat(config) !== playFormat) {
        throw new Error('游玩镜像格式不正确，需要重新构建');
    }
}

function savePlayImage(config) {
    const actualPlatform = inspectLocalImagePlatform(config);
    if (actualPlatform !== config.platform) {
        throw new Error(`本地游玩镜像 ${config.image} 不是 ${config.platform}，需要重新构建`);
    }
    fs.mkdirSync(path.dirname(config.archive), { recursive: true });
    const temporaryArchive = `${config.archive}.${process.pid}.tmp`;
    fs.rmSync(temporaryArchive, { force: true });
    try {
        runDocker(['image', 'save', '--output', temporaryArchive, config.image], {
            env: dockerEnvironment(config),
        });
        if (!archiveMatches(config, temporaryArchive)) {
            throw new Error('导出的游玩镜像标签或架构校验失败');
        }
        fs.renameSync(temporaryArchive, config.archive);
    } catch (error) {
        fs.rmSync(temporaryArchive, { force: true });
        throw error;
    }
}

function ensurePlayImageArchive({ forceBuild = false, buildMetadata = {} } = {}) {
    const config = getPlayImageConfig();
    if (!forceBuild && archiveMatches(config)) {
        if (
            inspectLocalImagePlatform(config) !== config.platform ||
            inspectLocalImageFormat(config) !== playFormat
        ) {
            runDocker(['image', 'load', '--input', config.archive], {
                env: dockerEnvironment(config),
            });
        }
        return config;
    }
    if (!forceBuild && process.env.BOX_DEPLOYMENT_MODE === 'creator') {
        throw new Error('游玩镜像尚未准备。请先通过启动器启动游玩端，再返回创作端');
    }

    const localPlatform = inspectLocalImagePlatform(config);
    const localFormat = inspectLocalImageFormat(config);
    if (forceBuild || localPlatform !== config.platform || localFormat !== playFormat) {
        buildPlayImage(config, buildMetadata);
    }
    savePlayImage(config);
    return config;
}

function playerServiceArchiveMatches(config, archive = config.playerServiceArchive) {
    const inspected = inspectPlayImageArchive(archive, config.playerServiceImage);
    return inspected?.platform === config.platform && inspected?.playFormat === playFormat;
}

function ensurePlayerServiceImageArchive({ forceBuild = false, buildMetadata = {} } = {}) {
    const config = getPlayImageConfig();
    const localPlatform = inspectLocalImagePlatform(config, config.playerServiceImage);
    const localFormat = inspectLocalImageFormat(
        config,
        config.playerServiceImage,
        'org.box.local-engine.player-service-format',
    );
    if (forceBuild || localPlatform !== config.platform || localFormat !== playFormat) {
        runDocker(['compose', '--profile', 'player-service', 'build', 'player-service'], {
            env: dockerEnvironment(config, buildMetadata),
        });
    }
    if (
        inspectLocalImagePlatform(config, config.playerServiceImage) !== config.platform ||
        inspectLocalImageFormat(
            config,
            config.playerServiceImage,
            'org.box.local-engine.player-service-format',
        ) !== playFormat
    ) {
        throw new Error('玩家服务镜像标签、架构或格式不正确');
    }

    fs.mkdirSync(path.dirname(config.playerServiceArchive), { recursive: true });
    const temporaryArchive = `${config.playerServiceArchive}.${process.pid}.tmp`;
    fs.rmSync(temporaryArchive, { force: true });
    try {
        runDocker(['image', 'save', '--output', temporaryArchive, config.playerServiceImage], {
            env: dockerEnvironment(config),
        });
        if (!playerServiceArchiveMatches(config, temporaryArchive)) {
            throw new Error('导出的玩家服务镜像标签或架构校验失败');
        }
        fs.renameSync(temporaryArchive, config.playerServiceArchive);
    } catch (error) {
        fs.rmSync(temporaryArchive, { force: true });
        throw error;
    }
    return config;
}

module.exports = {
    ensurePlayImageArchive,
    ensurePlayerServiceImageArchive,
    getPlayImageConfig,
    inspectPlayImageArchive,
};
