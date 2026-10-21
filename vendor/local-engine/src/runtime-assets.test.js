'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { copyRuntimeData, assertSafeStagingOutput, runtimeBlobHashes } = require('./runtime-assets');

test('generated resources resolve from the ignored build store before source publication', (context) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'box-staged-assets-'));
    context.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const source = path.join(root, 'apps/local-engine/data/blobs');
    const generated = path.join(root, '.local-data/build-assets/blobs');
    const resources = path.join(root, 'apps/game/src/resource');
    for (const directory of [source, generated, resources]) {
        fs.mkdirSync(directory, { recursive: true });
    }
    const parent = `Qm${'a'.repeat(44)}`;
    const child = `Qm${'b'.repeat(44)}`;
    fs.writeFileSync(path.join(resources, 'texture.ts'), `export const texture = '${parent}';`);
    fs.writeFileSync(path.join(generated, parent), JSON.stringify({ child }));
    fs.writeFileSync(path.join(generated, child), 'generated texture');
    assert.deepEqual(
        [...runtimeBlobHashes(root, { blobRoot: generated })].sort(),
        [parent, child].sort(),
    );
    assert.deepEqual(fs.readdirSync(source), []);
    assert.throws(
        () => runtimeBlobHashes(root, { blobRoot: path.dirname(root) }),
        /inside the source tree/,
    );
});

test('runtime staging follows nested resources and excludes local project state', (context) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'box-runtime-assets-'));
    context.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const blobRoot = path.join(root, 'apps/local-engine/data/blobs');
    const resources = path.join(root, 'apps/game/src/resource');
    fs.mkdirSync(blobRoot, { recursive: true });
    fs.mkdirSync(resources, { recursive: true });
    const parent = `Qm${'a'.repeat(44)}`;
    const child = `Qm${'b'.repeat(44)}`;
    const privateBlob = `Qm${'c'.repeat(44)}`;
    fs.writeFileSync(path.join(resources, 'textures.ts'), `export const atlas = '${parent}';`);
    fs.writeFileSync(path.join(blobRoot, parent), JSON.stringify({ texture: child }));
    fs.writeFileSync(path.join(blobRoot, child), Buffer.from([0, 1, 2]));
    fs.writeFileSync(
        path.join(blobRoot, privateBlob),
        JSON.stringify({ owner: 'fixture', users: {} }),
    );
    const output = path.join(root, 'output');
    assert.equal(copyRuntimeData(root, output), 2);
    assert.deepEqual(fs.readdirSync(path.join(output, 'blobs')).sort(), [parent, child].sort());
    assert.deepEqual(
        JSON.parse(fs.readFileSync(path.join(output, 'runtime-blobs.json'))).hashes,
        [parent, child].sort(),
    );
    assert.equal(fs.statSync(path.join(output, 'blobs', child)).mode & 0o777, 0o644);
    fs.unlinkSync(path.join(blobRoot, parent));
    assert.throws(
        () => copyRuntimeData(root, path.join(root, 'missing')),
        /Runtime blob is missing/,
    );
    fs.writeFileSync(path.join(blobRoot, parent), JSON.stringify({ texture: child }));
    fs.unlinkSync(path.join(blobRoot, child));
    assert.throws(
        () => copyRuntimeData(root, path.join(root, 'missing-child')),
        /dependency is missing/,
    );
    const outside = path.join(root, 'private.txt');
    fs.writeFileSync(outside, 'fixture private bytes');
    fs.symlinkSync(outside, path.join(blobRoot, child));
    assert.throws(
        () => copyRuntimeData(root, path.join(root, 'symlink-blob')),
        /must not be a symbolic link/,
    );
    const alias = path.join(root, 'data-alias');
    fs.symlinkSync(path.dirname(blobRoot), alias);
    assert.throws(() => assertSafeStagingOutput(root, alias), /must not overlap/);
    assert.throws(
        () => assertSafeStagingOutput(root, path.join(alias, 'child')),
        /must not overlap/,
    );
    assert.ok(fs.existsSync(blobRoot), 'validation never removes the original blob directory');
    fs.writeFileSync(
        path.join(resources, 'textures.ts'),
        `export const atlas = '${'d'.repeat(43)}';`,
    );
    assert.throws(
        () => copyRuntimeData(root, path.join(root, 'missing-url-safe')),
        /Runtime blob is missing/,
    );
});
