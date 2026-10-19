export declare enum GameLogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
export type GameLoggerMethod = (...args: any[]) => void;
export declare class GameConsole {
    clear: () => void;
    constructor(log: (level: GameLogLevel, message: string) => void, clear: () => void);
    assert: (assertion: any, ...args: any[]) => void;
    log: GameLoggerMethod;
    debug: GameLoggerMethod;
    error: GameLoggerMethod;
    warn: GameLoggerMethod;
    dir: () => void;
    dirxml: () => void;
    group: () => void;
    groupCollapsed: () => void;
    groupEnd: () => void;
    table: () => void;
    time: () => void;
    timeEnd: () => void;
    timeLog: () => void;
    timeStamp: () => void;
    trace: () => void;
}
//# sourceMappingURL=console.d.ts.map