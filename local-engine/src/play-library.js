'use strict';

const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');
const { createRuntimeLifecycle } = require('./runtime-lifecycle');
const { waitForRuntimeReady } = require('./runtime-readiness');
const { runtimeUpstream, runtimeHostHeader } = require('./runtime-upstream');
const { serveDerivedPlayResource } = require('./play-derived-resources');
const {
    createTeleportControlHandler,
    createTeleportRoomManager,
    roomIdPattern,
} = require('./teleport-room-manager');

const worldIdPattern = /^[a-z0-9][a-z0-9-]{0,62}$/;
const worldListCache = new Map();

function readWorld(libraryRoot, id) {
    if (!worldIdPattern.test(id || '')) {
        return null;
    }
    const root = path.join(libraryRoot, id);
    const manifestPath = path.join(root, 'manifest.json');
    const dataRoot = path.join(root, 'data');
    const statePath = path.join(dataRoot, 'project-state.json');
    const blobsRoot = path.join(dataRoot, 'blobs');
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        if (
            manifest.id !== id ||
            typeof manifest.version !== 'string' ||
            !manifest.permissionHash ||
            state.permissionHash !== manifest.permissionHash ||
            !fs.statSync(blobsRoot).isDirectory()
        ) {
            return null;
        }
        const stat = fs.statSync(manifestPath);
        return {
            id,
            root,
            dataRoot,
            statePath,
            manifest,
            signature: [
                stat.mtimeMs,
                stat.size,
                manifest.version,
                manifest.permissionHash,
                state.extraProjectHash || '',
            ].join(':'),
        };
    } catch {
        return null;
    }
}

function listWorlds(libraryRoot, cacheMaxAgeMs = 0) {
    const cached = worldListCache.get(libraryRoot);
    const now = Date.now();
    if (cached && cacheMaxAgeMs > 0 && now - cached.sampledAt < cacheMaxAgeMs) {
        return cached.worlds;
    }
    try {
        const worlds = fs
            .readdirSync(libraryRoot, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => readWorld(libraryRoot, entry.name))
            .filter(Boolean)
            .sort((a, b) => a.id.localeCompare(b.id));
        worldListCache.set(libraryRoot, { sampledAt: now, worlds });
        return worlds;
    } catch (error) {
        if (error?.code === 'ENOENT') {
            worldListCache.delete(libraryRoot);
            return [];
        }
        throw error;
    }
}

function resolveWorld(libraryRoot, reference) {
    const direct = readWorld(libraryRoot, reference);
    if (direct) {
        return direct;
    }
    return (
        listWorlds(libraryRoot).find((world) => {
            const publicId = worldIdPattern.test(String(world.manifest.publicId || ''))
                ? String(world.manifest.publicId)
                : world.id;
            return publicId === reference || world.manifest.permanentMapId === reference;
        }) || null
    );
}

function parseWorldRequest(requestUrl) {
    const parsed = new URL(requestUrl || '/', 'http://127.0.0.1');
    const segments = parsed.pathname.split('/').filter(Boolean);
    const reference = decodeURIComponent(segments[0] || '');
    let roomId = '';
    let consumed = 1;
    if (segments[1] === '__room') {
        roomId = decodeURIComponent(segments[2] || '');
        consumed = 3;
        if (!roomIdPattern.test(roomId)) {
            throw Object.assign(new Error('房间 ID 无效'), { statusCode: 400 });
        }
    }
    const pathname = `/${segments.slice(consumed).join('/')}`;
    return {
        reference,
        roomId,
        forwardedPath: `${pathname}${parsed.search}`,
    };
}

function startPlayLibrary({
    libraryRoot,
    runtimeCacheRoot = process.env.BOX_RUNTIME_CACHE_PATH,
    host,
    port,
    runtimePortStart = 10000,
    startRuntime,
    waitForRuntime,
    maxRuntimes = 4,
    idleTimeoutMs = 15 * 60_000,
    startupTimeoutMs,
    teleportInternalToken,
    teleportMaxRooms = 64,
    teleportRoomIdleTimeoutMs = 15 * 60_000,
    runtimeProfileForWorld = () => ({}),
}) {
    fs.mkdirSync(libraryRoot, { recursive: true });
    const runtimes = new Map();
    const starts = new Map();
    const destroyed = new Set();
    const statuses = new Map();
    let nextPort = runtimePortStart;
    let closed = false;

    const setStatus = (id, status) => {
        const next = { ...status, updatedAt: new Date().toISOString() };
        statuses.set(id, next);
        return next;
    };

    const runtimeStatus = async (id, runtime, fallback, details = {}) => {
        let metrics = {};
        if (runtime && !runtime.exited && runtime.metrics) {
            try {
                metrics = (await runtime.metrics()) || {};
            } catch {
                // A transient Docker stats failure must not make the map status API
                // unavailable. The next dashboard request will sample it again.
            }
        }
        return {
            ...(statuses.get(id) || fallback),
            ...details,
            ...(runtime && !runtime.exited
                ? {
                      port: runtime.port,
                      pid: runtime.pid,
                      startedAt: runtime.startedAt,
                      onlineCount: Number(runtime.activeConnections || 0),
                      ...metrics,
                  }
                : {}),
        };
    };

    async function stopRuntime(id) {
        const runtime = runtimes.get(id);
        if (!runtime) {
            return;
        }
        runtimes.delete(id);
        await runtime.stop();
    }

    const lifecycle = createRuntimeLifecycle({
        runtimes,
        starts,
        stopRuntime,
        setStatus,
        maxRuntimes,
        idleTimeoutMs,
        idleTimeoutFor: (runtime) => runtime.idleTimeoutMs,
    });

    const runtimeKey = (worldId, roomId = '') => (roomId ? `room:${roomId}` : worldId);

    async function ensureRuntime(reference, roomId = '') {
        const world =
            reference && typeof reference === 'object'
                ? reference
                : resolveWorld(libraryRoot, reference);
        if (!world) {
            throw Object.assign(new Error('地图不存在或数据不完整'), { statusCode: 404 });
        }
        const id = world.id;
        const key = runtimeKey(id, roomId);
        if (destroyed.has(key)) {
            throw Object.assign(new Error('运行时已销毁，请刷新页面或点击重新链接'), {
                statusCode: 409,
            });
        }
        // The runtime is registered before its health check completes. Always
        // join that startup first; treating the child as ready here proxies into
        // a port that is still prebaking and produces intermittent 500/502s.
        if (starts.has(key)) {
            return starts.get(key);
        }
        const current = runtimes.get(key);
        if (current?.signature === world.signature && !current.exited) {
            lifecycle.touch(current);
            setStatus(key, { phase: 'ready', percent: 100, message: '游戏运行时已就绪' });
            return current;
        }
        if (current) {
            await stopRuntime(key);
        }
        const promise = (async () => {
            await lifecycle.ensureCapacity(key);
            if (destroyed.has(key)) {
                throw Object.assign(new Error('运行时已销毁，请刷新页面或点击重新链接'), {
                    statusCode: 409,
                });
            }
            setStatus(key, {
                phase: 'starting',
                percent: 18,
                message: roomId ? '正在创建私有传送房间' : '正在创建独立游戏运行时',
            });
            const runtimePort = nextPort++;
            const runtime = await startRuntime(world, runtimePort, {
                serverId: roomId || world.manifest.permanentMapId,
                privateRoom: Boolean(roomId),
            });
            const profile = runtimeProfileForWorld(world) || {};
            runtime.idleTimeoutMs = profile.idleTimeoutMs;
            if (destroyed.has(key)) {
                await runtime.stop();
                throw Object.assign(new Error('运行时已销毁，请刷新页面或点击重新链接'), {
                    statusCode: 409,
                });
            }
            lifecycle.touch(runtime);
            runtime.signature = world.signature;
            runtime.worldId = id;
            runtime.roomId = roomId;
            runtimes.set(key, runtime);
            try {
                setStatus(key, {
                    phase: 'loading',
                    percent: 42,
                    message: '正在加载地图与预烘焙资源',
                });
                await waitForRuntimeReady({
                    runtime,
                    url: `http://${runtime.hostname || '127.0.0.1'}:${runtime.port || runtimePort}/api/health-check`,
                    waitForRuntime,
                    startupTimeoutMs,
                    onWindowElapsed: ({ elapsedMs, timeoutMs }) => {
                        const percent = Math.min(90, 42 + Math.floor((elapsedMs / timeoutMs) * 48));
                        setStatus(key, {
                            phase: 'loading',
                            percent,
                            message: '地图仍在迁移和预烘焙，运行时会继续加载',
                        });
                    },
                });
                if (destroyed.has(key)) {
                    runtimes.delete(key);
                    if (!runtime.exited) {
                        await runtime.stop();
                    }
                    throw Object.assign(new Error('运行时已销毁，请刷新页面或点击重新链接'), {
                        statusCode: 409,
                    });
                }
            } catch (error) {
                runtimes.delete(key);
                if (destroyed.has(key)) {
                    setStatus(key, { phase: 'idle', percent: 0, message: '运行时已销毁' });
                } else {
                    setStatus(key, {
                        phase: 'error',
                        percent: 0,
                        message: error.message || '游戏运行时启动失败',
                    });
                }
                if (!runtime.exited) {
                    await runtime.stop();
                }
                throw error;
            }
            setStatus(key, { phase: 'ready', percent: 100, message: '游戏运行时已就绪' });
            console.log(roomId ? `  Private room ready: ${id}/${roomId}` : `  Map ready: /p/${id}`);
            return runtime;
        })().finally(() => starts.delete(key));
        starts.set(key, promise);
        return promise;
    }

    const teleportRooms = createTeleportRoomManager({
        resolveMap: (reference) => resolveWorld(libraryRoot, reference),
        ensureRuntime: (world, roomId) => ensureRuntime(world, roomId),
        stopRuntime: (roomId) => stopRuntime(runtimeKey('', roomId)),
        isRoomActive: (roomId) => Boolean(runtimes.get(runtimeKey('', roomId))?.activeConnections),
        maxRooms: teleportMaxRooms,
        roomIdleTimeoutMs: teleportRoomIdleTimeoutMs,
        maxRoomsForMap: (permanentMapId) =>
            runtimeProfileForWorld(resolveWorld(libraryRoot, permanentMapId) || {})?.roomLimit,
        roomIdleTimeoutForMap: (permanentMapId) =>
            runtimeProfileForWorld(resolveWorld(libraryRoot, permanentMapId) || {})?.idleTimeoutMs,
    });
    const handleTeleportControl = teleportInternalToken
        ? createTeleportControlHandler({
              manager: teleportRooms,
              internalToken: teleportInternalToken,
          })
        : async () => false;

    const server = http.createServer(async (req, res) => {
        try {
            if (await handleTeleportControl(req, res)) {
                return;
            }
            const { reference, roomId, forwardedPath } = parseWorldRequest(req.url);
            const resolvedWorld = resolveWorld(libraryRoot, reference);
            if (
                await serveDerivedPlayResource({
                    world: resolvedWorld,
                    runtimeCacheRoot,
                    forwardedPath,
                    request: req,
                    response: res,
                })
            ) {
                return;
            }
            const id = resolvedWorld?.id || reference;
            const key = runtimeKey(id, roomId);
            if (forwardedPath === '/__local_runtime/status') {
                const runtime = runtimes.get(key);
                if (runtime?.exited && statuses.get(key)?.phase === 'ready') {
                    setStatus(key, { phase: 'error', percent: 0, message: '游戏运行时异常退出' });
                }
                res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
                res.end(
                    JSON.stringify(
                        await runtimeStatus(
                            key,
                            runtime,
                            {
                                phase: 'idle',
                                percent: 0,
                                message: '等待启动',
                                updatedAt: '',
                            },
                            {
                                rooms: teleportRooms.listRooms(
                                    resolvedWorld?.manifest.permanentMapId || id,
                                ),
                            },
                        ),
                    ),
                );
                return;
            }
            if (forwardedPath === '/__local_runtime/destroy' && req.method === 'POST') {
                destroyed.add(key);
                if (roomId) {
                    await teleportRooms.destroyRoom(roomId);
                } else {
                    await stopRuntime(id);
                    setStatus(key, { phase: 'idle', percent: 0, message: '运行时已销毁' });
                }
                res.writeHead(204);
                res.end();
                return;
            }
            if (forwardedPath === '/__local_runtime/start' && req.method === 'POST') {
                if (!resolvedWorld) {
                    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ message: '地图不存在或数据不完整' }));
                    return;
                }
                if (roomId) {
                    teleportRooms.resolveRoom({
                        targetMapId: resolvedWorld.manifest.permanentMapId,
                        serverId: roomId,
                    });
                }
                if (req.headers['x-box-runtime-restart'] === '1') {
                    destroyed.delete(key);
                }
                if (destroyed.has(key)) {
                    res.writeHead(409, { 'content-type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ message: '运行时已销毁，请刷新页面或点击重新链接' }));
                    return;
                }
                void ensureRuntime(resolvedWorld, roomId).catch(() => undefined);
                res.writeHead(202, { 'content-type': 'application/json; charset=utf-8' });
                res.end(
                    JSON.stringify(
                        statuses.get(key) ||
                            setStatus(key, { phase: 'starting', percent: 10, message: '正在启动' }),
                    ),
                );
                return;
            }
            if (roomId) {
                teleportRooms.resolveRoom({
                    targetMapId: resolvedWorld?.manifest.permanentMapId,
                    serverId: roomId,
                });
            }
            const runtime = await ensureRuntime(resolvedWorld || reference, roomId);
            const releaseConnection = lifecycle.acquire(runtime);
            res.once('close', releaseConnection);
            const proxy = http.request(
                {
                    ...runtimeUpstream(runtime),
                    method: req.method,
                    path: forwardedPath,
                    headers: { ...req.headers, host: runtimeHostHeader(runtime) },
                },
                (upstream) => {
                    res.writeHead(upstream.statusCode || 502, upstream.headers);
                    upstream.pipe(res);
                },
            );
            proxy.on('error', (error) => {
                if (!res.headersSent) {
                    res.writeHead(502, { 'content-type': 'application/json' });
                }
                res.end(JSON.stringify({ message: error.message }));
            });
            req.pipe(proxy);
        } catch (error) {
            if (res.headersSent) {
                res.destroy();
                return;
            }
            res.writeHead(error.statusCode || 500, {
                'content-type': 'application/json; charset=utf-8',
            });
            res.end(JSON.stringify({ message: error.message }));
        }
    });

    server.on('upgrade', async (req, socket, head) => {
        try {
            const { reference, roomId, forwardedPath } = parseWorldRequest(req.url);
            const world = resolveWorld(libraryRoot, reference);
            if (roomId) {
                teleportRooms.resolveRoom({
                    targetMapId: world?.manifest.permanentMapId,
                    serverId: roomId,
                });
            }
            const runtime = await ensureRuntime(world || reference, roomId);
            const releaseConnection = lifecycle.acquire(runtime);
            socket.once('close', releaseConnection);
            const target = runtimeUpstream(runtime);
            const upstream = net.connect(target.port, target.hostname);
            upstream.on('connect', () => {
                const headers = { ...req.headers, host: runtimeHostHeader(runtime) };
                const lines = [
                    `${req.method} ${forwardedPath} HTTP/${req.httpVersion}`,
                    ...Object.entries(headers).map(
                        ([key, value]) =>
                            `${key}: ${Array.isArray(value) ? value.join(', ') : value}`,
                    ),
                    '',
                    '',
                ];
                upstream.write(lines.join('\r\n'));
                if (head.length) {
                    upstream.write(head);
                }
                socket.pipe(upstream).pipe(socket);
            });
            upstream.on('error', () => socket.destroy());
            socket.on('error', () => upstream.destroy());
        } catch {
            socket.destroy();
        }
    });

    const scanTimer = setInterval(() => {
        // Runtime cleanup only needs eventual consistency. Cache the complete
        // library snapshot here, while request routing keeps its fresh lookup so
        // a newly imported map remains immediately enterable.
        const worlds = new Map(listWorlds(libraryRoot, 10_000).map((world) => [world.id, world]));
        for (const [key, runtime] of runtimes) {
            const world = worlds.get(runtime.worldId || key);
            if (!world || world.signature !== runtime.signature) {
                stopRuntime(key).catch((error) =>
                    console.error(`Unable to stop map ${runtime.worldId || key}:`, error),
                );
            }
        }
        teleportRooms
            .collectIdle()
            .catch((error) => console.error('Unable to recycle idle teleport rooms:', error));
        lifecycle
            .collectIdle()
            .catch((error) => console.error('Unable to recycle idle map runtimes:', error));
    }, 3000);
    scanTimer.unref();

    const ready = new Promise((resolve) => server.listen(port, host, resolve));

    return {
        server,
        ready,
        listWorlds: () => listWorlds(libraryRoot),
        ensureRuntime,
        teleportRooms,
        async stop() {
            if (closed) {
                return;
            }
            closed = true;
            clearInterval(scanTimer);
            await new Promise((resolve) => server.close(resolve));
            await Promise.all([...runtimes.keys()].map(stopRuntime));
        },
    };
}

module.exports = { listWorlds, readWorld, resolveWorld, startPlayLibrary };
