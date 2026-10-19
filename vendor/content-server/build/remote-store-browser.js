"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteStoreBrowser = void 0;
class RemoteStoreBrowser {
    constructor(cdnPath, ipfsPath = cdnPath) {
        this.storeURL = `${ipfsPath}/block`;
        this.retrieveURL = `${cdnPath}/block`;
    }
    async init() { }
    async store(raw_content) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.storeURL, true);
            xhr.onerror = reject;
            xhr.onabort = reject;
            xhr.ontimeout = reject;
            xhr.onload = (oEvent) => {
                resolve(xhr.responseText);
            };
            xhr.send(raw_content);
        });
    }
    async retrieve(hashOfBlob) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `${this.retrieveURL}/${hashOfBlob}`, true);
            xhr.responseType = 'arraybuffer';
            xhr.onerror = reject;
            xhr.onabort = reject;
            xhr.ontimeout = reject;
            xhr.onload = (oEvent) => {
                const arrayBuffer = xhr.response;
                if (arrayBuffer) {
                    resolve(new Uint8Array(arrayBuffer));
                }
                else {
                    resolve(void 0);
                }
            };
            xhr.send();
        });
    }
}
exports.RemoteStoreBrowser = RemoteStoreBrowser;
