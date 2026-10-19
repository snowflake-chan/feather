import { MuArray, MuStruct, MuUTF8, MuVarint } from '@box/mudb/schema';

export const RemoteChannelScriptProtocol = {
  name: 'remote-channel-api',
  client: {},
  server: {
    sendEventToClients: new MuStruct({
      entityIds: new MuArray(new MuVarint(), Infinity),
      args: new MuUTF8(),
    }),
    broadcastEvent: new MuUTF8(),
  },
};
