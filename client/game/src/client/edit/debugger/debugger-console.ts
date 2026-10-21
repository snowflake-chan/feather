import { GameLogLevel } from '@box/schema/api/console';
import {
  ParsedError,
  ParsedErrorSchema,
} from '@box/schema/debugger-console/schema';
import type { ClientConsole } from '@box/script-api';

import { ClientStateType } from '../edit-schema';
import { LogEntrySchema, LogListSchema } from './debugger-client-state';
import { reduxDispatch } from 'src/redux/edit';
import { setIsShowDebugLogPanel } from 'src/redux/edit/creator';
import { parseClientScriptError } from './parse-error';

export class DebuggerConsole implements ClientConsole {
  private _state: ClientStateType;
  private _remoteReporter?: {
    log: (log: { level: GameLogLevel; message: string }) => void;
    exception: (error: ParsedError) => void;
    clear: () => void;
  };
  constructor(state: ClientStateType) {
    this._state = state;
  }

  public setRemoteReporter(reporter: typeof this._remoteReporter) {
    this._remoteReporter = reporter;
  }

  private _nextToken() {
    return this._state.debugger.tokenCounter++;
  }

  public updateLogList = (log: { level: GameLogLevel; message: string }) => {
    const entry = LogEntrySchema.alloc();
    entry.id = this._nextToken();
    entry.level = log.level;
    (entry.time = Date.now()), (entry.message.type = 'text');
    entry.message.data = log.message;
    this._state.debugger.log.push(entry);
  };

  public scriptException = (error: ParsedError) => {
    const entry = LogEntrySchema.alloc();
    entry.id = this._nextToken();
    entry.level = GameLogLevel.ERROR;
    (entry.time = Date.now()), (entry.message.type = 'exception');
    entry.message.data = ParsedErrorSchema.clone(error);
    this._state.debugger.log.push(entry);
    if (this._state.replica.localPermissions.debugger) {
      reduxDispatch(setIsShowDebugLogPanel(true));
    }
  };

  private _reportLog(log: { level: GameLogLevel; message: string }) {
    this.updateLogList(log);
    this._remoteReporter?.log(log);
  }

  private _reportException(error: ParsedError) {
    this.scriptException(error);
    this._remoteReporter?.exception(error);
  }

  public clearLog = () => {
    this._state.debugger.log = LogListSchema.assign(
      this._state.debugger.log,
      [],
    );
  };

  public scriptEval = (expr: string) => {
    const entry = LogEntrySchema.alloc();
    entry.id = this._nextToken();
    entry.level = GameLogLevel.INFO;
    (entry.time = Date.now()), (entry.message.type = 'evalExpression');
    entry.message.data = expr;

    const result = LogEntrySchema.alloc();
    const token = (result.id = this._nextToken());
    result.level = GameLogLevel.INFO;
    (result.time = Date.now()), (result.message.type = 'evalResult');
    result.message.data = '...';

    this._state.debugger.log.push(entry, result);

    return token;
  };

  assert = (value: any, message?: string, ...optionalParams: any[]): void => {
    this._reportLog({
      level: GameLogLevel.ERROR,
      message: [value, message, ...optionalParams].join(' '),
    });
  };

  debug = (message?: any, ...optionalParams: any[]): void => {
    this._reportLog({
      level: GameLogLevel.DEBUG,
      message: [message, ...optionalParams].join(' '),
    });
  };

  error = (message?: any, ...optionalParams: any[]): void => {
    this._reportException(
      parseClientScriptError(message?.stack ? message : new Error(message)),
    );
  };

  log = (message?: any, ...optionalParams: any[]): void => {
    this._reportLog({
      level: GameLogLevel.INFO,
      message: [message, ...optionalParams].join(' '),
    });
  };

  warn = (message?: any, ...optionalParams: any[]): void => {
    this._reportLog({
      level: GameLogLevel.WARN,
      message: [message, ...optionalParams].join(' '),
    });
  };

  info(message?: any, ...optionalParams: any[]): void {
    this._reportLog({
      level: GameLogLevel.INFO,
      message: [message, ...optionalParams].join(' '),
    });
  }

  clear = () => {
    this.clearLog();
    this._remoteReporter?.clear();
  };
}
