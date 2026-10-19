"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRDAMap = exports.MuRDAMapStore = exports.MuRDAMapStoreElement = void 0;
const dictionary_1 = require("../schema/dictionary");
const struct_1 = require("../schema/struct");
const union_1 = require("../schema/union");
const sorted_array_1 = require("../schema/sorted-array");
const void_1 = require("../schema/void");
const varint_1 = require("../schema/varint");
const boolean_1 = require("../schema/boolean");
const schema_1 = require("../schema");
function compareKey(a, b) {
    return a < b ? -1 : (b < a ? 1 : 0);
}
function compareStoreElements(a, b) {
    return (a.sequence - b.sequence ||
        a.id - b.id);
}
function compareNum(a, b) {
    return a - b;
}
class MuRDAMapStoreElement {
    constructor(id, sequence, deleted, key, value) {
        this.id = id;
        this.sequence = sequence;
        this.deleted = deleted;
        this.key = key;
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}
exports.MuRDAMapStoreElement = MuRDAMapStoreElement;
class MuRDAMapStore {
    constructor(elements) {
        this.keyIndex = {};
        this.idIndex = {};
        const { idIndex } = this;
        for (let i = 0; i < elements.length; ++i) {
            const element = elements[i];
            const id = element.id;
            idIndex[id] = element;
            this._insertElement(element);
        }
    }
    state(rda, out) {
        const keyIndex = this.keyIndex;
        const outKeys = Object.keys(out);
        for (let i = 0; i < outKeys.length; ++i) {
            const key = outKeys[i];
            const cur = keyIndex[key];
            if (!cur || cur.deleted) {
                rda.valueRDA.stateSchema.free(out[key]);
                delete out[key];
            }
        }
        const keys = Object.keys(keyIndex);
        const valueRDA = rda.valueRDA;
        const valueSchema = valueRDA.stateSchema;
        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            const final = keyIndex[key];
            if (!final.deleted) {
                out[key] = final.value.state(valueRDA, out[key] || valueSchema.alloc());
            }
        }
        return out;
    }
    _moveElement(element, key) {
        if (key === element.key) {
            return;
        }
        const { next, prev, sequence } = element;
        if (this.keyIndex[element.key] === element) {
            if (next) {
                this.keyIndex[element.key] = next;
                if (next.sequence >= sequence) {
                    next.deleted = false;
                }
            }
            else {
                delete this.keyIndex[element.key];
            }
        }
        if (next) {
            next.prev = prev;
        }
        if (prev) {
            prev.next = next;
        }
        element.next = element.prev = null;
        element.key = key;
        this._insertElement(element);
    }
    _insertElement(element) {
        const key = element.key;
        const head = this.keyIndex[key];
        if (head) {
            if (compareStoreElements(head, element) < 0) {
                element.next = head;
                head.prev = element;
                head.deleted = true;
                this.keyIndex[key] = element;
            }
            else {
                let prev = head;
                while (prev) {
                    const next = prev.next;
                    if (!next) {
                        prev.next = element;
                        element.prev = prev;
                        break;
                    }
                    else if (compareStoreElements(next, element) < 0) {
                        prev.next = element;
                        next.prev = element;
                        element.next = next;
                        element.prev = prev;
                        break;
                    }
                    prev = next;
                }
            }
        }
        else {
            this.keyIndex[key] = element;
        }
    }
    _applyUpsert(valueRDA, upsertAction) {
        const prev = this.idIndex[upsertAction.id];
        if (prev) {
            prev.id = upsertAction.id;
            prev.deleted = upsertAction.deleted;
            prev.sequence = upsertAction.sequence;
            prev.value.free(valueRDA);
            prev.value = valueRDA.parse(upsertAction.value);
            this._moveElement(prev, upsertAction.key);
        }
        else {
            const element = new MuRDAMapStoreElement(upsertAction.id, upsertAction.sequence, upsertAction.deleted, upsertAction.key, valueRDA.parse(upsertAction.value));
            this.idIndex[element.id] = element;
            this._insertElement(element);
        }
    }
    apply(rda, action) {
        const { type, data } = action;
        if (type === 'reset') {
            const { upserts, deletes, undeletes, sequenceIds, sequenceVals } = data;
            for (let i = 0; i < upserts.length; ++i) {
                this._applyUpsert(rda.valueRDA, upserts[i]);
            }
            for (let i = 0; i < deletes.length; ++i) {
                const element = this.idIndex[deletes[i]];
                if (element) {
                    element.deleted = true;
                }
            }
            for (let i = 0; i < undeletes.length; ++i) {
                const element = this.idIndex[undeletes[i]];
                if (element) {
                    element.deleted = false;
                }
            }
            if (sequenceVals.length === sequenceIds.length) {
                for (let i = 0; i < sequenceIds.length; ++i) {
                    const element = this.idIndex[sequenceIds[i]];
                    if (element) {
                        element.sequence = sequenceVals[i];
                    }
                }
            }
            return true;
        }
        else if (type === 'upsert') {
            const upsertAction = data;
            this._applyUpsert(rda.valueRDA, upsertAction);
            return true;
        }
        else if (type === 'update') {
            const updateAction = data;
            const element = this.idIndex[updateAction.id];
            if (!element) {
                return false;
            }
            return element.value.apply(rda.valueRDA, updateAction.action);
        }
        else if (type === 'move') {
            const moveAction = data;
            const element = this.idIndex[moveAction.id];
            if (!element) {
                return false;
            }
            element.sequence = moveAction.sequence;
            this._moveElement(element, moveAction.key);
            return true;
        }
        else if (type === 'setDeleted') {
            const setDeletedAction = data;
            const element = this.idIndex[setDeletedAction.id];
            if (!element) {
                return false;
            }
            element.deleted = setDeletedAction.deleted;
            element.sequence = setDeletedAction.sequence;
            return true;
        }
        else if (type === 'noop') {
            return true;
        }
        return false;
    }
    inverse(rda, action) {
        const { type, data } = action;
        const idIndex = this.idIndex;
        const result = rda.actionSchema.alloc();
        result.type = 'noop';
        result.data = undefined;
        if (type === 'reset') {
            result.type = 'reset';
            const { upserts, deletes, undeletes, sequenceIds, sequenceVals } = data;
            const inverseReset = result.data = rda.resetActionSchema.clone(rda.resetActionSchema.identity);
            const inverseUndelete = inverseReset.undeletes;
            const inverseDelete = inverseReset.deletes;
            const inverseUpsert = inverseReset.upserts;
            const invserseSequenceIds = inverseReset.sequenceIds;
            const invserseSequenceVals = inverseReset.sequenceVals;
            for (let i = 0; i < upserts.length; ++i) {
                const upsertAction = upserts[i];
                const id = upsertAction.id;
                const prev = this.idIndex[id];
                if (prev) {
                    const inverseUpsertAction = rda.upsertActionSchema.alloc();
                    inverseUpsertAction.id = id;
                    inverseUpsertAction.key = prev.key;
                    inverseUpsertAction.deleted = prev.deleted;
                    inverseUpsertAction.sequence = prev.sequence;
                    inverseUpsertAction.value = prev.value.serialize(rda.valueRDA, inverseUpsertAction.value);
                    inverseUpsert.push(inverseUpsertAction);
                }
                else {
                    inverseDelete.push(id);
                    invserseSequenceIds.push(id);
                    invserseSequenceVals.push(0);
                }
            }
            inverseUpsert.sort(rda.storeSchema.compare);
            for (let i = 0; i < deletes.length; ++i) {
                const id = deletes[i];
                const element = this.idIndex[id];
                if (element && !element.deleted) {
                    inverseUndelete.push(id);
                }
            }
            inverseUndelete.sort(compareNum);
            for (let i = 0; i < undeletes.length; ++i) {
                const id = undeletes[i];
                const element = this.idIndex[id];
                if (element && element.deleted) {
                    inverseDelete.push(id);
                }
            }
            inverseDelete.sort(compareNum);
            for (let i = 0; i < sequenceIds.length; ++i) {
                const id = sequenceIds[i];
                const element = this.idIndex[id];
                if (element && element.sequence !== sequenceVals[i]) {
                    invserseSequenceIds.push(id);
                    invserseSequenceVals.push(element.sequence);
                }
            }
        }
        else if (type === 'upsert') {
            const upsertAction = data;
            const id = upsertAction.id;
            const prev = this.idIndex[id];
            if (prev) {
                result.type = 'upsert';
                const inverseUpsertAction = result.data = rda.upsertActionSchema.alloc();
                inverseUpsertAction.id = id;
                inverseUpsertAction.key = prev.key;
                inverseUpsertAction.deleted = prev.deleted;
                inverseUpsertAction.sequence = prev.sequence;
                inverseUpsertAction.value = prev.value.serialize(rda.valueRDA, inverseUpsertAction.value);
            }
            else {
                result.type = 'setDeleted';
                result.data = rda.setDeletedActionSchema.alloc();
                result.data.id = id;
                result.data.deleted = true;
                result.data.sequence = 0;
            }
        }
        else if (type === 'update') {
            const updateAction = data;
            const id = updateAction.id;
            const prev = idIndex[id];
            if (prev) {
                result.type = 'update';
                const inverseUpdate = result.data = rda.updateActionSchema.alloc();
                inverseUpdate.id = id;
                inverseUpdate.action = prev.value.inverse(rda.valueRDA, updateAction.action);
            }
        }
        else if (type === 'move') {
            const moveAction = data;
            const id = moveAction.id;
            const prev = idIndex[id];
            if (prev) {
                result.type = 'move';
                const inverseMove = result.data = rda.moveActionSchema.alloc();
                inverseMove.id = id;
                inverseMove.key = prev.key;
                inverseMove.sequence = prev.sequence;
            }
        }
        else if (type === 'setDeleted') {
            result.type = 'setDeleted';
            const inverseDelete = result.data = rda.setDeletedActionSchema.alloc();
            const setDeletedAction = data;
            const id = setDeletedAction.id;
            const prev = idIndex[id];
            inverseDelete.id = id;
            if (prev) {
                inverseDelete.deleted = prev.deleted;
                inverseDelete.sequence = prev.sequence;
            }
            else {
                inverseDelete.deleted = true;
                inverseDelete.sequence = 0;
            }
        }
        return result;
    }
    serialize(rda, result) {
        const idIndex = this.idIndex;
        const ids = Object.keys(idIndex);
        while (result.length > ids.length) {
            const element = result.pop();
            if (element) {
                rda.storeElementSchema.free(element);
            }
        }
        while (result.length < ids.length) {
            result.push(rda.storeElementSchema.alloc());
        }
        for (let i = 0; i < ids.length; ++i) {
            const element = idIndex[ids[i]];
            const store = result[i];
            store.id = element.id;
            store.key = element.key;
            store.sequence = element.sequence;
            store.deleted = element.deleted;
            store.value = element.value.serialize(rda.valueRDA, store.value);
        }
        return result;
    }
    free(rda) {
        const idIndex = this.idIndex;
        const ids = Object.keys(idIndex);
        const valueRDA = rda.valueRDA;
        for (let i = 0; i < ids.length; ++i) {
            const element = idIndex[ids[i]];
            element.value.free(valueRDA);
        }
        this.idIndex = {};
        this.keyIndex = {};
    }
    genId() {
        let shift = 0;
        while (true) {
            shift = Math.max(30, shift + 7);
            const id = (Math.random() * (1 << shift)) >>> 0;
            if (!this.idIndex[id]) {
                return id;
            }
        }
    }
}
exports.MuRDAMapStore = MuRDAMapStore;
class MuRDAMap {
    _constructUpdateDispatcher() {
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
        function wrapStore(meta, dispatcher, index) {
            if (meta.type === 'unit') {
                return (new Function('rda', 'dispatch', `return function () { rda._savedUpdate.action = dispatch(rda._savedElement)${index}.apply(null, arguments); return rda._savedAction; }`))(self, dispatcher);
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
        if (this.valueRDA.actionMeta.type === 'store') {
            return wrapStore(this.valueRDA.actionMeta.action, this.valueRDA.action, '');
        }
        else {
            return wrapAction(this.valueRDA.actionMeta, this.valueRDA.action);
        }
    }
    _constructNoopDispatcher() {
        const self = this;
        function mockDispatcher(meta) {
            if (meta.type === 'unit') {
                return function () { return self._savedAction; };
            }
            else if (meta.type === 'partial') {
                const child = mockDispatcher(meta.action);
                return function () { return child; };
            }
            else if (meta.type === 'table') {
                const result = {};
                const keys = Object.keys(meta.table);
                for (let i = 0; i < keys.length; ++i) {
                    const key = keys[i];
                    result[key] = mockDispatcher(meta.table[key]);
                }
                return result;
            }
            return {};
        }
        if (this.valueRDA.actionMeta.type === 'store') {
            return mockDispatcher(this.valueRDA.actionMeta.action);
        }
        else {
            return mockDispatcher(this.valueRDA.actionMeta);
        }
    }
    constructor(keySchema, valueRDA) {
        this._savedStore = null;
        this._savedElement = null;
        this._savedAction = null;
        this._savedUpdate = null;
        this._updateDispatcher = null;
        this._noopDispatcher = null;
        this._actionDispatchers = {
            set: (key, state) => {
                const result = this.actionSchema.alloc();
                result.type = 'upsert';
                const upsertAction = result.data = this.storeElementSchema.alloc();
                const prev = this._savedStore.keyIndex[key];
                upsertAction.key = key;
                upsertAction.deleted = false;
                const tmp = this.valueRDA.createStore(state);
                upsertAction.value = tmp.serialize(this.valueRDA, upsertAction.value);
                tmp.free(this.valueRDA);
                if (prev) {
                    upsertAction.id = prev.id;
                    upsertAction.sequence = prev.sequence;
                }
                else {
                    upsertAction.id = this._savedStore.genId();
                    upsertAction.sequence = 1;
                }
                return result;
            },
            remove: (key) => {
                const result = this.actionSchema.alloc();
                const prev = this._savedStore.keyIndex[key];
                if (prev && !prev.deleted) {
                    result.type = 'setDeleted';
                    const action = result.data = this.setDeletedActionSchema.alloc();
                    action.id = prev.id;
                    action.deleted = true;
                    action.sequence = prev.sequence;
                }
                else {
                    result.type = 'noop';
                    result.data = undefined;
                }
                return result;
            },
            move: (from, to) => {
                const result = this.actionSchema.alloc();
                const prev = this._savedStore.keyIndex[from];
                if (prev && !prev.deleted) {
                    result.type = 'move';
                    const moveAction = result.data = this.moveActionSchema.alloc();
                    moveAction.id = prev.id;
                    moveAction.key = to;
                    const target = this._savedStore.keyIndex[to];
                    if (target) {
                        moveAction.sequence = target.sequence + 1;
                    }
                    else if (prev.next) {
                        moveAction.sequence = prev.next.sequence + 1;
                    }
                    else {
                        moveAction.sequence = 1;
                    }
                }
                else {
                    result.type = 'noop';
                    result.data = undefined;
                }
                return result;
            },
            clear: () => {
                const result = this.actionSchema.alloc();
                result.type = 'reset';
                const resetAction = result.data = this.resetActionSchema.alloc();
                const keys = Object.keys(this._savedStore.keyIndex);
                for (let i = 0; i < keys.length; ++i) {
                    const prev = this._savedStore.keyIndex[keys[i]];
                    if (!prev || prev.deleted) {
                        continue;
                    }
                    resetAction.deletes.push(prev.id);
                }
                resetAction.deletes.sort(compareNum);
                return result;
            },
            reset: (state) => {
                const result = this.actionSchema.alloc();
                result.type = 'reset';
                const resetAction = result.data = this.resetActionSchema.alloc();
                const keys = Object.keys(state);
                const upsertAction = resetAction.upserts;
                const ids = Object.keys(this._savedStore.idIndex);
                const idConstraint = {};
                for (let i = 0; i < ids.length; ++i) {
                    idConstraint[ids[i]] = true;
                }
                for (let i = 0; i < keys.length; ++i) {
                    const key = keys[i];
                    const upsert = this.storeElementSchema.alloc();
                    upsert.key = key;
                    const tmp = this.valueRDA.createStore(state[key]);
                    upsert.value = tmp.serialize(this.valueRDA, upsert.value);
                    tmp.free(this.valueRDA);
                    upsert.deleted = false;
                    const prev = this._savedStore.keyIndex[key];
                    if (prev) {
                        upsert.id = prev.id;
                        upsert.sequence = prev.sequence;
                    }
                    else {
                        let id = 0;
                        let shift = 0;
                        while (true) {
                            shift = Math.max(30, shift + 7);
                            id = (Math.random() * (1 << shift)) >>> 0;
                            if (!idConstraint[id]) {
                                idConstraint[id] = true;
                                break;
                            }
                        }
                        upsert.id = id;
                        upsert.sequence = 1;
                    }
                    upsertAction.push(upsert);
                }
                upsertAction.sort(this.storeSchema.compare);
                const prevKeys = Object.keys(this._savedStore.keyIndex);
                const deleteActions = resetAction.deletes;
                for (let i = 0; i < prevKeys.length; ++i) {
                    const key = prevKeys[i];
                    if (key in state) {
                        continue;
                    }
                    const prev = this._savedStore.keyIndex[key];
                    if (!prev || prev.deleted) {
                        continue;
                    }
                    deleteActions.push(prev.id);
                }
                deleteActions.sort(compareNum);
                return result;
            },
            update: (key) => {
                const prev = this._savedStore.keyIndex[key];
                this._savedAction = this.actionSchema.alloc();
                if (prev) {
                    this._savedElement = prev.value;
                    this._savedAction.type = 'update';
                    this._savedUpdate = this._savedAction.data = this.updateActionSchema.alloc();
                    this._savedUpdate.id = prev.id;
                    this.valueRDA.actionSchema.free(this._savedUpdate.action);
                    return this._updateDispatcher;
                }
                else {
                    this._savedAction.type = 'noop';
                    this._savedAction.data = undefined;
                    return this._noopDispatcher;
                }
            },
        };
        this.action = (store) => {
            this._savedStore = store;
            return this._actionDispatchers;
        };
        this.keySchema = keySchema;
        this.valueRDA = valueRDA;
        this.stateSchema = new dictionary_1.MuDictionary(valueRDA.stateSchema, Infinity);
        this.storeElementSchema = new struct_1.MuStruct({
            id: new varint_1.MuVarint(0),
            sequence: new varint_1.MuVarint(0),
            deleted: new boolean_1.MuBoolean(true),
            key: keySchema,
            value: valueRDA.storeSchema,
        });
        this.storeSchema = new sorted_array_1.MuSortedArray(this.storeElementSchema, Infinity, function (a, b) {
            return (compareKey(a.key, b.key) ||
                a.sequence - b.sequence ||
                a.id - b.id ||
                (+a.deleted) - (+b.deleted));
        });
        this.resetActionSchema = new struct_1.MuStruct({
            upserts: this.storeSchema,
            deletes: new sorted_array_1.MuSortedArray(new varint_1.MuVarint(), Infinity, compareNum),
            undeletes: new sorted_array_1.MuSortedArray(new varint_1.MuVarint(), Infinity, compareNum),
            sequenceIds: new schema_1.MuArray(new varint_1.MuVarint(), Infinity),
            sequenceVals: new schema_1.MuArray(new varint_1.MuVarint(), Infinity),
        });
        this.upsertActionSchema = this.storeElementSchema;
        this.updateActionSchema = new struct_1.MuStruct({
            id: new varint_1.MuVarint(),
            action: valueRDA.actionSchema,
        });
        this.moveActionSchema = new struct_1.MuStruct({
            id: new varint_1.MuVarint(),
            sequence: new varint_1.MuVarint(),
            key: keySchema,
        });
        this.setDeletedActionSchema = new struct_1.MuStruct({
            id: new varint_1.MuVarint(),
            sequence: new varint_1.MuVarint(),
            deleted: new boolean_1.MuBoolean(false),
        });
        this.actionSchema = new union_1.MuUnion({
            reset: this.resetActionSchema,
            upsert: this.upsertActionSchema,
            update: this.updateActionSchema,
            move: this.moveActionSchema,
            setDeleted: this.setDeletedActionSchema,
            noop: new void_1.MuVoid(),
        });
        this.actionMeta = {
            type: 'store',
            action: {
                type: 'table',
                table: {
                    set: { type: 'unit' },
                    remove: { type: 'unit' },
                    clear: { type: 'unit' },
                    reset: { type: 'unit' },
                    move: { type: 'unit' },
                    update: {
                        type: 'partial',
                        action: valueRDA.actionMeta.type === 'store'
                            ? valueRDA.actionMeta.action
                            : valueRDA.actionMeta,
                    },
                },
            },
        };
        this._updateDispatcher = this._constructUpdateDispatcher();
        this._noopDispatcher = this._constructNoopDispatcher();
        this.emptyStore = new MuRDAMapStore([]);
    }
    createStore(initialState) {
        const keys = Object.keys(initialState);
        if (typeof this.keySchema.identity === 'number') {
            for (let i = 0; i < keys.length; ++i) {
                const k = +keys[i];
                if (k !== k) {
                    throw new Error(`invalid key ${keys[i]}`);
                }
                keys[i] = k;
            }
        }
        const elements = new Array(keys.length);
        let idCounter = 1;
        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            const value = initialState[key];
            elements[i] = new MuRDAMapStoreElement(idCounter++, 1, false, key, this.valueRDA.createStore(value));
        }
        return new MuRDAMapStore(elements);
    }
    parse(store) {
        const elements = new Array(store.length);
        const valueRDA = this.valueRDA;
        for (let i = 0; i < elements.length; ++i) {
            const e = store[i];
            elements[i] = new MuRDAMapStoreElement(e.id, e.sequence, e.deleted, e.key, valueRDA.parse(e.value));
        }
        return new MuRDAMapStore(elements);
    }
}
exports.MuRDAMap = MuRDAMap;
//# sourceMappingURL=map.js.map