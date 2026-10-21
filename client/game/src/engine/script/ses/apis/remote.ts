import { EventBus } from '@box/utils/event';
import * as I from '@box/script-api';
import { ScriptClientRemoteChannel } from '../../remote';
import { EventEmitter } from './events';

export class ClientRemoteChannel implements I.ClientRemoteChannel {
  public remoteEvents = new EventBus<any>();

  public readonly events = new EventEmitter<I.ClientRemoteChannelEvents>();

  /**
   * @param scriptRemoteChannel 实际接收事件，并转发事件的模块
   */
  constructor(scriptRemoteChannel: ScriptClientRemoteChannel) {
    this.sendServerEvent = (args) => {
      scriptRemoteChannel.sendServerEvent(args);
    };

    scriptRemoteChannel.onClientEvent((ev) => {
      this.remoteEvents.notify(ev);

      this.events.emit('client', ev);
    });
  }

  public sendServerEvent: (event: any) => void;

  public onClientEvent = (listener: (event: any) => void) => {
    return this.remoteEvents.sub(listener);
  };

  public removeEventListener = (eventHandle: (event: any) => void) => {
    this.remoteEvents.unsub(eventHandle);
  };

  public clear() {
    this.remoteEvents.unsubAll();
  }
}
