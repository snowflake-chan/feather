'use strict';

const path = require('path');
const fs = require('fs');

const { MockBuildCache } = require('@box/build-system/build-cache-mock');
const { BuildSystem } = require('@box/build-system/build-system');
const { buildResources } = require('@box/build-system/utils/resource');
const { FileSystemContentServer } = require('@box/content-server/file-system-store-node');
const { runtimeBlobHashes } = require('./runtime-assets');

const packageRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(packageRoot, '../..');
const dataRoot = path.join(packageRoot, 'data');
const blobRoot = path.join(dataRoot, 'blobs');
const buildBlobRoot = path.join(repoRoot, '.local-data/build-assets/blobs');

function writeFileIfChanged(filePath, content) {
    if (fs.existsSync(filePath) && fs.readFileSync(filePath).equals(content)) {
        return;
    }
    fs.writeFileSync(filePath, content);
}

function bundleEditorApiDeclarations(contentRoot) {
    const resourceRoot = path.join(repoRoot, 'apps/game/src/resource');
    const apiResourceSource = fs.readFileSync(path.join(resourceRoot, 'api.ts'), 'utf8');
    const apiHash = apiResourceSource.match(/`([^`]+)`/)?.[1];
    if (!apiHash) {
        throw new Error('Unable to resolve the generated API declaration hash');
    }
    const declarationBlob = fs.readFileSync(path.join(contentRoot, apiHash));
    writeFileIfChanged(path.join(resourceRoot, 'api-declarations.dts'), declarationBlob);
}

function createLogger(bindings = {}) {
    return {
        bindings: () => bindings,
        child: (extra) => createLogger({ ...bindings, ...extra }),
        debug: (...args) => console.debug(...args),
        info: (...args) => console.log(...args),
        warn: (...args) => console.warn(...args),
        error: (...args) => console.error(...args),
    };
}

async function main() {
    await require('./sync-built-in-skins')();
    const logger = createLogger();
    // Intermediate encodings and abandoned build hashes belong in the ignored
    // cache. Only the resulting engine resources are copied back into source.
    fs.mkdirSync(buildBlobRoot, { recursive: true });
    fs.cpSync(blobRoot, buildBlobRoot, { recursive: true, mode: fs.constants.COPYFILE_FICLONE });
    const contentServer = new FileSystemContentServer(buildBlobRoot);
    await contentServer.init();
    fs.mkdirSync(path.join(repoRoot, 'services/game-server/src/assets'), {
        recursive: true,
    });

    let nextUid = 1;
    const buildSystem = new BuildSystem(
        new MockBuildCache(),
        contentServer,
        contentServer,
        async ({ num }) => Array.from({ length: num }, () => `local-${nextUid++}`),
        logger.child({ caller: 'local-assets' }),
        false,
    );

    await buildResources(buildSystem, contentServer, logger, {
        assetsDir: path.join(repoRoot, 'services/game-server/scripts/assets'),
        tasksDir: path.join(repoRoot, 'services/game-server/scripts/resources'),
        targetDir: path.join(repoRoot, 'services/game-server/src/assets'),
    });

    await buildResources(buildSystem, contentServer, logger, {
        assetsDir: path.join(repoRoot, 'apps/game/scripts/assets'),
        tasksDir: path.join(repoRoot, 'apps/game/scripts/resources'),
        targetDir: path.join(repoRoot, 'apps/game/src/resource'),
    });

    // The cloud editor retrieves this content-addressed blob lazily. A local
    // editor must also have a bundled copy so IntelliSense is available before
    // the request completes and remains available while offline.
    bundleEditorApiDeclarations(buildBlobRoot);

    const hashes = runtimeBlobHashes(repoRoot, { blobRoot: buildBlobRoot });
    const migrationRoot = path.join(repoRoot, 'internals/build-system/tasks/migrations');
    for (const name of fs.readdirSync(migrationRoot)) {
        if (!name.endsWith('.ts')) {
            continue;
        }
        const source = fs.readFileSync(path.join(migrationRoot, name), 'utf8');
        for (const hash of source.match(/Qm[1-9A-HJ-NP-Za-km-z]{44}/g) || []) {
            if (fs.existsSync(path.join(buildBlobRoot, hash))) {
                hashes.add(hash);
            }
        }
    }
    for (const hash of hashes) {
        fs.copyFileSync(path.join(buildBlobRoot, hash), path.join(blobRoot, hash));
    }

    logger.info(
        { blobRoot, buildBlobRoot, publishedResources: hashes.size },
        'Local engine assets are ready',
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
