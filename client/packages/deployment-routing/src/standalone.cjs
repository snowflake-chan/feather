'use strict';
const fs = require('node:fs'),
    path = require('node:path');
function environment(role) {
    const key =
        role === 'play'
            ? 'BOX_PLAY'
            : role === 'creator'
              ? 'BOX_CREATOR'
              : role === 'voxa'
                ? 'BOX_VOXA'
                : role === 'player-service'
                  ? 'BOX_PLAYER_SERVICE'
                  : 'BOX_AUTH_PORTAL';
    const base = process.env.BOX_APP_BASE_PATH || '';
    if (
        base &&
        (!/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(base) ||
            /^\/(api|_next|runtime|p|player-admin)(\/|$)/.test(base))
    ) {
        throw new Error('Invalid public path prefix');
    }
    const publicUrl = process.env[key + '_PUBLIC_URL'];
    const byOrigin = JSON.parse(process.env.BOX_PUBLIC_SERVICE_PREFIXES_BY_ORIGIN || '{}');
    const peers = publicUrl ? byOrigin[new URL(publicUrl).origin] || [] : [];
    process.env.BOX_PUBLIC_SERVICE_PREFIXES = JSON.stringify(peers);
}
function inject(file, role) {
    const source = fs.readFileSync(file, 'utf8');
    const marker = 'process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig)';
    if (!source.includes(marker)) {
        throw new Error('Unsupported Next standalone entry');
    }
    const helper = __dirname;
    const insertion = `require(${JSON.stringify(path.join(helper, 'standalone.cjs'))}).environment(${JSON.stringify(role)});require(${JSON.stringify(path.join(helper, 'server.cjs'))}).install();if(process.env.BOX_APP_BASE_PATH)nextConfig.assetPrefix=process.env.BOX_APP_BASE_PATH;\n`;
    fs.writeFileSync(file, source.replace(marker, insertion + marker));
}
module.exports = { environment, inject };
if (require.main === module) {
    inject(process.argv[2], process.argv[3]);
}
