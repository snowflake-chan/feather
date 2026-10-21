'use strict';

const crypto = require('crypto');

const mapIdentityPattern = /^[0-9a-f]{20}$/;

function normalizeMapIdentity(value) {
    const identity = String(value || '')
        .trim()
        .toLowerCase();
    return mapIdentityPattern.test(identity) ? identity : '';
}

function createMapIdentity() {
    return crypto.randomBytes(10).toString('hex');
}

module.exports = {
    createMapIdentity,
    mapIdentityPattern,
    normalizeMapIdentity,
};
