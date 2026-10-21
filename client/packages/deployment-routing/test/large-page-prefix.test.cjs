'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('node:http');
const routing = require('../src/server.cjs');

test('prefixed map libraries larger than 8 MiB render without closing the connection', async () => {
    const previous = process.env.BOX_APP_BASE_PATH;
    process.env.BOX_APP_BASE_PATH = '/play';
    routing.install();
    const source =
        '<html><head></head><body><img src="/cover.png"><script type="application/json">"' +
        'a'.repeat(9 * 1024 * 1024) +
        '"</script></body></html>';
    let acceptedEncoding;
    const server = http.createServer((request, response) => {
        acceptedEncoding = request.headers['accept-encoding'];
        response.setHeader('Content-Type', 'text/html');
        response.end(source);
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
        const body = await response.text();
        assert.equal(response.status, 200);
        assert.match(body, /src="\/play\/cover.png"/);
        assert.ok(body.includes('a'.repeat(9 * 1024 * 1024)));
        assert.equal(acceptedEncoding, 'identity');
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
