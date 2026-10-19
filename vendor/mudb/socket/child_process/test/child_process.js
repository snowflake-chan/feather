"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../../../server");
const server_2 = require("../server");
module.exports = () => {
    const socketServer = new server_2.MuChildProcessSocketServer();
    const muServer = new server_1.MuServer(socketServer);
    muServer.start();
};
//# sourceMappingURL=child_process.js.map