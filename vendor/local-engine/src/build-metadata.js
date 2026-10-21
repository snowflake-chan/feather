'use strict';

function resolveBuildMetadata({ env = process.env, version, revision, now } = {}) {
    return {
        BOX_BUILD_VERSION: env.BOX_BUILD_VERSION || version || '0.0.0',
        BOX_BUILD_COMMIT: env.BOX_BUILD_COMMIT || revision || 'unknown',
        BOX_BUILD_DATE:
            env.BOX_BUILD_DATE ||
            (now instanceof Date ? now : new Date(now || Date.now())).toISOString(),
        BOX_BUILD_SOURCE: env.BOX_BUILD_SOURCE || 'local',
    };
}

module.exports = { resolveBuildMetadata };
