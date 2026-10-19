"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRPCClient = void 0;
const protocol_1 = require("./protocol");
const logger_1 = require("../logger");
class MuRPCClient {
    _createRPC(method) {
        return (arg) => {
            const rpc = this.schemas.argSchema.alloc();
            rpc.type = method;
            rpc.data = arg;
            return this.transport
                .send(this.schemas, rpc)
                .then(this._handleResponse, (reason) => {
                this.logger.exception(reason);
            });
        };
    }
    constructor(protocol, transport, logger) {
        this._handleResponse = (response) => {
            const { type, data } = response;
            response.type = 'error';
            response.data = '';
            this.schemas.responseSchema.free(response);
            if (type === 'success') {
                return data.data;
            }
            else {
                throw data;
            }
        };
        this.schemas = new protocol_1.MuRPCSchemas(protocol);
        this.transport = transport;
        this.logger = logger || logger_1.MuDefaultLogger;
        const api = (this.api = {});
        const methods = Object.keys(protocol.api);
        for (let i = 0; i < methods.length; ++i) {
            const method = methods[i];
            api[method] = this._createRPC(method);
        }
    }
}
exports.MuRPCClient = MuRPCClient;
//# sourceMappingURL=client.js.map