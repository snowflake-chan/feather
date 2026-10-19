import {
  MuASCII,
  MuFloat32,
  MuStruct,
  MuUTF8,
  MuVarint,
  MuBoolean,
} from '@box/mudb/schema';

export const RTCProtocol = {
  name: 'rtc',
  client: {
    join: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
      token: new MuASCII(),
      appId: new MuASCII(),
    }),
    leave: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
    }),
    unpublish: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
    }),
    publishMicrophone: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
    }),
    getVolume: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
    }),
    setVolume: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
      volume: new MuFloat32(),
    }),
    getMicrophonePermission: new MuStruct({
      handle: new MuVarint(),
    }),
    tokenReturn: new MuStruct({
      handle: new MuVarint(),
      token: new MuASCII(),
    }),
  },
  server: {
    return: new MuStruct({
      handle: new MuVarint(),
    }),
    volumeReturn: new MuStruct({
      handle: new MuVarint(),
      volume: new MuFloat32(),
    }),
    permissionReturn: new MuStruct({
      handle: new MuVarint(),
      permission: new MuBoolean(),
    }),
    throw: new MuStruct({
      handle: new MuVarint(),
      message: new MuUTF8(),
    }),
    fetchToken: new MuStruct({
      handle: new MuVarint(),
      uid: new MuVarint(),
      channelId: new MuASCII(),
    }),
  },
};
