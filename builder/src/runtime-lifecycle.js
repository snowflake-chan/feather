'use strict';

function positiveInteger(value, fallback, maximum) {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

function runtimeLimit(value, fallback = 4) {
    return positiveInteger(value, fallback, 128);
}

function idleTimeout(value, fallback = 15 * 60_000) {
    return positiveInteger(value, fallback, 7 * 24 * 60 * 60_000);
}

function createRuntimeLifecycle({
    runtimes,
    starts,
    stopRuntime,
    setStatus,
    maxRuntimes,
    idleTimeoutMs,
    idleTimeoutFor,
    idleMessage = '运行时已因空闲自动回收',
}) {
    const maximum = runtimeLimit(maxRuntimes);
    const idleAfter = idleTimeout(idleTimeoutMs);

    function touch(runtime, now = Date.now()) {
        runtime.lastAccessAt = now;
        runtime.activeConnections ||= 0;
        return runtime;
    }

    function acquire(runtime, { touchAccess = true } = {}) {
        if (touchAccess) {
            touch(runtime);
        } else {
            runtime.activeConnections ||= 0;
        }
        runtime.activeConnections += 1;
        let released = false;
        return () => {
            if (released) {
                return;
            }
            released = true;
            runtime.activeConnections = Math.max(0, runtime.activeConnections - 1);
            if (touchAccess) {
                touch(runtime);
            }
        };
    }

    function allocatedIds() {
        return new Set([...runtimes.keys(), ...starts.keys()]);
    }

    async function ensureCapacity(requestedId) {
        const allocated = allocatedIds();
        if (allocated.has(requestedId) || allocated.size < maximum) {
            return;
        }
        const candidates = [...runtimes.entries()]
            .filter(
                ([id, runtime]) =>
                    id !== requestedId && !runtime.exited && !runtime.activeConnections,
            )
            .sort((left, right) => (left[1].lastAccessAt || 0) - (right[1].lastAccessAt || 0));
        const oldest = candidates[0];
        if (!oldest) {
            throw Object.assign(new Error(`运行时数量已达到上限（${maximum}），请稍后重试`), {
                statusCode: 503,
            });
        }
        const [id] = oldest;
        setStatus(id, { phase: 'idle', percent: 0, message: '运行时已按容量限制回收' });
        await stopRuntime(id);
    }

    async function collectIdle(now = Date.now()) {
        const expired = [...runtimes.entries()]
            .filter(
                ([id, runtime]) =>
                    !starts.has(id) &&
                    !runtime.exited &&
                    !runtime.activeConnections &&
                    now - (runtime.lastAccessAt || now) >=
                        idleTimeout(runtime?.idleTimeoutMs ?? idleTimeoutFor?.(runtime), idleAfter),
            )
            .map(([id]) => id);
        await Promise.all(
            expired.map(async (id) => {
                setStatus(id, { phase: 'idle', percent: 0, message: idleMessage });
                await stopRuntime(id);
            }),
        );
        return expired;
    }

    return {
        maximum,
        idleAfter,
        touch,
        acquire,
        ensureCapacity,
        collectIdle,
    };
}

module.exports = { createRuntimeLifecycle, idleTimeout, runtimeLimit };
