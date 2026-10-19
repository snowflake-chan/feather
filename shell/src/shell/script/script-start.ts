// start point for all client scripts
const SHELL = require('./script-shell');
module.exports = function (socket, unsafeExec) {
  const s = new SHELL.ScriptShell(socket, !!unsafeExec);
};
