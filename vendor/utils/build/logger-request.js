"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestToLog = requestToLog;
const ip_1 = require("./ip");
function requestToLog(req, uuid) {
    let ip = '';
    try {
        ip = (0, ip_1.getRealIP)(req) || '';
    }
    catch (e) { }
    return {
        uuid: uuid,
        httpVersion: req.httpVersion,
        method: req.method,
        rawHeaders: req.rawHeaders || [],
        url: req.url || '',
        ip,
    };
}
