"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRDAUnion = exports.MuRDAUnionStore = void 0;
const union_1 = require("@box/mudb/schema/union");
const void_1 = require("@box/mudb/schema/void");
class MuRDAUnionStore {
    constructor(unionStore) {
        this.unionStore = unionStore;
    }
    state(rda, out) {
        const { type: currentType, data: currentStore } = this.unionStore;
        const currentRDA = rda.rdas[currentType];
        /**
         * out的type与当前store的记录的type不同，先free原有的数据，
         * 再创建当前RDA的stateSchema数据
         */
        if (out.type !== currentType) {
            const originRDA = rda.rdas[out.type];
            originRDA === null || originRDA === void 0 ? void 0 : originRDA.stateSchema.free(out.data);
            out.type = currentType;
            out.data = currentRDA === null || currentRDA === void 0 ? void 0 : currentRDA.stateSchema.alloc();
        }
        if (currentRDA && currentStore) {
            out.data = currentStore.state(currentRDA, out.data);
        }
        return out;
    }
    apply(rda, action) {
        if (action.type === 'noop') {
            return true;
        }
        // set是全量设置额，设置类型相同时，直接应用。类型不同时，生成新的store。
        if (action.type === 'set' && action.data) {
            const { type, data } = action.data;
            if (!type && !data) {
                this.free(rda);
                this.unionStore.type = type;
                this.unionStore.data = undefined;
            }
            else {
                const targetRDA = rda.rdas[type];
                if (!targetRDA) {
                    return false;
                }
                this.free(rda);
                this.unionStore.type = type;
                this.unionStore.data = targetRDA.parse(data);
            }
            return true;
        }
        if (action.type === 'update' &&
            action.data &&
            action.data.type === this.unionStore.type) {
            const targetRDA = rda.rdas[this.unionStore.type];
            if (!targetRDA) {
                return false;
            }
            return this.unionStore.data.apply(targetRDA, action.data.data);
        }
        return false;
    }
    inverse(rda, action) {
        const result = rda.actionSchema.alloc();
        result.type = 'noop';
        result.data = undefined;
        if (action.type === 'set' && action.data) {
            result.type = 'set';
            result.data = this.serialize(rda, rda.storeSchema.alloc());
            return result;
        }
        if (action.type === 'update') {
            const currentRDA = rda.rdas[this.unionStore.type];
            if (!currentRDA ||
                !action.data ||
                action.data.type !== this.unionStore.type) {
                return result;
            }
            result.type = 'update';
            const updateData = rda.updateSchema.alloc();
            updateData.type = action.data.type;
            updateData.data = this.unionStore.data.inverse(currentRDA, action.data.data);
            result.data = updateData;
            return result;
        }
        return result;
    }
    serialize(rda, out) {
        const { type: currentType, data: currentStore } = this.unionStore;
        const currentRDA = rda.rdas[currentType];
        /**
         * out的type与当前store的记录的type不同，先free原有的数据，
         * 再创建当前RDA的storeSchema数据
         */
        if (out.type !== currentType) {
            const originRDA = rda.rdas[out.type];
            originRDA === null || originRDA === void 0 ? void 0 : originRDA.storeSchema.free(out.data);
            out.type = currentType;
            out.data = currentRDA === null || currentRDA === void 0 ? void 0 : currentRDA.storeSchema.alloc();
        }
        if (currentRDA && currentStore) {
            out.data = currentStore.serialize(currentRDA, out.data);
        }
        return out;
    }
    free(rda) {
        const { type: currentType, data: currentStore } = this.unionStore;
        const currentRDA = rda.rdas[currentType];
        if (currentStore && currentRDA) {
            currentStore.free(currentRDA);
        }
    }
}
exports.MuRDAUnionStore = MuRDAUnionStore;
class MuRDAUnion {
    constructor(specs, identityType) {
        /**
         * 缓存当前的store数据（store.unionStore.data）
         * wrapDispatch生成的函数会使用该属性
         */
        this._savedElement = null;
        this.action = (store) => {
            this._savedStore = store;
            return {
                set: (newState) => {
                    const result = this.actionSchema.alloc();
                    result.type = 'set';
                    const setData = this.setSchema.alloc();
                    result.data = setData;
                    // 重置回空状态，可能是inverse set生成的action
                    if (!newState.type && !newState.data) {
                        setData.type = '';
                        setData.data = undefined;
                        return result;
                    }
                    const rda = this.rdas[newState.type];
                    // 没有对应的rda，则free setData，并修改action为noop
                    if (!rda) {
                        this.setSchema.free(setData);
                        result.type = 'noop';
                        result.data = undefined;
                        return result;
                    }
                    // 有对应的rda，通过临时创建的rda的store，来获取serializedStore。
                    setData.type = newState.type;
                    setData.data = rda.storeSchema.alloc();
                    const tempStore = rda.createStore(newState.data);
                    setData.data = tempStore.serialize(rda, setData.data);
                    tempStore.free(rda);
                    return result;
                },
                update: () => {
                    this._savedAction = this.actionSchema.alloc();
                    /**
                     * 先把action标记为'update'，如果后续调用到noopDispatcher，
                     * 会在noopDispatcher内重新标记为'noop'。
                     */
                    this._savedAction.type = 'update';
                    this._savedElement = this._savedStore.unionStore.data;
                    this._savedUpdate = this.updateSchema.alloc();
                    // 根据当前unionStore类型生成最终的dispatcher
                    const dynamicDispatcher = Object.keys(this._updateDispatcher).reduce((dynamicDispatcher, key) => {
                        if (key === this._savedStore.unionStore.type) {
                            dynamicDispatcher[key] = this._updateDispatcher[key];
                        }
                        else {
                            dynamicDispatcher[key] = this._noopDispatcher[key];
                        }
                        return dynamicDispatcher;
                    }, {});
                    this._savedAction.data = this._savedUpdate;
                    return dynamicDispatcher;
                },
            };
        };
        const storeSpecs = {};
        const stateSpecs = {};
        const actionSpecs = {};
        this.rdas = {};
        this._updateDispatcher = {};
        this._noopDispatcher = {};
        this.actionMeta = {
            type: 'store',
            action: {
                type: 'table',
                table: {
                    set: {
                        type: 'unit',
                    },
                    update: {
                        type: 'partial',
                        action: {
                            type: 'table',
                            table: {},
                        },
                    },
                },
            },
        };
        for (const key in specs) {
            const rda = specs[key];
            this.rdas[key] = rda;
            const { storeSchema, stateSchema, actionSchema } = rda;
            storeSpecs[key] = storeSchema;
            stateSpecs[key] = stateSchema;
            actionSpecs[key] = actionSchema;
            this._updateDispatcher[key] = this._constructUpdateDispatcher(key, rda);
            this._noopDispatcher[key] = this._constructNoopDispatcher(rda);
        }
        this.storeSchema = new union_1.MuUnion(storeSpecs, identityType);
        this.stateSchema = new union_1.MuUnion(stateSpecs, identityType);
        this.updateSchema = new union_1.MuUnion(actionSpecs);
        this.setSchema = this.storeSchema;
        this.actionSchema = new union_1.MuUnion({
            set: this.setSchema,
            update: this.updateSchema,
            noop: new void_1.MuVoid(),
        });
        this.emptyStore = new MuRDAUnionStore(this.storeSchema.identity);
        this._savedStore = this.emptyStore;
        this._savedAction = this.actionSchema.alloc();
        this._savedUpdate = this.updateSchema.alloc();
    }
    createStore(initialState) {
        const { type, data } = initialState;
        const targetRDA = this.rdas[type];
        if (!targetRDA) {
            return new MuRDAUnionStore(this.stateSchema.clone(initialState));
        }
        const targetStore = targetRDA.createStore(data);
        return new MuRDAUnionStore({
            type,
            data: targetStore,
        });
    }
    _constructUpdateDispatcher(key, rda) {
        const self = this;
        const id = key.toString();
        function wrapPartial(root, dispatch) {
            const savedPartial = { data: null };
            function wrapPartialRec(meta, index) {
                if (meta.type === 'unit') {
                    return new Function('rda', 'partial', `/* ${id}:${index} */ return function() {var result = rda._savedUpdate; result.type = "${id}"; result.data = partial.data${index}.apply(null, arguments); return rda._savedAction; }`)(self, savedPartial);
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
                    return wrapPartial(meta.action, new Function('partial', `/* ${id}:${index} */ return function () {return partial.data${index}.apply(null, arguments); }`)(savedPartial));
                }
                return {};
            }
            return new Function('dispatch', 'partial', 'wrappedDispatch', `/* ${id} */ return function () {partial.data = dispatch.apply(null, arguments); return wrappedDispatch; }`)(dispatch, savedPartial, wrapPartialRec(root, ''));
        }
        function wrapAction(meta, dispatcher) {
            if (meta.type === 'unit') {
                return function (...args) {
                    self._savedUpdate.data = dispatcher.apply(null, args);
                    return self._savedAction;
                };
            }
            else if (meta.type === 'table') {
                const result = {};
                const ids = Object.keys(meta.table);
                for (let i = 0; i < ids.length; ++i) {
                    const key = ids[i];
                    result[key] = wrapAction(meta.table[key], dispatcher[key]);
                }
                return result;
            }
            else if (meta.type === 'partial') {
                return wrapPartial(meta.action, dispatcher);
            }
            return {};
        }
        function wrapStore(meta, index) {
            if (meta.type === 'unit') {
                return new Function('rda', 'dispatch', `/* ${id}:${index} */ return function() {var result = rda._savedUpdate; result.type = "${id}"; result.data = dispatch(rda._savedElement)${index}.apply(null, arguments); return rda._savedAction; }`)(self, rda.action);
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
                return wrapPartial(meta.action, new Function('rda', 'dispatch', `/* ${id}:${index} */ return function() {return dispatch(rda._savedElement)${index}.apply(null, arguments); }`)(self, rda.action));
            }
            return {};
        }
        if (rda.actionMeta.type !== 'store') {
            this.actionMeta.action.table.update.action.table[key] = rda.actionMeta;
            return wrapAction(rda.actionMeta, rda.action);
        }
        else {
            this.actionMeta.action.table.update.action.table[key] =
                rda.actionMeta.action;
            return wrapStore(rda.actionMeta.action, '');
        }
    }
    _constructNoopDispatcher(rda) {
        const self = this;
        function mockDispatcher(meta) {
            if (meta.type === 'unit') {
                return function () {
                    self._savedAction.type = 'noop';
                    self._savedAction.data = undefined;
                    return self._savedAction;
                };
            }
            else if (meta.type === 'partial') {
                const child = mockDispatcher(meta.action);
                return function () {
                    return child;
                };
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
        if (rda.actionMeta.type === 'store') {
            return mockDispatcher(rda.actionMeta.action);
        }
        else {
            return mockDispatcher(rda.actionMeta);
        }
    }
    parse(store) {
        var _a;
        const { type, data } = store;
        return new MuRDAUnionStore({
            type,
            data: (_a = this.rdas[type]) === null || _a === void 0 ? void 0 : _a.parse(data),
        });
    }
}
exports.MuRDAUnion = MuRDAUnion;
