import { MuRDA, MuRDATypes } from '../rda/rda';
import { MuServer, MuServerProtocol } from '../server';
import { RDAProtocol } from './schema';
import { MuSessionId } from '../socket/socket';
import { MuScheduler } from '../scheduler/scheduler';
import { MuLogger } from '../logger';
export declare class MuReplicaServer<RDA extends MuRDA<any, any, any, any>> {
    protocol: MuServerProtocol<RDAProtocol<RDA>>;
    rda: RDA;
    store: MuRDATypes<RDA>['store'];
    scheduler: MuScheduler;
    private _logger;
    constructor(spec: {
        server: MuServer;
        rda: RDA;
        savedStore?: MuRDATypes<RDA>['serializedStore'];
        initialState?: MuRDATypes<RDA>['state'];
        scheduler?: MuScheduler;
        logger?: MuLogger;
    });
    private _pendingChangeCallback;
    private _onChange;
    private _changeTimeout;
    private _handleChange;
    private _notifyChange;
    configure(spec: {
        connect?: (sessionId: MuSessionId) => void;
        disconnect?: (sessionId: MuSessionId) => void;
        change?: (state: MuRDATypes<RDA>['state']) => void;
        checkApply?: (action: MuRDATypes<RDA>['action'], sessionId: MuSessionId) => boolean;
        checkUndo?: (action: MuRDATypes<RDA>['action'], sessionId: MuSessionId) => boolean;
    }): void;
    state(out?: MuRDATypes<RDA>['state']): any;
    dispatch(action: MuRDATypes<RDA>['action'], cb?: (state: MuRDATypes<RDA>['state'] | null) => void): void;
    action(): RDA['actionMeta'] extends {
        type: 'store';
    } ? ReturnType<RDA['action']> : RDA['action'];
    reset(state?: MuRDATypes<RDA>['state']): void;
    save(): MuRDATypes<RDA>['serializedStore'];
    load(saved: MuRDATypes<RDA>['serializedStore']): void;
}
//# sourceMappingURL=server.d.ts.map