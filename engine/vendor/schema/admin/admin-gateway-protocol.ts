import { MuUTF8, MuVoid } from '@box/mudb/schema';

export const AdminProtocol = {
  name: 'admin',
  client: {
    redirect: new MuUTF8(),
    alert: new MuUTF8(),
  },
  server: {
    closeWebsocket: new MuVoid(),
    logCurrentStore: new MuVoid(),
  },
};
