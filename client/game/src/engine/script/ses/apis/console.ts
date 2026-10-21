import type { ClientConsole } from '@box/script-api';

export class ScriptClientConsole implements ClientConsole {
  constructor(_console: ClientConsole) {
    this.log = function (message?: any, ...optionalParams: any[]) {
      _console.log(message, ...optionalParams);
    };
    this.error = function (message?: any, ...optionalParams: any[]) {
      _console.error(message, ...optionalParams);
    };
    this.assert = function (
      condition?: boolean,
      message?: string,
      ...data: any[]
    ) {
      _console.assert(condition, message, ...data);
    };
    this.info = function (message?: any, ...optionalParams: any[]) {
      _console.info(message, ...optionalParams);
    };
    this.warn = function (message?: any, ...optionalParams: any[]) {
      _console.warn(message, ...optionalParams);
    };
    this.clear = function () {
      _console.clear();
    };
  }

  log: (...data: any[]) => void;
  error: (...data: any[]) => void;
  assert: (condition?: boolean, message?: string, ...data: any[]) => void;
  info: (...data: any[]) => void;
  warn: (...data: any[]) => void;
  clear: () => void;
}
