// feather-shell 的 worker 入口（非侵入：不 import/modify src/shell 的任何逻辑）
'use strict';
process.stderr.write('[worker-entry] boot\n');
const path = require('path');
const { parentPort } = require('worker_threads');
const { randomUUID } = require('crypto');
const { NodeWorkerSocket } = require('../worker-poc/adapter');

if (!parentPort) {
  throw new Error('worker-entry must run inside worker_threads');
}

const socket = new NodeWorkerSocket(randomUUID(), parentPort);

const sysLog = (level, object, message, ...args) => {
  const parts = [];
  if (object !== undefined) {
    parts.push(object instanceof Error ? object.stack || object.message : String(object));
  }
  if (message !== undefined) parts.push(String(message));
  for (const a of args) parts.push(String(a));
  process.stderr.write(`[shell:${level}] ${parts.join(' ')}\n`);
};

const { ScriptShell } = require(path.resolve(__dirname, '../../dist/script/script-shell'));

new ScriptShell(socket, false, sysLog);
process.stderr.write('[worker-entry] ScriptShell constructed\n');
