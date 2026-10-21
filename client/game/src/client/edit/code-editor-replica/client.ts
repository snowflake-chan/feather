import { MuRDA, MuRDATypes } from '@box/mudb/rda';
import { rdaProtocol, RDAProtocol } from './schema';
import { MuStruct, MuArray } from '@box/mudb/schema';
import { MuSystemScheduler, MuScheduler } from '@box/mudb/scheduler';
import { MuClientProtocol, MuClient } from '@box/mudb/client';

export class MuCodeEditorReplicaClient<RDA extends MuRDA<any, any, any, any>> {
  public protocol: MuClientProtocol<RDAProtocol<RDA>>;
  public rda: RDA;
  public store: MuRDATypes<RDA>['store'];

  private _undoRedoSchema: MuStruct<{
    undo: MuArray<RDA['actionSchema']>;
    redo: MuArray<RDA['actionSchema']>;
  }>;
  private _actionListSchema: MuArray<RDA['actionSchema']>;

  private _undoActions: MuCodeEditorReplicaClient<RDA>['_undoRedoSchema']['identity'][] =
    [];
  private _redoActions: MuCodeEditorReplicaClient<RDA>['_undoRedoSchema']['identity'][] =
    [];

  private _fileHistoryDict = {};

  public scheduler: MuScheduler;

  constructor(spec: {
    client: MuClient;
    rda: RDA;
    scheduler?: MuScheduler;
    name: string;
  }) {
    this.rda = spec.rda;
    this.store = <MuRDATypes<RDA>['store']>(
      spec.rda.createStore(spec.rda.stateSchema.identity)
    );
    this.protocol = spec.client.protocol(rdaProtocol(spec.rda, spec.name));
    this._undoRedoSchema = new MuStruct({
      undo: new MuArray(spec.rda.actionSchema, Infinity),
      redo: new MuArray(spec.rda.actionSchema, Infinity),
    });
    this._actionListSchema = new MuArray(spec.rda.actionSchema, Infinity);
    this.scheduler = spec.scheduler || MuSystemScheduler;
    (window as any).undoredo = {
      undo: this._undoActions,
      redo: this._redoActions,
    };
  }

  // change listener stuff
  private _onChange = (
    state: MuRDATypes<RDA>['state'],
    isLocalChange: boolean,
  ) => {};
  private _checkIsHoldingLock = () => {};
  private _onDispatch:
    | ((actions: MuRDATypes<RDA>['action'][], name: string) => void)
    | undefined;
  private _changeTimeout: any = null;
  private _handleChange = (isLocalChange: boolean) => {
    this._changeTimeout = null;
    const state = this.state();
    this._onChange(state, isLocalChange);
    this.rda.stateSchema.free(state);
  };
  private _shouldGroupCharacter = false;
  private _notifyChange(isLocalChange: boolean = true) {
    if (this._changeTimeout) {
      return;
    }
    this._changeTimeout = this.scheduler.setTimeout(
      () => this._handleChange(isLocalChange),
      0,
    );
  }

  public configure(spec: {
    ready?: () => void;
    change?: (state: MuRDATypes<RDA>['state'], isLocalChange: boolean) => void;
    checkIsHoldingLock?: () => boolean;
    close?: () => void;
    onDispatch?: (actions: MuRDATypes<RDA>['action'][], name: string) => void;
  }) {
    if (spec.change) {
      this._onChange = spec.change;
    }
    if (spec.checkIsHoldingLock) {
      this._checkIsHoldingLock = spec.checkIsHoldingLock;
    }
    if (spec.onDispatch) {
      this._onDispatch = spec.onDispatch;
    }
    this.protocol.configure({
      message: {
        init: (store) => {
          this.store.free(this.rda);
          this.store = <MuRDATypes<RDA>['store']>this.rda.parse(store);
          if (spec.ready) {
            spec.ready();
          }
          this._notifyChange(false);
        },
        squash: (state) => {
          this.store.free(this.rda);
          this.store = <MuRDATypes<RDA>['store']>this.rda.createStore(state);
          for (let i = 0; i < this._undoActions.length; ++i) {
            this._undoRedoSchema.free(this._undoActions[i]);
          }
          this._undoActions.length = 0;
          this._clearRedo();
          this._notifyChange(false);
        },
        apply: (action) => {
          const a = this.store.apply(this.rda, action);
          if (a) {
            this._notifyChange(false);
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
        this._clearRedo();
        if (this._changeTimeout) {
          this.scheduler.clearTimeout(this._changeTimeout);
          this._changeTimeout = null;
        }
      },
    });
  }

  public state(out?: MuRDATypes<RDA>['state']) {
    return this.store.state(this.rda, out || this.rda.stateSchema.alloc());
  }

  public dispatch(
    actions: MuRDATypes<RDA>['action'][],
    allowUndo: boolean = true,
  ) {
    this._doDispatch(actions, allowUndo);
    this._clearRedo();
  }

  private peekUndoStack() {
    const pair = this._undoActions[this._undoActions.length - 1];
    if (pair) {
      return pair;
    }
    return null;
  }

  private getActionData(actions) {
    return actions[0].data.action.data;
  }

  private canGroupCharacter(actions): boolean {
    const data = this.getActionData(actions);
    if (!this._undoActions.length) {
      return true;
    }
    if (
      data.type === 'insertCharacter' &&
      (data.data.character === ' ' ||
        data.data.character === ')' ||
        data.data.character === ']' ||
        data.data.character === '}' ||
        data.data.character === '\n' ||
        data.data.character === '\t')
    ) {
      return true;
    } else if (
      data.type === 'insertString' &&
      (data.data.string === '()' ||
        data.data.string === '[]' ||
        data.data.string === '{}')
    ) {
      return true;
    }
    return false;
  }

  private _doDispatch(
    actions: MuRDATypes<RDA>['action'][],
    allowUndo: boolean,
  ) {
    const inverseList: MuRDATypes<RDA>['action'][] = [];
    if (allowUndo) {
      for (let i = actions.length - 1; i >= 0; i--) {
        inverseList.push(this.store.inverse(this.rda, actions[i]));
      }

      if (this._shouldGroupCharacter || this.canGroupCharacter(actions)) {
        const undo_redo = this._undoRedoSchema.alloc();
        undo_redo.undo = this._actionListSchema.assign(
          undo_redo.undo,
          inverseList,
        );
        undo_redo.redo = this._actionListSchema.assign(undo_redo.redo, actions);
        this._undoActions.push(undo_redo);
        this._shouldGroupCharacter = false;
      } else {
        const undo_redo = this.peekUndoStack();
        if (undo_redo) {
          const data = this.getActionData(actions);
          if (data.type === 'insertString' && data.data.string !== '// ') {
            this._shouldGroupCharacter = true;
          }
          undo_redo.redo.push(...actions);
          undo_redo.undo.unshift(...inverseList);
        }
      }
    }
    if (this._onDispatch) {
      this._onDispatch(actions, '');
    }
    this._applyActions(actions);
  }

  private _clearRedo() {
    for (let i = 0; i < this._redoActions.length; ++i) {
      // this._actionListSchema.free(this._redoActions[i]);
      this._undoRedoSchema.free(this._redoActions[i]);
    }
    this._redoActions.length = 0;
  }

  private _applyActions(actions: RDA['actionSchema'][]) {
    if (!actions || !actions.length) {
      return;
    }
    for (let i = 0; i < actions.length; i++) {
      if (this.store.apply(this.rda, actions[i])) {
        this.protocol.server.message.apply(actions[i]);
      }
    }
    this._notifyChange();
  }

  public shouldGroupCharacter() {
    this._shouldGroupCharacter = true;
  }

  public selectFileHistory(fileId) {
    let file_history = this._fileHistoryDict[fileId];
    if (!file_history) {
      file_history = this._fileHistoryDict[fileId] = [[], []];
    }
    const [redo, undo] = file_history;
    this._redoActions = redo;
    this._undoActions = undo;
  }

  public removeFileHistory(fileId) {
    delete this._fileHistoryDict[fileId];
  }

  public undo(): RDA['actionSchema']['identity'][] | undefined {
    const actions = this._undoActions.pop();
    if (actions) {
      this._redoActions.push(actions);
      this._applyActions(actions.undo);
      this._notifyChange();
      this._shouldGroupCharacter = true;
      return actions.undo;
    }
    return;
  }

  public redo(): RDA['actionSchema']['identity'][] | undefined {
    const actions = this._redoActions.pop();
    if (actions) {
      this._undoActions.push(actions);
      this._applyActions(actions.redo);
      this._notifyChange();
      this._shouldGroupCharacter = true;
      return actions.redo;
    }
    return void 0;
  }

  private _getActionName(actions: RDA['actionSchema'][]): string[] | undefined {
    if (!actions.length) {
      return [];
    }
    if (actions.length === 1) {
      const action = actions[0];
      let name = [action.type];
      if (action.data && action.data.type) {
        name = name.concat(this._getActionName([action.data]));
      }
      return name;
    } else {
      let name: string[] = [];
      for (let i = 0; i < actions.length; i++) {
        name = name.concat(this._getActionName([actions[i]]) || []);
      }
      return name;
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

  public canUndo() {
    return !!this._undoActions.length && this._checkIsHoldingLock();
  }

  public canRedo() {
    return !!this._redoActions.length && this._checkIsHoldingLock();
  }
}
