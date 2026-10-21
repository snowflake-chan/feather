'use strict';

const DEFAULT_RUNTIME_START_TIMEOUT_MS = 30 * 60_000;

function runtimeStartTimeout(value, fallback = DEFAULT_RUNTIME_START_TIMEOUT_MS) {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0
        ? Math.min(parsed, 24 * 60 * 60_000)
        : fallback;
}

function runtimeExitError(runtime, lastError) {
    const detail = runtime.exitCode != null ? `（退出码 ${runtime.exitCode}）` : '';
    return Object.assign(new Error(`运行时在地图加载完成前退出${detail}`), {
        statusCode: 503,
        cause: lastError,
    });
}

/**
 * A Boxes map container owns its startup independently from any one browser
 * request. Large imported maps can spend several health-check windows in
 * prebake/migration, so an elapsed window is progress, not process failure.
 */
async function waitForRuntimeReady({
    runtime,
    url,
    waitForRuntime,
    startupTimeoutMs = DEFAULT_RUNTIME_START_TIMEOUT_MS,
    onWindowElapsed = () => undefined,
}) {
    const timeoutMs = runtimeStartTimeout(startupTimeoutMs);
    const startedAt = Date.now();
    let lastError;

    while (Date.now() - startedAt < timeoutMs) {
        if (runtime.exited) {
            throw runtimeExitError(runtime, lastError);
        }
        try {
            const healthCheck = waitForRuntime(url, 120);
            if (runtime.exitPromise) {
                await Promise.race([
                    healthCheck,
                    runtime.exitPromise.then(() => {
                        throw runtimeExitError(runtime, lastError);
                    }),
                ]);
            } else {
                await healthCheck;
            }
            return;
        } catch (error) {
            lastError = error;
            if (runtime.exited || error?.statusCode === 503) {
                throw runtimeExitError(runtime, error);
            }
            const elapsedMs = Date.now() - startedAt;
            if (elapsedMs >= timeoutMs) {
                break;
            }
            onWindowElapsed({ elapsedMs, timeoutMs, error });
        }
    }

    throw Object.assign(new Error(`地图运行时启动超过 ${Math.ceil(timeoutMs / 60_000)} 分钟`), {
        statusCode: 504,
        cause: lastError,
    });
}

module.exports = {
    DEFAULT_RUNTIME_START_TIMEOUT_MS,
    runtimeStartTimeout,
    waitForRuntimeReady,
};
