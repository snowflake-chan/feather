"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettySink = void 0;
const logger_1 = require("./logger");
const logFunctions = {
    [logger_1.LogLevel.ERROR]: console.error.bind(console),
    [logger_1.LogLevel.WARN]: console.warn.bind(console),
    [logger_1.LogLevel.DEBUG]: console.info.bind(console),
    [logger_1.LogLevel.INFO]: console.info.bind(console),
};
const startTime = new Date();
let curPath = '';
const prettySink = (mesg) => {
    const { level, timestamp, prefix, message } = mesg;
    let t = ((timestamp - startTime) / 1000).toFixed(2);
    while (t.length < 8) {
        t = ' ' + t;
    }
    const nextPath = prefix.join('/');
    const p = nextPath === curPath ? '.' : nextPath;
    curPath = nextPath;
    const m = message;
    const txt = typeof m === 'string' ? m : JSON.stringify(m);
    if (typeof window === 'undefined') {
        const l = {
            [logger_1.LogLevel.ERROR]: '\u001B[31m[ERR]',
            [logger_1.LogLevel.WARN]: '\u001B[33m[WRN]',
            [logger_1.LogLevel.DEBUG]: '\u001B[35m[DBG]',
            [logger_1.LogLevel.INFO]: '\u001B[34m[INF]',
        }[level];
        console.log(`${l} \u001B[46;30m ${t} \u001B[43;30m ${p} \u001B[40;32m ${txt}\u001B[0m`);
    }
    else {
        const l = {
            [logger_1.LogLevel.ERROR]: '[ERR]',
            [logger_1.LogLevel.WARN]: '[WRN]',
            [logger_1.LogLevel.DEBUG]: '[DBG]',
            [logger_1.LogLevel.INFO]: '[INF]',
        }[level];
        const color = {
            [logger_1.LogLevel.ERROR]: 'red',
            [logger_1.LogLevel.WARN]: 'orange',
            [logger_1.LogLevel.DEBUG]: 'purple',
            [logger_1.LogLevel.INFO]: 'green',
        }[level];
        const logFunction = logFunctions[level];
        logFunction(`%c ${l} %c${t} %c ${p} %c ${txt}`, `background: #f7eddf; color:${color}`, `background: #f7eddf; color:#a07060`, 'background: #f7eddf; color:#508040', 'background: #f7eddf; color:#1a1a1a');
    }
};
exports.prettySink = prettySink;
