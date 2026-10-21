'use strict';

function identityPart(value) {
    const normalized = String(value || '').trim();
    return normalized && normalized !== '0' ? normalized : '';
}

function resolveMapRuntimeNamespace({ permanentMapId, mapId, prefix = '' }) {
    const identity = identityPart(permanentMapId) || identityPart(mapId);
    return `${prefix}${identity || 'isolated-standalone'}`;
}

function resolveGroupRuntimeNamespace({
    permanentMapGroupId,
    mapGroupId,
    mainProjectId,
    permanentMapId,
    mapId,
}) {
    return (
        identityPart(permanentMapGroupId) ||
        identityPart(mapGroupId) ||
        identityPart(mainProjectId) ||
        identityPart(permanentMapId) ||
        identityPart(mapId) ||
        'isolated-standalone'
    );
}

module.exports = {
    resolveMapRuntimeNamespace,
    resolveGroupRuntimeNamespace,
};
