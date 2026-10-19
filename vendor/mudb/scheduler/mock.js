"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuMockScheduler = void 0;
const pq_1 = require("./pq");
const perf_now_1 = require("./perf-now");
const frameDuration = 1000 / 60;
class MuMockScheduler {
    constructor() {
        this._eventQueue = pq_1.NIL;
        this._timeoutCounter = 0;
        this._mockMSCounter = 0;
        this._idToEvent = {};
        this.setTimeout = (callback, ms) => {
            const id = this._timeoutCounter++;
            const time = 1 + this._mockMSCounter + Math.max(ms, 0);
            const node = (0, pq_1.createNode)(id, time, callback);
            this._idToEvent[id] = node;
            this._eventQueue = (0, pq_1.merge)(node, this._eventQueue);
            return id;
        };
        this.clearTimeout = (id) => {
            const node = this._idToEvent[id];
            if (node) {
                this._eventQueue = (0, pq_1.decreaseKey)(this._eventQueue, node, -Infinity);
                this._eventQueue = (0, pq_1.pop)(this._eventQueue);
                delete this._idToEvent[id];
            }
        };
        this.setInterval = (callback, ms) => {
            const id = this._timeoutCounter++;
            const self = this;
            function insertNode() {
                const time = 1 + self._mockMSCounter + Math.max(ms, 0);
                const node = (0, pq_1.createNode)(id, time, event);
                self._idToEvent[id] = node;
                self._eventQueue = (0, pq_1.merge)(node, self._eventQueue);
            }
            function event() {
                insertNode();
                callback();
            }
            insertNode();
            return id;
        };
        this.clearInterval = this.clearTimeout;
        this._rAFLast = 0;
        this.requestAnimationFrame = (callback) => {
            const now_ = (0, perf_now_1.perfNow)();
            const timeout = Math.max(0, frameDuration - (now_ - this._rAFLast));
            const then = this._rAFLast = now_ + timeout;
            return this.setTimeout(() => callback(then), Math.round(timeout));
        };
        this.cancelAnimationFrame = this.clearTimeout;
        this.requestIdleCallback = (callback, options) => {
            const timeout = options ? options.timeout : 1;
            return this.setTimeout(() => {
                const start = (0, perf_now_1.perfNow)();
                callback({
                    didTimeout: false,
                    timeRemaining: () => Math.max(0, 50 - ((0, perf_now_1.perfNow)() - start)),
                });
            }, timeout);
        };
        this.cancelIdleCallback = this.clearTimeout;
        this.nextTick = (callback) => {
            this.setTimeout(callback, 0);
        };
    }
    now() {
        return this._mockMSCounter;
    }
    poll() {
        if (this._eventQueue === pq_1.NIL) {
            return false;
        }
        this._mockMSCounter = this._eventQueue.time;
        const event = this._eventQueue.event;
        delete this._idToEvent[this._eventQueue.id];
        this._eventQueue = (0, pq_1.pop)(this._eventQueue);
        event();
        return true;
    }
}
exports.MuMockScheduler = MuMockScheduler;
//# sourceMappingURL=mock.js.map