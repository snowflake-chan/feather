export enum GameLogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export type GameLoggerMethod = (...args: any[]) => void;

export class GameConsole {
  constructor(
    log: (level: GameLogLevel, message: string) => void,
    public clear: () => void,
  ) {
    this.assert = (assertion, ...args: any[]) => {
      if (!assertion) {
        log(GameLogLevel.ERROR, args.join(' '));
      }
    };
    this.log = (...args: any[]) => log(GameLogLevel.INFO, args.join(' '));
    this.debug = (...args: any[]) => log(GameLogLevel.DEBUG, args.join(' '));
    this.error = (...args: any[]) => log(GameLogLevel.ERROR, args.join(' '));
    this.warn = (...args: any[]) => log(GameLogLevel.WARN, args.join(' '));
  }

  public assert: (assertion, ...args: any[]) => void;
  public log: GameLoggerMethod;
  public debug: GameLoggerMethod;
  public error: GameLoggerMethod;
  public warn: GameLoggerMethod;

  // TODO: Not implemented yet
  public dir = () => {};
  public dirxml = () => {};
  public group = () => {};
  public groupCollapsed = () => {};
  public groupEnd = () => {};
  public table = () => {};
  public time = () => {};
  public timeEnd = () => {};
  public timeLog = () => {};
  public timeStamp = () => {};
  public trace = () => {};
}
