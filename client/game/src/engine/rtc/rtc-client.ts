import type { IAgoraRTCClient, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { PromiseWrapper } from './promise-wrapper';
import { RTCProtocol } from './rtc-protocol';
import { ImportAgoraRTC } from '../defer-imports';

export class RTCClient {
  public protocol: MuClientProtocol<typeof RTCProtocol>;
  private channels = {} as {
    [channelId: string]: IAgoraRTCClient;
  };
  private volumes = {} as {
    [channelId: string]: number;
  };
  private localTrack: Promise<IMicrophoneAudioTrack> | undefined;
  private wrappers = {} as { [handle: number]: PromiseWrapper<string> };
  private handleCounter = 0;

  constructor(spec: { client: MuClient }) {
    this.protocol = spec.client.protocol(RTCProtocol);

    this.protocol.configure({
      message: {
        join: async ({ handle, channelId, token, appId }) => {
          try {
            await this.join(channelId, token, appId);
            this.protocol.server.message.return({ handle });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        leave: async ({ handle, channelId }) => {
          try {
            await this.leave(channelId);
            this.protocol.server.message.return({ handle });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        unpublish: async ({ handle, channelId }) => {
          try {
            await this.unpublish(channelId);
            this.protocol.server.message.return({ handle });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        publishMicrophone: async ({ handle, channelId }) => {
          try {
            await this.publishMicrophone(channelId);
            this.protocol.server.message.return({ handle });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        getVolume: async ({ handle, channelId }) => {
          try {
            const volume = this.getVolume(channelId);
            this.protocol.server.message.volumeReturn({ handle, volume });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        setVolume: async ({ handle, channelId, volume }) => {
          try {
            this.setVolume(channelId, volume);
            this.protocol.server.message.return({ handle });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        getMicrophonePermission: async ({ handle }) => {
          try {
            const permission = await this.getMicrophonePermission();
            this.protocol.server.message.permissionReturn({
              handle,
              permission,
            });
          } catch (err) {
            this.protocol.server.message.throw({
              handle,
              message: err.message,
            });
          }
        },
        tokenReturn: async ({ handle, token }) => {
          const p = this.wrappers[handle];
          if (p) {
            p.resolve(token);
          }
        },
      },
    });
  }

  private async join(channelId: string, token: string, appId: string) {
    const AgoraRTC = await ImportAgoraRTC;
    if (!AgoraRTC) {
      console.error('RTC join error, AgoraRTC does not exist.');
      return;
    }
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        user.audioTrack!.setVolume(this.getVolume(channelId));
        user.audioTrack!.play();
      }
    });
    client.on('user-unpublished', async (user) => {
      await client.unsubscribe(user);
    });
    client.on('token-privilege-will-expire', async () => {
      const newToken = await this.fetchToken(client.uid as number, channelId);
      await client.renewToken(newToken);
    });

    client.on('token-privilege-did-expire', async () => {
      const newToken = await this.fetchToken(client.uid as number, channelId);
      await client.join(appId, channelId, newToken);
    });

    await client.join(appId, channelId, token);
    this.channels[channelId] = client;
  }

  private async leave(channelId: string) {
    const client = this.channels[channelId];
    if (client) {
      await client.leave();
      delete this.channels[channelId];
    }
  }

  private async unpublish(channelId: string) {
    const client = this.channels[channelId];
    if (client) {
      await client.unpublish();
    }
  }

  private async publishMicrophone(channelId: string) {
    const client = this.channels[channelId];
    if (client && client.localTracks.length === 0) {
      const track = await this.getTrack();

      track && (await client.publish(track));
    }
  }

  private async getTrack() {
    const AgoraRTC = await ImportAgoraRTC;
    if (!AgoraRTC) {
      console.error('Get audio track error, AgoraRTC does not exist.');
      return false;
    }
    if (this.localTrack) {
      return this.localTrack;
    }
    return (this.localTrack = AgoraRTC.createMicrophoneAudioTrack().catch(
      (err) => {
        this.localTrack = undefined;
        return Promise.reject(err);
      },
    ));
  }

  private getVolume(channelId: string) {
    return this.volumes[channelId] || 100;
  }

  private setVolume(channelId: string, volume: number) {
    const client = this.channels[channelId];
    this.volumes[channelId] = volume;
    if (client) {
      for (const user of client.remoteUsers) {
        if (user.audioTrack) {
          user.audioTrack.setVolume(volume);
        }
      }
    }
  }

  private async getMicrophonePermission() {
    const AgoraRTC = await ImportAgoraRTC;
    if (!AgoraRTC) {
      console.error(
        'Get microphone permission error, AgoraRTC does not exist.',
      );
      return false;
    }

    try {
      await AgoraRTC.getMicrophones();
      return true;
    } catch {
      return false;
    }
  }

  private async fetchToken(uid: number, channelId: string) {
    const handle = this.handleCounter++;
    this.protocol.server.message.fetchToken({
      handle,
      uid: uid,
      channelId,
    });
    const wrapper = new PromiseWrapper<string>(handle);
    this.wrappers[handle] = wrapper;
    return wrapper.promise;
  }
}
