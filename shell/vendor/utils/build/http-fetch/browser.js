"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserFetch = exports.isNon200Error = void 0;
exports.fetch = fetch;
const type_1 = require("./type");
Object.defineProperty(exports, "isNon200Error", { enumerable: true, get: function () { return type_1.isNon200Error; } });
class BrowserFetch {
    constructor(baseURL = 'http://127.0.0.1:9902') {
        this.baseURL = baseURL;
    }
    async get(path, query = {}) {
        const keys = Object.keys(query);
        return await fetch('get', this.baseURL +
            path +
            ((keys.length > 0 &&
                `?${keys.map((key) => `${key}=${query[key]}`).join('&')}`) ||
                ''));
    }
    async post(path, data) {
        return await fetch('post', this.baseURL + path, JSON.stringify(data));
    }
}
exports.BrowserFetch = BrowserFetch;
function fetch(method, url, data, timeout = 0) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.timeout = timeout;
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                }
                else {
                    reject(JSON.stringify({
                        non200: true,
                        method,
                        url,
                        data,
                        status: xhr.status,
                        res: xhr.responseText,
                    }));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(data);
    });
}
