'use strict';

const assert = require('assert');
const { resolveBuildMetadata } = require('./build-metadata');

const generated = resolveBuildMetadata({
    env: {},
    version: '1.2.3',
    revision: 'abc123',
    now: new Date('2026-08-15T00:00:00.000Z'),
});

assert.deepStrictEqual(generated, {
    BOX_BUILD_VERSION: '1.2.3',
    BOX_BUILD_COMMIT: 'abc123',
    BOX_BUILD_DATE: '2026-08-15T00:00:00.000Z',
    BOX_BUILD_SOURCE: 'local',
});

const explicit = resolveBuildMetadata({
    env: {
        BOX_BUILD_VERSION: '9.9.9',
        BOX_BUILD_COMMIT: 'release-commit',
        BOX_BUILD_DATE: '2026-08-14T12:00:00.000Z',
        BOX_BUILD_SOURCE: 'release-pipeline',
        BOX_DATABASE_URL: 'postgresql://secret:secret@example.invalid/database',
    },
    version: '1.2.3',
    revision: 'abc123',
    now: new Date('2026-08-15T00:00:00.000Z'),
});

assert.deepStrictEqual(explicit, {
    BOX_BUILD_VERSION: '9.9.9',
    BOX_BUILD_COMMIT: 'release-commit',
    BOX_BUILD_DATE: '2026-08-14T12:00:00.000Z',
    BOX_BUILD_SOURCE: 'release-pipeline',
});
assert(!JSON.stringify(explicit).includes('secret'));

console.log('build metadata regression passed');
