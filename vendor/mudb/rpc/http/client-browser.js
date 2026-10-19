"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRPCHttpClientTransport = void 0;
class MuRPCHttpClientTransport {
    constructor(spec) {
        this._url = spec.url;
        this._timeout = spec.timeout;
        this._headers = spec.headers || {};
    }
    send(schemas, arg) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this._url + '/' + schemas.protocol.name, true);
        for (let key in this._headers) {
            xhr.setRequestHeader(key, this._headers[key]);
        }
        xhr.responseType = '';
        if (this._timeout < Infinity && this._timeout) {
            xhr.timeout = this._timeout;
        }
        xhr.withCredentials = true;
        const body = JSON.stringify(schemas.argSchema.toJSON(arg));
        return new Promise((resolve, reject) => {
            let completed = false;
            xhr.onreadystatechange = () => {
                if (completed) {
                    return;
                }
                const readyState = xhr.readyState;
                if (readyState === 4) {
                    completed = true;
                    const responseText = xhr.responseText;
                    try {
                        let json;
                        if (0 < responseText.length) {
                            json = JSON.parse(responseText);
                        }
                        else {
                            json = {
                                type: 'error',
                                data: 'empty response',
                            };
                        }
                        return resolve(schemas.responseSchema.fromJSON(json));
                    }
                    catch (e) {
                        return reject(e);
                    }
                }
            };
            xhr.onabort = () => {
                if (completed) {
                    return;
                }
                reject(`request aborted [mudb/rpc]`);
            };
            xhr.onerror = () => {
                if (completed) {
                    return;
                }
                reject(`error during request [mudb/rpc]`);
            };
            xhr.send(body);
        });
    }
}
exports.MuRPCHttpClientTransport = MuRPCHttpClientTransport;
//# sourceMappingURL=client-browser.js.map