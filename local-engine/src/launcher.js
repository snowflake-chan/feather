'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const { createModerationCredential } = require('./moderation-credential');
const {
    resolveMapRuntimeNamespace,
    resolveGroupRuntimeNamespace,
} = require('./runtime-storage-namespace');
const { makeRuntimeDataReadable } = require('./runtime-data-permissions');
const { runtimeStartTimeout } = require('./runtime-readiness');
const { resolveMapRuntimeProfile } = require('./map-runtime-profiles');
const { ensureRuntimeContainer, schedulerSettings } = require('./runtime-container-client');

const packageRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(packageRoot, '../..');
const repoEnvPath = path.join(repoRoot, '.env');
// Docker Compose already injects .env. Source launches should behave the same
// way so optional PostgreSQL/Redis settings are not silently ignored.
if (fs.existsSync(repoEnvPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(repoEnvPath);
}
if (
    !process.argv.includes('--production') &&
    process.env.NODE_ENV !== 'production' &&
    !process.env.BOX_WORLD_PATH &&
    !process.env.BOX_SERVER_DATA_PATH &&
    !process.env.BOX_LOCAL_PROJECTS_PATH &&
    !process.env.BOX_PLAY_LIBRARY_PATH
) {
    const {
        developmentDataEnvironment,
        prepareDevelopmentData,
    } = require('../../../scripts/dev-data');
    Object.assign(process.env, developmentDataEnvironment(repoRoot, process.env));
    prepareDevelopmentData(repoRoot, process.env);
}
// Web session creation and every game runtime must share one signing secret.
// Keep an explicit host value stable across restarts; otherwise generate one
// per launcher process so local development still works without a weak default.
if (!process.env.PERMISSION_TOKEN_SECRET) {
    process.env.PERMISSION_TOKEN_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('PERMISSION_TOKEN_SECRET is unset; generated an ephemeral launcher secret.');
}
if (!process.env.BOX_TELEPORT_INTERNAL_TOKEN) {
    process.env.BOX_TELEPORT_INTERNAL_TOKEN = crypto.randomBytes(32).toString('hex');
}
const configPath = path.join(packageRoot, 'config/local.config.json');
const defaultDataRoot = path.join(packageRoot, 'data');
const mapRuntimeProfilesPath =
    process.env.BOX_MAP_RUNTIME_PROFILES_PATH ||
    path.join(defaultDataRoot, 'map-runtime-profiles.json');
const runtimeScheduler = schedulerSettings();
const generatedAsset = path.join(
    repoRoot,
    process.argv.includes('--production')
        ? 'services/game-server/dist/src/assets/block_info.js'
        : 'services/game-server/src/assets/block_info.ts',
);
const defaultAvatarManifest = path.join(
    repoRoot,
    process.argv.includes('--production')
        ? 'services/game-server/player/default-avatar.json'
        : 'services/game-server/src/player/default-avatar.json',
);
const sourceDefaultAvatarManifest = path.join(
    repoRoot,
    'services/game-server/src/player/default-avatar.json',
);
const launchArgs = process.argv.slice(2);
const launchFlags = new Set(['--production', '--creator', '--play', '--runtime-only']);
const launchValueFlags = new Set(['--project', '--release', '--runtime-mode']);
for (let index = 0; index < launchArgs.length; index += 1) {
    const arg = launchArgs[index];
    if (launchFlags.has(arg)) {
        continue;
    }
    if (launchValueFlags.has(arg)) {
        const value = launchArgs[index + 1];
        if (!value || value.startsWith('--')) {
            throw new Error(`${arg} requires a value`);
        }
        index += 1;
        continue;
    }
    throw new Error(`Unknown launch argument: ${arg}`);
}
const production = process.argv.includes('--production');
const creatorRequested = process.argv.includes('--creator');
const playMode = process.argv.includes('--play');
const playLibraryPath = process.env.BOX_PLAY_LIBRARY_PATH
    ? path.resolve(process.env.BOX_PLAY_LIBRARY_PATH)
    : '';
const usesPlayLibrary = playMode && Boolean(playLibraryPath);
const runtimeOnly = process.argv.includes('--runtime-only');
const projectArgIndex = process.argv.indexOf('--project');
const releaseArgIndex = process.argv.indexOf('--release');
const runtimeModeArgIndex = process.argv.indexOf('--runtime-mode');
const projectId = projectArgIndex >= 0 ? process.argv[projectArgIndex + 1] : '';
const releaseId = releaseArgIndex >= 0 ? process.argv[releaseArgIndex + 1] : '';
const projectManager = !playMode || projectId || releaseId ? require('./project-manager') : null;
const runtimeMode = runtimeModeArgIndex >= 0 ? process.argv[runtimeModeArgIndex + 1] : 'both';
const scriptVm = process.env.BOX_SCRIPT_VM || 'ivmp';
const playPort = Number(process.env.BOX_PLAY_RUNTIME_PORT || process.env.BOX_SERVER_PORT || 9966);
const editPort = Number(
    process.env.BOX_EDIT_RUNTIME_PORT || process.env.BOX_EDIT_SERVER_PORT || 9967,
);
const playTeleportControlURL = `http://127.0.0.1:${playPort}/__local_teleport`;
const editTeleportControlURL = `http://127.0.0.1:${editPort}/__local_teleport`;
const launchTarget =
    projectId || releaseId
        ? projectManager.getLaunchTarget({
              project: projectId,
              release: releaseId,
          })
        : undefined;
const configuredWorldPath = process.env.BOX_WORLD_PATH || process.env.BOX_SERVER_DATA_PATH;
const configuredDataRoot = configuredWorldPath
    ? path.resolve(configuredWorldPath)
    : defaultDataRoot;
const runtimeCacheRoot = path.resolve(
    process.env.BOX_RUNTIME_CACHE_PATH || path.join(packageRoot, 'runtime-cache'),
);
const dataRoot = launchTarget ? launchTarget.dataRoot : configuredDataRoot;
const projectStatePath = launchTarget
    ? launchTarget.statePath
    : process.env.BOX_WORLD_STATE_PATH || process.env.BOX_PROJECT_STATE_PATH || '';
const groupStatePath = launchTarget?.groupStatePath || '';
const groupBlobRoot = launchTarget?.groupBlobRoot || '';
const initialMapSize = Array.isArray(launchTarget?.initialMapSize)
    ? launchTarget.initialMapSize
    : [];
const initialMapVoxelCount = initialMapSize.reduce((total, value) => total * Number(value), 1);
// A 1024×128×1024 terrain needs roughly 256 MiB for the script-side voxel
// mirror before its other runtime allocations. Reserve isolate headroom for
// very large custom maps so they cannot silently inherit the normal 512 MiB
// quota and fail while creating their initial terrain.
const requiredScriptMemoryMB =
    initialMapVoxelCount > 64 * 1024 * 1024
        ? 2048
        : initialMapVoxelCount > 16 * 1024 * 1024
          ? 1024
          : 512;
const configuredScriptHeapMB = Number(
    process.env.BOX_SCRIPT_HEAP_MB || process.env.SCRIPT_HEAP_MB || 512,
);
const configuredScriptMemoryMB = Number(
    process.env.BOX_SCRIPT_MEMORY_MB || process.env.SCRIPT_MEMORY_LIMIT || 512,
);
const scriptHeapMB = Math.max(
    Number.isFinite(configuredScriptHeapMB) ? configuredScriptHeapMB : 512,
    requiredScriptMemoryMB,
);
const scriptMemoryMB = Math.max(
    Number.isFinite(configuredScriptMemoryMB) ? configuredScriptMemoryMB : 512,
    requiredScriptMemoryMB,
);
const requiredClientAsset = path.join(
    dataRoot,
    'blobs/QmUQg6ayL7bLmdso8b4Hc7nfxBUSJawPsQ7vsSUPhXNdv5',
);
const gameRoot = path.join(repoRoot, 'apps/game');
const gameServerRoot = path.join(repoRoot, 'services/game-server');
const nextBuildId = path.join(gameRoot, '.next/BUILD_ID');
const playBuildMarker = path.join(gameRoot, '.next/BOX_PLAY_BUILD');
const standaloneGameRoot = path.join(gameRoot, '.next/standalone/apps/game');
const standaloneServer = path.join(standaloneGameRoot, 'server.js');
const standaloneBuildId = path.join(standaloneGameRoot, '.next/BUILD_ID');
const standalonePlayBuildMarker = path.join(standaloneGameRoot, '.next/BOX_PLAY_BUILD');
const compiledGameServer = path.join(gameServerRoot, 'dist/src/launch.js');

if ([creatorRequested, playMode, runtimeOnly].filter(Boolean).length > 1) {
    throw new Error('Choose only one launch mode: --creator, --play, or --runtime-only');
}
if (launchTarget?.kind === 'release' && !playMode) {
    throw new Error('A release can only run with --play');
}
if (playMode && launchTarget?.kind === 'source') {
    throw new Error('The play runtime accepts a release, not an editable project');
}
const creatorMode = !playMode && !runtimeOnly;
if (creatorMode && launchTarget) {
    throw new Error('The creator manager does not launch a project or release directly');
}
if (runtimeOnly && launchTarget?.kind !== 'source') {
    throw new Error('--runtime-only requires --project <project-id>');
}
if (!['both', 'edit', 'play'].includes(runtimeMode)) {
    throw new Error('--runtime-mode must be one of: both, edit, play');
}
if (!runtimeOnly && runtimeModeArgIndex >= 0) {
    throw new Error('--runtime-mode can only be used with --runtime-only');
}

const startsWeb = !runtimeOnly;
const startsPlayServer = playMode || (runtimeOnly && runtimeMode !== 'edit');
const startsEditServer = runtimeOnly && runtimeMode !== 'play';
const usesPlayerWeb = playMode;
const requiresServerBuild = true;
const resourceAllowedOrigins = Array.from(
    new Set(
        [
            process.env.BOX_RESOURCE_ALLOWED_ORIGINS,
            process.env.BOX_CREATOR_PUBLIC_URL,
            process.env.BOX_VOXA_PUBLIC_URL,
            // Earlier launcher bundles only passed the public VOXA endpoint as
            // VOXA_URL. Keep that deployed configuration working when an embedded
            // VOXA iframe falls back to the editor runtime for a project blob.
            process.env.VOXA_URL,
        ]
            .flatMap((value) => String(value || '').split(','))
            .map((value) => value.trim())
            .filter(Boolean),
    ),
).join(',');

function dataStorageNamespace(id) {
    return resolveMapRuntimeNamespace({
        permanentMapId: id,
        prefix: process.env.BOX_DATA_STORAGE_NAMESPACE_PREFIX || '',
    });
}

function mapRuntimeProfile(permanentMapId, mode) {
    let document;
    try {
        document = JSON.parse(fs.readFileSync(mapRuntimeProfilesPath, 'utf8'));
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            console.warn(`Unable to read map runtime profiles: ${error.message}`);
        }
        document = { profiles: [] };
    }
    return resolveMapRuntimeProfile(
        document,
        { permanentMapId, mode },
        {
            playerLimit: Number(process.env.BOX_LOCAL_PLAYER_LIMIT || 70),
            roomLimit: Number(process.env.BOX_TELEPORT_MAX_ROOMS || 64),
            idleTimeoutMs: Number(process.env.BOX_RUNTIME_IDLE_TIMEOUT_MS || 900000),
        },
    );
}

async function startScheduledContainer({ profile, mapId, mode, roomId, projectId, port }) {
    if (profile.isolation !== 'container') {
        return null;
    }
    if (!runtimeScheduler) {
        console.warn(
            `Map ${mapId} requests isolated resources, but BOX_RUNTIME_MANAGER_URL is not configured; using the shared Node runtime.`,
        );
        return null;
    }
    return ensureRuntimeContainer(runtimeScheduler, {
        permanentMapId: mapId,
        mode,
        roomId: roomId || undefined,
        projectId,
        cpuMilli: profile.cpuMilli,
        memoryMb: profile.memoryMb,
        processLimit: profile.processLimit,
        networkPolicy: profile.networkPolicy,
        bandwidthMbps: profile.bandwidthMbps,
        playerLimit: profile.playerLimit,
        idleTimeoutMs: profile.idleTimeoutMs,
        // The room manager lives in the Play Library runtime, not in Next.js.
        // Keep this on Docker's private network: 9966 is deliberately not
        // published by the Play service, but isolated map containers must be
        // able to allocate and authorize their private rooms through it.
        teleportControlUrl: 'http://play:9966/__local_teleport',
        teleportInternalToken: process.env.BOX_TELEPORT_INTERNAL_TOKEN,
        port,
    });
}

function derivedRuntimePath(mode, identity) {
    const digest = crypto
        .createHash('sha256')
        .update(`${mode}\0${identity || 'default'}`)
        .digest('hex')
        .slice(0, 32);
    return path.join(runtimeCacheRoot, mode, digest);
}

function prewarmCount(name, fallback, maximum) {
    const value = Number(process.env[name] ?? fallback);
    if (!Number.isSafeInteger(value) || value < 0) {
        return fallback;
    }
    return Math.min(value, Math.max(0, Number(maximum) || 0));
}

function groupStorageNamespace(projectId = '') {
    if (projectId && projectManager) {
        try {
            return projectManager.projectStorageIdentity(projectId).permanentMapGroupId;
        } catch {
            // Standalone runtime fixtures do not necessarily have project metadata.
        }
    }
    return resolveGroupRuntimeNamespace({
        permanentMapGroupId: process.env.BOX_WORLD_PERMANENT_GROUP_ID,
        mapGroupId: process.env.BOX_WORLD_GROUP_ID,
        mainProjectId: process.env.BOX_WORLD_MAIN_PROJECT_ID || projectId,
        permanentMapId: process.env.BOX_WORLD_PERMANENT_MAP_ID,
        mapId: process.env.BOX_WORLD_ID || process.env.BOX_SERVER_CONTENT_ID,
    });
}

function validateDefaultAvatar() {
    const manifestPath = fs.existsSync(defaultAvatarManifest)
        ? defaultAvatarManifest
        : sourceDefaultAvatarManifest;
    if (!fs.existsSync(manifestPath)) {
        throw new Error('Bundled default avatar manifest is missing');
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const hashes = Object.values(manifest.parts || {});
    if (hashes.length !== 18) {
        throw new Error('Bundled default avatar must contain 18 body parts');
    }
    for (const hash of hashes) {
        if (!fs.existsSync(path.join(dataRoot, 'blobs', hash))) {
            throw new Error(`Bundled default avatar blob is missing: ${hash}`);
        }
    }
}

function readProjectHash() {
    if (launchTarget?.permissionHash) {
        return launchTarget.permissionHash;
    }
    if (!projectStatePath || !fs.existsSync(projectStatePath)) {
        return '';
    }
    const state = JSON.parse(fs.readFileSync(projectStatePath, 'utf8'));
    return typeof state.permissionHash === 'string' ? state.permissionHash : '';
}

function readCloudMapId() {
    if (!projectStatePath || !fs.existsSync(projectStatePath)) {
        return '';
    }
    const state = JSON.parse(fs.readFileSync(projectStatePath, 'utf8'));
    return Number.isSafeInteger(state.cloudMapId) && state.cloudMapId > 0
        ? String(state.cloudMapId)
        : '';
}

function run(command, args, options = {}) {
    const child = spawnRuntime(command, args, {
        stdio: 'inherit',
        ...options,
    });
    child.on('exit', (code, signal) => {
        if (!shuttingDown && code !== 0) {
            console.error(`${command} stopped (${signal || code})`);
            shutdown(code || 1);
        }
    });
    children.push(child);
    return child;
}
function spawnRuntime(command, args, options) {
    if (options.cwd !== gameServerRoot) {
        return spawn(command, args, options);
    }
    const credential = createModerationCredential(
        options.env,
        process.env.BOX_MODERATION_SIGNING_SECRET || '',
    );
    let child;
    try {
        child = spawn(command, args, { ...options, env: credential.env });
    } catch (error) {
        credential.close();
        throw error;
    }
    const close = () => {
        credential.close();
        process.removeListener('exit', close);
    };
    child.once('exit', close);
    child.once('error', close);
    process.once('exit', close);
    return child;
}

function waitFor(url, attemptsOrOptions = 120) {
    return new Promise((resolve, reject) => {
        const usesDeadline = typeof attemptsOrOptions === 'object';
        const initialAttempts = usesDeadline ? Number.POSITIVE_INFINITY : attemptsOrOptions;
        const deadline = usesDeadline
            ? Date.now() + runtimeStartTimeout(attemptsOrOptions.timeoutMs)
            : Number.POSITIVE_INFINITY;
        const retryOrReject = (remaining) => {
            if (remaining > 0 && Date.now() < deadline) {
                setTimeout(() => check(remaining - 1), 500);
            } else {
                reject(new Error(`Timed out waiting for ${url}`));
            }
        };
        const check = (remaining) => {
            const req = http.get(url, (res) => {
                res.resume();
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                } else {
                    retryOrReject(remaining);
                }
            });
            req.on('error', () => retryOrReject(remaining));
            req.setTimeout(1000, () => req.destroy());
        };
        check(initialAttempts);
    });
}

function waitForGameRuntime(url) {
    return waitFor(url, {
        timeoutMs: process.env.BOX_RUNTIME_START_TIMEOUT_MS || '1800000',
    });
}

const children = [];
let shuttingDown = false;

let playLibrary;
let editLibrary;
let creatorPlayLibrary;
let backupTimer;

async function terminateRuntimeChild(child, runtime, graceMs) {
    if (runtime.exited) {
        return;
    }
    const signalRuntime = (signal) => {
        // Project runtimes are their own process groups. Terminating only the
        // launcher leaves game and script-worker descendants orphaned, which in
        // turn leaks ports into the next development run.
        if (runtime.processGroup && process.platform !== 'win32' && child.pid) {
            try {
                process.kill(-child.pid, signal);
                return;
            } catch {
                // The child may have already left its process group; fall back to its PID.
            }
        }
        child.kill(signal);
    };
    signalRuntime('SIGTERM');
    await new Promise((resolve) => {
        const timer = setTimeout(resolve, graceMs);
        child.once('exit', () => {
            clearTimeout(timer);
            resolve();
        });
    });
    if (runtime.exited) {
        return;
    }
    signalRuntime('SIGKILL');
    await new Promise((resolve) => {
        const timer = setTimeout(resolve, 1000);
        child.once('exit', () => {
            clearTimeout(timer);
            resolve();
        });
    });
}

function readRuntimeProcessStats(pid) {
    // A map runtime is a launcher process which starts the actual game-server
    // process. Sample the complete descendant tree so the dashboard represents
    // the map, rather than its mostly-idle launcher parent.
    try {
        const status = fs.readFileSync(`/proc/${pid}/status`, 'utf8');
        const stat = fs.readFileSync(`/proc/${pid}/stat`, 'utf8');
        const closingParenthesis = stat.lastIndexOf(')');
        if (closingParenthesis < 0) {
            return null;
        }
        const fields = stat
            .slice(closingParenthesis + 2)
            .trim()
            .split(/\s+/);
        const parent = /^PPid:\s+(\d+)$/m.exec(status);
        const residentMemory = /^VmRSS:\s+(\d+)\s+kB$/m.exec(status);
        // stat fields start at process state (the original field 3); user and
        // system CPU ticks are original fields 14 and 15.
        return {
            pid,
            parentPid: Number(parent?.[1] || 0),
            cpuTicks: Number(fields[11] || 0) + Number(fields[12] || 0),
            memoryBytes: Number(residentMemory?.[1] || 0) * 1024,
        };
    } catch {
        return null;
    }
}

const runtimeProcessSnapshotTtlMs = 250;
let runtimeProcessSnapshot = {
    sampledAt: 0,
    processes: null,
    processesByPid: null,
    childrenByPid: null,
};

function readRuntimeProcesses() {
    const sampledAt = Date.now();
    if (
        runtimeProcessSnapshot.processes &&
        sampledAt - runtimeProcessSnapshot.sampledAt < runtimeProcessSnapshotTtlMs
    ) {
        return runtimeProcessSnapshot;
    }

    let processIds;
    try {
        processIds = fs.readdirSync('/proc').filter((entry) => /^\d+$/.test(entry));
    } catch {
        return null;
    }
    const processes = processIds
        .map((entry) => readRuntimeProcessStats(Number(entry)))
        .filter(Boolean);
    const processesByPid = new Map(processes.map((processInfo) => [processInfo.pid, processInfo]));
    const childrenByPid = new Map();
    for (const processInfo of processes) {
        const children = childrenByPid.get(processInfo.parentPid) || [];
        children.push(processInfo.pid);
        childrenByPid.set(processInfo.parentPid, children);
    }
    runtimeProcessSnapshot = { sampledAt, processes, processesByPid, childrenByPid };
    return runtimeProcessSnapshot;
}

function readRuntimeProcessTree(rootPid) {
    const snapshot = readRuntimeProcesses();
    if (!snapshot) {
        return null;
    }
    const { processesByPid, childrenByPid } = snapshot;
    if (!processesByPid?.has(rootPid)) {
        return null;
    }

    const descendants = new Set([rootPid]);
    const pending = [rootPid];
    while (pending.length) {
        const parentPid = pending.pop();
        for (const childPid of childrenByPid.get(parentPid) || []) {
            if (!descendants.has(childPid)) {
                descendants.add(childPid);
                pending.push(childPid);
            }
        }
    }
    return [...descendants].reduce(
        (total, pid) => {
            const processInfo = processesByPid.get(pid);
            return {
                cpuTicks: total.cpuTicks + processInfo.cpuTicks,
                memoryBytes: total.memoryBytes + processInfo.memoryBytes,
                processCount: total.processCount + 1,
            };
        },
        { cpuTicks: 0, memoryBytes: 0, processCount: 0 },
    );
}

function attachRuntimeMetrics(child, runtime) {
    let previousCpuTicks = 0;
    let previousSampleAt = 0;

    runtime.metrics = () => {
        const sampledAt = Date.now();
        const processTree = readRuntimeProcessTree(child.pid);
        if (!processTree) {
            return {};
        }
        const { cpuTicks, memoryBytes } = processTree;
        const elapsedMs = sampledAt - previousSampleAt;
        const cpuPercent =
            previousSampleAt && elapsedMs > 0
                ? Math.max(
                      0,
                      Math.round((((cpuTicks - previousCpuTicks) * 1000) / elapsedMs) * 100) / 100,
                  )
                : 0;
        previousCpuTicks = cpuTicks;
        previousSampleAt = sampledAt;

        return {
            cpuPercent,
            memoryBytes,
            processCount: processTree.processCount,
            uptimeMs: Math.max(0, sampledAt - Date.parse(runtime.startedAt)),
        };
    };
}

function shutdown(code = 0) {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    for (const child of children) {
        child.kill('SIGTERM');
    }
    if (playLibrary) {
        playLibrary.stop().catch(() => {});
    }
    if (editLibrary) {
        editLibrary.stop().catch(() => {});
    }
    if (creatorPlayLibrary) {
        creatorPlayLibrary.stop().catch(() => {});
    }
    if (backupTimer) {
        clearInterval(backupTimer);
    }
    setTimeout(() => {
        process.exit(code);
    }, 200);
}

async function main() {
    const webPort = Number(
        process.env.BOX_WEB_PORT || process.env.BOX_CLIENT_PORT || (playMode ? 3121 : 3127),
    );
    const webHost = process.env.BOX_WEB_HOST || process.env.BOX_CLIENT_HOST || '127.0.0.1';
    const playRuntimeHost =
        process.env.BOX_PLAY_RUNTIME_HOST || process.env.BOX_SERVER_HOST || '127.0.0.1';
    const editRuntimeHost =
        process.env.BOX_EDIT_RUNTIME_HOST || process.env.BOX_EDIT_SERVER_HOST || '127.0.0.1';
    let playServerDataRoot = dataRoot;

    if ((startsPlayServer && !usesPlayLibrary) || startsEditServer) {
        fs.mkdirSync(dataRoot, { recursive: true });

        // Docker Desktop may materialize files created in a macOS bind mount as
        // write-only. Normalize the editable project before every runtime boot so
        // blobs written by a previous autosave remain readable after a restart.
        if (startsEditServer) {
            makeRuntimeDataReadable(dataRoot);
        }

        if (!fs.existsSync(generatedAsset) || !fs.existsSync(requiredClientAsset)) {
            if (production) {
                throw new Error(
                    `Runtime assets are incomplete. Check the mounted world data: ${dataRoot}`,
                );
            }
            const prepared = spawnSync(
                process.execPath,
                [path.join(__dirname, 'prepare-assets.js')],
                {
                    cwd: packageRoot,
                    stdio: 'inherit',
                },
            );
            if (prepared.status !== 0) {
                throw new Error('Unable to prepare local engine assets');
            }
        }
        validateDefaultAvatar();
    }

    if (startsPlayServer && !usesPlayLibrary) {
        // Published worlds stay immutable. The game server reads them in place
        // and writes prebake/build products into BOX_DERIVED_STORAGE_PATH, so a
        // cold runtime no longer copies the complete world or loses its cache.
        playServerDataRoot = dataRoot;
    }

    if (production) {
        const hasWebBuild = fs.existsSync(nextBuildId) || fs.existsSync(standaloneBuildId);
        const hasPlayBuildMarker =
            fs.existsSync(playBuildMarker) || fs.existsSync(standalonePlayBuildMarker);
        if (startsWeb && !hasWebBuild) {
            throw new Error(
                `Web build is missing. Run \`rushx ${usesPlayerWeb ? 'build:play' : 'build:creator'}\` from apps/local-engine before starting it.`,
            );
        }
        if (usesPlayerWeb && !hasPlayBuildMarker) {
            throw new Error(
                'Play build is missing. Run `rushx build:play` from apps/local-engine before starting it.',
            );
        }
        if (startsWeb && !usesPlayerWeb && hasPlayBuildMarker) {
            throw new Error(
                'The current web build is play-only. Run `rushx build:creator` from apps/local-engine before starting the creator.',
            );
        }
        if (requiresServerBuild && !fs.existsSync(compiledGameServer)) {
            throw new Error(
                `Game runtime build is missing. Run \`rushx ${playMode ? 'build:play' : 'build:creator'}\` from apps/local-engine before starting it.`,
            );
        }
    }

    const sharedEnv = {
        ...process.env,
        BOX_LOCAL_CONFIG_PATH: configPath,
        BOX_LOCAL_ENGINE_ROOT: packageRoot,
        BOX_LOCAL_PROJECTS_PATH:
            process.env.BOX_LOCAL_PROJECTS_PATH || path.join(packageRoot, 'projects'),
        // VOXA is embedded from its own public origin and writes project-local
        // blobs to the editor runtime. Keep its public URL in the runtime CORS
        // list automatically, including when the deployment manager uses LAN.
        BOX_RESOURCE_ALLOWED_ORIGINS: resourceAllowedOrigins,
        BOX_TELEPORT_INTERNAL_TOKEN: process.env.BOX_TELEPORT_INTERNAL_TOKEN,
        BOX_PLAY_TELEPORT_CONTROL_URL: playTeleportControlURL,
        BOX_EDIT_TELEPORT_CONTROL_URL: editTeleportControlURL,
        NEXT_PUBLIC_APP_ENV: 'development',
        NEXT_PUBLIC_APP_EDITION: 'createra',
        NEXT_PUBLIC_APP_REGION: 'cn',
        BACKEND_SERVER_URL: `http://127.0.0.1:${playPort}`,
        INTRANET_BACKEND_SERVER_URL: `http://127.0.0.1:${playPort}`,
        OSS_CDN_URL: process.env.BOX_LOCAL_OSS_CDN_URL || `http://127.0.0.1:${playPort}`,
        CREATERA_BACKEND_SERVER_URL:
            process.env.BOX_LOCAL_AVATAR_API_URL || `http://127.0.0.1:${playPort}`,
        INTRANET_CREATERA_BACKEND_SERVER_URL:
            process.env.BOX_LOCAL_AVATAR_API_URL || `http://127.0.0.1:${playPort}`,
        MAAS_BACKEND_SERVER_URL: `http://127.0.0.1:${playPort}`,
        INTRANET_MAAS_BACKEND_SERVER_URL: `http://127.0.0.1:${playPort}`,
        INTRANET_STORAGE_BACKEND_SERVER_URL: `http://127.0.0.1:${playPort}`,
        INTRANET_BOX_API_URL: `http://127.0.0.1:${playPort}`,
        BUILD_SERVER_URL: '',
        REDIS_HOST: process.env.REDIS_HOST || '',
        REDIS_PORT: process.env.REDIS_PORT || '6379',
        REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
        REDIS_DB: process.env.REDIS_DB || '0',
        STORAGE_CACHE_REDIS_DB: process.env.STORAGE_CACHE_REDIS_DB || '1',
        // The upstream game-server schema defines this value as uint8 (0-255).
        // Keep the local default within that range so opening a project cannot
        // fail during config validation before the runtime starts.
        STORAGE_CACHE_REDIS_TTL: process.env.STORAGE_CACHE_REDIS_TTL || '240',
        // Local Creator/Play runtimes must use the Player Service identity path as
        // well. Without this default, source launches silently fall back to the
        // legacy generated userKey and ignore bindings made in player management.
        // Container deployments pass the service name explicitly and keep it.
        BOX_PLAYER_SERVICE_INTERNAL_URL:
            process.env.BOX_PLAYER_SERVICE_INTERNAL_URL ||
            `http://127.0.0.1:${process.env.BOX_PLAYER_SERVICE_PORT || '3124'}`,
        // Large maps retain the owner's setting as a minimum; the experimental
        // 1024-wide map raises it to 2 GiB automatically.
        SCRIPT_HEAP_MB: String(scriptHeapMB),
        SCRIPT_MEMORY_LIMIT: String(scriptMemoryMB),
        // Local products create sessions through the web API, which authenticates
        // the internal runtime request and preserves the actual client address.
        BOX_DIRECT_SESSION_API: 'false',
        // Editable projects contain only project-owned blobs. Engine assets such
        // as block_info remain in the immutable bundled data directory and are a
        // read-only fallback, matching the shared content layer used by Boxes.
        BOX_BUNDLED_CONTENT_PATH:
            process.env.BOX_BUNDLED_CONTENT_PATH ||
            path.join(process.env.BOX_LOCAL_TEMPLATE_DATA_PATH || defaultDataRoot, 'blobs'),
        NODE_ENV: production ? 'production' : 'development',
    };

    // The entrypoint validates before the launcher starts. Runtime processes are
    // separate Node children, so preload a second in-process verifier as well.

    const localStorageIdentity =
        launchTarget && projectManager
            ? projectManager.projectStorageIdentity(launchTarget.id)
            : null;

    const startGameServer = (mode, port, hostIP = '') =>
        run(
            process.execPath,
            production
                ? ['dist/src/launch.js', '--useProdBundle']
                : ['-r', '@swc-node/register', 'src/launch.ts'],
            {
                cwd: gameServerRoot,
                env: {
                    ...sharedEnv,
                    // Editor-side OSS URLs must point at the runtime that is actually
                    // serving this project. Creator launches often run edit-only, so
                    // the play port is intentionally unavailable in that mode.
                    OSS_CDN_URL: `http://127.0.0.1:${port}`,
                    BOX_ANTICHEAT_AUDIT_PATH: path.join(defaultDataRoot, 'anticheat-audit'),
                    METHOD: 'local',
                    MODE: mode,
                    // Creator and Play sessions are authenticated by Player Service.
                    // Do not use the upstream fake admin/guest login shortcuts: they
                    // replace the registered account with adminXXXXX or a guest user.
                    LOGIN: '',
                    IS_HTTPS: 'false',
                    PORT: String(port),
                    HOST_IP: hostIP,
                    // The launcher resolves one authoritative read source. Play writes
                    // generated prebake/build data only to BOX_DERIVED_STORAGE_PATH.
                    STORAGE_PATH: mode === 'play' ? playServerDataRoot : dataRoot,
                    BOX_DERIVED_STORAGE_PATH:
                        mode === 'play'
                            ? derivedRuntimePath(
                                  mode,
                                  localStorageIdentity?.permanentMapId ||
                                      projectId ||
                                      releaseId ||
                                      process.env.BOX_WORLD_PERMANENT_MAP_ID ||
                                      process.env.BOX_WORLD_ID ||
                                      readProjectHash(),
                              )
                            : '',
                    BOX_PROJECT_STATE_PATH: projectStatePath,
                    BOX_GROUP_PROJECT_STATE_PATH: groupStatePath,
                    BOX_GROUP_CONTENT_PATH: groupBlobRoot,
                    // A newly-created project has no project-state.json yet. Pass its
                    // stored creation choices through to createDefaultProject; once the
                    // state exists, these values deliberately no longer alter the map.
                    BOX_INITIAL_MAP_SIZE: Array.isArray(launchTarget?.initialMapSize)
                        ? launchTarget.initialMapSize.join(',')
                        : '',
                    BOX_INITIAL_TERRAIN_THEME: launchTarget?.initialTerrainTheme || '',
                    HASH:
                        process.env.BOX_WORLD_HASH ||
                        process.env.BOX_PROJECT_HASH ||
                        readProjectHash(),
                    // `local` only supports an in-process function supplied by tests and
                    // silently skips normal map modules. The packaged engine must use
                    // the isolated child-process runtime so server scripts are loaded.
                    VM: scriptVm,
                    CONTENT_ID:
                        process.env.BOX_WORLD_ID ||
                        process.env.BOX_SERVER_CONTENT_ID ||
                        readCloudMapId() ||
                        '0',
                    BOX_DATA_STORAGE_NAMESPACE: dataStorageNamespace(
                        localStorageIdentity?.permanentMapId ||
                            process.env.BOX_WORLD_PERMANENT_MAP_ID ||
                            process.env.BOX_WORLD_ID ||
                            process.env.BOX_SERVER_CONTENT_ID ||
                            'default',
                    ),
                    BOX_WORLD_PERMANENT_MAP_ID:
                        localStorageIdentity?.permanentMapId ||
                        process.env.BOX_WORLD_PERMANENT_MAP_ID ||
                        '',
                    // getGroupStorage is shared inside one map group, never across
                    // unrelated projects or independently distributed game packages.
                    BOX_GROUP_STORAGE_NAMESPACE: groupStorageNamespace(projectId),
                    BOX_SERVER_NAME:
                        launchTarget?.name ||
                        process.env.BOX_WORLD_NAME ||
                        process.env.BOX_SERVER_NAME ||
                        'BOX 世界',
                    BOX_WORLD_PUBLIC_ID: launchTarget?.publicId || projectId,
                    BOX_WORLD_DESCRIPTION: launchTarget?.description || '',
                    BOX_WORLD_VERSION: mode === 'play' ? launchTarget?.version || '' : '',
                    // world.serverId is a runtime identity, not the mutable route used
                    // to open a map. Public/edit runtimes use the permanent map ID;
                    // private teleport runtimes keep their generated room ID.
                    SERVER_ID:
                        process.env.SERVER_ID ||
                        localStorageIdentity?.permanentMapId ||
                        process.env.BOX_WORLD_PERMANENT_MAP_ID ||
                        '1',
                    // Local VOXA defaults are scoped by the editable project. Leaving
                    // this empty makes every Creator runtime query the legacy mapId=0
                    // default and leaks another project's skin into startProject().
                    CONTAINER_NAME:
                        projectId ||
                        releaseId ||
                        process.env.BOX_WORLD_ID ||
                        process.env.BOX_SERVER_CONTENT_ID ||
                        '',
                    PLAYER_LIMIT: process.env.BOX_LOCAL_PLAYER_LIMIT || '70',
                    MAX_ZERO_PLAYER_TIME: process.env.BOX_RUNTIME_IDLE_TIMEOUT_MS || '2147483647',
                    ...(Number(process.env.BOX_RUNTIME_NODE_MEMORY_MB) > 0
                        ? {
                              NODE_OPTIONS:
                                  `${process.env.NODE_OPTIONS || ''} --max-old-space-size=${process.env.BOX_RUNTIME_NODE_MEMORY_MB}`.trim(),
                          }
                        : {}),
                },
            },
        );

    const startLibraryRuntime = async (world, port, instance = {}) => {
        const profile = mapRuntimeProfile(world.manifest.permanentMapId || world.id, 'play');
        const scheduled = await startScheduledContainer({
            profile,
            mapId: world.manifest.permanentMapId || world.id,
            mode: 'play',
            roomId: instance.privateRoom ? instance.serverId : '',
            projectId: world.id,
            port,
        });
        if (scheduled) {
            return scheduled;
        }
        const externalDistribution = world.manifest?.assetDistribution;
        const externalCDN =
            externalDistribution?.mode === 'external-cdn' &&
            typeof externalDistribution?.cdnBaseUrl === 'string'
                ? externalDistribution.cdnBaseUrl
                : '';
        const externalHashes = Array.isArray(externalDistribution?.hashes)
            ? externalDistribution.hashes.filter((hash) => typeof hash === 'string')
            : [];
        const child = spawnRuntime(
            process.execPath,
            production
                ? [
                      ...(profile.memoryMb ? [`--max-old-space-size=${profile.memoryMb}`] : []),
                      'dist/src/launch.js',
                      '--useProdBundle',
                  ]
                : [
                      ...(profile.memoryMb ? [`--max-old-space-size=${profile.memoryMb}`] : []),
                      '-r',
                      '@swc-node/register',
                      'src/launch.ts',
                  ],
            {
                cwd: gameServerRoot,
                stdio: 'inherit',
                env: {
                    ...sharedEnv,
                    BOX_ANTICHEAT_AUDIT_PATH: path.join(defaultDataRoot, 'anticheat-audit'),
                    METHOD: 'local',
                    MODE: 'play',
                    LOGIN: '',
                    IS_HTTPS: 'false',
                    PORT: String(port),
                    HOST_IP: '127.0.0.1',
                    STORAGE_PATH: world.dataRoot,
                    BOX_PROJECT_STATE_PATH: world.statePath,
                    BOX_DERIVED_STORAGE_PATH: derivedRuntimePath(
                        'play',
                        world.manifest.permanentMapId || world.id,
                    ),
                    HASH: world.manifest.permissionHash,
                    VM: scriptVm,
                    CONTENT_ID: world.id,
                    // Multi-world play deployments must never collapse all maps into a
                    // single data namespace. Server owners can add a prefix, while the
                    // permanent map ID always remains part of the namespace.
                    BOX_DATA_STORAGE_NAMESPACE: dataStorageNamespace(
                        world.manifest.permanentMapId || world.id,
                    ),
                    BOX_WORLD_PERMANENT_MAP_ID: world.manifest.permanentMapId || '',
                    BOX_GROUP_STORAGE_NAMESPACE: resolveGroupRuntimeNamespace({
                        permanentMapGroupId: world.manifest.permanentMapGroupId,
                        mapGroupId: world.manifest.mapGroupId,
                        mainProjectId: world.manifest.mainProjectId,
                        permanentMapId: world.manifest.permanentMapId,
                        mapId: world.id,
                    }),
                    BOX_SERVER_NAME: world.manifest.projectName || world.id,
                    BOX_WORLD_PUBLIC_ID: world.manifest.publicId || world.id,
                    BOX_WORLD_DESCRIPTION: world.manifest.description || '',
                    BOX_WORLD_VERSION: world.manifest.version || '',
                    CONTAINER_NAME: world.id,
                    SERVER_ID: instance.serverId || world.manifest.permanentMapId || world.id,
                    TYPE: instance.privateRoom ? 'teleport' : 'public',
                    TELEPORT_ACCESS: 'true',
                    // A referenced play package owns its CDN setting. Never use a
                    // server-wide OSS setting here: different published maps can come
                    // from different developers and storage providers.
                    ...(externalCDN
                        ? {
                              OSS_CDN_URL: externalCDN,
                              BOX_EXTERNAL_ASSET_CDN_URL: externalCDN,
                              BOX_EXTERNAL_ASSET_HASHES: JSON.stringify(externalHashes),
                          }
                        : {}),
                    BOX_TELEPORT_CONTROL_URL: playTeleportControlURL,
                    PLAYER_LIMIT: String(profile.playerLimit),
                    MAX_ZERO_PLAYER_TIME: String(profile.idleTimeoutMs),
                },
            },
        );
        const runtime = {
            port,
            pid: child.pid,
            startedAt: new Date().toISOString(),
            exited: false,
            async stop() {
                await terminateRuntimeChild(child, runtime, 1500);
            },
        };
        attachRuntimeMetrics(child, runtime);
        runtime.exitPromise = new Promise((resolve) => {
            runtime.resolveExit = resolve;
        });
        child.once('exit', (code, signal) => {
            runtime.exited = true;
            runtime.exitCode = code;
            runtime.exitSignal = signal;
            runtime.resolveExit({ code, signal });
        });
        return runtime;
    };

    const startProjectRuntime = async (project, port, mode, instance = {}) => {
        // Desktop map policies apply only to the installed Play service. Creator
        // preview/edit runtimes intentionally remain lightweight child processes.
        const profile = mapRuntimeProfile(
            project.permanentMapId || project.id,
            creatorMode ? 'edit' : mode,
        );
        const scheduled = await startScheduledContainer({
            profile,
            mapId: project.permanentMapId || project.id,
            mode,
            roomId: instance.privateRoom ? instance.serverId : '',
            projectId: project.id,
            port,
        });
        if (scheduled) {
            return scheduled;
        }
        const child = spawn(
            process.execPath,
            [
                ...(profile.memoryMb ? [`--max-old-space-size=${profile.memoryMb}`] : []),
                path.join(packageRoot, 'src/launcher.js'),
                ...(production ? ['--production'] : []),
                '--runtime-only',
                '--runtime-mode',
                mode,
                '--project',
                project.id,
            ],
            {
                cwd: repoRoot,
                detached: process.platform !== 'win32',
                stdio: 'inherit',
                env: {
                    ...process.env,
                    SERVER_ID: instance.serverId || project.permanentMapId || project.id,
                    TYPE: instance.privateRoom ? 'teleport' : 'public',
                    TELEPORT_ACCESS: 'true',
                    BOX_LOCAL_PLAYER_LIMIT: String(profile.playerLimit),
                    BOX_TELEPORT_MAX_ROOMS: String(profile.roomLimit),
                    BOX_RUNTIME_IDLE_TIMEOUT_MS: String(profile.idleTimeoutMs),
                    BOX_RUNTIME_NODE_MEMORY_MB: profile.memoryMb ? String(profile.memoryMb) : '',
                    BOX_TELEPORT_CONTROL_URL:
                        mode === 'edit' ? editTeleportControlURL : playTeleportControlURL,
                    ...(mode === 'edit'
                        ? {
                              BOX_EDIT_RUNTIME_PORT: String(port),
                              BOX_EDIT_RUNTIME_HOST: '127.0.0.1',
                          }
                        : {
                              BOX_PLAY_RUNTIME_PORT: String(port),
                              BOX_PLAY_RUNTIME_HOST: '127.0.0.1',
                          }),
                },
            },
        );
        const runtime = {
            port,
            pid: child.pid,
            startedAt: new Date().toISOString(),
            exited: false,
            processGroup: process.platform !== 'win32',
            async stop() {
                await terminateRuntimeChild(child, runtime, 5000);
            },
        };
        attachRuntimeMetrics(child, runtime);
        runtime.exitPromise = new Promise((resolve) => {
            runtime.resolveExit = resolve;
        });
        child.once('exit', (code, signal) => {
            runtime.exited = true;
            runtime.exitCode = code;
            runtime.exitSignal = signal;
            runtime.resolveExit({ code, signal });
        });
        return runtime;
    };

    if (creatorMode) {
        const resolveProject = (reference) => {
            try {
                let metadata;
                try {
                    metadata = projectManager.getProject(reference);
                } catch {
                    const summary = projectManager
                        .listProjects()
                        .find(
                            (project) =>
                                project.publicId === reference ||
                                project.permanentMapId === reference,
                        );
                    if (!summary) {
                        return null;
                    }
                    metadata = projectManager.getProject(summary.id);
                }
                const id = metadata.id;
                const identity = projectManager.projectStorageIdentity(id);
                return {
                    id,
                    permanentMapId: identity.permanentMapId,
                    publicId: metadata.publicId || id,
                    mapGroupId: metadata.mapGroupId,
                    mainProjectId: metadata.mainProjectId,
                    permanentMapGroupId: identity.permanentMapGroupId,
                };
            } catch (error) {
                console.error(`Unable to resolve local project ${reference}: ${error.message}`);
                return null;
            }
        };
        editLibrary = require('./edit-library').startEditLibrary({
            host: editRuntimeHost,
            port: editPort,
            mode: 'edit',
            runtimePortStart: 11000,
            resolveProject,
            startRuntime: (project, port) => startProjectRuntime(project, port, 'edit'),
            waitForRuntime: waitFor,
            maxRuntimes: process.env.BOX_CREATOR_EDIT_MAX_RUNTIMES || '6',
            idleTimeoutMs: process.env.BOX_RUNTIME_IDLE_TIMEOUT_MS || '900000',
            startupTimeoutMs: process.env.BOX_RUNTIME_START_TIMEOUT_MS || '1800000',
            teleportInternalToken: process.env.BOX_TELEPORT_INTERNAL_TOKEN,
            teleportMaxRooms: process.env.BOX_TELEPORT_MAX_ROOMS || '64',
            teleportRoomIdleTimeoutMs: process.env.BOX_TELEPORT_ROOM_IDLE_TIMEOUT_MS || '900000',
        });
        creatorPlayLibrary = require('./edit-library').startEditLibrary({
            host: playRuntimeHost,
            port: playPort,
            mode: 'play',
            runtimePortStart: 12000,
            resolveProject,
            startRuntime: (project, port, instance) =>
                startProjectRuntime(project, port, 'play', instance),
            waitForRuntime: waitFor,
            maxRuntimes: process.env.BOX_CREATOR_PLAY_MAX_RUNTIMES || '4',
            idleTimeoutMs: process.env.BOX_RUNTIME_IDLE_TIMEOUT_MS || '900000',
            startupTimeoutMs: process.env.BOX_RUNTIME_START_TIMEOUT_MS || '1800000',
            teleportInternalToken: process.env.BOX_TELEPORT_INTERNAL_TOKEN,
            teleportMaxRooms: process.env.BOX_TELEPORT_MAX_ROOMS || '64',
            teleportRoomIdleTimeoutMs: process.env.BOX_TELEPORT_ROOM_IDLE_TIMEOUT_MS || '900000',
        });
        await Promise.all([editLibrary.ready, creatorPlayLibrary.ready]);

        const backupConfiguration = projectManager.getBackupConfiguration();
        if (backupConfiguration.enabled) {
            let backupRunning = false;
            const runAutomaticBackup = async () => {
                if (backupRunning || shuttingDown) {
                    return;
                }
                backupRunning = true;
                try {
                    for (const project of projectManager.listProjects()) {
                        await new Promise((resolve) => {
                            const request = http.request(
                                {
                                    hostname: '127.0.0.1',
                                    port: editPort,
                                    path: `/${encodeURIComponent(project.id)}/internal/save-local-project`,
                                    method: 'POST',
                                    timeout: 10_000,
                                },
                                (response) => {
                                    response.resume();
                                    response.on('end', resolve);
                                },
                            );
                            request.on('timeout', () => request.destroy());
                            request.on('error', resolve);
                            request.end();
                        });
                    }
                    const result = projectManager.runProjectBackups('automatic');
                    if (result.failed?.length) {
                        console.warn(
                            `Automatic project backup completed with ${result.failed.length} failure(s).`,
                        );
                    }
                } catch (error) {
                    console.error(`Automatic project backup failed: ${error.message}`);
                } finally {
                    backupRunning = false;
                }
            };
            const intervalMs = backupConfiguration.intervalMinutes * 60 * 1000;
            backupTimer = setInterval(runAutomaticBackup, intervalMs);
            backupTimer.unref();
            setTimeout(runAutomaticBackup, 15_000).unref();
            console.log(
                `Automatic project backup enabled: every ${backupConfiguration.intervalMinutes} minute(s), keep ${backupConfiguration.retentionCount} per project.`,
            );
        }
    }

    let editStarted = false;

    // A new local project has no root hash yet. Start the editor first so it can
    // create and persist the project root; the play server then opens that exact
    // same root instead of generating an unrelated default world.
    if (launchTarget?.kind === 'source' && startsEditServer && !readProjectHash()) {
        startGameServer('edit', editPort, runtimeOnly ? editRuntimeHost : '');
        editStarted = true;
        await waitForGameRuntime(`http://127.0.0.1:${editPort}/api/health-check`);
    }

    if (usesPlayLibrary) {
        playLibrary = require('./play-library').startPlayLibrary({
            libraryRoot: playLibraryPath,
            runtimeCacheRoot,
            host: playRuntimeHost,
            port: playPort,
            startRuntime: startLibraryRuntime,
            waitForRuntime: waitFor,
            maxRuntimes: process.env.BOX_PLAY_MAX_RUNTIMES || '8',
            idleTimeoutMs: process.env.BOX_RUNTIME_IDLE_TIMEOUT_MS || '900000',
            startupTimeoutMs: process.env.BOX_RUNTIME_START_TIMEOUT_MS || '1800000',
            teleportInternalToken: process.env.BOX_TELEPORT_INTERNAL_TOKEN,
            teleportMaxRooms: process.env.BOX_TELEPORT_MAX_ROOMS || '64',
            teleportRoomIdleTimeoutMs: process.env.BOX_TELEPORT_ROOM_IDLE_TIMEOUT_MS || '900000',
            runtimeProfileForWorld: (world) =>
                mapRuntimeProfile(world?.manifest?.permanentMapId || world?.id || '', 'play'),
        });
        await playLibrary.ready;
    } else if (startsPlayServer) {
        startGameServer('play', playPort, playRuntimeHost);

        await waitForGameRuntime(`http://127.0.0.1:${playPort}/api/health-check`);
    }

    if (startsEditServer && !editStarted) {
        startGameServer('edit', editPort, runtimeOnly ? editRuntimeHost : '');

        await waitForGameRuntime(`http://127.0.0.1:${editPort}/api/health-check`);
    }

    if (runtimeOnly) {
        console.log('\nBOX Project Runtime is ready:');
        console.log(`  Project: ${projectId}`);
        if (startsPlayServer) {
            console.log(`  Play runtime: http://127.0.0.1:${playPort}`);
        }
        if (startsEditServer) {
            console.log(`  Edit runtime: http://127.0.0.1:${editPort}`);
        }
        console.log('');
        return;
    }

    const useStandalone = production && fs.existsSync(standaloneServer);
    const webArgs = production
        ? useStandalone
            ? ['server.js']
            : [
                  path.join(gameRoot, 'node_modules/next/dist/bin/next'),
                  'start',
                  '-H',
                  webHost,
                  '-p',
                  String(webPort),
              ]
        : [
              '-r',
              'ts-node/register',
              'server/dev-server/index.ts',
              '--http',
              '--port',
              String(webPort),
          ];

    run(process.execPath, webArgs, {
        cwd: useStandalone ? standaloneGameRoot : gameRoot,
        env: {
            ...sharedEnv,
            BOX_DEPLOYMENT_MODE: playMode ? 'play' : 'creator',
            BOX_WEB_HOST: webHost,
            BOX_REMOTE_SERVER_URL: '',
            HOSTNAME: webHost,
            PORT: String(webPort),
            IS_LOCAL_GAME_SERVER: 'true',
            LOCAL_GAME_SERVER_URL: `http://127.0.0.1:${playPort}`,
            LOCAL_EDIT_SERVER_URL: `http://127.0.0.1:${editPort}`,
            ARENA_URL: `http://127.0.0.1:${webPort}`,
            WEBSITE_URL: `http://127.0.0.1:${webPort}`,
            HOME_URL: `http://127.0.0.1:${webPort}`,
            PLATFORM_URL: `http://127.0.0.1:${webPort}`,
            CACHE_IPFS: 'true',
        },
    });

    await waitFor(`http://127.0.0.1:${webPort}/api/health-check`);

    // Keep only the requested Creator/Play maps resident. Starting every map in
    // a large library only to populate a cache makes service startup compete
    // with the first player for CPU and disk bandwidth.
    const prewarmTimer = setTimeout(async () => {
        try {
            if (creatorMode && editLibrary) {
                const projects = projectManager.listProjects();
                const editCount = prewarmCount(
                    'BOX_CREATOR_EDIT_PREWARM_RUNTIMES',
                    0,
                    process.env.BOX_CREATOR_EDIT_MAX_RUNTIMES || 6,
                );
                for (const project of projects.slice(0, editCount)) {
                    await editLibrary.ensureRuntime(project.id);
                }
            } else if (usesPlayLibrary && playLibrary) {
                const worlds = playLibrary.listWorlds().sort((left, right) => {
                    const leftMain = left.manifest.mapRole === 'main' ? 0 : 1;
                    const rightMain = right.manifest.mapRole === 'main' ? 0 : 1;
                    return leftMain - rightMain || left.id.localeCompare(right.id);
                });
                const count = prewarmCount(
                    'BOX_PLAY_PREWARM_RUNTIMES',
                    0,
                    process.env.BOX_PLAY_MAX_RUNTIMES || 8,
                );
                if (count > 0) {
                    for (const world of worlds.slice(0, count)) {
                        await playLibrary.ensureRuntime(world.id);
                    }
                }
            }
        } catch (error) {
            console.warn(`Runtime background prewarm failed: ${error.message}`);
        }
    }, 1000);
    prewarmTimer.unref();

    console.log(
        `\nBOX ${creatorMode ? 'Creator' : 'Play'} is ready (${
            production ? 'production' : 'development'
        }):`,
    );
    console.log(`  Open: http://127.0.0.1:${webPort}/\n`);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

main().catch((error) => {
    console.error(error);
    shutdown(1);
});
