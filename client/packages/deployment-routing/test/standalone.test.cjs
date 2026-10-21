'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { inject } = require('../src/standalone.cjs');

test('standalone injection resolves the installed package outside the workspace layout', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'box-standalone-'));
    try {
        const file = path.join(root, 'server.cjs');
        fs.writeFileSync(
            file,
            `const nextConfig = {};
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);
console.log(JSON.stringify({ config: nextConfig, peers: JSON.parse(process.env.BOX_PUBLIC_SERVICE_PREFIXES) }));
`,
        );
        inject(file, 'play');
        const env = {
            ...process.env,
            BOX_APP_BASE_PATH: '/abc',
            BOX_PLAY_PUBLIC_URL: 'http://example.test/abc',
            BOX_PUBLIC_SERVICE_PREFIXES_BY_ORIGIN: JSON.stringify({
                'http://example.test': ['/abc', '/creator'],
            }),
        };
        const result = JSON.parse(
            execFileSync(process.execPath, [file], { env, encoding: 'utf8' }),
        );
        assert.deepEqual(result, { config: { assetPrefix: '/abc' }, peers: ['/abc', '/creator'] });
        env.BOX_APP_BASE_PATH = '';
        assert.deepEqual(
            JSON.parse(execFileSync(process.execPath, [file], { env, encoding: 'utf8' })).config,
            {},
        );
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
});

test('unsupported standalone entries are not modified', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'box-standalone-'));
    try {
        const file = path.join(root, 'server.cjs');
        fs.writeFileSync(file, 'unsupported entry');
        assert.throws(() => inject(file, 'play'), /Unsupported Next standalone entry/);
        assert.equal(fs.readFileSync(file, 'utf8'), 'unsupported entry');
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
});
