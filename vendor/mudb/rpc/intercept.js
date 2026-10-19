"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRPCIntercept = void 0;
const client_1 = require("./client");
const server_1 = require("./server");
class MuRPCIntercept {
    constructor(spec) {
        this.protocol = spec.protocol;
        this.logger = spec.logger;
        this._transport = spec.server;
        this.remote = new client_1.MuRPCClient(spec.protocol, spec.client, spec.logger);
        this.schemas = this.remote.schemas;
    }
    configure(spec) {
        const handlers = {};
        const methods = Object.keys(this.protocol.api);
        for (let i = 0; i < methods.length; ++i) {
            if (methods[i] in spec.handlers) {
                handlers[methods[i]] = spec.handlers[methods[i]];
            }
            else {
                handlers[methods[i]] = (conn, arg) => this.remote.api[methods[i]](arg);
            }
        }
        this._server = new server_1.MuRPCServer({
            protocol: this.protocol,
            transport: this._transport,
            authorize: spec.authorize || (() => Promise.resolve(true)),
            handlers,
            logger: this.logger,
        });
    }
}
exports.MuRPCIntercept = MuRPCIntercept;
//# sourceMappingURL=intercept.js.map