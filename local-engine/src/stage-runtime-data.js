'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { copyRuntimeData, assertSafeStagingOutput } = require('./runtime-assets');

const repoRoot = path.resolve(__dirname, '../../..');
if (!process.argv[2]) {
    throw new Error('Usage: node stage-runtime-data.js <output-directory>');
}
const outputRoot = path.resolve(process.argv[2]);
assertSafeStagingOutput(repoRoot, outputRoot);
fs.rmSync(outputRoot, { recursive: true, force: true });
const count = copyRuntimeData(repoRoot, outputRoot);
console.log(`Staged ${count} referenced runtime blobs in ${outputRoot}`);
