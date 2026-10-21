'use strict';

const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(packageRoot, '../..');
const blobRoot = path.join(packageRoot, 'data/blobs');
const manifestPath = path.join(repoRoot, 'services/game-server/src/player/default-avatar.json');

const bodyParts = {
    1: 'head',
    2: 'hips',
    3: 'leftFoot',
    4: 'leftHand',
    5: 'leftLowerArm',
    6: 'leftLowerLeg',
    7: 'leftShoulder',
    8: 'leftUpperArm',
    9: 'leftUpperLeg',
    10: 'neck',
    11: 'rightFoot',
    12: 'rightHand',
    13: 'rightLowerArm',
    14: 'rightLowerLeg',
    15: 'rightShoulder',
    16: 'rightUpperArm',
    17: 'rightUpperLeg',
    18: 'torso',
};

async function main() {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const parts = manifest.parts || {};
    const expected = Object.values(bodyParts);
    const missing = expected.filter((part) => {
        const hash = parts[part];
        const file = hash && path.join(blobRoot, hash);
        return !hash || !fs.existsSync(file) || fs.statSync(file).size === 0;
    });
    if (missing.length) {
        throw new Error(`Default avatar resources are missing locally: ${missing.join(', ')}`);
    }
    console.log(`Default avatar is ready offline (${expected.length} body parts checked)`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
