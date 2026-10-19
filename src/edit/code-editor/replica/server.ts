import { rdaProtocol, RDAProtocol } from './schema';
import { MuRDA, MuRDATypes } from '@box/mudb/rda';
import { MuServerProtocol, MuServer } from '@box/mudb/server';
import { MuScheduler, MuSystemScheduler } from '@box/mudb/scheduler';
import { MuLogger, MuDefaultLogger } from '@box/mudb/logger';
import { MuSessionId } from '@box/mudb/socket/socket';
import { EditServer } from '../../edit-server';

export class MuCodeEditorReplicaServer<RDA extends MuRDA<any, any, any, any>> {
  public protocol: MuServerProtocol<RDAProtocol<RDA>>;
  public rda: RDA;
  public store: MuRDATypes<RDA>['store'];

  public scheduler: MuScheduler;

  private _logger: MuLogger;

  private _editServer: EditServer;

  constructor(spec: {
    editServer: EditServer;
    server: MuServer;
    rda: RDA;
    savedStore?: MuRDATypes<RDA>['serializedStore'];
    initialState?: MuRDATypes<RDA>['state'];
    scheduler?: MuScheduler;
    logger?: MuLogger;
    name: string;
  }) {
    this._editServer = spec.editServer;
    this._logger = spec.logger || MuDefaultLogger;
    this.rda = spec.rda;
    if ('savedStore' in spec) {
      this.store = <MuRDATypes<RDA>['store']>this.rda.parse(spec.savedStore);
    } else {
      this.store = <MuRDATypes<RDA>['store']>(
        this.rda.createStore(
          'initialState' in spec
            ? spec.initialState
            : this.rda.stateSchema.identity,
        )
      );
    }
    this.protocol = spec.server.protocol(rdaProtocol(spec.rda, spec.name));

    this.scheduler = spec.scheduler || MuSystemScheduler;
  }

  private _pendingChangeCallback: ((
    state: MuRDATypes<RDA>['state'],
  ) => void)[] = [];
  private _onChange = (
    state: MuRDATypes<RDA>['state'],
    sessionId?: MuSessionId,
  ) => {};
  private _changeTimeout: any = null;
  private _handleChange = (sessionId?: MuSessionId) => {
    this._changeTimeout = null;
    const state = this.state();
    this._onChange(state, sessionId);
    for (let i = 0; i < this._pendingChangeCallback.length; ++i) {
      this._pendingChangeCallback[i].call(null, state);
    }
    this._pendingChangeCallback.length = 0;
    this.rda.stateSchema.free(state);
  };
  private _notifyChange(sessionId?: MuSessionId) {
    if (this._changeTimeout) {
      return;
    }
    this._changeTimeout = this.scheduler.setTimeout(
      () => this._handleChange(sessionId),
      0,
    );
  }

  public configure(spec: {
    connect?: (sessionId: MuSessionId) => void;
    disconnect?: (sessionId: MuSessionId) => void;
    change?: (state: MuRDATypes<RDA>['state'], sessionId?: MuSessionId) => void;
    checkApply?: (
      action: MuRDATypes<RDA>['action'],
      sessionId: MuSessionId,
    ) => boolean;
    checkUndo?: (
      action: MuRDATypes<RDA>['action'],
      sessionId: MuSessionId,
    ) => boolean;
  }) {
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
          if (
            !this._editServer.replica.getSessionPermissions(client.sessionId)
              .editScripts
          ) {
            this._logger.log(
              `unauthorized code-editor action from ${client.sessionId}`,
            );
            return;
          }
          if (spec.checkApply && !spec.checkApply(action, client.sessionId)) {
            this._logger.log(
              `invalid action ${JSON.stringify} from ${client.sessionId}`,
            );
            return;
          }
          this.dispatch(action, client.sessionId);
        },
      },
    });
  }

  // polls the current state
  public state(out?: MuRDATypes<RDA>['state']) {
    return this.store.state(this.rda, out || this.rda.stateSchema.alloc());
  }

  // dispatch an action
  public dispatch(action: MuRDATypes<RDA>['action'], sessionId?: MuSessionId) {
    this._logger.log(`replica server.... ${action}`);
    if (this.store.apply(this.rda, action)) {
      this.protocol.broadcast.apply(action);
      this._notifyChange(sessionId);
    }
  }

  public action(): RDA['actionMeta'] extends { type: 'store' }
    ? ReturnType<RDA['action']>
    : RDA['action'] {
    if (this.rda.actionMeta.type === 'store') {
      return this.rda.action(this.store);
    }
    return this.rda.action;
  }

  // squash all history to current state.  erase history and ability to undo previous actions
  public reset(state?: MuRDATypes<RDA>['state']) {
    const head = state || this.rda.stateSchema.identity;
    this.store.free(this.rda);
    this.store = <MuRDATypes<RDA>['store']>this.rda.createStore(head);
    this.protocol.broadcast.squash(head);
    this._notifyChange();
  }

  // save store
  public save(): MuRDATypes<RDA>['serializedStore'] {
    return this.store.serialize(this.rda, this.rda.storeSchema.alloc());
  }
}
