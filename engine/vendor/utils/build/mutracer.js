"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMuLogger = createMuLogger;
function createMuLogger(baseLogger, prefix = '@box/mudb/src') {
    const logger = baseLogger.create(prefix);
    return {
        log: (x) => { },
        error: (x) => logger.error(x),
        exception: (x) => logger.error(x),
    };
}
