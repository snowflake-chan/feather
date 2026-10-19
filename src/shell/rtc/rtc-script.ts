import { MuClientProtocol } from '@box/mudb/client';
import { GameRTC, GameRTCChannel } from '@box/schema/api/js/rtc';
import { RTCScriptProtocol } from './rtc-script-protocol';
import { PromiseWrapper } from './promise-wrapper';
import { ScriptShell } from '../script/script-shell';
import { GamePlayerEntity } from '@box/schema/api/js/api';
import { GameUIDEntity } from '../script/bindings/entity-synchronizer';

function generateChannelId(len = 32) {
  const charset =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let s = '';
  while (s.length < len) {
    s += charset[Math.floor(Math.random() * charset.length)];
  }
  return s;
}

function shallowExtract(obj: any) {
  const o = {};
  for (const k in obj) {
    o[k] = obj[k];
    delete obj[k];
  }
  return o;
}

export class RTCScriptShell {
  public protocol: MuClientProtocol<typeof RTCScriptProtocol>;
  public rtcAPI: GameRTC;
  private wrappers = {} as { [handle: number]: PromiseWrapper<any> };
  private handleCounter = 0;
  constructor(private shell: ScriptShell) {
    this.protocol = shell.client.protocol(RTCScriptProtocol);
    const resolve = (message: any) => {
      const p = this.wrappers[message.handle];
      if (p) {
        p.resolve(shallowExtract(message));
      }
    };
    const reject = (message: any) => {
      const p = this.wrappers[message.handle];
      if (p) {
        p.reject(shallowExtract(message));
      }
    };
    this.protocol.configure({
      message: {
        return: resolve,
        throw: reject,
        listReturn: resolve,
        volumeReturn: resolve,
        permissionReturn: resolve,
      },
    });
    this.rtcAPI = new GameRTC(this.createChannel);
  }

  public createChannel = async (channelId: string = generateChannelId()) => {
    return new GameRTCChannel(
      (entity) => this.joinChannel(channelId, (entity as GameUIDEntity).uid),
      (entity) => this.leaveChannel(channelId, (entity as GameUIDEntity).uid),
      (entity) => this.unpublish(channelId, (entity as GameUIDEntity).uid),
      (entity) =>
        this.publishMicrophone(channelId, (entity as GameUIDEntity).uid),
      () => this.getPlayers(channelId),
      () => this.destroy(channelId),
      (entity) => this.getVolume(channelId, (entity as GameUIDEntity).uid),
      (entity, volume) =>
        this.setVolume(channelId, (entity as GameUIDEntity).uid, volume),
      (entity) => this.getMicrophonePermission((entity as GameUIDEntity).uid),
    );
  };

  private async joinChannel(channelId: string, id: number) {
    const handle = this.handleCounter++;
    this.protocol.server.message.joinChannel({
      handle,
      channelId,
      id,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  }

  private async leaveChannel(channelId: string, id: number) {
    const handle = this.handleCounter++;
    this.protocol.server.message.leaveChannel({
      handle,
      channelId,
      id,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  }

  private async unpublish(channelId: string, id: number) {
    const handle = this.handleCounter++;
    this.protocol.server.message.unpublish({
      handle,
      channelId,
      id,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    return wrapper.promise;
  }

  private async publishMicrophone(channelId: string, id: number) {
    const handle = this.handleCounter++;
    this.protocol.server.message.publishMicrophone({
      handle,
      channelId,
      id,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  }

  private async getPlayers(channelId: string) {
    const handle = this.handleCounter++;
    this.protocol.server.message.listChannelPlayers({
      handle,
      channelId,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    const { list } = await wrapper.promise;
    const entities: GamePlayerEntity[] = [];
    for (const { entity } of this.shell.world.entity.entities) {
      if (entity.isPlayer && list.includes(entity.uid)) {
        entities.push(entity as GamePlayerEntity);
      }
    }
    return entities;
  }

  private async destroy(channelId: string) {
    const handle = this.handleCounter++;
    this.protocol.server.message.destroyChannel({
      handle,
      channelId,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  }

  private async getVolume(channelId: string, id: number) {
    const handle = this.handleCounter++;
    this.protocol.server.message.getVolume({
      handle,
      channelId,
      id,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    return (await wrapper.promise).volume as number;
  }

  private async setVolume(channelId: string, id: number, volume: number) {
    const handle = this.handleCounter++;
    this.protocol.server.message.setVolume({
      handle,
      channelId,
      id,
      volume,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    await wrapper.promise;
  }

  private async getMicrophonePermission(id: number) {
    const handle = this.handleCounter++;
    this.protocol.server.message.getMicrophonePermission({
      handle,
      id,
    });
    const wrapper = new PromiseWrapper<any>(handle);
    this.wrappers[handle] = wrapper;
    return (await wrapper.promise).permission as boolean;
  }
}
