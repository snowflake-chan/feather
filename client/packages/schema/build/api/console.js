"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameConsole = exports.GameLogLevel = void 0;
var GameLogLevel;
(function (GameLogLevel) {
    GameLogLevel[GameLogLevel["ERROR"] = 0] = "ERROR";
    GameLogLevel[GameLogLevel["WARN"] = 1] = "WARN";
    GameLogLevel[GameLogLevel["INFO"] = 2] = "INFO";
    GameLogLevel[GameLogLevel["DEBUG"] = 3] = "DEBUG";
})(GameLogLevel || (exports.GameLogLevel = GameLogLevel = {}));
class GameConsole {
    constructor(log, clear) {
        this.clear = clear;
        // TODO: Not implemented yet
        this.dir = () => { };
        this.dirxml = () => { };
        this.group = () => { };
        this.groupCollapsed = () => { };
        this.groupEnd = () => { };
        this.table = () => { };
        this.time = () => { };
        this.timeEnd = () => { };
        this.timeLog = () => { };
        this.timeStamp = () => { };
        this.trace = () => { };
        this.assert = (assertion, ...args) => {
            if (!assertion) {
                log(GameLogLevel.ERROR, args.join(' '));
            }
        };
        this.log = (...args) => log(GameLogLevel.INFO, args.join(' '));
        this.debug = (...args) => log(GameLogLevel.DEBUG, args.join(' '));
        this.error = (...args) => log(GameLogLevel.ERROR, args.join(' '));
        this.warn = (...args) => log(GameLogLevel.WARN, args.join(' '));
    }
}
exports.GameConsole = GameConsole;
//# sourceMappingURL=console.js.map