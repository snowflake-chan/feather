'use strict';

const fs = require('node:fs');
const path = require('node:path');

function references(buffer, exists) {
    const text = buffer.toString('utf8');
    try {
        const hashes = new Set();
        const collect = (value) => {
            if (typeof value === 'string') {
                const cid = /^(Qm[1-9A-HJ-NP-Za-km-z]{44})(?:\.[a-z0-9]+)?$/i.exec(value);
                if (cid) {
                    hashes.add(cid[1]);
                } else if (/^[A-Za-z0-9_-]{43}$/.test(value)) {
                    hashes.add(value);
                }
            } else if (Array.isArray(value)) {
                value.forEach(collect);
            } else if (value && typeof value === 'object') {
                Object.values(value).forEach(collect);
            }
        };
        collect(JSON.parse(text));
        return hashes;
    } catch {
        // Generated JS and binary mesh payloads are not JSON documents.
    }
    const hashes = new Set(text.match(/Qm[1-9A-HJ-NP-Za-km-z]{44}/g) || []);
    if (buffer.every((byte) => byte >= 32 || [9, 10, 13].includes(byte))) {
        for (const match of text.matchAll(/(['"`])([A-Za-z0-9_-]{43})\1/g)) {
            hashes.add(match[2]);
        }
    }
    for (const match of text.matchAll(/(?<![A-Za-z0-9_-])[A-Za-z0-9_-]{43}(?![A-Za-z0-9_-])/g)) {
        if (exists(match[0])) {
            hashes.add(match[0]);
        }
    }
    // Binary model documents encode URL-safe hashes as length-delimited strings.
    for (let index = 0; index + 44 <= buffer.length; index += 1) {
        if (buffer[index] !== 43) {
            continue;
        }
        const hash = buffer.subarray(index + 1, index + 44).toString('ascii');
        if (/^[A-Za-z0-9_-]{43}$/.test(hash) && exists(hash)) {
            hashes.add(hash);
        }
    }
    return hashes;
}

function runtimeBlobHashes(repoRoot, { blobRoot: configuredBlobRoot } = {}) {
    repoRoot = fs.realpathSync(repoRoot);
    const blobRoot = configuredBlobRoot || path.join(repoRoot, 'apps/local-engine/data/blobs');
    if (fs.lstatSync(blobRoot).isSymbolicLink()) {
        throw new Error('Runtime blob store must not be a symbolic link');
    }
    if (!fs.realpathSync(blobRoot).startsWith(`${repoRoot}${path.sep}`)) {
        throw new Error('Runtime blob store must remain inside the source tree');
    }
    const exists = (hash) => {
        const stat = fs.lstatSync(path.join(blobRoot, hash), { throwIfNoEntry: false });
        if (stat?.isSymbolicLink()) {
            throw new Error(`Runtime blob must not be a symbolic link: ${hash}`);
        }
        return stat?.isFile() === true;
    };
    const hashes = new Set();
    const collect = (target) => {
        if (!fs.existsSync(target)) {
            return;
        }
        const stat = fs.lstatSync(target);
        if (
            stat.isSymbolicLink() ||
            !fs.realpathSync(target).startsWith(`${repoRoot}${path.sep}`)
        ) {
            throw new Error('Runtime reference roots must remain inside the source tree');
        }
        if (stat.isDirectory()) {
            for (const entry of fs.readdirSync(target)) {
                collect(path.join(target, entry));
            }
        } else if (stat.isFile() && stat.size <= 32 * 1024 * 1024) {
            for (const hash of references(fs.readFileSync(target), exists)) {
                hashes.add(hash);
            }
        }
    };
    for (const relative of [
        'apps/game/src/resource',
        'services/game-server/src/assets',
        'services/game-server/dist/src/assets',
        'services/game-server/src/player/default-avatar.json',
        'services/game-server/src/player/built-in-skins.ts',
    ]) {
        collect(path.join(repoRoot, relative));
    }
    if (!hashes.size) {
        throw new Error('No runtime blob references were found');
    }

    const pending = [...hashes];
    while (pending.length) {
        const hash = pending.pop();
        const target = path.join(blobRoot, hash);
        if (!exists(hash)) {
            throw new Error(`Runtime blob is missing: ${hash}`);
        }
        if (fs.statSync(target).size > 32 * 1024 * 1024) {
            continue;
        }
        const content = fs.readFileSync(target);
        const isText = content.every((byte) => byte >= 32 || [9, 10, 13].includes(byte));
        for (const child of references(content, exists)) {
            // Binary resource bytes may contain arbitrary CID-shaped sequences.
            // Only real blobs can extend the dependency graph.
            if (exists(child) && !hashes.has(child)) {
                hashes.add(child);
                pending.push(child);
            } else if (!exists(child) && isText) {
                throw new Error(`Runtime blob dependency is missing: ${child}`);
            }
        }
    }
    return hashes;
}

function resolvedDestination(target) {
    let parent = path.resolve(target);
    const suffix = [];
    while (!fs.lstatSync(parent, { throwIfNoEntry: false })) {
        suffix.unshift(path.basename(parent));
        parent = path.dirname(parent);
    }
    return path.join(fs.realpathSync(parent), ...suffix);
}

function assertSafeStagingOutput(repoRoot, outputRoot) {
    const source = fs.realpathSync(path.join(repoRoot, 'apps/local-engine/data'));
    const output = resolvedDestination(outputRoot);
    if (
        source === output ||
        source.startsWith(`${output}${path.sep}`) ||
        output.startsWith(`${source}${path.sep}`)
    ) {
        throw new Error('The staging output must not overlap the source blob store');
    }
    const blobs = path.join(outputRoot, 'blobs');
    if (fs.lstatSync(blobs, { throwIfNoEntry: false })?.isSymbolicLink()) {
        throw new Error('The staging blob directory must not be a symbolic link');
    }
}

function copyRuntimeData(repoRoot, outputRoot) {
    assertSafeStagingOutput(repoRoot, outputRoot);
    const hashes = [...runtimeBlobHashes(repoRoot)].sort();
    const sourceRoot = path.join(repoRoot, 'apps/local-engine/data/blobs');
    const outputBlobRoot = path.join(outputRoot, 'blobs');
    fs.mkdirSync(outputBlobRoot, { recursive: true, mode: 0o755 });
    for (const hash of hashes) {
        const target = path.join(outputBlobRoot, hash);
        if (fs.lstatSync(target, { throwIfNoEntry: false })?.isSymbolicLink()) {
            throw new Error(`The staging blob must not be a symbolic link: ${hash}`);
        }
        fs.copyFileSync(path.join(sourceRoot, hash), target);
        fs.chmodSync(target, 0o644);
    }
    fs.writeFileSync(
        path.join(outputRoot, 'runtime-blobs.json'),
        `${JSON.stringify({ formatVersion: 1, hashes }, null, 2)}\n`,
        { mode: 0o644 },
    );
    return hashes.length;
}

module.exports = { references, runtimeBlobHashes, copyRuntimeData, assertSafeStagingOutput };
