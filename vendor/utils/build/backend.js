"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bodyParse = bodyParse;
function bodyParse(req, maxSizeBytes = 1000 * 1000) {
    return new Promise((resolve, reject) => {
        let nBytesReceived = 0;
        let data = '';
        req.on('data', (chunk) => {
            nBytesReceived += chunk.length;
            if (nBytesReceived > maxSizeBytes) {
                reject(new Error(`Body size too big. Max bytes: ${maxSizeBytes}`));
                return;
            }
            data += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(data));
            }
            catch (e) {
                reject(e);
            }
        });
        req.on('error', (err) => {
            reject(err);
        });
    });
}
