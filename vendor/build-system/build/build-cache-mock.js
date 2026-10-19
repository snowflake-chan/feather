"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockBuildCache = void 0;
const crypto_1 = require("crypto");
const semaphore_1 = require("@box/utils/semaphore");
class MockBuildCache {
    constructor() {
        this.cache = {};
        this.mutex = {};
    }
    token(name, params) {
        return (0, crypto_1.createHash)('sha1')
            .update(JSON.stringify([name, params]))
            .digest()
            .toString('hex');
    }
    retrieve(name, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = this.token(name, params);
            if (token in this.cache) {
                return this.cache[token];
            }
            return '';
        });
    }
    invalidate(name_1, params_1) {
        return __awaiter(this, arguments, void 0, function* (name, params, result = '') {
            const token = this.token(name, params);
            if (!result || this.cache[token] === result) {
                delete this.cache[token];
            }
        });
    }
    store(name, params, method) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = this.token(name, params);
            if (this.cache[token]) {
                return this.cache[token];
            }
            if (this.mutex[token]) {
                yield this.mutex[token].p();
                return this.cache[token];
            }
            const sem = (this.mutex[token] = new semaphore_1.Semaphore(0));
            try {
                const result = (this.cache[token] = yield method());
                return result;
            }
            catch (e) {
                throw e;
            }
            finally {
                delete this.mutex[token];
                sem.v(Infinity);
            }
        });
    }
}
exports.MockBuildCache = MockBuildCache;
//# sourceMappingURL=build-cache-mock.js.map