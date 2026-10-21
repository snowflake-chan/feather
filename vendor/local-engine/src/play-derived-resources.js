'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

function matchesHash(hash, content) {
    const digest = crypto.createHash('sha256').update(content).digest();
    if (/^[A-Za-z0-9_-]{43}$/.test(hash)) {
        return digest.toString('base64url') === hash;
    }
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let value = 0n;
    for (const character of hash) {
        value = value * 58n + BigInt(alphabet.indexOf(character));
    }
    const encoded = value.toString(16);
    const multihash = Buffer.from(encoded.padStart(Math.ceil(encoded.length / 2) * 2, '0'), 'hex');
    return (
        multihash.length === 34 &&
        multihash[0] === 0x12 &&
        multihash[1] === 0x20 &&
        digest.equals(multihash.subarray(2))
    );
}

/** Serve the same immutable derived store advertised by the signed cache manifest.
 * Isolated map containers use a separate temporary store and may not contain
 * these files. Never expose scripts, control data, symlinks or altered bytes.
 */
async function serveDerivedPlayResource({
    world,
    runtimeCacheRoot,
    forwardedPath,
    request,
    response,
}) {
    if (!world || !runtimeCacheRoot || request.method !== 'GET') {
        return false;
    }
    const match = forwardedPath.match(
        /^\/block\/(Qm[1-9A-HJ-NP-Za-km-z]{44}|[A-Za-z0-9_-]{43})(?:\?.*)?$/,
    );
    if (!match) {
        return false;
    }
    const hash = match[1];
    const identity = world.manifest.permanentMapId || world.id;
    const digest = crypto
        .createHash('sha256')
        .update(`play\0${identity}`)
        .digest('hex')
        .slice(0, 32);
    const file = path.join(runtimeCacheRoot, 'play', digest, 'blobs', hash);
    try {
        if (!(await fs.lstat(file)).isFile()) {
            return false;
        }
        const privateManifest = JSON.parse(
            await fs.readFile(path.join(world.dataRoot, 'private-blobs.json'), 'utf8'),
        );
        if (!Array.isArray(privateManifest.hashes) || privateManifest.hashes.includes(hash)) {
            return false;
        }
        const content = await fs.readFile(file);
        if (!matchesHash(hash, content)) {
            return false;
        }
        response.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': content.length,
            'Cross-Origin-Resource-Policy': 'same-origin',
        });
        response.end(content);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
}

module.exports = { serveDerivedPlayResource };
