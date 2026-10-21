"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameQueryResult = exports.GameDatabase = void 0;
/**
 * A standard SQL database
 */
class GameDatabase {
    /**
     * @ignore
     */
    constructor(
    /**
     * Executes a SQL query on this database
     */
    sql) {
        this.sql = sql;
    }
}
exports.GameDatabase = GameDatabase;
/**
 * Query result api
 */
class GameQueryResult {
    [Symbol.asyncIterator]() {
        return this;
    }
    /**
     * @ignore
     */
    constructor(next, abort, error, then) {
        this.next = next;
        this['return'] = abort;
        this['throw'] = error;
        this['then'] = then;
    }
}
exports.GameQueryResult = GameQueryResult;
//# sourceMappingURL=db.js.map