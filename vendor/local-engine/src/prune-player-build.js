'use strict';

const fs = require('fs');
const path = require('path');

const removedPageRoutes = new Set([
    '/projects',
    '/api/local-projects',
    '/api/local-projects/[id]',
    '/api/local-projects/[id]/export',
    '/api/local-projects/[id]/package',
    '/api/local-projects/[id]/publish',
    '/api/local-projects/[id]/runtime',
    '/api/local-projects/import',
]);
const removedAppRoutes = new Set(['/e/[container]/page']);
const playerServiceRoutes = new Set([
    '/',
    '/404',
    '/_app',
    '/_document',
    '/_error',
    '/players',
    '/api/config/[...slug]',
    '/api/health-check',
    '/api/realtime/session',
    '/api/player-auth/login',
    '/api/player-auth/logout',
    '/api/player-auth/login-required',
    '/api/player-auth/register',
    '/api/player-auth/session',
    '/api/player-auth/profile',
    '/api/player-auth/password',
    '/api/player-auth/transfer',
    '/api/player-internal/login-transfer',
    '/api/player-internal/map-library',
    '/api/player-internal/logout',
    '/api/player-internal/profile',
    '/api/player-internal/revocations',
    '/api/player-internal/runtime-identity',
    '/api/player-internal/script-moderation',
    '/api/player-internal/script-metadata',
    '/api/player-internal/map-admission',
    '/api/play-admin/script-moderation',
    '/api/play-admin/activity',
    '/api/play-admin/containers',
    '/api/play-admin/containers/[permanentMapId]',
    '/api/play-admin/container-resource-groups',
    '/api/play-admin/container-resource-groups/[id]',
    '/api/play-admin/admins',
    '/api/play-admin/admins/[id]',
    '/api/play-admin/identity-bans',
    '/api/play-admin/import',
    '/api/play-admin/import-resource',
    '/api/play-admin/library/[section]/[[...id]]',
    '/api/play-admin/library/import',
    '/api/play-admin/login',
    '/api/play-admin/logout',
    '/api/play-admin/maintenance',
    '/api/play-admin/owner-session',
    '/api/play-admin/permission-groups',
    '/api/play-admin/permission-groups/[id]',
    '/api/play-admin/players',
    '/api/play-admin/players/[subjectId]',
    '/api/play-admin/players/batch',
    '/api/play-admin/players/export',
    '/api/play-admin/players/overview',
    '/api/play-admin/self-password',
    '/api/play-admin/verify',
]);

function readJSON(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, value) {
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function updateObjectManifest(filePath, removedRoutes) {
    if (!fs.existsSync(filePath)) {
        return;
    }
    const manifest = readJSON(filePath);
    for (const route of removedRoutes) {
        delete manifest[route];
    }
    writeJSON(filePath, manifest);
}

function pruneRoutesManifest(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }
    const manifest = readJSON(filePath);
    const shouldKeep = ({ page }) =>
        !removedPageRoutes.has(page) &&
        page !== '/e/[container]' &&
        !page.startsWith('/api/local-projects/');
    manifest.dynamicRoutes = (manifest.dynamicRoutes || []).filter(shouldKeep);
    manifest.staticRoutes = (manifest.staticRoutes || []).filter(shouldKeep);
    manifest.dataRoutes = (manifest.dataRoutes || []).filter(shouldKeep);
    writeJSON(filePath, manifest);
}

function pruneBuildManifest(filePath, removedRoutes) {
    if (!fs.existsSync(filePath)) {
        return;
    }
    const manifest = readJSON(filePath);
    for (const route of removedRoutes) {
        delete manifest.pages?.[route];
    }
    writeJSON(filePath, manifest);
}

function prunePlayerBuild(nextRoot) {
    if (!fs.existsSync(nextRoot)) {
        return;
    }

    const removablePaths = [
        path.join(nextRoot, 'server/pages/projects.js'),
        path.join(nextRoot, 'server/pages/projects.js.nft.json'),
        path.join(nextRoot, 'server/pages/api/local-projects'),
        path.join(nextRoot, 'server/pages/api/local-projects.js'),
        path.join(nextRoot, 'server/pages/api/local-projects.js.nft.json'),
        path.join(nextRoot, 'server/app/e'),
        path.join(nextRoot, 'static/chunks/app/e'),
        path.join(nextRoot, 'static/css/app/e'),
    ];

    for (const target of removablePaths) {
        fs.rmSync(target, { recursive: true, force: true });
    }

    const pageChunksRoot = path.join(nextRoot, 'static/chunks/pages');
    if (fs.existsSync(pageChunksRoot)) {
        for (const name of fs.readdirSync(pageChunksRoot)) {
            if (name.startsWith('projects-')) {
                fs.rmSync(path.join(pageChunksRoot, name), { force: true });
            }
        }
    }

    updateObjectManifest(path.join(nextRoot, 'server/pages-manifest.json'), removedPageRoutes);
    updateObjectManifest(path.join(nextRoot, 'server/app-paths-manifest.json'), removedAppRoutes);
    pruneRoutesManifest(path.join(nextRoot, 'routes-manifest.json'));
    pruneBuildManifest(path.join(nextRoot, 'app-build-manifest.json'), removedAppRoutes);
}

function prunePlayerServiceBuild(nextRoot) {
    if (!fs.existsSync(nextRoot)) {
        return;
    }
    const pagesManifestPath = path.join(nextRoot, 'server/pages-manifest.json');
    if (!fs.existsSync(pagesManifestPath)) {
        return;
    }
    const pagesManifest = readJSON(pagesManifestPath);
    for (const [route, relative] of Object.entries(pagesManifest)) {
        if (playerServiceRoutes.has(route)) {
            continue;
        }
        const compiled = path.join(nextRoot, 'server', relative);
        fs.rmSync(compiled, { recursive: true, force: true });
        fs.rmSync(`${compiled}.nft.json`, { force: true });
        delete pagesManifest[route];
    }
    writeJSON(pagesManifestPath, pagesManifest);

    pruneRoutesManifestToSet(path.join(nextRoot, 'routes-manifest.json'), playerServiceRoutes);
    pruneBuildManifestToSet(path.join(nextRoot, 'build-manifest.json'), playerServiceRoutes);

    // Player Service has no App Router page. Removing the editor App bundle
    // keeps engine/editor code out of the independently distributed image.
    fs.rmSync(path.join(nextRoot, 'server/app'), { recursive: true, force: true });
    fs.rmSync(path.join(nextRoot, 'static/chunks/app'), { recursive: true, force: true });
    fs.rmSync(path.join(nextRoot, 'static/css/app'), { recursive: true, force: true });
    const appPaths = path.join(nextRoot, 'server/app-paths-manifest.json');
    if (fs.existsSync(appPaths)) {
        writeJSON(appPaths, {});
    }
}

function pruneRoutesManifestToSet(filePath, allowedRoutes) {
    if (!fs.existsSync(filePath)) {
        return;
    }
    const manifest = readJSON(filePath);
    const keep = ({ page }) => allowedRoutes.has(page);
    manifest.dynamicRoutes = (manifest.dynamicRoutes || []).filter(keep);
    manifest.staticRoutes = (manifest.staticRoutes || []).filter(keep);
    manifest.dataRoutes = (manifest.dataRoutes || []).filter(keep);
    writeJSON(filePath, manifest);
}

function pruneBuildManifestToSet(filePath, allowedRoutes) {
    if (!fs.existsSync(filePath) || !filePath.endsWith('.json')) {
        return;
    }
    const manifest = readJSON(filePath);
    for (const route of Object.keys(manifest.pages || {})) {
        if (!allowedRoutes.has(route)) {
            delete manifest.pages[route];
        }
    }
    writeJSON(filePath, manifest);
}

module.exports = { prunePlayerBuild, prunePlayerServiceBuild, playerServiceRoutes };

if (require.main === module) {
    const roots = process.argv.slice(2);
    if (roots.length === 0) {
        throw new Error('Usage: node prune-player-build.js <next-root> [...]');
    }
    const playerService = roots[0] === '--player-service';
    for (const root of playerService ? roots.slice(1) : roots) {
        const resolved = path.resolve(root);
        if (playerService) {
            prunePlayerServiceBuild(resolved);
        } else {
            prunePlayerBuild(resolved);
        }
    }
}
