import { Logger } from '@box/utils/logger';
import WS = require('ws');

type MessageHandler = (message: string) => void;

export class BackendSocket {
  private _logger: Logger;
  private _socket: WebSocket | undefined = undefined;
  private _messageHandlers: MessageHandler[] = [];
  private _subscribeMessage: string[] = [];

  constructor(spec: { logger: Logger; enabled?: boolean }) {
    this._logger = spec.logger.create('backendSocket');
    if (spec.enabled !== false) {
      this._connect();
    }
  }

  public close() {
    if (this._socket) {
      this._socket.close();
    }
  }

  public onMessage(onmessage: MessageHandler) {
    this._messageHandlers.push(onmessage);
  }

  public removeHandler(handler: MessageHandler) {
    const index = this._messageHandlers.indexOf(handler);
    if (index > -1) {
      this._messageHandlers.splice(index, 1);
    }
  }

  public subscribe(message: string) {
    if (this._socket && this._socket.readyState === WS.OPEN) {
      this._socket.send(message);
    }
    this._subscribeMessage.push(message);
  }

  public async send<T extends Object>(message: T) {
    if (this._socket && this._socket.readyState === WS.OPEN) {
      this._socket.send(JSON.stringify(message));
    } else {
      this._logger.warn('WebSocket not connected. Message not sent');
    }
  }

  private _connect() {
    this._logger.warn('Platform WebSocket is unavailable in the local engine');
  }
}
