"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Semaphore = void 0;
class SemaphoreNode {
    constructor(I, F, next, prev) {
        this.I = I;
        this.F = F;
        this.next = next;
        this.prev = prev;
    }
}
class Semaphore {
    constructor(counter = 1) {
        this.counter = counter;
        this._head = null;
        this._tail = null;
    }
    spinP(I = 1) {
        if (this.counter >= I) {
            this.counter -= I;
            return true;
        }
        return false;
    }
    p(I = 1) {
        return new Promise((F) => {
            if (I <= this.counter) {
                this.counter -= I;
                return F();
            }
            else {
                const tail = this._tail;
                const node = new SemaphoreNode(I, F, null, tail);
                if (tail) {
                    tail.next = node;
                }
                else {
                    this._head = node;
                }
                this._tail = node;
            }
        });
    }
    v(X = 1) {
        this.counter += X;
        for (let node = this._head; !!node && this.counter > 0;) {
            const { next, prev, I, F } = node;
            if (I <= this.counter) {
                this.counter -= I;
                if (!prev) {
                    this._head = next;
                }
                else {
                    prev.next = next;
                }
                if (!next) {
                    this._tail = prev;
                }
                else {
                    next.prev = prev;
                }
                node.next = node.prev = null;
                F();
            }
            node = next;
        }
    }
}
exports.Semaphore = Semaphore;
