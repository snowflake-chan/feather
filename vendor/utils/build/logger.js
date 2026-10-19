"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferSink = exports.Logger = exports.LogMessageSchema = exports.LogLevel = void 0;
const schema_1 = require("@box/mudb/schema");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
exports.LogMessageSchema = new schema_1.MuStruct({
    uuid: new schema_1.MuASCII(),
    level: new schema_1.MuUint8(LogLevel.INFO),
    timestamp: new schema_1.MuDate(new Date(0)),
    prefix: new schema_1.MuArray(new schema_1.MuASCII(), Infinity),
    message: new schema_1.MuUTF8(),
});
class Logger {
    constructor(sink, prefix, uuid) {
        this.sink = sink;
        this.prefix = prefix;
        this.uuid = uuid;
        this.create = (prefix) => {
            const p = this.prefix.slice();
            p.push(prefix);
            return new Logger(this.sink, p, this.uuid);
        };
        this.error = (mesg) => {
            if (typeof mesg === 'string') {
                return this._log(LogLevel.ERROR, mesg);
            }
            if (mesg && mesg.stack !== undefined && mesg.stack !== '') {
                return this._log(LogLevel.ERROR, mesg.stack);
            }
            return this._log(LogLevel.ERROR, '' + mesg);
        };
        this.warn = (mesg) => {
            return this._log(LogLevel.WARN, mesg);
        };
        this.log = (mesg) => {
            return this._log(LogLevel.INFO, mesg);
        };
        this.debug = (mesg) => {
            return this._log(LogLevel.DEBUG, mesg);
        };
        this.fatal = (mesg) => {
            return this.error(mesg);
        };
        this.trace = (mesg) => {
            return this.debug(mesg);
        };
        this.info = (mesg) => {
            return this.log(mesg);
        };
    }
    _log(level, message) {
        this.sink({
            level,
            timestamp: new Date(),
            prefix: this.prefix,
            uuid: this.uuid,
            message,
        });
    }
}
exports.Logger = Logger;
class BufferSink {
    constructor() {
        this.buffer = [];
        this.sink = (message) => {
            if (this._sink) {
                this._sink(message);
            }
            else {
                this.buffer.push(exports.LogMessageSchema.clone(message));
            }
        };
    }
    replace(nextSink) {
        this._sink = nextSink;
        for (let i = 0; i < this.buffer.length; ++i) {
            nextSink(this.buffer[i]);
            exports.LogMessageSchema.free(this.buffer[i]);
        }
        this.buffer.length = 0;
    }
}
exports.BufferSink = BufferSink;
