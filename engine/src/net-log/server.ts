import { MuServer, MuServerProtocol } from '@box/mudb/server';
import {
  LogSink,
  LogMessage,
  LogMessageSchema,
  LogLevel,
} from '@box/utils/logger';
import { NetLogEvent, NetLogSchema } from '@box/schema/net-log/schema';
import { levels, Logger } from 'pino';

export class NetLogServer {
  private _protocol: MuServerProtocol<typeof NetLogSchema>;
  private _sink: LogSink;
  private logger: Logger;

  constructor(spec: { server: MuServer; sink: LogSink; logger: Logger }) {
    this._sink = spec.sink;
    this.logger = spec.logger;
    this._protocol = spec.server.protocol(NetLogSchema);
    this._protocol.configure({
      message: {
        log: (client, { prefix, level, message }) => {
          this._processLog(client.sessionId, level, prefix, message);
        },
        logASCII: (client, { prefix, level, message }) => {
          this._processLog(client.sessionId, level, prefix, message);
        },
        logPino: (client, message) => {
          this.processPinoLog(client.sessionId, message);
        },
      },
    });
  }

  private processPinoLog(sessionId: string, ev: NetLogEvent) {
    ev['pid'] = `client:${sessionId}`;
    this.logger[levels.labels[ev['level']] || 'info'](ev);
  }

  private _processLog(
    sessionId: string,
    level: LogLevel,
    prefix: string[],
    message: string,
  ) {
    const log = LogMessageSchema.alloc();
    log.uuid = `client:${sessionId}`;
    log.level = level;
    log.timestamp = new Date();
    log.message = message;
    log.prefix.length = 0;
    for (let i = 0; i < prefix.length; ++i) {
      log.prefix.push(prefix[i]);
    }
    this._sink(log);
  }

  public log(mesg: LogMessage) {
    if (this._protocol.server.running) {
      this._protocol.broadcast.log(mesg);
    }
  }
}
