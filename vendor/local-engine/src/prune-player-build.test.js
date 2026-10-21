const test = require('node:test');
const assert = require('node:assert/strict');

const { playerServiceRoutes, prunePlayerServiceBuild } = require('./prune-player-build');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('keeps Player Admin routes that are called by the standalone management UI', () => {
    assert.equal(playerServiceRoutes.has('/api/realtime/session'), true);
    assert.equal(playerServiceRoutes.has('/api/play-admin/identity-bans'), true);
    assert.equal(playerServiceRoutes.has('/api/play-admin/self-password'), true);
    assert.equal(playerServiceRoutes.has('/api/play-admin/library/[section]/[[...id]]'), true);
    assert.equal(playerServiceRoutes.has('/api/play-admin/library/import'), true);
    assert.equal(playerServiceRoutes.has('/api/play-admin/worlds'), false);
    assert.equal(playerServiceRoutes.has('/api/play-admin/worlds/[id]'), false);
    assert.equal(playerServiceRoutes.has('/api/play-admin/worlds/status'), false);
});

test('packaging preserves compiled self-service APIs and their routing manifests while removing editor routes', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'box-self-service-prune-'));
    const routes = [
        '/api/player-auth/profile',
        '/api/player-auth/password',
        '/api/realtime/session',
        '/api/player-auth/transfer',
        '/api/player-internal/login-transfer',
        '/projects',
    ];
    const pages = Object.fromEntries(routes.map((route) => [route, `pages${route}.js`]));
    const write = (file, value) => {
        fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        fs.writeFileSync(path.join(root, file), JSON.stringify(value));
    };
    const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    try {
        for (const file of Object.values(pages)) {
            write(`server/${file}`, 'compiled fixture');
        }
        write('server/pages-manifest.json', pages);
        write('routes-manifest.json', { staticRoutes: routes.map((page) => ({ page })) });
        write('build-manifest.json', {
            pages: Object.fromEntries(routes.map((route) => [route, ['bundle.js']])),
        });
        prunePlayerServiceBuild(root);
        const kept = routes.filter((route) => route !== '/projects');
        assert.deepEqual(Object.keys(read('server/pages-manifest.json')), kept);
        assert.deepEqual(
            read('routes-manifest.json').staticRoutes.map((route) => route.page),
            kept,
        );
        assert.deepEqual(Object.keys(read('build-manifest.json').pages), kept);
        for (const route of kept) {
            assert.ok(fs.existsSync(path.join(root, 'server', pages[route])));
        }
        assert.equal(fs.existsSync(path.join(root, 'server', pages['/projects'])), false);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
});
