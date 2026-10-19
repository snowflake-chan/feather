"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameHttpAPI = exports.GameHttpResponse = exports.GameHttpRequest = exports.GameHttpFetchResponse = void 0;
class GameHttpFetchResponse {
    constructor(status, statusText, headers, json, text, arrayBuffer, close) {
        this.status = status;
        this.statusText = statusText;
        this.headers = headers;
        this.json = json;
        this.text = text;
        this.arrayBuffer = arrayBuffer;
        this.close = close;
    }
    get ok() {
        return 200 <= this.status && this.status < 300;
    }
}
exports.GameHttpFetchResponse = GameHttpFetchResponse;
class GameHttpRequest {
}
exports.GameHttpRequest = GameHttpRequest;
class GameHttpResponse {
}
exports.GameHttpResponse = GameHttpResponse;
class GameHttpAPI {
    constructor(
    // public url:string,
    fetch) {
        this.fetch = fetch;
    }
}
exports.GameHttpAPI = GameHttpAPI;
//# sourceMappingURL=http.js.map