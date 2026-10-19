import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { GameServerState } from '../game-server-schema';
import { RTCScriptProtocol } from './rtc-script-protocol';
import { RTCProtocol } from './rtc-protocol';
import { getConfigSync } from '../../config/server';
import { PromiseWrapper } from './promise-wrapper';
import { getById } from '@box/utils/id';

export class RTCServer {
  public scriptProtocol: MuServerProtocol<typeof RTCScriptProtocol>;
  public netProtocol: MuServerProtocol<typeof RTCProtocol>;
  public state: GameServerState;

  private channels = {} as {
    [channelId: string]: number[];
  };
  private wrappers = {} as { [handle: number]: PromiseWrapper<any> };
  private handleCounter = 0;

  constructor(spec: {
    state: GameServerState;
    server: MuServer;
    scriptServer: MuServer;
  }) {
    this.state = spec.state;
    this.netProtocol = spec.server.protocol(RTCProtocol);
    this.netProtocol.configure({
      message: {
        return: (client, message) => {
          const p = this.wrappers[message.handle];
          if (p) {
            p.resolve(undefined);
          }
        },
        throw: (client, message) => {
          const p = this.wrappers[message.handle];
          if (p) {
            p.reject(new Error(message.message));
          }
        },
        volumeReturn: (client, message) => {
          const p = this.wrappers[message.handle];
          if (p) {
            p.resolve(message);
          }
        },
        permissionReturn: (client, message) => {
          const p = this.wrappers[message.handle];
          if (p) {
            p.resolve(message);
          }
        },
        fetchToken: (client, { handle, channelId, uid }) => {
          const token = this.generateToken(channelId, uid);
          client.message.tokenReturn({ handle, token });
        },
      },
    });
    this.scriptProtocol = spec.scriptServer.protocol(RTCScriptProtocol);
    this.scriptProtocol.configure({
      message: {
        destroyChannel: async (client, message) => {
          try {
            await this.destroyChannel(message.channelId);
            client.message.return({ handle: message.handle });
          } catch (err) {
            client.message.throw({
              handle: message.handle,
              message: err.message,
            });
          }
        },
        joinChannel: async (client, message) => {
          try {
            await this.joinChannel(message.channelId, message.id);
            this.getChannelList(message.channelId).push(message.id);
            client.message.return({ handle: message.handle });
          } catch (err) {
            client.message.throw({
              handle: message.handle,
              message: err.message,
            });
          }
        },
        leaveChannel: async (client, message) => {
          try {
            await this.leaveChannel(message.channelId, message.id);
            client.message.return({ handle: message.handle });
          } catch (err) {
            client.message.throw({
              handle: message.handle,
              message: err.message,
            });
          }
        },
        unpublish: async (client, message) => {
          try {
            await this.unpublish(message.channelId, message.id);
            client.message.return({ handle: message.handle });
          } catch (err) {
            client.message.throw({
              handle: message.handle,
              message: err.message,
            });
          }
        },
        publishMicrophone: async (client, message) => {
          try {
            await this.publishMicrophone(message.channelId, message.id);
            client.message.return({ handle: message.handle });
          } catch (err) {
            client.message.throw({
              handle: message.handle,
              message: err.message,
            });
          }
        },
        listChannelPlayers: (client, message) => {
          client.message.listReturn({
            handle: message.handle,
            list: this.getChannelList(message.channelId),
          });
        },
        getVolume: async (client, message) => {
          try {
            const volume = await this.getVolume(message.channelId, message.id);
            client.message.volumeReturn({ handle: message.handle, volume });
          } catch (err) {
            client.message.throw({
              handle: message.handle,
              message: err.message,
            });
          }
        },
        setVolume: async (client, message) => {
          try {
            await this.setVolume(message.channelId, message.id, message.volume);
            client.message.return({ handle: message.handle });
          } catch (err) {
            client.message.throw({
              handle: message.handle,
              message: err.message,
            });
          }
        },
        getMicrophonePermission: async (client, message) => {
          try {
            const permission = await this.getMicrophonePermission(message.id);
            client.message.permissionReturn({
              handle: message.handle,
              permission,
            });
          } catch (err) {
            client.message.throw({
              handle: message.handle,
              message: err.message,
            });
          }
        },
      },
    });
  }

  public async reset() {
    for (const c in this.channels) {
      await this.destroyChannel(c);
    }
  }

  private getChannelList(channelId: string) {
    if (!(channelId in this.channels)) {
      this.channels[channelId] = [];
    }
    return this.channels[channelId];
  }

  private getClient(id: number) {
    const conn = getById(this.state.connectionSet, id);
    if (!conn) {
      throw new Error(`cannot found player by entity uid ${id}`);
    }
    const client = this.netProtocol.clients[conn.sessionId];
    if (!client) {
      throw new Error(`cannot found client by entity uid ${id}`);
    }
    return client;
  }

  private async destroyChannel(channelId: string) {
    await Promise.all(
      this.getChannelList(channelId).map((id) => {
        return this.leaveChannel(channelId, id);
      }),
    );
    delete this.channels[channelId];
  }

  private generateToken(channelId: string, uid = 0) {
    const config = getConfigSync();
    const privilegeExpiredTs = 3600 + Math.floor(Date.now() / 1000);
    return RtcTokenBuilder.buildTokenWithUid(
      config.AGORA_APP_ID,
      config.AGORA_CERTIFICATE,
      channelId,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs,
    );
  }

  private async joinChannel(channelId: string, id: number) {
    const config = getConfigSync();
    const token = this.generateToken(channelId);
    const handle = this.handleCounter++;
    this.getClient(id).message.join({
      handle,
      token,
      channelId,
      appId: config.AGORA_APP_ID,
    });
    const wrapper = new PromiseWrapper<void>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  }

  private async leaveChannel(channelId: string, id: number) {
    const handle = this.handleCounter++;
    this.getClient(id).message.leave({
      handle,
      channelId,
    });
    const wrapper = new PromiseWrapper<void>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  }

  private async unpublish(channelId: string, id: number) {
    const handle = this.handleCounter++;
    this.getClient(id).message.unpublish({
      handle,
      channelId,
    });
    const wrapper = new PromiseWrapper<void>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  }

  private async publishMicrophone(channelId: string, id: number) {
    const handle = this.handleCounter++;
    this.getClient(id).message.publishMicrophone({
      handle,
      channelId,
    });
    const wrapper = new PromiseWrapper<void>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  }

  private async setVolume(channelId: string, id: number, volume: number) {
    const handle = this.handleCounter++;
    this.getClient(id).message.setVolume({
      handle,
      channelId,
      volume,
    });
    const wrapper = new PromiseWrapper<void>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  }

  private async getVolume(channelId: string, id: number) {
    const handle = this.handleCounter++;
    this.getClient(id).message.getVolume({
      handle,
      channelId,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    return (await wrapper.promise).volume as number;
  }

  private async getMicrophonePermission(id: number) {
    const handle = this.handleCounter++;
    this.getClient(id).message.getMicrophonePermission({
      handle,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    return (await wrapper.promise).permission as boolean;
  }
}
