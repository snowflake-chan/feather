import { MuStruct, MuASCII, MuSchema, MuArray, MuDate, MuUTF8 } from '@box/mudb/schema';
export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
export declare const LogMessageSchema: MuStruct<{
    uuid: MuASCII;
    level: MuSchema<LogLevel>;
    timestamp: MuDate;
    prefix: MuArray<MuASCII>;
    message: MuUTF8;
}>;
export type LogMessage = typeof LogMessageSchema.identity;
export type LogSink = (mesg: LogMessage) => void;
export declare class Logger {
    sink: LogSink;
    prefix: string[];
    uuid: string;
    constructor(sink: LogSink, prefix: string[], uuid: string);
    private _log;
    create: (prefix: string) => Logger;
    error: <E extends Error>(mesg: string | E) => void;
    warn: (mesg: string) => void;
    log: (mesg: string) => void;
    debug: (mesg: string) => void;
    fatal: (mesg: string) => void;
    trace: (mesg: string) => void;
    info: (mesg: string) => void;
}
export declare class BufferSink {
    buffer: LogMessage[];
    _sink: any;
    sink: (message: LogMessage) => void;
    replace(nextSink: LogSink): void;
}
//# sourceMappingURL=logger.d.ts.map