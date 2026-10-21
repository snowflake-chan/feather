"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../../server");
const server_2 = require("../../../../server");
module.exports = () => {
    const socketServer = (0, server_1.createWorkerSocketServer)();
    const muServer = new server_2.MuServer(socketServer);
    socketServer.listen();
    muServer.start();
};
//# sourceMappingURL=worker.js.map