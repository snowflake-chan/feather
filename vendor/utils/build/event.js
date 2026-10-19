"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
class EventBus {
    constructor() {
        this.handlers = [];
        this.nextHandlers = [];
    }
    notify(e) {
        for (let i = 0; i < this.handlers.length; ++i) {
            this.handlers[i](e);
        }
        for (let i = 0; i < this.nextHandlers.length; ++i) {
            this.nextHandlers[i](e);
        }
        this.nextHandlers.length = 0;
    }
    sub(handler) {
        this.handlers.push(handler);
    }
    unsub(handler) {
        const idx = this.handlers.indexOf(handler);
        if (idx >= 0) {
            this.handlers[idx] = this.handlers[this.handlers.length - 1];
            this.handlers.pop();
        }
    }
    unsubAll() {
        this.handlers.length = 0;
    }
    next(handler) {
        this.nextHandlers.push(handler);
    }
}
exports.EventBus = EventBus;
