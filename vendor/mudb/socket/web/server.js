"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuWebSocketServer = exports.MuWebSocketClient = exports.MuWebSocketConnection = void 0;
const ws = require("ws");
const url = require("url");
const session_proof_1 = require("./session-proof");
const socket_1 = require("../socket");
const system_1 = require("../../scheduler/system");
const logger_1 = require("../../logger");
const error_1 = require("../../util/error");
const stream_1 = require("../../stream");
const error = (0, error_1.makeError)('socket/web/server');
function noop() { }
function coallesceFragments(frags) {
    let size = 0;
    for (let i = 0; i < frags.length; ++i) {
        size += frags[i].length;
    }
    const result = new Uint8Array(size);
    let offset = 0;
    for (let i = 0; i < frags.length; ++i) {
        result.set(frags[i], offset);
        offset += frags[i].length;
    }
    return result;
}
class MuWebSocketConnection {
    constructor(sessionId, reliableSocket, serverClose, logger, bufferLimit) {
        this.bufferLimit = bufferLimit;
        this.sessionProof = '';
        this.started = false;
        this.closed = false;
        this.unreliableSockets = [];
        this.lastReliablePing = 0;
        this.lastUnreliablePing = [];
        this.pendingMessages = [];
        this.onMessage = noop;
        this.onClose = noop;
        this.sessionId = sessionId;
        this.reliableSocket = reliableSocket;
        this.serverClose = serverClose;
        this._logger = logger;
        this.reliableSocket.onmessage = ({ data }) => {
            if (this.closed) {
                return;
            }
            if (this.started) {
                if (typeof data === 'string') {
                    this.onMessage(data, false);
                }
                else if (data.length === 1) {
                    this.onMessage(data[0], false);
                }
                else if (data.length > 1) {
                    let size = 0;
                    for (let i = 0; i < data.length; ++i) {
                        size += data[i].length;
                    }
                    const buffer = (0, stream_1.allocBuffer)(size);
                    const result = buffer.uint8;
                    let offset = 0;
                    for (let i = 0; i < data.length; ++i) {
                        result.set(data[i], offset);
                        offset += data[i].length;
                    }
                    this.onMessage(result.subarray(0, offset), false);
                    (0, stream_1.freeBuffer)(buffer);
                }
            }
            else {
                if (typeof data === 'string') {
                    this.pendingMessages.push(data);
                }
                else {
                    this.pendingMessages.push(coallesceFragments(data));
                }
            }
        };
        this.reliableSocket.onclose = () => {
            if (!this.closed) {
                this._logger.log(`unexpectedly closed websocket connection for ${this.sessionId}`);
            }
            else {
                this._logger.log(`closing websocket connection for ${this.sessionId}`);
            }
            this.closed = true;
            for (let i = 0; i < this.unreliableSockets.length; ++i) {
                this.unreliableSockets[i].close();
            }
            this.onClose();
            this.serverClose();
        };
        this.reliableSocket.onerror = (e) => {
            this._logger.error(`error on reliable socket ${this.sessionId}. reason ${e} ${e.stack ? e.stack : ''}`);
        };
    }
    addUnreliableSocket(socket) {
        if (this.closed) {
            return;
        }
        this.unreliableSockets.push(socket);
        this.lastUnreliablePing.push(0);
        socket.onmessage = ({ data }) => {
            if (this.closed) {
                return;
            }
            if (this.started) {
                if (typeof data === 'string') {
                    this.onMessage(data, true);
                }
                else if (data.length === 1) {
                    this.onMessage(data[0], true);
                }
                else if (data.length > 1) {
                    let size = 0;
                    for (let i = 0; i < data.length; ++i) {
                        size += data[i].length;
                    }
                    const buffer = (0, stream_1.allocBuffer)(size);
                    const result = buffer.uint8;
                    let offset = 0;
                    for (let i = 0; i < data.length; ++i) {
                        result.set(data[i], offset);
                        offset += data[i].length;
                    }
                    this.onMessage(result.subarray(0, offset), true);
                    (0, stream_1.freeBuffer)(buffer);
                }
            }
        };
        socket.onclose = () => {
            const idx = this.unreliableSockets.indexOf(socket);
            this.unreliableSockets.splice(idx, 1);
            this.lastUnreliablePing.splice(idx, 1);
            if (!this.closed) {
                this._logger.error(`unreliable socket closed unexpectedly: ${this.sessionId}`);
            }
        };
        socket.onerror = (e) => {
            this._logger.error(`unreliable socket ${this.sessionId} error: ${e} ${e.stack ? e.stack : ''}`);
        };
    }
    send(data, unreliable) {
        if (this.closed) {
            return;
        }
        if (unreliable) {
            const sockets = this.unreliableSockets;
            if (sockets.length > 0) {
                let socket = sockets[0];
                let bufferedAmount = socket.bufferedAmount || 0;
                let idx = 0;
                for (let i = 1; i < sockets.length; ++i) {
                    const s = sockets[i];
                    const b = s.bufferedAmount || 0;
                    if (b < bufferedAmount) {
                        socket = s;
                        bufferedAmount = b;
                        idx = i;
                    }
                }
                if (bufferedAmount < this.bufferLimit) {
                    socket.send(typeof data === 'string' ? data : new Uint8Array(data));
                    sockets.splice(idx, 1);
                    sockets.push(socket);
                }
            }
        }
        else {
            this.reliableSocket.send(typeof data === 'string' ? data : new Uint8Array(data));
        }
    }
    close() {
        this.reliableSocket.close();
    }
    doPing(now, pingCutoff) {
        if (this.closed) {
            return;
        }
        if (this.lastReliablePing < pingCutoff) {
            this.lastReliablePing = now;
            this.reliableSocket.ping();
        }
        for (let i = 0; i < this.unreliableSockets.length; ++i) {
            if (this.lastUnreliablePing[i] < pingCutoff) {
                this.lastUnreliablePing[i] = now;
                this.unreliableSockets[i].ping();
            }
        }
    }
}
exports.MuWebSocketConnection = MuWebSocketConnection;
class MuWebSocketClient {
    state() { return this._state; }
    constructor(connection, scheduler, logger) {
        this._state = socket_1.MuSocketState.INIT;
        this.sessionId = connection.sessionId;
        this._connection = connection;
        this._logger = logger;
        this.scheduler = scheduler;
    }
    open(spec) {
        if (this._state !== socket_1.MuSocketState.INIT) {
            throw error(`socket had been opened`);
        }
        this.scheduler.setTimeout(() => {
            if (this._state !== socket_1.MuSocketState.INIT) {
                return;
            }
            this._state = socket_1.MuSocketState.OPEN;
            spec.ready();
            for (let i = 0; i < this._connection.pendingMessages.length; ++i) {
                if (this._connection.closed) {
                    break;
                }
                try {
                    spec.message(this._connection.pendingMessages[i], false);
                }
                catch (e) {
                    this._logger.exception(e);
                }
            }
            this._connection.pendingMessages.length = 0;
            if (this._connection.closed) {
                this._state = socket_1.MuSocketState.CLOSED;
                spec.close();
            }
            else {
                this._connection.started = true;
                this._connection.onMessage = spec.message;
                this._connection.onClose = () => {
                    this._state = socket_1.MuSocketState.CLOSED;
                    spec.close();
                };
            }
        }, 0);
    }
    send(data, unreliable) {
        this._connection.send(data, !!unreliable);
    }
    close() {
        this._logger.log(`close called on websocket ${this.sessionId}`);
        if (this._state !== socket_1.MuSocketState.CLOSED) {
            this._state = socket_1.MuSocketState.CLOSED;
            this._connection.close();
        }
    }
    reliableBufferedAmount() {
        return this._connection.reliableSocket.bufferedAmount;
    }
    unreliableBufferedAmount() {
        let amount = Infinity;
        for (let i = 0; i < this._connection.unreliableSockets.length; ++i) {
            amount = Math.min(amount, this._connection.unreliableSockets[i].bufferedAmount);
        }
        return amount;
    }
}
exports.MuWebSocketClient = MuWebSocketClient;
class MuWebSocketServer {
    issueSessionProof(sessionId) { return this._proof.issue(sessionId); }
    state() { return this._state; }
    constructor(spec) {
        this._proof = new session_proof_1.MuSessionProof();
        this._state = socket_1.MuSocketServerState.INIT;
        this._connections = [];
        this.clients = [];
        this._onClose = noop;
        this._pingInterval = 10000;
        this._logger = spec.logger || logger_1.MuDefaultLogger;
        this._requireSessionProof = !!spec.requireSessionProof;
        this.bufferLimit = spec.bufferLimit || 1024;
        this._options = {
            server: spec.server,
            clientTracking: false,
        };
        spec.backlog && (this._options['backlog'] = spec.backlog);
        spec.maxPayload && (this._options['maxPayload'] = spec.maxPayload);
        spec.handleProtocols && (this._options['handleProtocols'] = spec.handleProtocols);
        if (this._requireSessionProof) {
            this._options['handleProtocols'] = (protocols) => {
                const values = Array.isArray(protocols) ? protocols : Array.from(protocols);
                return values.includes('box3-game') ? 'box3-game' : false;
            };
        }
        spec.path && (this._options['path'] = spec.path);
        spec.perMessageDeflate && (this._options['perMessageDeflate'] = spec.perMessageDeflate);
        this.scheduler = spec.scheduler || system_1.MuSystemScheduler;
        if ('pingInterval' in spec) {
            this._pingInterval = spec.pingInterval || 0;
        }
    }
    _findConnection(sessionId) {
        for (let i = 0; i < this._connections.length; ++i) {
            if (this._connections[i].sessionId === sessionId) {
                return this._connections[i];
            }
        }
        return null;
    }
    start(spec) {
        if (this._state !== socket_1.MuSocketServerState.INIT) {
            throw error(`server had been started`);
        }
        if (this._pingInterval) {
            this._pingIntervalId = this.scheduler.setInterval(() => {
                const now = Date.now();
                const pingCutoff = now - this._pingInterval;
                for (let i = 0; i < this._connections.length; ++i) {
                    this._connections[i].doPing(now, pingCutoff);
                }
            }, this._pingInterval * 0.5);
        }
        this.scheduler.setTimeout(() => {
            this._wsServer = new ws.Server(this._options)
                .on('connection', (socket, req) => {
                if (this._state === socket_1.MuSocketServerState.SHUTDOWN) {
                    this._logger.error('connection attempt from closed socket server');
                    socket.terminate();
                    return;
                }
                this._logger.log(`muwebsocket connection received: extensions ${socket.extensions} protocol ${socket.protocol}`);
                const query = url.parse(req.url, true).query;
                const sessionId = query['sid'];
                if (typeof sessionId !== 'string') {
                    this._logger.error(`no session id`);
                    socket.terminate();
                    return;
                }
                socket.binaryType = 'fragments';
                socket.onerror = (e) => {
                    this._logger.error(`socket error in opening state: ${e}`);
                };
                socket.onopen = () => this._logger.log('socket opened');
                let connection = this._findConnection(sessionId);
                const proofHeaders = String(req.headers['sec-websocket-protocol'] || '').split(',')
                    .map((value) => value.trim()).filter((value) => value.startsWith('box3-proof.'));
                const sessionProof = proofHeaders.length === 1 ? proofHeaders[0].slice('box3-proof.'.length) : undefined;
                if (this._requireSessionProof && (sessionId.length > 128 || (connection
                    ? !this._proof.matches(connection.sessionProof, sessionProof)
                    : !this._proof.verify(sessionId, sessionProof)))) {
                    socket.terminate();
                    return;
                }
                if (connection) {
                    socket.send(JSON.stringify({
                        reliable: false,
                    }));
                    connection.addUnreliableSocket(socket);
                }
                else {
                    socket.send(JSON.stringify({
                        reliable: true,
                    }));
                    connection = new MuWebSocketConnection(sessionId, socket, () => {
                        if (connection) {
                            this._connections.splice(this._connections.indexOf(connection), 1);
                            for (let i = this.clients.length - 1; i >= 0; --i) {
                                if (this.clients[i].sessionId === connection.sessionId) {
                                    this.clients.splice(i, 1);
                                }
                            }
                        }
                    }, this._logger, this.bufferLimit);
                    connection.sessionProof = this._requireSessionProof ? String(sessionProof) : '';
                    this._connections.push(connection);
                    const client = new MuWebSocketClient(connection, this.scheduler, this._logger);
                    this.clients.push(client);
                    spec.connection(client);
                }
            })
                .on('error', (e) => {
                this._logger.error(`internal websocket error ${e}.  ${e.stack ? e.stack : ''}`);
            })
                .on('listening', () => this._logger.log(`muwebsocket server listening: ${JSON.stringify(this._wsServer.address())}`))
                .on('close', () => {
                if (this._pingIntervalId) {
                    this.scheduler.clearInterval(this._pingIntervalId);
                }
                this._logger.log('muwebsocket server closing');
            })
                .on('headers', (headers) => this._logger.log(`muwebsocket: headers ${headers}`));
            this._onClose = spec.close;
            this._state = socket_1.MuSocketServerState.RUNNING;
            spec.ready();
        }, 0);
    }
    close() {
        if (this._state === socket_1.MuSocketServerState.SHUTDOWN) {
            return;
        }
        this._state = socket_1.MuSocketServerState.SHUTDOWN;
        if (this._wsServer) {
            this._wsServer.close(this._onClose);
        }
    }
}
exports.MuWebSocketServer = MuWebSocketServer;
//# sourceMappingURL=server.js.map