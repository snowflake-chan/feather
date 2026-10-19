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
exports.MuRPCFetchClientTransport = void 0;
class MuRPCFetchClientTransport {
    constructor(spec) {
        this._url = spec.url;
    }
    send(schemas, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = JSON.stringify(schemas.argSchema.toJSON(arg));
            const response = yield (yield fetch(this._url + '/' + schemas.protocol.name, {
                method: 'POST',
                mode: 'same-origin',
                cache: 'no-cache',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                redirect: 'follow',
                body,
            })).json();
            return schemas.responseSchema.fromJSON(response);
        });
    }
}
exports.MuRPCFetchClientTransport = MuRPCFetchClientTransport;
//# sourceMappingURL=client-fetch.js.map