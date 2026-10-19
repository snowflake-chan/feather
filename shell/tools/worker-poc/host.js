// 假 engine：用 shell 自己的 ScriptProtocol 起一个 MuServer，等 shell 连上来
'use strict';
const path = require('path');
const { MuServer } = require('@box/mudb/server');
const { ScriptProtocol } = require(path.resolve(__dirname, '../../dist/script/script-protocol'));
const { NodeWorkerSocketServer } = require('./adapter');

function createHarness() {
  const socketServer = new NodeWorkerSocketServer();
  const muServer = new MuServer(socketServer, undefined, true);
  const protocol = muServer.protocol(ScriptProtocol);

  let resolvePump;
  let rejectPump;
  const pumped = new Promise((resolve, reject) => {
    resolvePump = resolve;
    rejectPump = reject;
  });

  let connected = false;
  const noop = () => {};

  // ScriptProtocol.server 是 shell -> engine 的消息集；全部接住，避免未处理消息抛错
  const message = {};
  for (const name of Object.keys(ScriptProtocol.server)) {
    message[name] = (client, data) => {
      if (name === 'pump') {
        resolvePump(true);
        return;
      }
      if (process.env.POC_VERBOSE) {
        console.error('[engine<-shell]', name, summarize(data));
      }
    };
  }

  protocol.configure({
    message,
    connect: (client) => {
      connected = true;
      console.error('[engine] shell connected:', client.sessionId);
      // engine -> shell：poll 会触发 shell 的 _poll，随后 shell 回一条 pump
      client.message.poll();
    },
    disconnect: () => {
      console.error('[engine] shell disconnected');
    },
  });

  const started = new Promise((resolve, reject) => {
    muServer.start({
      ready: resolve,
      close: (err) => reject(err || new Error('muServer closed')),
    });
  });

  return { socketServer, muServer, protocol, started, pumped, isConnected: () => connected };
}

function summarize(data) {
  if (data === undefined || data === null) return String(data);
  if (typeof data !== 'object') return String(data);
  if (ArrayBuffer.isView(data)) return `<${data.constructor.name} ${data.length}>`;
  try {
    return JSON.stringify(data).slice(0, 160);
  } catch (e) {
    return Object.prototype.toString.call(data);
  }
}

module.exports = { createHarness };
