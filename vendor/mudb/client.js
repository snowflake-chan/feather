"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuClient = exports.MuClientProtocol = exports.MuClientProtocolSpec = exports.MuRemoteServer = void 0;
const protocol_1 = require("./protocol");
const logger_1 = require("./logger");
const noop = function () { };
class MuRemoteServer {
    constructor() {
        this.message = {};
        this.sendRaw = noop;
    }
}
exports.MuRemoteServer = MuRemoteServer;
class MuClientProtocolSpec {
    constructor() {
        this.messageHandlers = {};
        this.rawHandler = noop;
        this.readyHandler = noop;
        this.closeHandler = noop;
    }
}
exports.MuClientProtocolSpec = MuClientProtocolSpec;
class MuClientProtocol {
    constructor(schema, client, protocolSpec) {
        this.configured = false;
        this.schema = schema;
        this.client = client;
        this.server = new MuRemoteServer();
        this._protocolSpec = protocolSpec;
    }
    configure(spec) {
        if (this.configured) {
            throw new Error('mudb: protocol has been configured');
        }
        this.configured = true;
        this._protocolSpec.messageHandlers = spec.message;
        this._protocolSpec.rawHandler = spec.raw || noop;
        this._protocolSpec.readyHandler = spec.ready || noop;
        this._protocolSpec.closeHandler = spec.close || noop;
    }
}
exports.MuClientProtocol = MuClientProtocol;
class MuClient {
    constructor(socket, logger, skipProtocolValidation) {
        this.protocols = [];
        this._protocolSpecs = [];
        this.running = false;
        this._started = false;
        this._closed = false;
        this.bandwidth = [];
        this._socket = socket;
        this.sessionId = socket.sessionId;
        this.logger = logger || logger_1.MuDefaultLogger;
        this._shouldValidateProtocol = !skipProtocolValidation;
    }
    start(spec_) {
        if (this._started || this._closed) {
            throw new Error('mudb: client has been started');
        }
        this._started = true;
        const clientSchemas = this.protocols.map((p) => p.schema.client);
        const clientFactory = new protocol_1.MuProtocolFactory(clientSchemas);
        const serverSchemas = this.protocols.map((p) => p.schema.server);
        const serverFactory = new protocol_1.MuProtocolFactory(serverSchemas);
        const spec = spec_ || {};
        const checkProtocolConsistency = (packet) => {
            try {
                const data = JSON.parse(packet);
                if (data.clientJsonStr !== clientFactory.jsonStr ||
                    data.serverJsonStr !== serverFactory.jsonStr) {
                    this.logger.error('protocol mismatch');
                    this._socket.close();
                }
            }
            catch (e) {
                this.logger.exception(e);
                this._socket.close();
            }
        };
        const parser = clientFactory.createParser(this._protocolSpecs, this.logger, this.bandwidth, this.sessionId);
        let validationPacket = this._shouldValidateProtocol;
        this._socket.open({
            ready: () => {
                this.running = true;
                if (this._shouldValidateProtocol) {
                    this._socket.send(JSON.stringify({
                        clientJsonStr: clientFactory.jsonStr,
                        serverJsonStr: serverFactory.jsonStr,
                    }));
                }
                serverFactory.protocolFactories.forEach((factory, protocolId) => {
                    this.bandwidth[protocolId] = {
                        [this.sessionId]: {
                            sent: {
                                raw: {
                                    count: 0,
                                    bytes: 0,
                                },
                            },
                            received: {
                                raw: {
                                    count: 0,
                                    bytes: 0,
                                },
                            },
                        },
                    };
                    const protocol = this.protocols[protocolId];
                    protocol.server.message = factory.createDispatch([this._socket], this.bandwidth[protocolId]);
                    protocol.server.sendRaw = factory.createSendRaw([this._socket], this.bandwidth[protocolId]);
                });
                this._protocolSpecs.forEach((protoSpec) => {
                    protoSpec.readyHandler();
                });
                if (spec.ready) {
                    try {
                        spec.ready();
                    }
                    catch (e) {
                        this.logger.exception(e);
                    }
                }
            },
            message: (data, unreliable) => {
                if (!validationPacket) {
                    try {
                        parser(data, unreliable);
                    }
                    catch (e) {
                        this.logger.exception(e);
                    }
                }
                else {
                    checkProtocolConsistency(data);
                    validationPacket = false;
                }
            },
            close: (error) => {
                this.running = false;
                this._closed = true;
                this._protocolSpecs.forEach((protoSpec) => protoSpec.closeHandler());
                if (spec.close) {
                    try {
                        spec.close(error);
                    }
                    catch (e) {
                        this.logger.exception(e);
                    }
                }
            },
        });
    }
    destroy() {
        if (!this.running) {
            throw new Error('mudb: client is not running');
        }
        this._socket.close();
        this._protocolSpecs.length = 0;
        this.protocols.length = 0;
    }
    protocol(schema) {
        if (this._started || this._closed) {
            throw new Error('mudb: attempt to register protocol after client has been started');
        }
        this.logger.log(`register ${schema.name} protocol`);
        const spec = new MuClientProtocolSpec();
        const p = new MuClientProtocol(schema, this, spec);
        this.protocols.push(p);
        this._protocolSpecs.push(spec);
        return p;
    }
}
exports.MuClient = MuClient;
//# sourceMappingURL=client.js.map