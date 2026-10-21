"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRDAConstant = exports.MuRDAConstantStore = void 0;
const void_1 = require("../schema/void");
class MuRDAConstantStore {
    constructor(initial) {
        this.value = initial;
    }
    state(rda, out) {
        return rda.stateSchema.assign(out, this.value);
    }
    apply() { return false; }
    inverse() { }
    serialize(rda, out) {
        return rda.storeSchema.assign(out, this.value);
    }
    free(rda) {
        rda.stateSchema.free(this.value);
    }
}
exports.MuRDAConstantStore = MuRDAConstantStore;
class MuRDAConstant {
    constructor(stateSchema) {
        this.actionSchema = new void_1.MuVoid();
        this.actionMeta = {
            type: 'table',
            table: {},
        };
        this.action = {};
        this.stateSchema = stateSchema;
        this.storeSchema = stateSchema;
        this.emptyStore = new MuRDAConstantStore(stateSchema.identity);
    }
    createStore(initialState) {
        return new MuRDAConstantStore(this.stateSchema.clone(initialState));
    }
    parse(store) {
        return new MuRDAConstantStore(this.stateSchema.clone(store));
    }
}
exports.MuRDAConstant = MuRDAConstant;
//# sourceMappingURL=constant.js.map