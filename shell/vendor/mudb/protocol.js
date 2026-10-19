"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuProtocolFactory = exports.MuMessageFactory = void 0;
const stream_1 = require("./stream");
const stringify_1 = require("./util/stringify");
class MuMessageFactory {
    constructor(schema, idBase) {
        this.idBase = idBase;
        this.messageNames = Object.keys(schema).sort();
        this.schemas = new Array(this.messageNames.length);
        this.messageNames.forEach((name, id) => {
            this.schemas[id] = schema[name];
        });
        const json = this.schemas.map((s) => s.json);
        this.jsonStr = (0, stringify_1.stableStringify)(json);
    }
    createDispatch(sockets, bandwidth) {
        const result = {};
        this.messageNames.forEach((name, messageId) => {
            const schema = this.schemas[messageId];
            result[name] = (data, unreliable) => {
                const stream = new stream_1.MuWriteStream(128);
                stream.writeVarint(this.idBase + messageId);
                schema.diff(schema.identity, data, stream);
                const contentBytes = stream.bytes();
                const numBytes = contentBytes.byteLength;
                for (let i = 0; i < sockets.length; ++i) {
                    const socket = sockets[i];
                    socket.send(contentBytes, unreliable);
                    if (!bandwidth[socket.sessionId].sent[name]) {
                        bandwidth[socket.sessionId].sent[name] = {
                            count: 0,
                            bytes: 0,
                        };
                    }
                    const acc = bandwidth[socket.sessionId].sent[name];
                    acc.count += 1;
                    acc.bytes += numBytes;
                }
                stream.destroy();
            };
        });
        return result;
    }
    createSendRaw(sockets, bandwidth) {
        const rawId = this.idBase + this.messageNames.length;
        return function (data, unreliable) {
            if (typeof data === 'string') {
                const packet = JSON.stringify({
                    i: rawId,
                    d: data,
                });
                const numBytes = packet.length << 1;
                for (let i = 0; i < sockets.length; ++i) {
                    const socket = sockets[i];
                    socket.send(packet, unreliable);
                    const acc = bandwidth[socket.sessionId].sent['raw'];
                    acc.count += 1;
                    acc.bytes += numBytes;
                }
            }
            else {
                const size = 5 + data.length;
                const stream = new stream_1.MuWriteStream(size);
                stream.writeVarint(rawId);
                const { uint8 } = stream.buffer;
                uint8.set(data, stream.offset);
                stream.offset += data.length;
                const bytes = stream.bytes();
                const numBytes = bytes.byteLength;
                for (let i = 0; i < sockets.length; ++i) {
                    const socket = sockets[i];
                    socket.send(bytes, unreliable);
                    const acc = bandwidth[socket.sessionId].sent['raw'];
                    acc.count += 1;
                    acc.bytes += numBytes;
                }
                stream.destroy();
            }
        };
    }
}
exports.MuMessageFactory = MuMessageFactory;
class MuProtocolFactory {
    constructor(protocolSchemas) {
        this.protocolFactories = [];
        let counter = 0;
        for (let i = 0; i < protocolSchemas.length; ++i) {
            const factory = new MuMessageFactory(protocolSchemas[i], counter);
            this.protocolFactories.push(factory);
            counter += factory.messageNames.length + 1;
        }
        this.jsonStr = this.protocolFactories.map((factory) => factory.jsonStr).join();
    }
    createParser(spec, logger, bandwidth, sessionId) {
        const schemaTable = [];
        const handlerTable = [];
        const protocolIdTable = [];
        const messageNameTable = [];
        spec.forEach(({ messageHandlers, rawHandler }, id) => {
            const { messageNames, schemas } = this.protocolFactories[id];
            for (let i = 0; i < messageNames.length; ++i) {
                schemaTable.push(schemas[i]);
                handlerTable.push(messageHandlers[messageNames[i]]);
                protocolIdTable.push(id);
                messageNameTable.push(messageNames[i]);
            }
            schemaTable.push(null);
            handlerTable.push(rawHandler);
            protocolIdTable.push(id);
            messageNameTable.push('raw');
        });
        return (data, unreliable) => {
            if (typeof data === 'string') {
                const object = JSON.parse(data);
                const id = object.i;
                if (id < 0 || id >= handlerTable.length) {
                    throw new Error(`invalid message id: ${id}`);
                }
                if ('d' in object) {
                    handlerTable[id].call(null, object.d, unreliable);
                    const acc = bandwidth[protocolIdTable[id]][sessionId].received.raw;
                    acc.count += 1;
                    acc.bytes += data.length << 1;
                }
            }
            else {
                const stream = new stream_1.MuReadStream(data);
                const id = stream.readVarint();
                if (id < 0 || id >= handlerTable.length) {
                    throw new Error(`invalid message id: ${id}`);
                }
                const schema = schemaTable[id];
                const handler = handlerTable[id];
                const protocolId = protocolIdTable[id];
                const messageName = messageNameTable[id];
                if (!bandwidth[protocolId][sessionId].received[messageName]) {
                    bandwidth[protocolId][sessionId].received[messageName] = {
                        count: 0,
                        bytes: 0,
                    };
                }
                const acc = bandwidth[protocolId][sessionId].received[messageName];
                acc.count += 1;
                acc.bytes += data.byteLength;
                if (schema === null) {
                    handler.call(null, stream.bytes(), unreliable);
                    return;
                }
                let msg;
                if (stream.offset < stream.length) {
                    msg = schema.patch(schema.identity, stream);
                }
                else {
                    msg = schema.clone(schema.identity);
                }
                handler.call(null, msg, unreliable);
                schema.free(msg);
            }
        };
    }
}
exports.MuProtocolFactory = MuProtocolFactory;
//# sourceMappingURL=protocol.js.map