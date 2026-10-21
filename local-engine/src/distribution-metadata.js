'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function readJSON(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return null;
    }
}

function sourceRevision(repoRoot) {
    if (process.env.BOX_BUILD_COMMIT) {
        return process.env.BOX_BUILD_COMMIT;
    }
    const result = spawnSync('git', ['rev-parse', 'HEAD'], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
    });
    return result.status === 0 ? result.stdout.trim() : 'unknown';
}

function repositoryValue(value) {
    if (typeof value === 'string') {
        return value;
    }
    return value && typeof value.url === 'string' ? value.url : '';
}

function licenseValue(value) {
    if (typeof value === 'string') {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(licenseValue).filter(Boolean).join(' OR ');
    }
    return value && typeof value.type === 'string' ? value.type : 'UNKNOWN';
}

function collectThirdPartyDependencies(repoRoot) {
    const runtimeCandidates = [
        path.join(repoRoot, 'apps/game/.next/standalone/node_modules'),
        path.join(repoRoot, 'services/game-server/node_modules'),
    ].filter((entry) => fs.existsSync(entry));
    // A source checkout has a large workspace-wide node_modules that includes
    // build tools and unrelated applications. Prefer the two runtime trees so
    // the notice describes what the distributed services actually execute.
    const candidates = runtimeCandidates.length
        ? runtimeCandidates
        : [path.join(repoRoot, 'node_modules')].filter((entry) => fs.existsSync(entry));
    const visited = new Set();
    const dependencies = new Map();

    function visit(directory) {
        let real;
        try {
            real = fs.realpathSync(directory);
        } catch {
            return;
        }
        if (visited.has(real)) {
            return;
        }
        visited.add(real);
        const manifest = readJSON(path.join(real, 'package.json'));
        if (manifest?.name && manifest?.version && !manifest.name.startsWith('@box/')) {
            const key = `${manifest.name}@${manifest.version}`;
            dependencies.set(key, {
                name: manifest.name,
                version: manifest.version,
                license: licenseValue(manifest.license || manifest.licenses),
                homepage: typeof manifest.homepage === 'string' ? manifest.homepage : '',
                repository: repositoryValue(manifest.repository),
            });
        }
        let entries;
        try {
            entries = fs.readdirSync(real, { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            if (entry.name.startsWith('.') && entry.name !== '.pnpm') {
                continue;
            }
            if (!entry.isDirectory() && !entry.isSymbolicLink()) {
                continue;
            }
            const child = path.join(real, entry.name);
            // Dependency manifests can nest under scopes, pnpm's virtual store, or
            // ordinary node_modules. Avoid traversing package source trees that do
            // not contain another dependency directory.
            if (
                path.basename(real) === 'node_modules' ||
                path.basename(real).startsWith('@') ||
                path.basename(real) === '.pnpm' ||
                entry.name === 'node_modules' ||
                entry.name === '.pnpm' ||
                entry.name.startsWith('@')
            ) {
                visit(child);
            }
        }
    }

    candidates.forEach(visit);
    return [...dependencies.values()].sort(
        (left, right) =>
            left.name.localeCompare(right.name) || left.version.localeCompare(right.version),
    );
}

function listFiles(root) {
    const result = [];
    function visit(directory) {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const absolute = path.join(directory, entry.name);
            const relative = path.relative(root, absolute).split(path.sep).join('/');
            if (entry.isDirectory()) {
                visit(absolute);
            } else if (entry.isFile() && relative !== 'SHA256SUMS') {
                result.push(relative);
            }
        }
    }
    visit(root);
    return result.sort();
}

function sha256(file) {
    const digest = crypto.createHash('sha256');
    const descriptor = fs.openSync(file, 'r');
    const buffer = Buffer.allocUnsafe(1024 * 1024);
    try {
        let bytes;
        do {
            bytes = fs.readSync(descriptor, buffer, 0, buffer.length, null);
            if (bytes) {
                digest.update(buffer.subarray(0, bytes));
            }
        } while (bytes);
    } finally {
        fs.closeSync(descriptor);
    }
    return digest.digest('hex');
}

function generateDistributionMetadata(bundleRoot, options) {
    const repoRoot = options.repoRoot;
    const rootManifest = readJSON(path.join(repoRoot, 'package.json')) || {};
    const licenseSource = path.join(repoRoot, 'distribution', 'LICENSE.txt');
    fs.copyFileSync(licenseSource, path.join(bundleRoot, 'LICENSE.txt'));

    const dependencies = collectThirdPartyDependencies(repoRoot);
    fs.writeFileSync(
        path.join(bundleRoot, 'THIRD-PARTY-NOTICES.json'),
        `${JSON.stringify({ formatVersion: 1, generatedAt: options.generatedAt, dependencies }, null, 2)}\n`,
    );
    fs.writeFileSync(
        path.join(bundleRoot, 'BUILD-INFO.json'),
        `${JSON.stringify(
            {
                formatVersion: 1,
                product: rootManifest.name || 'box-local-engine',
                version:
                    process.env.BOX_BUILD_VERSION ||
                    rootManifest.version ||
                    options.imageTag ||
                    'unknown',
                release: options.release,
                generatedAt: options.generatedAt,
                buildCreatedAt: process.env.BOX_BUILD_DATE || 'unknown',
                sourceRevision: sourceRevision(repoRoot),
                source: process.env.BOX_BUILD_SOURCE || 'local',
                nodeVersion: process.version,
                platform: options.platform,
                images: options.images,
                ...(options.imageRevisions ? { imageRevisions: options.imageRevisions } : {}),
                ...(options.imageCreatedAt ? { imageCreatedAt: options.imageCreatedAt } : {}),
                checksumAlgorithm: 'SHA-256',
                thirdPartyDependencyCount: dependencies.length,
            },
            null,
            2,
        )}\n`,
    );

    const checksums = listFiles(bundleRoot).map(
        (relative) => `${sha256(path.join(bundleRoot, relative))}  ${relative}`,
    );
    fs.writeFileSync(path.join(bundleRoot, 'SHA256SUMS'), `${checksums.join('\n')}\n`);
    return { dependencyCount: dependencies.length, checksumCount: checksums.length };
}

module.exports = {
    collectThirdPartyDependencies,
    generateDistributionMetadata,
    listFiles,
};
