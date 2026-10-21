'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { issueModerationRuntimeToken } = require(
    require.resolve('@box/utils/moderation-runtime-auth', {
        paths: [
            path.resolve(__dirname, '..'),
            path.resolve(__dirname, '../../../services/game-server'),
        ],
    }),
);

/** The launcher retains the signing secret; game children receive only a private rotating credential file. */
function createModerationCredential(environment, secret) {
    const env = { ...environment };
    delete env.BOX_MODERATION_SIGNING_SECRET;
    delete env.BOX_MODERATION_CREDENTIAL_PATH;
    const mapId = env.BOX_WORLD_PERMANENT_MAP_ID || '';
    if (!mapId || !secret) {
        return { env, close() {} };
    }
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'box-moderation-'));
    const file = path.join(directory, 'credential');
    const identity = { mapId, runtimeId: env.SERVER_ID || mapId, mode: env.MODE };
    const refresh = () => {
        const temporary = path.join(directory, 'credential.tmp');
        fs.writeFileSync(temporary, issueModerationRuntimeToken(identity, secret), { mode: 0o600 });
        fs.renameSync(temporary, file);
    };
    try {
        refresh();
    } catch (error) {
        fs.rmSync(directory, { recursive: true, force: true });
        throw error;
    }
    const timer = setInterval(() => {
        try {
            refresh();
        } catch {
            console.warn('地图实例凭证刷新失败，过期后管理调用将被拒绝');
        }
    }, 60000);
    timer.unref();
    env.BOX_MODERATION_CREDENTIAL_PATH = file;
    let closed = false;
    return {
        env,
        close() {
            if (closed) {
                return;
            }
            closed = true;
            clearInterval(timer);
            fs.rmSync(directory, { recursive: true, force: true });
        },
    };
}
module.exports = { createModerationCredential };
