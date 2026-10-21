import { EventBus } from '@box/utils/event';
import type { RemoteChannelClient } from '../remote-channel/channel-client';

/**
 * 实际发送、监听通信事件（serverEvent、clientEvent）的模块。
 *
 * 客户端脚本的ClientRemoteChannel依赖于该模块。
 */
export class ScriptClientRemoteChannel {
  public remoteEvents = new EventBus<JSONValue>();

  /**
   * @param remoteChannel 通过MuClientProtocol配置与服务端通信的模块。
   */
  constructor(private remoteChannel: RemoteChannelClient) {}

  public receiveClientEvent(ev: any) {
    this.remoteEvents.notify(ev);
  }

  public sendServerEvent = (args) => {
    this.remoteChannel.sendServerEvent(args);
  };

  public onClientEvent = (listener: (event: JSONValue) => void) => {
    return this.remoteEvents.sub(listener);
  };

  public removeEventListener = (eventHandle: (event: JSONValue) => void) => {
    this.remoteEvents.unsub(eventHandle);
  };

  public clear() {
    this.remoteEvents.unsubAll();
  }
}
