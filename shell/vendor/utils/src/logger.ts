import {
  MuStruct,
  MuASCII,
  MuUint8,
  MuSchema,
  MuArray,
  MuDate,
  MuUTF8,
} from '@box/mudb/schema';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export const LogMessageSchema = new MuStruct({
  uuid: new MuASCII(),
  level: <MuSchema<LogLevel>>new MuUint8(LogLevel.INFO),
  timestamp: new MuDate(new Date(0)),
  prefix: new MuArray(new MuASCII(), Infinity),
  message: new MuUTF8(),
});

export type LogMessage = typeof LogMessageSchema.identity;

export type LogSink = (mesg: LogMessage) => void;

export class Logger {
  constructor(
    public sink: LogSink,
    public prefix: string[],
    public uuid: string,
  ) {}

  private _log(level: LogLevel, message: string) {
    this.sink({
      level,
      timestamp: new Date(),
      prefix: this.prefix,
      uuid: this.uuid,
      message,
    });
  }

  public create = (prefix: string) => {
    const p = this.prefix.slice();
    p.push(prefix);
    return new Logger(this.sink, p, this.uuid);
  };

  public error = <E extends Error>(mesg: string | E) => {
    if (typeof mesg === 'string') {
      return this._log(LogLevel.ERROR, mesg);
    }
    if (mesg && mesg.stack !== undefined && mesg.stack !== '') {
      return this._log(LogLevel.ERROR, mesg.stack);
    }
    return this._log(LogLevel.ERROR, '' + mesg);
  };

  public warn = (mesg: string) => {
    return this._log(LogLevel.WARN, mesg);
  };

  public log = (mesg: string) => {
    return this._log(LogLevel.INFO, mesg);
  };

  public debug = (mesg: string) => {
    return this._log(LogLevel.DEBUG, mesg);
  };

  // redundant log levels
  public fatal = (mesg: string) => {
    return this.error(mesg);
  };
  public trace = (mesg: string) => {
    return this.debug(mesg);
  };
  public info = (mesg: string) => {
    return this.log(mesg);
  };
}

export class BufferSink {
  public buffer: LogMessage[] = [];
  public _sink;

  public sink = (message: LogMessage) => {
    if (this._sink) {
      this._sink(message);
    } else {
      this.buffer.push(LogMessageSchema.clone(message));
    }
  };

  public replace(nextSink: LogSink) {
    this._sink = nextSink;
    for (let i = 0; i < this.buffer.length; ++i) {
      nextSink(this.buffer[i]);
      LogMessageSchema.free(this.buffer[i]);
    }
    this.buffer.length = 0;
  }
}
