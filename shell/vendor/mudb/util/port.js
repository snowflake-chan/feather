"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPort = findPort;
exports.findPortAsync = findPortAsync;
const tcp = require("net");
function findPort(cb) {
    const server = tcp.createServer();
    server.on('error', (e) => console.error(e));
    server.unref();
    server.listen(() => {
        const addr = server.address();
        if (typeof addr === 'string') {
            server.close(() => cb(+addr));
        }
        else {
            const port = addr.port;
            server.close(() => cb(port));
        }
    });
}
function findPortAsync() {
    return new Promise((resolve) => {
        findPort(resolve);
    });
}
//# sourceMappingURL=port.js.map