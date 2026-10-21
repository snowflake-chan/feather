'use strict';
const { spawn } = require('node:child_process');
const { createModerationCredential } = require('./moderation-credential');
const credential = createModerationCredential(
    process.env,
    process.env.BOX_MODERATION_SIGNING_SECRET || '',
);
const child = spawn(
    process.execPath,
    [...process.execArgv, '/app/services/game-server/dist/src/launch.js', '--useProdBundle'],
    { stdio: 'inherit', env: credential.env },
);
for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => child.kill(signal));
}
child.once('error', () => {
    credential.close();
    process.exit(1);
});
child.once('exit', (code) => {
    credential.close();
    process.exit(code ?? 1);
});
process.once('exit', credential.close);
