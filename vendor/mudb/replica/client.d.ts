import { MuRDA, MuRDATypes } from '../rda/rda';
import { MuClient, MuClientProtocol } from '../client';
import { RDAProtocol } from './schema';
import { MuScheduler } from '../scheduler/scheduler';
export declare class MuReplicaClient<RDA extends MuRDA<any, any, any, any>> {
    protocol: MuClientProtocol<RDAProtocol<RDA>>;
    rda: RDA;
    store: MuRDATypes<RDA>['store'];
    private _undoRedoSchema;
    private _undoActions;
    private _redoActions;
    scheduler: MuScheduler;
    constructor(spec: {
        client: MuClient;
        rda: RDA;
        scheduler?: MuScheduler;
    });
    private _pendingChangeCallback;
    private _onChange;
    private _changeTimeout;
    private _handleChange;
    private _notifyChange;
    configure(spec: {
        ready?: () => void;
        change?: (state: MuRDATypes<RDA>['state']) => void;
        close?: () => void;
    }): void;
    state(out?: MuRDATypes<RDA>['state']): any;
    dispatch(action: MuRDATypes<RDA>['action'], allowUndo?: boolean, cb?: (state: MuRDATypes<RDA>['state'] | null) => void): void;
    undo(): void;
    redo(): void;
    action(): RDA['actionMeta'] extends {
        type: 'store';
    } ? ReturnType<RDA['action']> : RDA['action'];
}
//# sourceMappingURL=client.d.ts.map