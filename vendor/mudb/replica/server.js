"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuReplicaServer = void 0;
const schema_1 = require("./schema");
const system_1 = require("../scheduler/system");
const logger_1 = require("../logger");
class MuReplicaServer {
    constructor(spec) {
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
        this._logger = spec.logger || logger_1.MuDefaultLogger;
        this.rda = spec.rda;
        if ('savedStore' in spec) {
            this.store = this.rda.parse(spec.savedStore);
        }
        else {
            this.store = this.rda.createStore('initialState' in spec
                ? spec.initialState
                : this.rda.stateSchema.identity);
        }
        this.protocol = spec.server.protocol((0, schema_1.rdaProtocol)(spec.rda));
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
            connect: (client) => {
                const state = this.save();
                client.message.init(state);
                this.rda.storeSchema.free(state);
                if (spec.connect) {
                    spec.connect(client.sessionId);
                }
            },
            disconnect: (client) => {
                if (spec.disconnect) {
                    spec.disconnect(client.sessionId);
                }
            },
            message: {
                apply: (client, action) => {
                    if (spec.checkApply && !spec.checkApply(action, client.sessionId)) {
                        this._logger.log(`invalid action ${JSON.stringify} from ${client.sessionId}`);
                        return;
                    }
                    this.dispatch(action);
                },
            },
        });
    }
    state(out) {
        return this.store.state(this.rda, out || this.rda.stateSchema.alloc());
    }
    dispatch(action, cb) {
        if (this.store.apply(this.rda, action)) {
            this.protocol.broadcast.apply(action);
            if (cb) {
                this._pendingChangeCallback.push(cb);
            }
            this._notifyChange();
        }
        else if (cb) {
            this.scheduler.setTimeout(() => cb(null), 0);
        }
    }
    action() {
        if (this.rda.actionMeta.type === 'store') {
            return this.rda.action(this.store);
        }
        return this.rda.action;
    }
    reset(state) {
        const head = state || this.rda.stateSchema.identity;
        this.store.free(this.rda);
        this.store = this.rda.createStore(head);
        this.protocol.broadcast.squash(head);
        this._notifyChange();
    }
    save() {
        return this.store.serialize(this.rda, this.rda.storeSchema.alloc());
    }
    load(saved) {
        this.protocol.broadcast.init(saved);
        this.store.free(this.rda);
        this.store = this.rda.parse(saved);
        this._notifyChange();
    }
}
exports.MuReplicaServer = MuReplicaServer;
//# sourceMappingURL=server.js.map