"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuReplicaClient = void 0;
const struct_1 = require("../schema/struct");
const schema_1 = require("./schema");
const system_1 = require("../scheduler/system");
class MuReplicaClient {
    constructor(spec) {
        this._undoActions = [];
        this._redoActions = [];
        this._pendingChangeCallback = [];
        this._onChange = (state) => { };
        this._changeTimeout = null;
        this._handleChange = () => {
            this._changeTimeout = null;
            const state = this.state();
            this._onChange(state);
            for (let i = 0; i < this._pendingChangeCallback.length; ++i) {
                this._pendingChangeCallback[i].call(null, state);
            }
            this._pendingChangeCallback.length = 0;
            this.rda.stateSchema.free(state);
        };
        this.rda = spec.rda;
        this.store = spec.rda.createStore(spec.rda.stateSchema.identity);
        this.protocol = spec.client.protocol((0, schema_1.rdaProtocol)(spec.rda));
        this._undoRedoSchema = new struct_1.MuStruct({
            undo: spec.rda.actionSchema,
            redo: spec.rda.actionSchema,
        });
        this.scheduler = spec.scheduler || system_1.MuSystemScheduler;
    }
    _notifyChange() {
        if (this._changeTimeout) {
            return;
        }
        this._changeTimeout = this.scheduler.setTimeout(this._handleChange, 0);
    }
    configure(spec) {
        if (spec.change) {
            this._onChange = spec.change;
        }
        this.protocol.configure({
            message: {
                init: (store) => {
                    this.store.free(this.rda);
                    this.store = this.rda.parse(store);
                    if (spec.ready) {
                        spec.ready();
                    }
                    this._notifyChange();
                },
                squash: (state) => {
                    this.store.free(this.rda);
                    this.store = this.rda.createStore(state);
                    for (let i = 0; i < this._undoActions.length; ++i) {
                        this._undoRedoSchema.free(this._undoActions[i]);
                    }
                    this._undoActions.length = 0;
                    for (let i = 0; i < this._redoActions.length; ++i) {
                        this.rda.actionSchema.free(this._redoActions[i]);
                    }
                    this._redoActions.length = 0;
                    this._notifyChange();
                },
                apply: (action) => {
                    if (this.store.apply(this.rda, action)) {
                        this._notifyChange();
                    }
                },
            },
            close: () => {
                if (spec.close) {
                    spec.close();
                }
                this.store.free(this.rda);
                for (let i = 0; i < this._undoActions.length; ++i) {
                    this._undoRedoSchema.free(this._undoActions[i]);
                }
                this._undoActions.length = 0;
                for (let i = 0; i < this._redoActions.length; ++i) {
                    this.rda.actionSchema.free(this._redoActions[i]);
                }
                this._redoActions.length = 0;
                if (this._changeTimeout) {
                    this.scheduler.clearTimeout(this._changeTimeout);
                    this._changeTimeout = null;
                }
            },
        });
    }
    state(out) {
        return this.store.state(this.rda, out || this.rda.stateSchema.alloc());
    }
    dispatch(action, allowUndo = true, cb) {
        if (allowUndo) {
            const inverse = this.store.inverse(this.rda, action);
            const undo = this._undoRedoSchema.alloc();
            undo.undo = this.rda.actionSchema.assign(undo.undo, inverse);
            undo.redo = this.rda.actionSchema.assign(undo.redo, action);
            this._undoActions.push(undo);
            this.rda.actionSchema.free(inverse);
        }
        if (this.store.apply(this.rda, action)) {
            this.protocol.server.message.apply(action);
            if (cb) {
                this._pendingChangeCallback.push(cb);
            }
            this._notifyChange();
        }
        else if (cb) {
            this.scheduler.setTimeout(() => { cb(null); }, 0);
        }
    }
    undo() {
        const action = this._undoActions.pop();
        if (action) {
            this._redoActions.push(this.rda.actionSchema.clone(action.redo));
            if (this.store.apply(this.rda, action.undo)) {
                this.protocol.server.message.apply(action.undo);
            }
            this.rda.actionSchema.free(action);
            this._notifyChange();
        }
    }
    redo() {
        const action = this._redoActions.pop();
        if (action) {
            this.dispatch(action, true);
            this.rda.actionSchema.free(action);
        }
    }
    action() {
        if (this.rda.actionMeta.type === 'store') {
            return this.rda.action(this.store);
        }
        return this.rda.action;
    }
}
exports.MuReplicaClient = MuReplicaClient;
//# sourceMappingURL=client.js.map