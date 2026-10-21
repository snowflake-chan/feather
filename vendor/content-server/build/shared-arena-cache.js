"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedArenaContentCache = exports.DEFAULT_ARENA_ENTRIES = exports.DEFAULT_ARENA_DATA_BYTES = void 0;
exports.createSharedArenaSpec = createSharedArenaSpec;
exports.readSharedArenaUsage = readSharedArenaUsage;
exports.installSharedContentArena = installSharedContentArena;
const content_cache_1 = require("./content-cache");
const CTRL_BUMP = 0;
const CTRL_COUNT = 1;
const CTRL_REJECTED = 2;
const CTRL_CAPACITY = 3;
const CTRL_WORDS = 8;
const SLOT_STATE = 0;
const SLOT_OFFSET = 4;
const SLOT_LENGTH = 8;
const SLOT_HASH_LENGTH = 12;
const SLOT_HASH = 16;
const SLOT_STATE_EMPTY = 0;
const SLOT_STATE_READY = 2;
const HASH_MAX_BYTES = 56;
const SLOT_BYTES = SLOT_HASH + HASH_MAX_BYTES;
const SLOT_WORDS = SLOT_BYTES / 4;
exports.DEFAULT_ARENA_DATA_BYTES = 64 * 1024 * 1024;
exports.DEFAULT_ARENA_ENTRIES = 16384;
function createSharedArrayBuffer(bytes) {
    return new SharedArrayBuffer(bytes);
}
function createSharedArenaSpec(options = {}) {
    var _a, _b;
    const dataBytes = Math.max(1, Math.floor((_a = options.dataBytes) !== null && _a !== void 0 ? _a : exports.DEFAULT_ARENA_DATA_BYTES));
    const entries = Math.max(1, Math.floor((_b = options.entries) !== null && _b !== void 0 ? _b : exports.DEFAULT_ARENA_ENTRIES));
    const control = createSharedArrayBuffer(CTRL_WORDS * 4);
    const ctrl = new Int32Array(control);
    ctrl[CTRL_CAPACITY] = entries;
    return {
        data: createSharedArrayBuffer(dataBytes),
        index: createSharedArrayBuffer(entries * SLOT_BYTES),
        control,
    };
}
function readSharedArenaUsage(spec) {
    const ctrl = new Int32Array(spec.control);
    const entryCapacity = ctrl[CTRL_CAPACITY] || 0;
    return {
        usedBytes: Atomics.load(ctrl, CTRL_BUMP),
        capacityBytes: spec.data.byteLength,
        entries: Math.min(Atomics.load(ctrl, CTRL_COUNT), entryCapacity),
        entryCapacity,
        rejected: Atomics.load(ctrl, CTRL_REJECTED),
    };
}
function asciiLength(hash) {
    for (let i = 0; i < hash.length; i += 1) {
        if (hash.charCodeAt(i) > 0x7f)
            return -1;
    }
    return hash.length;
}
class SharedArenaContentCache {
    constructor(spec) {
        this._local = new Map();
        this._spec = spec;
        this._data = spec.data;
        this._ctrl = new Int32Array(spec.control);
        this._words = new Int32Array(spec.index);
        this._bytes = new Uint8Array(spec.index);
        this._entryCapacity = this._ctrl[CTRL_CAPACITY] || 0;
    }
    putCache(hash, data, _needCopy) {
        if (this._local.has(hash))
            return;
        const existing = this._findInShared(hash);
        if (existing) {
            this._local.set(hash, existing);
            return;
        }
        const hashLength = asciiLength(hash);
        if (hashLength <= 0 || hashLength > HASH_MAX_BYTES)
            return;
        if (!data || data.length === 0)
            return;
        const offset = this._reserve(data.length);
        if (offset < 0) {
            Atomics.add(this._ctrl, CTRL_REJECTED, 1);
            return;
        }
        const slot = this._claimSlot();
        if (slot < 0) {
            Atomics.add(this._ctrl, CTRL_REJECTED, 1);
            return;
        }
        new Uint8Array(this._data, offset, data.length).set(data);
        const word = slot * SLOT_WORDS;
        const hashBase = slot * SLOT_BYTES + SLOT_HASH;
        Atomics.store(this._words, word + SLOT_OFFSET / 4, offset);
        Atomics.store(this._words, word + SLOT_LENGTH / 4, data.length);
        Atomics.store(this._words, word + SLOT_HASH_LENGTH / 4, hashLength);
        for (let i = 0; i < hashLength; i += 1) {
            this._bytes[hashBase + i] = hash.charCodeAt(i);
        }
        Atomics.store(this._words, word + SLOT_STATE / 4, SLOT_STATE_READY);
        this._local.set(hash, { offset, length: data.length });
    }
    getCache(hash) {
        const local = this._local.get(hash);
        if (local)
            return this._view(local.offset, local.length);
        const shared = this._findInShared(hash);
        if (!shared)
            return undefined;
        this._local.set(hash, shared);
        return this._view(shared.offset, shared.length);
    }
    stats() {
        return Object.assign(Object.assign({}, readSharedArenaUsage(this._spec)), { localEntries: this._local.size });
    }
    _view(offset, length) {
        if (typeof Buffer === 'function' && Uint8Array.isPrototypeOf(Buffer)) {
            return Buffer.from(this._data, offset, length);
        }
        return new Uint8Array(this._data, offset, length);
    }
    _findInShared(hash) {
        const hashLength = asciiLength(hash);
        if (hashLength <= 0 || hashLength > HASH_MAX_BYTES)
            return undefined;
        const count = Math.min(Atomics.load(this._ctrl, CTRL_COUNT), this._entryCapacity);
        for (let slot = 0; slot < count; slot += 1) {
            const word = slot * SLOT_WORDS;
            if (Atomics.load(this._words, word + SLOT_STATE / 4) !== SLOT_STATE_READY)
                continue;
            if (Atomics.load(this._words, word + SLOT_HASH_LENGTH / 4) !== hashLength)
                continue;
            const hashBase = slot * SLOT_BYTES + SLOT_HASH;
            let same = true;
            for (let i = 0; i < hashLength; i += 1) {
                if (this._bytes[hashBase + i] !== hash.charCodeAt(i)) {
                    same = false;
                    break;
                }
            }
            if (!same)
                continue;
            return {
                offset: Atomics.load(this._words, word + SLOT_OFFSET / 4),
                length: Atomics.load(this._words, word + SLOT_LENGTH / 4),
            };
        }
        return undefined;
    }
    _reserve(length) {
        const capacity = this._data.byteLength;
        for (;;) {
            const current = Atomics.load(this._ctrl, CTRL_BUMP);
            if (current + length > capacity)
                return -1;
            if (Atomics.compareExchange(this._ctrl, CTRL_BUMP, current, current + length) === current) {
                return current;
            }
        }
    }
    _claimSlot() {
        for (;;) {
            const current = Atomics.load(this._ctrl, CTRL_COUNT);
            if (current >= this._entryCapacity)
                return -1;
            if (Atomics.compareExchange(this._ctrl, CTRL_COUNT, current, current + 1) === current) {
                return current;
            }
        }
    }
}
exports.SharedArenaContentCache = SharedArenaContentCache;
function installSharedContentArena(spec) {
    const cache = new SharedArenaContentCache(spec);
    (0, content_cache_1.setDefaultContentCache)(cache);
    return cache;
}
