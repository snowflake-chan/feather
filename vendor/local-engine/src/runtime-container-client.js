'use strict';

const { ApiClient } = require('@box/apis');

function schedulerSettings(env = process.env) {
    const endpoint = String(env.BOX_RUNTIME_MANAGER_URL || '')
        .trim()
        .replace(/\/$/, '');
    const token = String(env.BOX_RUNTIME_MANAGER_TOKEN || '').trim();
    return endpoint && token ? { endpoint, token } : null;
}

function schedulerApi(settings) {
    return new ApiClient({
        baseUrl: settings.endpoint,
        headers: {
            'content-type': 'application/json',
            'x-box-runtime-token': settings.token,
        },
        defaultErrorMessage: '地图容器调度失败',
    });
}

async function ensureRuntimeContainer(settings, request) {
    const api = schedulerApi(settings);
    const result = await api.postApiRuntimeEnsure({ body: request });
    if (!result.hostname || !Number.isInteger(Number(result.port))) {
        throw new Error('地图容器调度器返回了无效的运行时地址');
    }
    return {
        hostname: result.hostname,
        port: Number(result.port),
        containerId: String(result.containerId || ''),
        startedAt: result.startedAt || new Date().toISOString(),
        exited: false,
        async metrics() {
            const stats = await api.getApiRuntimeContainerIdStats({
                params: { path: { container_id: String(result.containerId) } },
            });
            if (!stats.running) {
                this.exited = true;
            }
            return stats.running ? stats : {};
        },
        async stop() {
            await api.deleteApiRuntimeContainerId({
                params: { path: { container_id: String(result.containerId) } },
            });
            this.exited = true;
        },
    };
}

module.exports = { ensureRuntimeContainer, schedulerSettings };
