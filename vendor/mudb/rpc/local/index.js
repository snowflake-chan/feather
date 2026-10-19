"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRPCLocalTransport = exports.MuRPCLocalClient = void 0;
class MuRPCLocalClient {
    constructor(auth, _handlers) {
        this.auth = auth;
        this._handlers = _handlers;
    }
    setAuth(auth) {
        this.auth = auth;
    }
    send(schemas, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const handler = this._handlers[schemas.protocol.name];
            if (!handler) {
                throw new Error('server not registered');
            }
            const json = yield handler(this, schemas.argSchema.toJSON(args));
            return schemas.responseSchema.fromJSON(json);
        });
    }
}
exports.MuRPCLocalClient = MuRPCLocalClient;
class MuRPCLocalTransport {
    constructor() {
        this._handlers = {};
    }
    client(auth) {
        return new MuRPCLocalClient(auth, this._handlers);
    }
    listen(schemas, auth, recv) {
        this._handlers[schemas.protocol.name] = (client, json) => __awaiter(this, void 0, void 0, function* () {
            const response = schemas.responseSchema.alloc();
            try {
                if (!(yield auth(client))) {
                    throw new Error('unauthorized access');
                }
                const parsed = schemas.argSchema.fromJSON(json);
                yield recv(client, parsed, response);
                schemas.argSchema.free(parsed);
            }
            catch (e) {
                response.type = 'error';
                if (e instanceof Error && e.stack) {
                    response.data = e.stack;
                }
                else {
                    response.data = '' + e;
                }
            }
            const result = schemas.responseSchema.toJSON(response);
            schemas.responseSchema.free(response);
            return result;
        });
        return {};
    }
}
exports.MuRPCLocalTransport = MuRPCLocalTransport;
//# sourceMappingURL=index.js.map