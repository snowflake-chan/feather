import {
  MuArray,
  MuASCII,
  MuFloat32,
  MuStruct,
  MuUTF8,
  MuVarint,
  MuBoolean,
} from '@box/mudb/schema';

export const RTCScriptProtocol = {
  name: 'rtc',
  client: {
    return: new MuStruct({
      handle: new MuVarint(),
    }),
    throw: new MuStruct({
      handle: new MuVarint(),
      message: new MuUTF8(),
    }),
    listReturn: new MuStruct({
      handle: new MuVarint(),
      list: new MuArray(new MuVarint(), Infinity),
    }),
    volumeReturn: new MuStruct({
      handle: new MuVarint(),
      volume: new MuFloat32(),
    }),
    permissionReturn: new MuStruct({
      handle: new MuVarint(),
      permission: new MuBoolean(),
    }),
  },
  server: {
    destroyChannel: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
    }),
    joinChannel: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
      id: new MuVarint(),
    }),
    leaveChannel: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
      id: new MuVarint(),
    }),
    unpublish: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
      id: new MuVarint(),
    }),
    publishMicrophone: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
      id: new MuVarint(),
    }),
    listChannelPlayers: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
    }),
    setVolume: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
      id: new MuVarint(),
      volume: new MuFloat32(),
    }),
    getVolume: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII(),
      id: new MuVarint(),
    }),
    getMicrophonePermission: new MuStruct({
      handle: new MuVarint(),
      id: new MuVarint(),
    }),
  },
};
