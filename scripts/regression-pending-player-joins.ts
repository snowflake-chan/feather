import assert from 'assert';

import { PendingPlayerJoins } from '../src/player/pending-player-joins';

const pending = new PendingPlayerJoins();

assert.equal(pending.request('slow-session', false), false);
assert.equal(pending.connectionReady('slow-session'), true);
assert.equal(pending.connectionReady('slow-session'), false);

assert.equal(pending.request('ready-session', true), true);
assert.equal(pending.connectionReady('ready-session'), false);

assert.equal(pending.request('closed-session', false), false);
pending.disconnect('closed-session');
assert.equal(pending.connectionReady('closed-session'), false);

console.log('pending player join regression passed');
