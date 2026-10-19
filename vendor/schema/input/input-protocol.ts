import { MuUint8 } from '@box/mudb/schema';

export const InputProtocolSchema = {
  name: 'input',
  client: {
    setCameraPitch: new MuUint8(0),
    setCameraYaw: new MuUint8(0),
  },
  server: {},
};
