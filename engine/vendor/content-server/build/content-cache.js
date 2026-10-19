"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONTENT_CACHE = exports.LruContentCache = void 0;
exports.copyContent = copyContent;
const nodePool = [];
function copyContent(array) {
    let result;
    if (typeof Buffer === 'function' && Uint8Array.isPrototypeOf(Buffer)) {
        result = Buffer.allocUnsafe(array.length);
    }
    else {
        result = new Uint8Array(array.length);
    }
    result.set(array);
    return result;
}
class LruNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
    static alloc(key, value) {
        const node = nodePool.pop();
        if (node) {
            node.key = key;
            node.value = value;
            return node;
        }
        return new LruNode(key, value);
    }
    static free(node) {
        node.prev = null;
        node.next = null;
        node.key = '';
        node.value = null;
        nodePool.push(node);
    }
}
class Lru {
    constructor(capacity) {
        this.capacity = capacity;
        this.head = null;
        this.tail = null;
        if (capacity < 1) {
            throw new Error('You can not create a no-op cache :-(');
        }
        this.size = 0;
    }
    put(node) {
        node.prev = null;
        node.next = this.head;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
        if (this.size < this.capacity) {
            ++this.size;
            return void 0;
        }
        const currentTail = this.tail;
        const newTail = currentTail.prev;
        if (newTail) {
            newTail.next = null;
        }
        currentTail.prev = null;
        this.tail = newTail;
        return currentTail;
    }
    refresh(node) {
        if (node == this.head) {
            return;
        }
        if (!this.head) {
            throw new Error('LRU must not be empty when refreshing');
        }
        const prev = node.prev;
        const next = node.next;
        if (prev != null) {
            prev.next = next;
        }
        if (next != null) {
            next.prev = prev;
        }
        if (node == this.tail) {
            this.tail = prev;
        }
        node.prev = null;
        node.next = this.head;
        this.head.prev = node;
        this.head = node;
    }
    purge() {
        this.head = this.tail = null;
        this.size = 0;
    }
}
class LruContentCache {
    constructor(capacity) {
        this.hashing = new Map();
        this.lru = new Lru(capacity);
    }
    putCache(hash, data, needCopy) {
        let node = this.hashing.get(hash);
        if (node) {
            this.lru.refresh(node);
            return;
        }
        if (needCopy) {
            data = copyContent(data);
        }
        node = LruNode.alloc(hash, data);
        const evicted = this.lru.put(node);
        if (evicted) {
            this.hashing.delete(evicted.key);
            LruNode.free(evicted);
        }
        this.hashing.set(hash, node);
        return;
    }
    getCache(hash) {
        const node = this.hashing.get(hash);
        if (node && node.value) {
            this.lru.refresh(node);
            return node.value;
        }
        return void 0;
    }
    purge() {
        this.hashing.clear();
    }
}
exports.LruContentCache = LruContentCache;
exports.DEFAULT_CONTENT_CACHE = new LruContentCache(2048);
