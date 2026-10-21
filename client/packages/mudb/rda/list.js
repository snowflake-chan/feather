"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRDAList = exports.MuRDAListStore = exports.MuRDAListStoreElement = void 0;
const array_1 = require("../schema/array");
const struct_1 = require("../schema/struct");
const sorted_array_1 = require("../schema/sorted-array");
const schema_1 = require("../schema");
const _id_1 = require("./_id");
function compareKey(a, b) {
    return a.key < b.key ? -1 : (a.key > b.key ? 1 : (a.id - b.id));
}
function compareNum(a, b) {
    return a - b;
}
class MuRDAListStoreElement {
    constructor(id, deleted, key, value) {
        this.id = id;
        this.deleted = deleted;
        this.key = key;
        this.value = value;
    }
}
exports.MuRDAListStoreElement = MuRDAListStoreElement;
class MuRDAListStore {
    _rebuildListIndex() {
        const list = this.listIndex;
        list.length = 0;
        const idIndex = this.idIndex;
        const ids = Object.keys(idIndex);
        for (let i = 0; i < ids.length; ++i) {
            const element = idIndex[ids[i]];
            if (!element.deleted) {
                list.push(element);
            }
        }
        list.sort(compareKey);
        let ptr = 0;
        for (let i = 0; i < list.length;) {
            const node = list[i++];
            list[ptr++] = node;
            while (i < list.length && list[i].key === node.key) {
                ++i;
            }
        }
        list.length = ptr;
    }
    constructor(elements) {
        this.idIndex = {};
        this.listIndex = [];
        const idIndex = this.idIndex;
        for (let i = 0; i < elements.length; ++i) {
            const element = elements[i];
            idIndex[element.id] = element;
        }
        this._rebuildListIndex();
    }
    state(rda, out) {
        const stateSchema = rda.valueRDA.stateSchema;
        const listIndex = this.listIndex;
        while (out.length > listIndex.length) {
            stateSchema.free(out.pop());
        }
        while (out.length < listIndex.length) {
            out.push(stateSchema.alloc());
        }
        for (let i = 0; i < listIndex.length; ++i) {
            out[i] = listIndex[i].value.state(rda.valueRDA, out[i]);
        }
        return out;
    }
    apply(rda, action) {
        const { upserts, deletes, undeletes, moves, updates, } = action;
        const idIndex = this.idIndex;
        for (let i = 0; i < upserts.length; ++i) {
            const upsert = upserts[i];
            const prev = idIndex[upsert.id];
            if (prev) {
                prev.deleted = upsert.deleted;
                prev.key = upsert.key;
                prev.value.free(rda.valueRDA);
                prev.value = rda.valueRDA.parse(upsert.value);
            }
            else {
                const element = new MuRDAListStoreElement(upsert.id, upsert.deleted, upsert.key, rda.valueRDA.parse(upsert.value));
                idIndex[element.id] = element;
            }
        }
        for (let i = 0; i < deletes.length; ++i) {
            const prev = idIndex[deletes[i]];
            if (prev && !prev.deleted) {
                prev.deleted = true;
            }
        }
        for (let i = 0; i < undeletes.length; ++i) {
            const prev = idIndex[undeletes[i]];
            if (prev && prev.deleted) {
                prev.deleted = false;
            }
        }
        for (let i = 0; i < moves.length; ++i) {
            const { id, key } = moves[i];
            const prev = idIndex[id];
            if (prev) {
                prev.key = key;
            }
        }
        for (let i = 0; i < updates.length; ++i) {
            const update = updates[i];
            const prev = idIndex[update.id];
            if (prev) {
                prev.value.apply(rda.valueRDA, update.action);
            }
        }
        if (upserts.length > 0 ||
            deletes.length > 0 ||
            undeletes.length > 0 ||
            moves.length > 0) {
            this._rebuildListIndex();
        }
        return true;
    }
    inverse(rda, action) {
        const result = rda.actionSchema.alloc();
        const { upserts, deletes, undeletes, moves, updates, } = action;
        const idIndex = this.idIndex;
        for (let i = 0; i < upserts.length; ++i) {
            const upsert = upserts[i];
            const prev = idIndex[upsert.id];
            if (prev) {
                const inverseUpsert = rda.storeElementSchema.alloc();
                inverseUpsert.id = prev.id;
                inverseUpsert.deleted = prev.deleted;
                inverseUpsert.key = prev.key;
                inverseUpsert.value = prev.value.serialize(rda.valueRDA, inverseUpsert.value);
                result.upserts.push(inverseUpsert);
            }
            else {
                const inverseUpsert = rda.storeElementSchema.clone(rda.storeElementSchema.identity);
                inverseUpsert.id = upsert.id;
                result.upserts.push(inverseUpsert);
            }
        }
        result.upserts.sort(rda.storeSchema.compare);
        for (let i = 0; i < deletes.length; ++i) {
            const id = deletes[i];
            const prev = idIndex[id];
            if (prev && !prev.deleted) {
                result.undeletes.push(id);
            }
        }
        result.undeletes.sort(compareNum);
        for (let i = 0; i < undeletes.length; ++i) {
            const id = undeletes[i];
            const prev = idIndex[id];
            if (prev && prev.deleted) {
                result.deletes.push(id);
            }
        }
        result.deletes.sort(compareNum);
        for (let i = moves.length - 1; i >= moves.length; --i) {
            const { id, key } = moves[i];
            const prev = idIndex[id];
            if (prev && prev.key !== key) {
                const inverseMove = rda.moveActionSchema.alloc();
                inverseMove.id = id;
                inverseMove.key = prev.key;
            }
        }
        for (let i = updates.length - 1; i >= 0; --i) {
            const update = updates[i];
            const prev = idIndex[update.id];
            if (prev) {
                const inverseUpdate = rda.updateActionSchema.alloc();
                inverseUpdate.id = update.id;
                rda.valueRDA.actionSchema.free(inverseUpdate.action);
                inverseUpdate.action = prev.value.inverse(rda.valueRDA, update.action);
                result.updates.push(inverseUpdate);
            }
        }
        return result;
    }
    serialize(rda, out) {
        const idIndex = this.idIndex;
        const ids = Object.keys(idIndex);
        while (out.length < ids.length) {
            out.push(rda.storeElementSchema.alloc());
        }
        while (ids.length < out.length) {
            rda.storeElementSchema.free(out.pop());
        }
        for (let i = 0; i < ids.length; ++i) {
            const element = idIndex[ids[i]];
            const store = out[i];
            store.id = element.id;
            store.key = element.key;
            store.deleted = element.deleted;
            store.value = element.value.serialize(rda.valueRDA, store.value);
        }
        return out;
    }
    free(rda) {
        const ids = Object.keys(this.idIndex);
        for (let i = 0; i < ids.length; ++i) {
            const node = this.idIndex[ids[i]];
            node.value.free(rda.valueRDA);
        }
        this.idIndex = {};
        this.listIndex.length = 0;
    }
    genId(upserts) {
        let shift = 0;
        searchLoop: while (true) {
            shift = Math.min(30, shift + 7);
            const id = (Math.random() * (1 << shift)) >>> 0;
            for (let i = 0; i < upserts.length; ++i) {
                if (upserts[i].id === id) {
                    continue searchLoop;
                }
            }
            if (!this.idIndex[id]) {
                return id;
            }
        }
    }
}
exports.MuRDAListStore = MuRDAListStore;
class MuRDAList {
    _dispatchSplice(start_, deleteCount_, items) {
        const result = this.actionSchema.alloc();
        const list = this._savedStore.listIndex;
        const start = Math.max(0, Math.min(list.length, start_ | 0));
        const end = Math.min(list.length, start + Math.max(0, (deleteCount_ | 0)));
        for (let i = start; i < end; ++i) {
            result.deletes.push(list[i].id);
        }
        if (items.length > 0) {
            const startKey = start - 1 >= 0 ? list[start - 1].key : _id_1.ID_MIN;
            const endKey = end < list.length ? list[end].key : _id_1.ID_MAX;
            const keys = (0, _id_1.allocIds)(startKey, endKey, items.length);
            for (let i = 0; i < items.length; ++i) {
                const upsert = this.storeElementSchema.alloc();
                upsert.id = this._savedStore.genId(result.upserts);
                upsert.key = keys[i];
                upsert.deleted = false;
                const store = this.valueRDA.createStore(items[i]);
                upsert.value = store.serialize(this.valueRDA, upsert.value);
                store.free(this.valueRDA);
                result.upserts.push(upsert);
            }
        }
        return result;
    }
    constructor(valueRDA) {
        this._savedStore = null;
        this._savedElement = null;
        this._savedAction = null;
        this._savedUpdate = null;
        this._dispatchers = {
            update: (index) => {
                const list = this._savedStore.listIndex;
                if ((index === (index | 0)) && 0 <= index && index < list.length) {
                    const element = list[index];
                    if (element) {
                        this._savedElement = element.value;
                        const action = this._savedAction = this.actionSchema.clone(this.actionSchema.identity);
                        const update = this._savedUpdate = this.updateActionSchema.alloc();
                        update.id = element.id;
                        this.valueRDA.actionSchema.free(update.action);
                        action.updates.push(update);
                        return this._updateDispatcher;
                    }
                }
                return this._noopDispatcher;
            },
            push: (...elements) => this._dispatchSplice(this._savedStore.listIndex.length, 0, elements),
            pop: (count = 1) => this._dispatchSplice(Math.max(this._savedStore.listIndex.length - count), count, []),
            unshift: (...elements) => this._dispatchSplice(0, 0, elements),
            shift: (count = 1) => this._dispatchSplice(0, count, []),
            splice: (start, deleteCount = 0, ...elements) => this._dispatchSplice(start, deleteCount, elements),
            clear: () => this._dispatchSplice(0, this._savedStore.listIndex.length, []),
            reset: (elements) => this._dispatchSplice(0, this._savedStore.listIndex.length, elements),
            swap: (...cycle) => {
                const result = this.actionSchema.alloc();
                const list = this._savedStore.listIndex;
                for (let i = 0; i < cycle.length; ++i) {
                    if (!list[cycle[i]]) {
                        return result;
                    }
                }
                for (let i = 0; i < cycle.length; ++i) {
                    const a = list[cycle[i]];
                    const b = list[cycle[(i + 1) % cycle.length]];
                    const move = this.moveActionSchema.alloc();
                    move.id = a.id;
                    move.key = b.key;
                    result.moves.push(move);
                }
                return result;
            },
            reverse: () => {
                const list = this._savedStore.listIndex;
                const result = this.actionSchema.alloc();
                for (let i = 0; i < list.length; ++i) {
                    const move = this.moveActionSchema.alloc();
                    move.id = list[i].id;
                    move.key = list[list.length - 1 - i].key;
                    result.moves.push(move);
                }
                return result;
            },
            sort: (compare) => {
                const list = this._savedStore.listIndex;
                const tagged = list.map((element) => {
                    return {
                        element: element,
                        state: element.value.state(this.valueRDA, this.valueRDA.stateSchema.alloc()),
                    };
                });
                tagged.sort((a, b) => compare(a.state, b.state));
                const result = this.actionSchema.alloc();
                for (let i = 0; i < tagged.length; ++i) {
                    const a = list[i];
                    const b = tagged[i].element;
                    if (a !== b) {
                        const move = this.moveActionSchema.alloc();
                        move.id = b.id;
                        move.key = a.key;
                        result.moves.push(move);
                    }
                    this.valueRDA.stateSchema.free(tagged[i].state);
                }
                return result;
            },
        };
        this.action = (store) => {
            this._savedStore = store;
            return this._dispatchers;
        };
        this.valueRDA = valueRDA;
        this.stateSchema = new array_1.MuArray(valueRDA.stateSchema, Infinity);
        this.storeElementSchema = new struct_1.MuStruct({
            id: new schema_1.MuVarint(),
            deleted: new schema_1.MuBoolean(true),
            key: new schema_1.MuASCII(),
            value: valueRDA.storeSchema,
        });
        this.storeSchema = new sorted_array_1.MuSortedArray(this.storeElementSchema, Infinity, compareKey);
        this.updateActionSchema = new struct_1.MuStruct({
            id: new schema_1.MuVarint(),
            action: valueRDA.actionSchema,
        });
        this.moveActionSchema = new struct_1.MuStruct({
            id: new schema_1.MuVarint(),
            key: new schema_1.MuASCII(),
        });
        const actionSchema = this.actionSchema = new struct_1.MuStruct({
            upserts: this.storeSchema,
            deletes: new sorted_array_1.MuSortedArray(new schema_1.MuVarint(), Infinity, compareNum),
            undeletes: new sorted_array_1.MuSortedArray(new schema_1.MuVarint(), Infinity, compareNum),
            moves: new array_1.MuArray(this.moveActionSchema, Infinity),
            updates: new array_1.MuArray(this.updateActionSchema, Infinity),
        });
        this.actionMeta = {
            type: 'store',
            action: {
                type: 'table',
                table: {
                    push: { type: 'unit' },
                    pop: { type: 'unit' },
                    shift: { type: 'unit' },
                    unshift: { type: 'unit' },
                    splice: { type: 'unit' },
                    clear: { type: 'unit' },
                    reset: { type: 'unit' },
                    swap: { type: 'unit' },
                    reverse: { type: 'unit' },
                    sort: { type: 'unit' },
                    update: {
                        type: 'partial',
                        action: valueRDA.actionMeta.type === 'store'
                            ? valueRDA.actionMeta.action
                            : valueRDA.actionMeta,
                    },
                },
            },
        };
        function generateNoop(meta) {
            if (meta.type === 'unit') {
                return () => actionSchema.clone(actionSchema.identity);
            }
            else if (meta.type === 'partial') {
                const partial = generateNoop(meta.action);
                return () => partial;
            }
            else if (meta.type === 'table') {
                const table = {};
                const ids = Object.keys(meta.table);
                for (let i = 0; i < ids.length; ++i) {
                    table[ids[i]] = generateNoop(meta.table[ids[i]]);
                }
                return table;
            }
            return {};
        }
        this._noopDispatcher = generateNoop(valueRDA.action.type === 'store' ? valueRDA.action.action : valueRDA.action);
        const self = this;
        function wrapPartial(root, dispatcher) {
            const savedPartial = { data: null };
            function wrapPartialRec(meta, index) {
                if (meta.type === 'unit') {
                    return (new Function('rda', 'saved', `return function () { rda._savedUpdate.action = saved.data${index}.apply(null, arguments); return rda._savedAction; }`))(self, savedPartial);
                }
                else if (meta.type === 'table') {
                    const result = {};
                    const keys = Object.keys(meta.table);
                    for (let i = 0; i < keys.length; ++i) {
                        const key = keys[i];
                        result[key] = wrapPartialRec(meta.table[key], `${index}["${key}"]`);
                    }
                    return result;
                }
                else if (meta.type === 'partial') {
                    return wrapPartial(meta.action, (new Function('saved', `return function () { return saved.data${index}.apply(null, arguments); }`))(savedPartial));
                }
                return {};
            }
            return (new Function('savedPartial', 'dispatch', 'wrapped', `return function () { savedPartial.data = dispatch.apply(null, arguments); return wrapped; }`))(savedPartial, dispatcher, wrapPartialRec(root, ''));
        }
        function wrapAction(meta, dispatcher) {
            if (meta.type === 'unit') {
                return function (...args) {
                    self._savedUpdate.action = dispatcher.apply(null, args);
                    return self._savedAction;
                };
            }
            else if (meta.type === 'table') {
                const result = {};
                const keys = Object.keys(meta.table);
                for (let i = 0; i < keys.length; ++i) {
                    const key = keys[i];
                    result[key] = wrapAction(meta.table[key], dispatcher[key]);
                }
                return result;
            }
            else if (meta.type === 'partial') {
                return wrapPartial(meta.action, dispatcher);
            }
            return {};
        }
        function wrapStore(meta, dispatcher, index) {
            if (meta.type === 'unit') {
                return (new Function('rda', 'dispatch', `return function () {
                        rda._savedUpdate.action = dispatch(rda._savedElement)${index}.apply(null, arguments);
                        return rda._savedAction;
                    }`))(self, dispatcher);
            }
            else if (meta.type === 'table') {
                const result = {};
                const keys = Object.keys(meta.table);
                for (let i = 0; i < keys.length; ++i) {
                    const key = keys[i];
                    result[key] = wrapStore(meta.table[key], dispatcher, `${index}["${key}"]`);
                }
                return result;
            }
            else if (meta.type === 'partial') {
                return wrapPartial(meta.action, (new Function('rda', 'dispatch', `return function () { return dispatch(rda._savedElement)${index}.apply(null, arguments); }`))(self, dispatcher));
            }
            return {};
        }
        if (valueRDA.actionMeta.type === 'store') {
            this._updateDispatcher = wrapStore(valueRDA.actionMeta.action, valueRDA.action, '');
        }
        else {
            this._updateDispatcher = wrapAction(valueRDA.actionMeta, valueRDA.action);
        }
        this.emptyStore = new MuRDAListStore([]);
    }
    createStore(initialState) {
        const nodes = new Array(initialState.length);
        const keys = (0, _id_1.allocIds)(_id_1.ID_MIN, _id_1.ID_MAX, initialState.length);
        for (let i = 0; i < nodes.length; ++i) {
            nodes[i] = new MuRDAListStoreElement(i + 1, false, keys[i], this.valueRDA.createStore(initialState[i]));
        }
        return new MuRDAListStore(nodes);
    }
    parse(store) {
        const nodes = new Array(store.length);
        for (let i = 0; i < store.length; ++i) {
            const element = store[i];
            nodes[i] = new MuRDAListStoreElement(element.id, element.deleted, element.key, this.valueRDA.parse(element.value));
        }
        return new MuRDAListStore(nodes);
    }
}
exports.MuRDAList = MuRDAList;
//# sourceMappingURL=list.js.map