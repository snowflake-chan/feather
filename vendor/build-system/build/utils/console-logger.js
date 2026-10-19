"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConsoleLogger = createConsoleLogger;
const logger_1 = require("@box/utils/logger");
function createConsoleLogger(startTime, level = logger_1.LogLevel.INFO) {
    // set up build stuff
    const startDate = +new Date(startTime);
    const logger = new logger_1.Logger((message) => {
        const time = ((+message.timestamp - startDate) / 1000).toFixed(4);
        if (message.level > level) {
            return;
        }
        switch (message.level) {
            case logger_1.LogLevel.ERROR:
                console.error(`${time} [${message.prefix.join(';')}] ${message.message}`);
                break;
            case logger_1.LogLevel.WARN:
                console.warn(`${time} [${message.prefix.join(';')}] ${message.message}`);
                break;
            default:
                const prefix = message.prefix.slice();
                if (prefix.length > 3) {
                    prefix.splice(2, prefix.length - 3, '...');
                }
                console.log(`${time} [${prefix.join(';')}] ${message.message}`);
                break;
        }
    }, [], '');
    return logger;
}
//# sourceMappingURL=console-logger.js.map