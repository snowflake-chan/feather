"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuServer = exports.MuServerProtocol = exports.MuServerProtocolSpec = exports.MuRemoteClient = void 0;
const protocol_1 = require("./protocol");
const logger_1 = require("./logger");
class MuRemoteClient {
    constructor(socket, message, sendRaw) {
        this._socket = socket;
        this.sessionId = socket.sessionId;
        this.message = message;
        this.sendRaw = sendRaw;
    }
    close() {
        this._socket.close();
    }
}
exports.MuRemoteClient = MuRemoteClient;
const noop = function () { };
class MuServerProtocolSpec {
    constructor() {
        this.messageHandlers = {};
        this.readyHandler = noop;
        this.connectHandler = noop;
        this.rawHandler = noop;
        this.disconnectHandler = noop;
        this.closeHandler = noop;
    }
}
exports.MuServerProtocolSpec = MuServerProtocolSpec;
class MuServerProtocol {
    constructor(schema, server, protocolSpec) {
        this.clients = {};
        this.broadcast = {};
        this.broadcastRaw = noop;
        this.configured = false;
        this.schema = schema;
        this.server = server;
        this._protocolSpec = protocolSpec;
    }
    configure(spec) {
        if (this.configured) {
            throw new Error('mudb: protocol has been configured');
        }
        this.configured = true;
        this._protocolSpec.messageHandlers = spec.message;
        this._protocolSpec.readyHandler = spec.ready || noop;
        this._protocolSpec.connectHandler = spec.connect || noop;
        this._protocolSpec.rawHandler = spec.raw || noop;
        this._protocolSpec.disconnectHandler = spec.disconnect || noop;
        this._protocolSpec.closeHandler = spec.close || noop;
    }
}
exports.MuServerProtocol = MuServerProtocol;
class MuServer {
    constructor(socketServer, logger, skipProtocolValidation) {
        this.protocols = [];
        this._protocolSpecs = [];
        this.running = false;
        this._started = false;
        this._closed = false;
        this.bandwidth = [];
        this._socketServer = socketServer;
        this.logger = logger || logger_1.MuDefaultLogger;
        this._shouldValidateProtocol = !skipProtocolValidation;
    }
    start(spec) {
        if (this._started || this._closed) {
            throw new Error('mudb: server has been started');
        }
        this._started = true;
        const clientSchemas = this.protocols.map((p) => p.schema.client);
        const clientFactory = new protocol_1.MuProtocolFactory(clientSchemas);
        const serverSchemas = this.protocols.map((p) => p.schema.server);
        const serverFactory = new protocol_1.MuProtocolFactory(serverSchemas);
        const sockets = [];
        this._socketServer.start({
            ready: () => {
                this.running = true;
                this.protocols.forEach((protocol, pid) => {
                    this.bandwidth[pid] = {};
                    protocol.broadcast = clientFactory.protocolFactories[pid].createDispatch(sockets, this.bandwidth[pid]);
                    protocol.broadcastRaw = clientFactory.protocolFactories[pid].createSendRaw(sockets, this.bandwidth[pid]);
                });
                this._protocolSpecs.forEach((protocolSpec) => {
                    protocolSpec.readyHandler();
                });
                if (spec && spec.ready) {
                    spec.ready();
                }
            },
            close: (error) => {
                if (spec && spec.close) {
                    spec.close(error);
                }
            },
            connection: (socket) => {
                const clientObjects = new Array(this.protocols.length);
                const protocolHandlers = new Array(this.protocols.length);
                this.protocols.forEach((protocol, pid) => {
                    const factory = clientFactory.protocolFactories[pid];
                    this.bandwidth[pid][socket.sessionId] = {
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
                    };
                    const client = new MuRemoteClient(socket, factory.createDispatch([socket], this.bandwidth[pid]), factory.createSendRaw([socket], this.bandwidth[pid]));
                    clientObjects[pid] = client;
                    const protocolSpec = this._protocolSpecs[pid];
                    const messageHandlers = {};
                    Object.keys(protocolSpec.messageHandlers).forEach((message) => {
                        const handler = protocolSpec.messageHandlers[message];
                        messageHandlers[message] = (data, unreliable) => {
                            this._guardMessage({ sessionId: socket.sessionId, protocol: protocol.schema.name || String(pid), message, data, unreliable: !!unreliable }, protocol.schema.server[message], (retained) => handler(client, retained, unreliable));
                        };
                    });
                    const rawHandler = protocolSpec.rawHandler;
                    protocolHandlers[pid] = {
                        rawHandler: (bytes, unreliable) => {
                            this._guardMessage({ sessionId: socket.sessionId, protocol: protocol.schema.name || String(pid), message: 'raw', data: bytes, unreliable: !!unreliable }, undefined, (retained) => rawHandler(client, retained, unreliable));
                        },
                        messageHandlers,
                    };
                });
                function checkProtocolConsistency(packet) {
                    try {
                        const info = JSON.parse(packet);
                        if (info.clientJsonStr !== clientFactory.jsonStr ||
                            info.serverJsonStr !== serverFactory.jsonStr) {
                            throw new Error('incompatible protocols');
                        }
                    }
                    catch (e) {
                        console.error(`mudb: kill connection ${socket.sessionId}: ${e}`);
                        socket.close();
                    }
                }
                const parser = serverFactory.createParser(protocolHandlers, this.logger, this.bandwidth, socket.sessionId);
                let validationPacket = this._shouldValidateProtocol;
                socket.open({
                    ready: () => {
                        sockets.push(socket);
                        if (this._shouldValidateProtocol) {
                            socket.send(JSON.stringify({
                                clientJsonStr: clientFactory.jsonStr,
                                serverJsonStr: serverFactory.jsonStr,
                            }));
                        }
                        this.protocols.forEach((protocol, id) => {
                            const client = clientObjects[id];
                            protocol.clients[socket.sessionId] = client;
                        });
                        this._protocolSpecs.forEach((protocolSpec, id) => {
                            const client = clientObjects[id];
                            protocolSpec.connectHandler(client);
                        });
                    },
                    message: (data, unreliable) => {
                        if (!validationPacket) {
                            try {
                                parser(data, unreliable);
                            }
                            catch (e) {
                                console.error(`mudb: kill connection ${socket.sessionId}: ${e}`);
                                socket.close();
                            }
                        }
                        else {
                            checkProtocolConsistency(data);
                            validationPacket = false;
                        }
                    },
                    close: (error) => {
                        this._protocolSpecs.forEach((protocolSpec, id) => {
                            const client = clientObjects[id];
                            protocolSpec.disconnectHandler(client);
                        });
                        this.protocols.forEach((protocol) => {
                            delete protocol.clients[socket.sessionId];
                        });
                        sockets.splice(sockets.indexOf(socket), 1);
                        if (error) {
                            this.logger.error(`socket ${socket.sessionId} was closed due to ${error}`);
                        }
                    },
                });
            },
        });
    }
    destroy() {
        if (!this.running) {
            throw new Error('mudb: server is not running');
        }
        this._closed = true;
        this.running = false;
        this._socketServer.close();
        this._protocolSpecs.forEach((protocolSpec) => protocolSpec.closeHandler());
    }
    _guardMessage(event, schema, dispatch) {
        if (!this.messageGuard) {
            dispatch(event.data);
            return;
        }
        const retained = schema ? schema.clone(event.data) : typeof event.data === 'string'
            ? event.data : new Uint8Array(event.data);
        let finished = false;
        const complete = (allow) => {
            if (finished) {
                return;
            }
            finished = true;
            let asynchronous = false;
            try {
                if (allow) {
                    const result = dispatch(retained);
                    if (result && typeof result.then === 'function') {
                        asynchronous = true;
                        Promise.resolve(result).catch((error) => this.logger.error(error)).then(() => {
                            if (schema) {
                                schema.free(retained);
                            }
                        });
                    }
                }
            }
            catch (error) {
                this.logger.error(error);
            }
            finally {
                if (!asynchronous && schema) {
                    schema.free(retained);
                }
            }
        };
        try {
            this.messageGuard(Object.assign(Object.assign({}, event), { data: retained }), complete);
        }
        catch (error) {
            complete(false);
            this.logger.error(error);
        }
    }
    protocol(schema) {
        if (this._started || this._closed) {
            throw new Error('mudb: attempt to register protocol after server has been started');
        }
        this.logger.log(`register ${schema.name} protocol`);
        const spec = new MuServerProtocolSpec();
        const p = new MuServerProtocol(schema, this, spec);
        this.protocols.push(p);
        this._protocolSpecs.push(spec);
        return p;
    }
}
exports.MuServer = MuServer;
//# sourceMappingURL=server.js.map