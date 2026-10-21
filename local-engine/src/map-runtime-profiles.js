'use strict';

// Profiles apply only to published Play maps. Published-world metadata remains
// immutable; the stable permanent map ID is the lookup key.
const PROFILE_VERSION = 1;
const profileMode = new Set(['play']);
const permanentMapIdPattern = /^[a-z0-9][a-z0-9-]{0,62}$/;

function positiveInteger(value, name, { minimum = 1, maximum } = {}) {
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < minimum || (maximum && parsed > maximum)) {
        throw new Error(`${name} 必须是 ${minimum}${maximum ? ` 到 ${maximum}` : ' 以上'}的整数`);
    }
    return parsed;
}

function optionalPositiveInteger(value, name, options = {}) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    return positiveInteger(value, name, options);
}

function normalizeMapRuntimeProfile(input = {}) {
    const permanentMapId = String(input.permanentMapId || '').trim();
    if (!permanentMapIdPattern.test(permanentMapId)) {
        throw new Error('地图永久 ID 格式无效');
    }
    const mode = String(input.mode || '').trim();
    if (!profileMode.has(mode)) {
        throw new Error('地图容器配置仅支持游玩端');
    }

    const resourceGroupId = String(input.resourceGroupId || '').trim();
    if (resourceGroupId && !permanentMapIdPattern.test(resourceGroupId)) {
        throw new Error('资源组 ID 格式无效');
    }

    return {
        permanentMapId,
        mode,
        playerLimit: positiveInteger(input.playerLimit, '人数上限', { maximum: 10000 }),
        roomLimit: positiveInteger(input.roomLimit, '房间上限', { maximum: 10000 }),
        idleTimeoutMs: positiveInteger(input.idleTimeoutMs, '无用户时存活时间（ms）', {
            minimum: 1000,
            maximum: 7 * 24 * 60 * 60 * 1000,
        }),
        // Resource limits are only supplied by a reusable resource group.  Do
        // not honor historical per-map values when a document is read.
        cpuMilli: null,
        memoryMb: null,
        ...(resourceGroupId ? { resourceGroupId } : {}),
    };
}

function normalizeRuntimeResourceGroup(input = {}) {
    const id = String(input.id || '').trim();
    if (!permanentMapIdPattern.test(id)) {
        throw new Error('资源组 ID 格式无效');
    }
    const name = String(input.name || '').trim();
    if (!name || name.length > 64) {
        throw new Error('资源组名称不能为空且不能超过 64 个字符');
    }
    const description = String(input.description || '').trim();
    if (description.length > 500) {
        throw new Error('资源说明不能超过 500 个字符');
    }
    const networkPolicy = input.networkPolicy === 'private' ? 'private' : 'unrestricted';
    if (
        input.networkPolicy !== undefined &&
        input.networkPolicy !== 'private' &&
        input.networkPolicy !== 'unrestricted'
    ) {
        throw new Error('网络策略无效');
    }
    return {
        id,
        name,
        cpuMilli: positiveInteger(input.cpuMilli, 'CPU 上限（m）', { minimum: 1, maximum: 128000 }),
        memoryMb: positiveInteger(input.memoryMb, '内存上限（MB）', {
            minimum: 64,
            maximum: 1048576,
        }),
        description,
        networkPolicy,
        processLimit: positiveInteger(input.processLimit ?? 512, '容器进程上限', {
            minimum: 16,
            maximum: 4096,
        }),
        bandwidthMbps: optionalPositiveInteger(input.bandwidthMbps, '出网带宽上限（Mbps）', {
            minimum: 1,
            maximum: 100000,
        }),
    };
}

function runtimeProfileKey({ permanentMapId, mode }) {
    return `${mode}:${permanentMapId}`;
}

function resolveMapRuntimeProfile(document, { permanentMapId, mode }, defaults = {}) {
    if (mode !== 'play') {
        return {
            playerLimit: defaults.playerLimit,
            roomLimit: defaults.roomLimit,
            idleTimeoutMs: defaults.idleTimeoutMs,
            cpuMilli: null,
            memoryMb: null,
            isolation: 'process',
        };
    }
    const profiles = Array.isArray(document?.profiles) ? document.profiles : [];
    const profile = profiles.find(
        (candidate) => candidate?.permanentMapId === permanentMapId && candidate?.mode === mode,
    );
    const normalized = profile ? normalizeMapRuntimeProfile(profile) : null;
    const groups = Array.isArray(document?.resourceGroups) ? document.resourceGroups : [];
    const resourceGroup = normalized?.resourceGroupId
        ? groups
              .map((group) => {
                  try {
                      return normalizeRuntimeResourceGroup(group);
                  } catch {
                      return null;
                  }
              })
              .find((group) => group?.id === normalized.resourceGroupId)
        : null;
    const cpuMilli = resourceGroup?.cpuMilli ?? null;
    const memoryMb = resourceGroup?.memoryMb ?? null;
    return {
        playerLimit: normalized?.playerLimit ?? defaults.playerLimit,
        roomLimit: normalized?.roomLimit ?? defaults.roomLimit,
        idleTimeoutMs: normalized?.idleTimeoutMs ?? defaults.idleTimeoutMs,
        cpuMilli,
        memoryMb,
        processLimit: resourceGroup?.processLimit ?? null,
        networkPolicy: resourceGroup?.networkPolicy ?? 'unrestricted',
        bandwidthMbps: resourceGroup?.bandwidthMbps ?? null,
        isolation: cpuMilli || memoryMb ? 'container' : 'process',
    };
}

module.exports = {
    PROFILE_VERSION,
    normalizeMapRuntimeProfile,
    normalizeRuntimeResourceGroup,
    resolveMapRuntimeProfile,
    runtimeProfileKey,
};
