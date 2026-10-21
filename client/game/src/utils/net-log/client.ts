import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { LogSink, LogMessage, LogMessageSchema } from '@box/utils/logger';
import { NetLogEvent, NetLogSchema } from '@box/schema/net-log/schema';

function isASCII(msg: string) {
  for (let i = 0; i < msg.length; ++i) {
    if (msg.charCodeAt(i) > 127) {
      return false;
    }
  }
  return true;
}

export class NetLogClient {
  private _protocol: MuClientProtocol<typeof NetLogSchema>;
  private _pending: LogMessage[] = [];
  private _pinoPending: NetLogEvent[] = [];

  constructor(spec: { client: MuClient; sink: LogSink }) {
    this._protocol = spec.client.protocol(NetLogSchema);
    this._protocol.configure({
      message: {
        log: spec.sink,
      },
      ready: () => {
        for (let i = 0; i < this._pending.length; ++i) {
          this._log(this._pending[i]);
        }
        this._pending.length = 0;

        for (let i = 0; i < this._pinoPending.length; ++i) {
          this._logPino(this._pinoPending[i]);
        }
        this._pinoPending.length = 0;
      },
    });
  }

  private _log(mesg: LogMessage) {
    if (isASCII(mesg.message)) {
      this._protocol.server.message.logASCII(mesg);
    } else {
      this._protocol.server.message.log(mesg);
    }
  }

  public log(mesg: LogMessage) {
    if (this._protocol.client.running) {
      this._log(mesg);
    } else {
      this._pending.push(LogMessageSchema.clone(mesg));
    }
  }

  private _logPino(msg: NetLogEvent) {
    this._protocol.server.message.logPino(msg);
  }
  public logPino(msg: NetLogEvent) {
    if (this._protocol.client.running) {
      this._logPino(msg);
    } else {
      this._pinoPending.push(msg);
    }
  }
}
