'use strict';

const http = require('http');
const net = require('net');
const { createRuntimeLifecycle } = require('./runtime-lifecycle');
const { waitForRuntimeReady } = require('./runtime-readiness');
const { runtimeUpstream, runtimeHostHeader } = require('./runtime-upstream');
const {
    createTeleportControlHandler,
    createTeleportRoomManager,
    roomIdPattern,
} = require('./teleport-room-manager');

const projectIdPattern = /^[a-z0-9][a-z0-9-]{0,62}$/;

function parseProjectRequest(requestUrl) {
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
    return {
        reference,
        roomId,
        forwardedPath: `/${segments.slice(consumed).join('/')}${parsed.search}`,
    };
}

/**
 * boxes allocates one edit container per map and returns that container's
 * address to the browser. This is the local equivalent: one stable proxy port
 * allocates an isolated child runtime per project and routes by project id.
 */
function startEditLibrary({
    host,
    port,
    mode = 'edit',
    runtimePortStart = 11000,
    resolveProject,
    startRuntime,
    waitForRuntime,
    maxRuntimes = 4,
    idleTimeoutMs = 15 * 60_000,
    startupTimeoutMs,
    teleportInternalToken,
    teleportMaxRooms = 64,
    teleportRoomIdleTimeoutMs = 15 * 60_000,
}) {
    const runtimes = new Map();
    const starts = new Map();
    const destroyed = new Set();
    const statuses = new Map();
    let nextPort = runtimePortStart;
    let closed = false;

    // A Creator instance may be restarted while an older map process is still
    // winding down. Allocate per-map ports defensively instead of assuming the
    // sequential range is empty after every restart.
    const usedRuntimePorts = () =>
        new Set(
            [...runtimes.values()]
                .filter((runtime) => runtime && !runtime.exited)
                .map((runtime) => runtime.port),
        );

    const portIsAvailable = (candidate) =>
        new Promise((resolve) => {
            const probe = net.createServer();
            const finish = (available) => {
                probe.removeAllListeners();
                if (probe.listening) {
                    probe.close(() => resolve(available));
                } else {
                    resolve(available);
                }
            };
            probe.once('error', () => finish(false));
            probe.once('listening', () => finish(true));
            probe.listen(candidate, '127.0.0.1');
        });

    async function allocateRuntimePort() {
        const unavailable = usedRuntimePorts();
        for (let attempts = 0; attempts < 512; attempts += 1) {
            const candidate = nextPort++;
            if (unavailable.has(candidate)) {
                continue;
            }
            if (await portIsAvailable(candidate)) {
                return candidate;
            }
        }
        throw Object.assign(new Error('没有可用的地图运行时端口，请稍后重试'), { statusCode: 503 });
    }

    const setStatus = (id, status) => {
        const next = { ...status, updatedAt: new Date().toISOString() };
        statuses.set(id, next);
        return next;
    };

    const runtimeStatus = (id, runtime, fallback, details = {}) => ({
        ...(statuses.get(id) || fallback),
        ...details,
        ...(runtime && !runtime.exited
            ? {
                  port: runtime.port,
                  pid: runtime.pid,
                  startedAt: runtime.startedAt,
                  onlineCount: Number(runtime.activeConnections || 0),
                  ...(runtime.metrics?.() || {}),
              }
            : {}),
    });

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
    });

    const runtimeKey = (projectId, roomId = '') => (roomId ? `room:${roomId}` : projectId);

    async function ensureRuntime(reference, roomId = '') {
        const project =
            reference && typeof reference === 'object' ? reference : resolveProject(reference);
        const id = project?.id || String(reference || '');
        if (!projectIdPattern.test(id)) {
            throw Object.assign(new Error('工程 ID 无效'), { statusCode: 400 });
        }
        if (!project) {
            throw Object.assign(new Error('工程不存在'), { statusCode: 404 });
        }
        const key = runtimeKey(id, roomId);
        if (destroyed.has(key)) {
            throw Object.assign(new Error('运行时已销毁，请刷新页面或点击重新链接'), {
                statusCode: 409,
            });
        }
        // A child is inserted into `runtimes` before its health check completes.
        // Concurrent block/createSession requests must join that same startup
        // promise instead of proxying early to a port that is not ready yet.
        if (starts.has(key)) {
            return starts.get(key);
        }
        const current = runtimes.get(key);
        if (current && !current.exited) {
            lifecycle.touch(current);
            setStatus(key, { phase: 'ready', percent: 100, message: '运行时已就绪' });
            return current;
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
                message: roomId ? '正在创建私有传送房间' : '正在创建独立运行时',
            });
            const runtimePort = await allocateRuntimePort();
            const runtime = await startRuntime(project, runtimePort, {
                serverId: roomId || project.permanentMapId,
                privateRoom: Boolean(roomId),
            });
            if (destroyed.has(key)) {
                await runtime.stop();
                throw Object.assign(new Error('运行时已销毁，请刷新页面或点击重新链接'), {
                    statusCode: 409,
                });
            }
            lifecycle.touch(runtime);
            runtime.projectId = id;
            runtime.roomId = roomId;
            runtimes.set(key, runtime);
            try {
                setStatus(key, {
                    phase: 'loading',
                    percent: 42,
                    message: '正在加载工程与预烘焙资源',
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
                        message: error.message || '运行时启动失败',
                    });
                }
                if (!runtime.exited) {
                    await runtime.stop();
                }
                throw error;
            }
            setStatus(key, { phase: 'ready', percent: 100, message: '运行时已就绪' });
            console.log(
                roomId
                    ? `  Private room ready: ${id}/${roomId}`
                    : mode === 'play'
                      ? `  Play project ready: /p/${id}`
                      : `  Edit project ready: /e/${id}`,
            );
            return runtime;
        })().finally(() => starts.delete(key));
        starts.set(key, promise);
        return promise;
    }

    const teleportRooms = createTeleportRoomManager({
        resolveMap: resolveProject,
        ensureRuntime: (project, roomId) =>
            mode === 'play' ? ensureRuntime(project, roomId) : undefined,
        stopRuntime: (roomId) => stopRuntime(runtimeKey('', roomId)),
        isRoomActive: (roomId) => Boolean(runtimes.get(runtimeKey('', roomId))?.activeConnections),
        maxRooms: teleportMaxRooms,
        roomIdleTimeoutMs: teleportRoomIdleTimeoutMs,
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
            const { reference, roomId, forwardedPath } = parseProjectRequest(req.url);
            let project = null;
            let id = reference;
            let key = runtimeKey(id, roomId);
            if (forwardedPath === '/__local_runtime/status') {
                const runtime = runtimes.get(key);
                if (runtime?.exited && statuses.get(key)?.phase === 'ready') {
                    setStatus(key, { phase: 'error', percent: 0, message: '运行时异常退出' });
                }
                const status = runtimeStatus(
                    key,
                    runtime,
                    runtime && !runtime.exited
                        ? { phase: 'ready', percent: 100, message: '运行时已就绪' }
                        : { phase: 'idle', percent: 0, message: '等待启动', updatedAt: '' },
                    { rooms: teleportRooms.listRooms(resolveProject(id)?.permanentMapId || id) },
                );
                res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify(status));
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
                project = resolveProject(reference);
                if (!project) {
                    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ message: '工程不存在' }));
                    return;
                }
                id = project.id;
                key = runtimeKey(id, roomId);
                if (req.headers['x-box-runtime-restart'] === '1') {
                    destroyed.delete(key);
                }
                if (destroyed.has(key)) {
                    res.writeHead(409, { 'content-type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ message: '运行时已销毁，请刷新页面或点击重新链接' }));
                    return;
                }
                if (roomId) {
                    teleportRooms.resolveRoom({
                        targetMapId: project.permanentMapId,
                        serverId: roomId,
                    });
                }
                void ensureRuntime(project, roomId).catch(() => undefined);
                res.writeHead(202, { 'content-type': 'application/json; charset=utf-8' });
                res.end(
                    JSON.stringify(
                        statuses.get(key) ||
                            setStatus(key, { phase: 'starting', percent: 10, message: '正在启动' }),
                    ),
                );
                return;
            }
            // Creator CLI status and log subscriptions observe an editor runtime;
            // neither operation may allocate a map process as a side effect. Only a
            // deliberate preview `start` request is allowed to create one.
            const isCreatorPreviewRoute =
                forwardedPath === '/internal/creator-preview-runtime' ||
                forwardedPath === '/internal/creator-preview-runtime/events';
            if (isCreatorPreviewRoute) {
                project = resolveProject(reference);
                if (!project) {
                    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ message: '工程不存在' }));
                    return;
                }
                id = project.id;
                key = runtimeKey(id, roomId);
            }
            if (forwardedPath === '/internal/creator-preview-runtime') {
                const current = runtimes.get(key);
                const starting = starts.has(key);
                const previewAction = req.headers['x-box-creator-preview-action'];
                if (req.method === 'POST' && previewAction === 'start') {
                    // `runtime start` is an explicit request to make a previously
                    // recycled preview usable again, just like opening the map editor.
                    destroyed.delete(key);
                }
                if (req.method === 'GET' && !current && !starting) {
                    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
                    res.end(
                        JSON.stringify({
                            phase: 'idle',
                            running: false,
                            message: '预览已停止',
                            updatedAt: new Date().toISOString(),
                        }),
                    );
                    return;
                }
                if (req.method === 'POST' && previewAction === 'stop' && !current && !starting) {
                    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
                    res.end(
                        JSON.stringify({
                            phase: 'idle',
                            running: false,
                            message: '预览已停止',
                            updatedAt: new Date().toISOString(),
                        }),
                    );
                    return;
                }
            }
            if (forwardedPath === '/internal/creator-preview-runtime/events') {
                const current = runtimes.get(key);
                const starting = starts.has(key);
                if (!current && !starting) {
                    res.writeHead(409, { 'content-type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ message: '地图编辑器尚未打开' }));
                    return;
                }
            }
            let existingRuntime = runtimes.get(key);
            // Publishing asks an already-open editor to flush its state. A project
            // that is not open is already authoritative on disk and must not start a
            // heavyweight edit runtime merely to acknowledge this request.
            if (forwardedPath === '/internal/save-local-project' && !existingRuntime) {
                res.writeHead(204);
                res.end();
                return;
            }
            if (roomId || (!existingRuntime && !starts.has(key))) {
                project = resolveProject(reference);
                id = project?.id || reference;
                key = runtimeKey(id, roomId);
                existingRuntime = runtimes.get(key);
            }
            if (roomId) {
                teleportRooms.resolveRoom({
                    targetMapId: project?.permanentMapId,
                    serverId: roomId,
                });
            }
            const runtime = starts.has(key)
                ? await ensureRuntime(project || reference, roomId)
                : existingRuntime && !existingRuntime.exited
                  ? existingRuntime
                  : await ensureRuntime(project || reference, roomId);
            // Automatic backup saves must keep the child alive while the request is
            // in flight, but they are maintenance rather than editor activity and
            // must not postpone idle recycling forever.
            const releaseConnection = lifecycle.acquire(runtime, {
                touchAccess: forwardedPath !== '/internal/save-local-project',
            });
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
                    res.writeHead(502, { 'content-type': 'application/json; charset=utf-8' });
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
            const { reference, roomId, forwardedPath } = parseProjectRequest(req.url);
            const project = resolveProject(reference);
            if (roomId) {
                teleportRooms.resolveRoom({
                    targetMapId: project?.permanentMapId,
                    serverId: roomId,
                });
            }
            const runtime = await ensureRuntime(project || reference, roomId);
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

    const recycleTimer = setInterval(
        () => {
            teleportRooms
                .collectIdle()
                .catch((error) => console.error('Unable to recycle idle teleport rooms:', error));
            lifecycle
                .collectIdle()
                .catch((error) => console.error('Unable to recycle idle project runtimes:', error));
        },
        Math.max(5_000, Math.min(60_000, Math.floor(lifecycle.idleAfter / 2))),
    );
    recycleTimer.unref();

    const ready = new Promise((resolve) => server.listen(port, host, resolve));

    return {
        server,
        ready,
        ensureRuntime,
        teleportRooms,
        async stop() {
            if (closed) {
                return;
            }
            closed = true;
            clearInterval(recycleTimer);
            await new Promise((resolve) => server.close(resolve));
            await Promise.all([...runtimes.keys()].map(stopRuntime));
        },
    };
}

module.exports = { startEditLibrary };
