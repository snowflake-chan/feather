'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('node:http');
const { imageRequest } = require('@box/deployment-routing/server');

test('image optimizer fetches its own prefixed source through an internal path', () => {
    const request =
        '/_next/image?url=%2Fwoooow%2Fruntime%2Fedit%2Fproject-one%2Fblock%2Fhash.png&w=48&q=75';
    const result = new URL(imageRequest(request, { basePath: '/woooow' }), 'http://engine.test');
    assert.equal(result.searchParams.get('url'), '/runtime/edit/project-one/block/hash.png');
    assert.equal(result.searchParams.get('w'), '48');
    assert.equal(result.searchParams.get('q'), '75');
});

test('normalizes optimizer sources before the HTTP request handler runs', async () => {
    const previous = process.env.BOX_APP_BASE_PATH;
    process.env.BOX_APP_BASE_PATH = '/woooow';
    require('@box/deployment-routing/server').install();
    const server = http.createServer((request, response) => response.end(request.url));
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
        const response = await fetch(
            `http://127.0.0.1:${server.address().port}/_next/image?url=%2Fwoooow%2Fimage.png&w=48&q=75`,
        );
        const result = new URL(await response.text(), 'http://box.internal');
        assert.equal(result.searchParams.get('url'), '/image.png');
    } finally {
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
        if (previous === undefined) {
            delete process.env.BOX_APP_BASE_PATH;
        } else {
            process.env.BOX_APP_BASE_PATH = previous;
        }
    }
});

test('independent addresses, other services and external image sources remain unchanged', () => {
    for (const source of [
        '/runtime/edit/project-one/block/hash.png',
        '/abc/image.png',
        '/woooow-other/image.png',
        'https://cdn.test/image.png',
    ]) {
        const request = '/_next/image?' + new URLSearchParams({ url: source, w: '48', q: '75' });
        assert.equal(imageRequest(request, { basePath: '/woooow' }), request);
        assert.equal(imageRequest(request, { basePath: '' }), request);
    }
    const ordinary = '/api/test?url=%2Fwoooow%2Fimage.png';
    assert.equal(imageRequest(ordinary, { basePath: '/woooow' }), ordinary);
    const duplicate = '/_next/image?url=%2Fwoooow%2Fa.png&url=%2Fwoooow%2Fb.png&w=48&q=75';
    assert.equal(imageRequest(duplicate, { basePath: '/woooow' }), duplicate);
});
