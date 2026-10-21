'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { startPlayLibrary } = require('./play-library');

test('manifest resources remain downloadable when an isolated runtime has a separate store', async (context) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'box-derived-route-'));
    context.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const libraryRoot = path.join(root, 'worlds');
    const data = path.join(libraryRoot, 'map-one', 'data');
    const runtimeCacheRoot = path.join(root, 'cache');
    const permanentMapId = 'permanent-map-one';
    const digest = crypto
        .createHash('sha256')
        .update(`play\0${permanentMapId}`)
        .digest('hex')
        .slice(0, 32);
    const blobs = path.join(runtimeCacheRoot, 'play', digest, 'blobs');
    fs.mkdirSync(path.join(data, 'blobs'), { recursive: true });
    fs.mkdirSync(blobs, { recursive: true });
    fs.writeFileSync(
        path.join(libraryRoot, 'map-one', 'manifest.json'),
        JSON.stringify({
            id: 'map-one',
            permanentMapId,
            publicId: 'public-map',
            version: '1',
            permissionHash: 'permission',
        }),
    );
    fs.writeFileSync(
        path.join(data, 'project-state.json'),
        JSON.stringify({ permissionHash: 'permission' }),
    );
    const body = Buffer.from('public generated resource');
    const hash = crypto.createHash('sha256').update(body).digest('base64url');
    const privateBody = Buffer.from('private script');
    const privateHash = crypto.createHash('sha256').update(privateBody).digest('base64url');
    fs.writeFileSync(path.join(blobs, hash), body);
    fs.writeFileSync(path.join(blobs, privateHash), privateBody);
    fs.writeFileSync(
        path.join(data, 'private-blobs.json'),
        JSON.stringify({ hashes: [privateHash] }),
    );
    const upstream = http.createServer((_request, response) => {
        response.writeHead(404);
        response.end();
    });
    await new Promise((resolve) => upstream.listen(0, '127.0.0.1', resolve));
    context.after(() => new Promise((resolve) => upstream.close(resolve)));
    let starts = 0;
    const library = startPlayLibrary({
        libraryRoot,
        runtimeCacheRoot,
        host: '127.0.0.1',
        port: 0,
        startRuntime: async () => {
            starts += 1;
            return { port: upstream.address().port, stop: async () => {} };
        },
        waitForRuntime: async () => {},
    });
    await library.ready;
    context.after(() => library.stop());
    const base = `http://127.0.0.1:${library.server.address().port}/public-map`;
    const response = await fetch(`${base}/block/${hash}`);
    assert.equal(response.status, 200);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), body);
    assert.equal(starts, 0, 'reading an immutable cache must not require the map container');
    const cid = 'QmXaQXQLV28MgoBDsoNkKMxkYbKkFXLSKriLwxubYaX1q2';
    fs.writeFileSync(path.join(blobs, cid), body);
    const cidResponse = await fetch(`${base}/block/${cid}`);
    assert.equal(cidResponse.status, 200);
    assert.deepEqual(Buffer.from(await cidResponse.arrayBuffer()), body);
    assert.equal(starts, 0);
    assert.equal((await fetch(`${base}/block/${privateHash}`)).status, 404);
    fs.writeFileSync(path.join(blobs, hash), 'corrupt bytes');
    assert.equal((await fetch(`${base}/block/${hash}`)).status, 404);
    assert.equal((await fetch(`${base}/engine/s/${privateHash}`)).status, 404);
    fs.unlinkSync(path.join(blobs, hash));
    fs.symlinkSync(path.join(blobs, privateHash), path.join(blobs, hash));
    assert.equal((await fetch(`${base}/block/${hash}`)).status, 404);
});
