"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRDARegister = exports.MuRDARegisterStore = void 0;
function identity(x) { return x; }
class MuRDARegisterStore {
    constructor(initial) { this.value = initial; }
    state(rda, out) { return rda.stateSchema.assign(out, this.value); }
    inverse(rda) { return rda.actionSchema.clone(this.value); }
    free(rda) { rda.stateSchema.free(this.value); }
    apply(rda, action) {
        this.value = rda.stateSchema.assign(this.value, rda.constrain(action));
        return true;
    }
    serialize(rda, out) {
        return rda.storeSchema.assign(out, this.value);
    }
}
exports.MuRDARegisterStore = MuRDARegisterStore;
class MuRDARegister {
    constructor(stateSchema, constrain) {
        this.actionMeta = { type: 'unit' };
        this.action = (value) => {
            return this.actionSchema.clone(this.constrain(value));
        };
        this.stateSchema = this.actionSchema = this.storeSchema = stateSchema;
        this.constrain = constrain || identity;
        this.emptyStore = new MuRDARegisterStore(stateSchema.identity);
    }
    createStore(initialState) {
        return new MuRDARegisterStore(this.stateSchema.clone(initialState));
    }
    parse(store) {
        return new MuRDARegisterStore(this.stateSchema.clone(store));
    }
}
exports.MuRDARegister = MuRDARegister;
//# sourceMappingURL=register.js.map