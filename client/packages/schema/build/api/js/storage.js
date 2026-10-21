"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryList = exports.GameDataStorage = exports.GameStorage = void 0;
class GameStorage {
    constructor(getDataStorage, getGroupStorage) {
        this.getDataStorage = getDataStorage;
        this.getGroupStorage = getGroupStorage;
    }
}
exports.GameStorage = GameStorage;
/**
 *
 * A Data storage class
 * @export
 * @class GameDataStorage
 */
class GameDataStorage {
    constructor(key, 
    // set value
    set, 
    // update value
    update, get, increment, list, remove, destroy) {
        this.key = key;
        this.set = set;
        this.update = update;
        this.get = get;
        this.increment = increment;
        this.list = list;
        this.remove = remove;
        this.destroy = destroy;
    }
}
exports.GameDataStorage = GameDataStorage;
class QueryList {
    constructor(getCurrentPage, nextPage) {
        this.getCurrentPage = getCurrentPage;
        this.nextPage = nextPage;
        this.isLastPage = false;
    }
}
exports.QueryList = QueryList;
//# sourceMappingURL=storage.js.map