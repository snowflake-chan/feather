import type { EventEmitter } from './events';

export type ClientRemoteChannelEvents = {
  client: any;
};

export declare class ClientRemoteChannel {
  /**
   * @ignore
   */
  constructor(...args: any);
  /**
   * 向服务端发送服务端事件。
   */
  public sendServerEvent: (event: any) => void;

  /**
   * 监听服务端发来的ClientEvent。
   */
  public readonly events: EventEmitter<ClientRemoteChannelEvents>;
}

export declare const remoteChannel: ClientRemoteChannel;
