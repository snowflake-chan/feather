"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRDAStruct = exports.MuRDAStructStore = void 0;
const struct_1 = require("../schema/struct");
const union_1 = require("../schema/union");
class MuRDAStructStore {
    constructor(stores) {
        this.stores = stores;
    }
    state(rda, out) {
        const ids = Object.keys(this.stores);
        for (let i = 0; i < ids.length; ++i) {
            const id = ids[i];
            out[id] = this.stores[id].state(rda.rdas[id], out[id]);
        }
        return out;
    }
    apply(rda, action) {
        return this.stores[action.type].apply(rda.rdas[action.type], action.data);
    }
    inverse(rda, action) {
        const result = rda.actionSchema.alloc();
        result.type = action.type;
        const x = (result.data = this.stores[action.type].inverse(rda.rdas[action.type], action.data));
        return result;
    }
    serialize(rda, out) {
        const ids = Object.keys(this.stores);
        for (let i = 0; i < ids.length; ++i) {
            const id = ids[i];
            out[id] = this.stores[id].serialize(rda.rdas[id], out[id]);
        }
        return out;
    }
    free(rda) {
        const ids = Object.keys(this.stores);
        for (let i = 0; i < ids.length; ++i) {
            const id = ids[i];
            this.stores[id].free(rda.rdas[id]);
        }
    }
}
exports.MuRDAStructStore = MuRDAStructStore;
class MuRDAStruct {
    _wrapDispatch(id, rda) {
        const self = this;
        function wrapPartial(root, dispatch) {
            const savedPartial = { data: null };
            function wrapPartialRec(meta, index) {
                if (meta.type === 'unit') {
                    return new Function('rda', 'partial', `/* ${id}:${index} */ return function() { var result = rda.actionSchema.alloc(); result.type = "${id}"; result.data = partial.data${index}.apply(null, arguments); return result; }`)(self, savedPartial);
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
                    return wrapPartial(meta.action, new Function('partial', `/* ${id}:${index} */ return function () { return partial.data${index}.apply(null, arguments); }`)(savedPartial));
                }
                return {};
            }
            return new Function('dispatch', 'partial', 'wrappedDispatch', `/* ${id} */ return function () { partial.data = dispatch.apply(null, arguments); return wrappedDispatch; }`)(dispatch, savedPartial, wrapPartialRec(root, ''));
        }
        function wrapAction(meta, dispatch) {
            if (meta.type === 'unit') {
                return function (...args) {
                    const result = self.actionSchema.alloc();
                    result.type = id;
                    result.data = dispatch.apply(null, args);
                    return result;
                };
            }
            else if (meta.type === 'table') {
                const result = {};
                const ids = Object.keys(meta.table);
                for (let i = 0; i < ids.length; ++i) {
                    const key = ids[i];
                    result[key] = wrapAction(meta.table[key], dispatch);
                }
                return result;
            }
            else if (meta.type === 'partial') {
                return wrapPartial(meta.action, dispatch);
            }
            return {};
        }
        function wrapStore(meta, index) {
            if (meta.type === 'unit') {
                return new Function('rda', 'dispatch', `/* ${id}:${index} */ return function() { var result = rda.actionSchema.alloc(); result.type = "${id}"; result.data = dispatch(rda._saveStore.stores["${id}"])${index}.apply(null, arguments); return result; }`)(self, rda.action);
            }
            else if (meta.type === 'table') {
                const result = {};
                const ids = Object.keys(meta.table);
                for (let i = 0; i < ids.length; ++i) {
                    const key = ids[i];
                    result[key] = wrapStore(meta.table[key], `${index}["${key}"]`);
                }
                return result;
            }
            else if (meta.type === 'partial') {
                return wrapPartial(meta.action, new Function('rda', 'dispatch', `/* ${id}:${index} */ return function() { return dispatch(rda._saveStore.stores["${id}"])${index}.apply(null, arguments); }`)(self, rda.action));
            }
            return {};
        }
        if (rda.actionMeta.type !== 'store') {
            this.actionMeta.action.table[id] = rda.actionMeta;
            return wrapAction(rda.actionMeta, rda.action);
        }
        else {
            this.actionMeta.action.table[id] = rda.actionMeta.action;
            return wrapStore(rda.actionMeta.action, '');
        }
    }
    constructor(spec) {
        this._saveStore = null;
        this.rdas = spec;
        const stateSpec = {};
        const actionSpec = {};
        const storeSpec = {};
        const emptyStores = {};
        const props = Object.keys(spec);
        for (let i = 0; i < props.length; ++i) {
            const prop = props[i];
            const rda = spec[prop];
            stateSpec[prop] = rda.stateSchema;
            actionSpec[prop] = rda.actionSchema;
            storeSpec[prop] = rda.storeSchema;
            emptyStores[prop] = rda.emptyStore;
        }
        this.stateSchema = new struct_1.MuStruct(stateSpec);
        this.actionSchema = new union_1.MuUnion(actionSpec);
        this.storeSchema = new struct_1.MuStruct(storeSpec);
        this.emptyStore = new MuRDAStructStore(emptyStores);
        this.actionMeta = {
            type: 'store',
            action: {
                type: 'table',
                table: {},
            },
        };
        const storeDispatch = {};
        for (let i = 0; i < props.length; ++i) {
            const prop = props[i];
            storeDispatch[prop] = this._wrapDispatch(prop, spec[prop]);
        }
        this.action = ((store) => {
            this._saveStore = store;
            return storeDispatch;
        });
    }
    createStore(state) {
        const stores = {};
        const ids = Object.keys(this.rdas);
        for (let i = 0; i < ids.length; ++i) {
            const id = ids[i];
            stores[id] = this.rdas[id].createStore(state[id]);
        }
        return new MuRDAStructStore(stores);
    }
    parse(store) {
        const stores = {};
        const ids = Object.keys(this.rdas);
        for (let i = 0; i < ids.length; ++i) {
            const id = ids[i];
            stores[id] = this.rdas[id].parse(store[id]);
        }
        return new MuRDAStructStore(stores);
    }
}
exports.MuRDAStruct = MuRDAStruct;
//# sourceMappingURL=struct.js.map