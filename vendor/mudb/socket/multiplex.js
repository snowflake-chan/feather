"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuMultiSocketServer = void 0;
const socket_1 = require("./socket");
class MuMultiSocketServer {
    state() {
        return this._state;
    }
    constructor(servers) {
        this._state = socket_1.MuSocketServerState.INIT;
        this.clients = [];
        this._numLiveServers = 0;
        this._onclose = () => { };
        this._servers = servers;
    }
    start(spec) {
        this._onclose = spec.close;
        for (let i = 0; i < this._servers.length; ++i) {
            this._servers[i].start({
                ready: () => ++this._numLiveServers,
                connection: spec.connection,
                close: () => --this._numLiveServers,
            });
        }
        const startHandle = setInterval(() => {
            if (this._numLiveServers < this._servers.length) {
                return;
            }
            clearInterval(startHandle);
            this._state = socket_1.MuSocketServerState.RUNNING;
            spec.ready();
        }, 300);
    }
    close() {
        for (let i = 0; i < this._servers.length; ++i) {
            this._servers[i].close();
        }
        const closeHandle = setInterval(() => {
            if (this._numLiveServers > 0) {
                return;
            }
            clearInterval(closeHandle);
            this._state = socket_1.MuSocketServerState.SHUTDOWN;
            this._onclose();
        }, 300);
    }
}
exports.MuMultiSocketServer = MuMultiSocketServer;
//# sourceMappingURL=multiplex.js.map