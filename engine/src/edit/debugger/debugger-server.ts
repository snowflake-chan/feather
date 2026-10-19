import { MuServerProtocol, MuServer, MuRemoteClient } from '@box/mudb/server';
import { DebuggerProtocol } from '@box/schema/debugger-console/protocol';
import type { ParsedError } from '@box/schema/debugger-console/schema';
import { EditServerState } from '../edit-server-schema';
import { GameLogLevel } from '@box/schema/api/console';
import { EventBus } from '@box/utils/event';

export type CreatorConsoleEvent =
  | { type: 'log'; side: 'server' | 'client'; level: GameLogLevel; message: string; at: string }
  | { type: 'exception'; side: 'server' | 'client'; level: GameLogLevel.ERROR; message: string; stack: ParsedError['stack']; at: string }
  | { type: 'clear'; side: 'server' | 'client'; at: string };

export class DebuggerServer {
  private _protocol: MuServerProtocol<typeof DebuggerProtocol>;
  private _state: EditServerState;
  /** The Creator runtime adapter consumes this exact editor-console event stream. */
  public onCreatorConsoleEvent = new EventBus<CreatorConsoleEvent>();

  private _canUseDebugger(sessionId: string) {
    const permissions = this._state.replica.sessionPermission[sessionId];
    return !!(permissions && permissions.permissions.debugger);
  }

  constructor(spec: { server: MuServer; state: EditServerState }) {
    const protocol = (this._protocol = spec.server.protocol(DebuggerProtocol));
    const state = (this._state = spec.state);
    protocol.configure({
      message: {
        scriptEval: (client, { token, expr }) => {
          if (this._canUseDebugger(client.sessionId)) {
            this._scriptEval(client, token, expr);
          } else {
            client.message.scriptEvalResult({
              token,
              error: true,
              result: 'debugger not permitted',
            });
          }
        },
        clientLog: (_client, log) => this._publishLog('client', log),
        clientException: (_client, error) => this._publishException('client', error),
        clientClearLog: () => this._publishClear('client'),
      },
    });

    const scriptServer = state.game.script;
    scriptServer.onConsoleLog.sub(this.updateLog);
    scriptServer.onException.sub(this.scriptException);
    scriptServer.onConsoleClear.sub(this.clearLog);
  }

  private _scriptEval(
    client: MuRemoteClient<typeof DebuggerProtocol.client>,
    token: number,
    expr: string,
  ) {
    this._state.game.script
      .scriptEval(expr)
      .then((value) => {
        client.message.scriptEvalResult({
          token,
          error: false,
          result: value,
        });
      })
      .catch((e) => {
        client.message.scriptEvalResult({
          token,
          error: true,
          result: e + '',
        });
      });
  }

  private updateLog = (log: { level: GameLogLevel; message: string }) => {
    this._protocol.broadcast.updateLog(log);
    this._publishLog('server', log);
  };

  private scriptException = (error: ParsedError) => {
    this._protocol.broadcast.scriptException(error);
    this._publishException('server', error);
  };

  private clearLog = () => {
    this._protocol.broadcast.clearLog();
    this._publishClear('server');
  };

  private _publishLog(side: 'server' | 'client', log: { level: GameLogLevel; message: string }) {
    this.onCreatorConsoleEvent.notify({ type: 'log', side, ...log, at: new Date().toISOString() });
  }

  private _publishException(side: 'server' | 'client', error: ParsedError) {
    this.onCreatorConsoleEvent.notify({
      type: 'exception', side, level: GameLogLevel.ERROR,
      message: `${error.name}: ${error.message}`,
      stack: error.stack.map((frame) => ({ ...frame })),
      at: new Date().toISOString(),
    });
  }

  private _publishClear(side: 'server' | 'client') {
    this.onCreatorConsoleEvent.notify({ type: 'clear', side, at: new Date().toISOString() });
  }
}
