"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consolePrefix = consolePrefix;
exports.consoleSink = consoleSink;
const logger_1 = require("./logger");
const logFunctions = {
    [logger_1.LogLevel.ERROR]: console.error.bind(console),
    [logger_1.LogLevel.WARN]: console.warn.bind(console),
    [logger_1.LogLevel.DEBUG]: console.info.bind(console),
    [logger_1.LogLevel.INFO]: console.info.bind(console),
};
function padToLength(mesg, length) {
    let result = mesg;
    while (result.length < length) {
        result += ' ';
    }
    return result;
}
function consolePrefix(mesg) {
    return `(${mesg.timestamp.toISOString()} ${padToLength(mesg.uuid, 16)} ${padToLength(mesg.prefix.join('/'), 16)}): `;
}
function consoleSink(mesg) {
    const str = consolePrefix(mesg) + mesg.message;
    const logger = logFunctions[mesg.level];
    if (logger) {
        logger.call(null, str);
    }
}
